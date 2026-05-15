package taskqueue

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/hibiken/asynq"
	redisx "sawithub/backend/internal/redis"
)

// EmailPayload mirrors redisx.EmailJob for Asynq task payloads.
type EmailPayload struct {
	JobID       string    `json:"job_id"`
	Type        string    `json:"type"`
	ToEmail     string    `json:"to_email"`
	Subject     string    `json:"subject,omitempty"`
	HTML        string    `json:"html,omitempty"`
	Attachment  string    `json:"attachment,omitempty"`
	Filename    string    `json:"filename,omitempty"`
	ContentType string    `json:"content_type,omitempty"`
	Code        string    `json:"code,omitempty"`
	FullName    string    `json:"full_name,omitempty"`
	CreatedAt   time.Time `json:"created_at"`
}

// Client wraps asynq.Client with helpers for each email task type.
type Client struct {
	asynq *asynq.Client
}

func NewClient(redisClient *redisx.Client) *Client {
	if redisClient == nil || !redisClient.Enabled() {
		return nil
	}
	opt := redisClient.AsynqRedisOpt()
	return &Client{asynq: asynq.NewClient(opt)}
}

func (c *Client) Close() error {
	if c == nil {
		return nil
	}
	return c.asynq.Close()
}

func (c *Client) EnqueueWelcome(ctx context.Context, toEmail, fullName string) error {
	return c.enqueue(ctx, TypeEmailWelcome, EmailPayload{
		Type:     "welcome",
		ToEmail:  toEmail,
		FullName: fullName,
	})
}

func (c *Client) EnqueueResetCode(ctx context.Context, toEmail, code string) error {
	return c.enqueue(ctx, TypeEmailResetCode, EmailPayload{
		Type:    "reset_code",
		ToEmail: toEmail,
		Code:    code,
	})
}

func (c *Client) EnqueueReport(ctx context.Context, toEmail, subject, html, filename, attachment, contentType string) error {
	return c.enqueue(ctx, TypeEmailReport, EmailPayload{
		Type:        "report",
		ToEmail:     toEmail,
		Subject:     subject,
		HTML:        html,
		Filename:    filename,
		Attachment:  attachment,
		ContentType: contentType,
	})
}

func (c *Client) enqueue(ctx context.Context, taskType string, payload EmailPayload) error {
	if c == nil {
		return fmt.Errorf("taskqueue client not initialized")
	}
	if payload.JobID == "" {
		payload.JobID = uuid.NewString()
	}
	if payload.CreatedAt.IsZero() {
		payload.CreatedAt = time.Now().UTC()
	}
	b, err := json.Marshal(payload)
	if err != nil {
		return err
	}
	task := asynq.NewTask(taskType, b)
	_, err = c.asynq.EnqueueContext(ctx, task,
		asynq.MaxRetry(3),
		asynq.Queue("email"),
	)
	return err
}
