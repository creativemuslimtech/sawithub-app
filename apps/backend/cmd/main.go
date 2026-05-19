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

	"sawithub/backend/internal/config"
	"sawithub/backend/internal/db"
	"sawithub/backend/internal/handler"
	"sawithub/backend/internal/jobs"
	"sawithub/backend/internal/logger"
	mw "sawithub/backend/internal/middleware"
	"sawithub/backend/internal/observability"
	"sawithub/backend/internal/platform"
	redisx "sawithub/backend/internal/redis"
	"sawithub/backend/internal/telemetry"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/joho/godotenv"
	"go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp"
)

func main() {
	_ = godotenv.Load()
	cfg := config.Load()
	if err := cfg.Validate(); err != nil {
		log.Fatalf("config validation failed: %v", err)
	}
	redisClient := redisx.New(cfg)
	defer redisClient.Close()

	// Initialize stdout-only logging (Docker-compatible)
	logger.Init()
	defer logger.Close()

	// Initialize OpenTelemetry tracing.
	serviceName := os.Getenv("OTEL_SERVICE_NAME")
	if serviceName == "" {
		serviceName = "sawithub-backend"
	}
	otelShutdown, otelErr := telemetry.Init(serviceName, os.Getenv("ENVIRONMENT"))
	if otelErr != nil {
		log.Printf("WARN: otel init failed: %v", otelErr)
	} else {
		defer otelShutdown()
	}

	// Connect write database with retry logic (5 attempts, 3 second delay)
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

	presenceEnabled, err := db.EnsureRuntimeSchema(database)
	if err != nil {
		log.Printf("WARN: DB schema sync skipped: %v", err)
		presenceEnabled, _ = db.HasColumn(database, "t_sawit_hub_users", "last_seen_at")
	}

	// Run database migrations (idempotent — safe on every startup).
	if err := db.RunMigrations(database, "migrations"); err != nil {
		log.Printf("WARN: migrations failed: %v", err)
	}

	apiObservability := platform.NewPlatformApiObservabilityService()
	h := handler.New(database, databaseRead, cfg, presenceEnabled, redisClient)
	reminderJob := jobs.NewBillingReminderWorker(database, cfg, h.Mailer(), h.Notification(), h.Subscription())

	// Seed theme config
	if err := db.SeedTheme(database, cfg.BaseURL); err != nil {
		log.Printf("Warning: theme seed failed: %v", err)
	}

	// Initialize rate limiter: 100 requests per minute per user
	rateLimiter := mw.NewRateLimiter(cfg, redisClient, 100, 2)
	defer rateLimiter.Stop()

	r := chi.NewRouter()
	r.Use(otelhttp.NewMiddleware("sawithub-backend"))
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.Timeout(30 * time.Second))
	r.Use(mw.SecurityHeaders)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins: []string{
			cfg.FrontendURL,
			"capacitor://localhost",
		},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: true,
		MaxAge:           300,
	}))
	r.Use(apiObservability.Middleware)
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

	// Serve static files
	r.Handle("/static/*", http.StripPrefix("/static/", http.FileServer(http.Dir("./static"))))

	// HTTP paths use standardized service-style segments (see docs/api-routes.md): drop the "Farm"
	// prefix from FarmFinance*/FarmCore* type names (e.g. FarmFinanceIncomeService → FinanceIncomeService).
	r.Route("/api", func(r chi.Router) {
		r.Get("/PlatformThemeService", h.GetThemeConfig)
		r.Post("/PlatformTrafficService", h.RecordVisit)
		r.Post("/Contact", h.Contact)
		r.Post("/BillingPaymentService/callback", h.PaymentCallback)
		r.Post("/BillingPaymentService/mock/callback", h.MockPaymentCallback)

		r.Post("/IdentityAuthService/register", h.Register)
		r.Post("/IdentityAuthService/login", h.Login)
		r.Post("/IdentityAuthService/forgot-password", h.ForgotPassword)
		r.Post("/IdentityAuthService/verify-reset", h.VerifyReset)
		r.Post("/IdentityAuthService/reset-password", h.ResetPassword)

		r.Group(func(r chi.Router) {
			r.Use(mw.Auth(cfg, database, databaseRead, presenceEnabled, redisClient))
			r.Use(mw.SubscriptionContext(database, h.Subscription()))
			r.Use(mw.RateLimit(rateLimiter))
			r.Use(mw.InvalidateCacheOnMutation(cfg, redisClient))

			r.Get("/IdentityAuthService/me", h.Me)
			r.Get("/IdentityAuthService/ping", h.Ping)
			r.Post("/IdentitySessionService/logout", h.Logout)
			r.Post("/IdentitySessionService/logout-all", h.LogoutAll)
			r.Put("/IdentityProfileService/update-full-name", h.UpdateFullName)
			r.Put("/IdentityProfileService/update-email", h.UpdateEmail)
			r.Put("/IdentityProfileService/update-phone", h.UpdatePhone)
			r.Put("/IdentityProfileService/update-username", h.UpdateUsername)
			r.Put("/IdentityAuthService/update-password", h.UpdatePassword)
			r.Get("/ReportingDashboardService", h.Dashboard)
			r.Get("/BillingSubscriptionService/status", h.GetSubscriptionStatus)
			r.Post("/BillingSubscriptionService/checkout", h.CheckoutSubscription)
			r.Get("/NotificationCenterService", h.ListNotifications)
			r.Patch("/NotificationCenterService/read-all", h.ReadAllNotifications)
			r.Delete("/NotificationCenterService/read", h.DeleteReadNotifications)
			r.Patch("/NotificationCenterService/{id}/read", h.ReadNotification)
			r.Get("/CoreChecklistService", h.ListFieldChecklistRuns)

			r.Get("/CorePlotService", h.ListLahan)
			writeRoutes := func(r chi.Router) {
				r.Post("/CorePlotService", h.CreateLahan)
				r.Put("/CorePlotService/{id}", h.UpdateLahan)
				r.Delete("/CorePlotService/{id}", h.DeleteLahan)
				r.Put("/CoreHarvestService/{id}", h.UpdatePanen)
				r.Delete("/CoreHarvestService/{id}", h.DeletePanen)
				r.Post("/CoreMaintenanceService", h.CreatePerawatan)
				r.Put("/CoreMaintenanceService/{id}", h.UpdatePerawatan)
				r.Delete("/CoreMaintenanceService/{id}", h.DeletePerawatan)
				r.Post("/CoreMaintenanceScheduleService", h.CreateJadwalPerawatan)
				r.Put("/CoreMaintenanceScheduleService/{id}", h.UpdateJadwalPerawatan)
				r.Delete("/CoreMaintenanceScheduleService/{id}", h.DeleteJadwalPerawatan)
				r.Post("/FinanceIncomeService", h.CreatePendapatan)
				r.Put("/FinanceIncomeService/{id}", h.UpdatePendapatan)
				r.Delete("/FinanceIncomeService/{id}", h.DeletePendapatan)
				r.Post("/ReportingExportService/email-export", h.EmailLaporanKeuanganExport)
				r.Post("/CoreChecklistService", h.CreateFieldChecklistRun)
				r.Patch("/CoreChecklistService/{id}/status", h.UpdateFieldChecklistRunStatus)
			}
			r.Group(func(r chi.Router) {
				if cfg.SubscriptionEnforcement {
					r.Use(mw.RequireFullAccess())
				}
				writeRoutes(r)
				r.Get("/CoreMaintenanceService", h.ListPerawatan)
				r.Get("/CoreMaintenanceScheduleService/upcoming", h.GetUpcomingJadwal)
				r.Get("/CoreMaintenanceScheduleService", h.ListJadwalPerawatan)
			})

			r.Get("/CoreHarvestService", h.ListPanen)
			r.Group(func(r chi.Router) {
				if cfg.SubscriptionEnforcement {
					r.Use(mw.RequireFeature(mw.FeatureCreateHarvest))
				}
				r.Post("/CoreHarvestService", h.CreatePanen)
			})
			r.Get("/CoreHarvestService/{id}", h.GetPanen)

			r.Get("/FinanceIncomeService", h.ListPendapatan)

			r.Get("/FinanceCommodityPriceService", h.ListHarga)

			r.Get("/ReportingFarmFinanceService", h.GetLaporanKeuangan)
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
	shutdownCtx, stopCtx := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM, syscall.SIGINT)
	defer stopCtx()
	reminderJob.Start(shutdownCtx)
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
