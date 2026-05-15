package taskqueue

import (
	"context"
	"log"

	"github.com/hibiken/asynq"
	redisx "sawithub/backend/internal/redis"
)

// NewServer creates a configured Asynq server.
// Uses the same Redis instance as the rest of the backend.
func NewServer(redisClient *redisx.Client) *asynq.Server {
	opt := redisClient.AsynqRedisOpt()
	return asynq.NewServer(opt, asynq.Config{
		Concurrency: 5,
		Queues: map[string]int{
			"email":    10,
			"critical": 6,
			"default":  3,
		},
		ErrorHandler: asynq.ErrorHandlerFunc(func(_ context.Context, task *asynq.Task, err error) {
			log.Printf("asynq error: type=%s err=%v", task.Type(), err)
		}),
	})
}
