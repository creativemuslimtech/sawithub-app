package queue

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"SawitHub/internal/mailer"
	"SawitHub/internal/observability"
	redisx "SawitHub/internal/redis"

	"github.com/getsentry/sentry-go"
)

const maxQueueRetry = 3

func RunEmailWorker(ctx context.Context, redisClient *redisx.Client, m *mailer.Mailer) {
	if redisClient == nil || !redisClient.Enabled() {
		log.Println("email worker disabled: redis unavailable")
		return
	}
	queueKey := redisClient.Key("queue", "email")
	deadLetterKey := redisClient.Key("queue", "email", "dlq")

	for {
		select {
		case <-ctx.Done():
			return
		default:
		}

		res, err := redisClient.Raw().BLPop(ctx, 5*time.Second, queueKey).Result()
		if err != nil || len(res) < 2 {
			continue
		}

		var job redisx.EmailJob
		if err := json.Unmarshal([]byte(res[1]), &job); err != nil {
			continue
		}

		if err := handleEmailJob(m, job); err != nil {
			log.Printf("email worker failed job %s: %v", job.JobID, err)
			job.RetryCount++
			if job.RetryCount <= maxQueueRetry {
				observability.IncQueueRetry()
				time.Sleep(time.Duration(job.RetryCount) * time.Second)
				_ = redisClient.Raw().RPush(ctx, queueKey, mustMarshal(job)).Err()
				continue
			}
			observability.IncQueueDLQ()
			sentry.CaptureException(fmt.Errorf("email job %s (type=%s) moved to DLQ after %d retries: %w", job.JobID, job.Type, job.RetryCount, err))
			_ = redisClient.Raw().RPush(ctx, deadLetterKey, mustMarshal(job)).Err()
			continue
		}
		observability.IncQueueProcessed()
	}
}

func handleEmailJob(m *mailer.Mailer, job redisx.EmailJob) error {
	switch job.Type {
	case "welcome":
		return m.SendWelcome(job.ToEmail, job.FullName)
	case "reset_code":
		return m.SendResetCode(job.ToEmail, job.Code)
	case "report":
		return m.SendReport(job.ToEmail, job.Subject, job.HTML, mailer.Attachment{
			Filename:    job.Filename,
			Content:     job.Attachment,
			ContentType: job.ContentType,
		})
	default:
		return nil
	}
}

func mustMarshal(v interface{}) string {
	b, _ := json.Marshal(v)
	return string(b)
}

