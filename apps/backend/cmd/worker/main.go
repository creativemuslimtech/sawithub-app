package main

import (
	"log"
	"os"
	"os/signal"
	"syscall"

	"sawithub/backend/internal/config"
	"sawithub/backend/internal/mailer"
	redisx "sawithub/backend/internal/redis"
	"sawithub/backend/internal/taskqueue"

	"github.com/joho/godotenv"
)

func main() {
	_ = godotenv.Load()
	cfg := config.Load()
	redisClient := redisx.New(cfg)
	defer redisClient.Close()

	m := &mailer.Mailer{
		APIKey:      cfg.ResendAPIKey,
		From:        cfg.EmailFrom,
		FrontendURL: cfg.FrontendURL,
	}

	srv := taskqueue.NewServer(redisClient)
	mux := taskqueue.NewEmailHandler(m)

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt, syscall.SIGTERM, syscall.SIGINT)

	go func() {
		if err := srv.Run(mux); err != nil {
			log.Fatalf("asynq server error: %v", err)
		}
	}()

	<-stop
	log.Println("worker shutting down")
	srv.Shutdown()
}
