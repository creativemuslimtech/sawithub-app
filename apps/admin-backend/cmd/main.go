package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"
	_ "time/tzdata"

	"sawithub/admin-backend/internal/config"
	"sawithub/admin-backend/internal/db"
	"sawithub/admin-backend/internal/handler"
	"sawithub/admin-backend/internal/logger"
	mw "sawithub/admin-backend/internal/middleware"
	"sawithub/admin-backend/internal/observability"
	redisx "sawithub/admin-backend/internal/redis"
	"sawithub/admin-backend/internal/telemetry"
	"github.com/go-chi/chi/v5"
	chimw "github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/joho/godotenv"
	"go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp"
)

func main() {
	_ = godotenv.Load()
	cfg := config.Load()
	redisClient := redisx.New(cfg)
	defer redisClient.Close()

	// Initialize stdout-only logging (Docker-compatible)
	logger.Init()
	defer logger.Close()

	// Initialize OpenTelemetry tracing.
	serviceName := os.Getenv("OTEL_SERVICE_NAME")
	if serviceName == "" {
		serviceName = "sawithub-admin-backend"
	}
	otelShutdown, otelErr := telemetry.Init(serviceName, os.Getenv("ENVIRONMENT"))
	if otelErr != nil {
		log.Printf("WARN: otel init failed: %v", otelErr)
	} else {
		defer otelShutdown()
	}

	// Main DB stays required for admin analytics/data endpoints.
	database, err := db.ConnectWithRetry(cfg, 5, 3*time.Second)
	if err != nil {
		log.Fatalf("DB connection failed after retries: %v", err)
	}
	defer database.Close()

	// Connect read database; fallback to write DB when read replica DSN is not configured.
	databaseRead := database
	if cfg.DatabaseURLRead != "" {
		readDB, readErr := db.ConnectRead(cfg)
		if readErr != nil {
			log.Printf("WARN: read DB connect failed, fallback to write DB: %v", readErr)
		} else {
			databaseRead = readDB
			defer databaseRead.Close()
		}
	}

	// Connect admin database; fallback to main DB when admin DSN is not configured.
	adminDB := database
	if cfg.AdminDatabaseURL != "" {
		adb, adminErr := db.ConnectAdmin(cfg)
		if adminErr != nil {
			log.Printf("WARN: admin DB connect failed, fallback to main DB: %v", adminErr)
		} else {
			adminDB = adb
			defer adminDB.Close()
		}
	}

	adminDBRead := adminDB
	if cfg.AdminDatabaseURLRead != "" {
		adbRead, adminReadErr := db.ConnectAdminRead(cfg)
		if adminReadErr != nil {
			log.Printf("WARN: admin read DB connect failed, fallback to admin write DB: %v", adminReadErr)
		} else {
			adminDBRead = adbRead
			defer adminDBRead.Close()
		}
	}

	presenceEnabled, _ := db.HasColumn(database, "t_sawit_hub_users", "last_seen_at")

	apiMonitor := handler.NewAPIMonitor()
	h := handler.New(database, databaseRead, adminDB, adminDBRead, cfg, apiMonitor, presenceEnabled, redisClient)

	// Initialize rate limiter: 100 requests per minute per user
	rateLimiter := mw.NewRateLimiter(cfg, redisClient, 100, 2)
	defer rateLimiter.Stop()

	r := chi.NewRouter()
	r.Use(otelhttp.NewMiddleware("sawithub-admin-backend"))
	r.Use(chimw.RealIP)
	r.Use(mw.SafeRequestLogger)
	r.Use(chimw.Recoverer)
	r.Use(chimw.Timeout(30 * time.Second))
	r.Use(mw.SecurityHeaders)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins: config.ParseFrontendOrigins(cfg.FrontendURL),
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: true,
		MaxAge:           300,
	}))
	r.Use(apiMonitor.Middleware)
	// Keep API gate for emergency kill-switch from admin system menu.
	r.Use(mw.APIGate(redisClient))

	// Health check endpoints (before auth/rate limiting)
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		// Simple health check - verify database connection
		ctx, cancel := context.WithTimeout(r.Context(), 2*time.Second)
		defer cancel()

		if err := database.PingContext(ctx); err != nil {
			w.WriteHeader(http.StatusServiceUnavailable)
			w.Write([]byte("unhealthy: database unreachable"))
			return
		}

		w.WriteHeader(http.StatusOK)
		w.Write([]byte("ok"))
	})

	r.Get("/api/health", func(w http.ResponseWriter, r *http.Request) {
		// Detailed health check with database stats
		ctx, cancel := context.WithTimeout(r.Context(), 2*time.Second)
		defer cancel()

		health := map[string]interface{}{
			"status":    "healthy",
			"timestamp": time.Now().Format(time.RFC3339),
			// Expected to match user backend; set SUBSCRIPTION_ENFORCEMENT consistently in deploy.
			"subscription_enforcement": cfg.SubscriptionEnforcement,
		}

		// Check database connection
		if err := database.PingContext(ctx); err != nil {
			health["status"] = "unhealthy"
			health["database"] = "unreachable"
			health["error"] = err.Error()
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusServiceUnavailable)
			json.NewEncoder(w).Encode(health)
			return
		}

		readStatus := "connected"
		if err := databaseRead.PingContext(ctx); err != nil {
			readStatus = "unreachable"
		}
		health["database"] = map[string]string{
			"write": "connected",
			"read":  readStatus,
		}
		health["redis"] = redisClient.Health(ctx)
		health["redis_metrics"] = observability.Snapshot()
		health["redis_queue"] = map[string]int64{
			"email_depth": redisClient.QueueDepth(ctx, "email"),
			"email_dlq":   redisClient.DLQDepth(ctx, "email"),
		}

		// Add database connection pool stats
		statsWrite := database.Stats()
		statsRead := databaseRead.Stats()
		health["db_stats"] = map[string]map[string]int{
			"write": {
				"open_connections": statsWrite.OpenConnections,
				"in_use":           statsWrite.InUse,
				"idle":             statsWrite.Idle,
				"max_open":         50,
			},
			"read": {
				"open_connections": statsRead.OpenConnections,
				"in_use":           statsRead.InUse,
				"idle":             statsRead.Idle,
				"max_open":         50,
			},
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(health)
	})

	r.Route("/api", func(r chi.Router) {
		// Admin login (public).
		r.Post("/admin/auth/login", h.AdminLogin)

		// Admin protected routes (auth source: admin DB only).
		r.Group(func(r chi.Router) {
			r.Use(mw.AdminAuth(cfg, adminDB, adminDBRead, redisClient))
			r.Use(mw.RateLimit(rateLimiter))
			r.Use(mw.InvalidateCacheOnMutation(cfg, redisClient))

			r.Get("/admin/auth/me", h.AdminMe)
			r.Post("/admin/auth/logout", h.AdminLogout)
			r.Post("/admin/auth/logout-all", h.AdminLogoutAll)
			r.Get("/admin/overview", h.AdminOverview)
			r.Get("/admin/users", h.AdminUsers)
			r.Put("/admin/users/{id}/role", h.AdminChangeRole)
			r.Put("/admin/users/{id}/status", h.AdminToggleUserStatus)
			r.Put("/admin/users/{id}/deactivate", h.AdminDeactivateUser)
			r.Put("/admin/users/{id}/password", h.AdminChangeUserPassword)
			r.Get("/admin/data", h.AdminData)
			r.Get("/admin/analytics", h.AdminAnalytics)
			r.Get("/admin/system", h.AdminSystem)
			r.Put("/admin/system/api-state", h.AdminSetAPIState)
			r.Put("/admin/system/api-endpoint-state", h.AdminSetEndpointAPIState)
			r.Get("/admin/settings", h.AdminSettings)
			r.Put("/admin/settings", h.AdminUpdateSettings)
			r.Get("/admin/audit", h.AdminAudit)
		})
	})

	// Create HTTP server with timeouts
	addr := fmt.Sprintf(":%s", cfg.Port)
	server := &http.Server{
		Addr:         addr,
		Handler:      r,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 30 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Channel to listen for interrupt signals
	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt, syscall.SIGTERM, syscall.SIGINT)

	// Start server in a goroutine
	go func() {
		log.Printf("Server listening on %s", addr)
		log.Printf("Health check available at http://localhost%s/health", addr)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Server error: %v", err)
		}
	}()

	// Wait for interrupt signal
	<-stop
	log.Println("Shutting down gracefully... (press Ctrl+C again to force)")

	// Create shutdown context with timeout (30 seconds)
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// Attempt graceful shutdown
	if err := server.Shutdown(ctx); err != nil {
		log.Printf("Server forced to shutdown: %v", err)
	} else {
		log.Println("Server stopped gracefully")
	}
}
