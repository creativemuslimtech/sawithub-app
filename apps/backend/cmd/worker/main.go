package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"SawitHub/internal/config"
	"SawitHub/internal/mailer"
	"SawitHub/internal/queue"
	redisx "SawitHub/internal/redis"

	"github.com/getsentry/sentry-go"
	"github.com/joho/godotenv"
)

func main() {
	_ = godotenv.Load()
	cfg := config.Load()

	if cfg.SentryDSN != "" {
		if err := sentry.Init(sentry.ClientOptions{
			Dsn:         cfg.SentryDSN,
			Environment: cfg.SentryEnvironment,
			Release:     cfg.SentryRelease,
		}); err != nil {
			log.Printf("WARN: sentry init failed: %v", err)
		} else {
			defer sentry.Flush(2 * time.Second)
		}
	}

	redisClient := redisx.New(cfg)
	defer redisClient.Close()

	m := &mailer.Mailer{
		APIKey:      cfg.ResendAPIKey,
		From:        cfg.EmailFrom,
		FrontendURL: cfg.FrontendURL,
	}

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	go queue.RunEmailWorker(ctx, redisClient, m)

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt, syscall.SIGTERM, syscall.SIGINT)
	<-stop
	log.Println("worker shutting down")
}

