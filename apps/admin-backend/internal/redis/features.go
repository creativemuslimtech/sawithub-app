package redisx

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/google/uuid"
)

func (c *Client) AllowFixedWindow(ctx context.Context, key string, limit int64, window time.Duration) (bool, int64, error) {
	if !c.Enabled() {
		return false, 0, fmt.Errorf("redis disabled")
	}
	count, err := c.rdb.Incr(ctx, key).Result()
	if err != nil {
		return false, 0, err
	}
	if count == 1 {
		_ = c.rdb.Expire(ctx, key, window).Err()
	}
	remaining := limit - count
	if remaining < 0 {
		remaining = 0
	}
	return count <= limit, remaining, nil
}

func (c *Client) GetSessionVersion(ctx context.Context, userID string) int64 {
	if !c.Enabled() {
		return 1
	}
	key := c.Key("session", "version", userID)
	val, err := c.rdb.Get(ctx, key).Int64()
	if err != nil {
		return 1
	}
	if val <= 0 {
		return 1
	}
	return val
}

func (c *Client) BumpSessionVersion(ctx context.Context, userID string) int64 {
	if !c.Enabled() {
		return 1
	}
	key := c.Key("session", "version", userID)
	val, err := c.rdb.Incr(ctx, key).Result()
	if err != nil || val <= 0 {
		return 1
	}
	return val
}

func (c *Client) RevokeJTI(ctx context.Context, jti string, expiresAt time.Time) {
	if !c.Enabled() || jti == "" {
		return
	}
	ttl := time.Until(expiresAt)
	if ttl <= 0 {
		ttl = 24 * time.Hour
	}
	_ = c.rdb.Set(ctx, c.Key("jwt", "revoke", jti), "1", ttl).Err()
}

func (c *Client) IsRevokedJTI(ctx context.Context, jti string) bool {
	if !c.Enabled() || jti == "" {
		return false
	}
	val, err := c.rdb.Exists(ctx, c.Key("jwt", "revoke", jti)).Result()
	if err != nil {
		return false
	}
	return val > 0
}

func (c *Client) SetPresence(ctx context.Context, userID string, ttl time.Duration) {
	if !c.Enabled() {
		return
	}
	_ = c.rdb.Set(ctx, c.Key("presence", "user", userID), time.Now().UTC().Format(time.RFC3339), ttl).Err()
}

func (c *Client) CountPresence(ctx context.Context) int64 {
	if !c.Enabled() {
		return 0
	}
	var cursor uint64
	var total int64
	for {
		keys, next, err := c.rdb.Scan(ctx, cursor, c.Key("presence", "user", "*"), 200).Result()
		if err != nil {
			return total
		}
		total += int64(len(keys))
		cursor = next
		if cursor == 0 {
			break
		}
	}
	return total
}

type EmailJob struct {
	JobID       string    `json:"job_id"`
	RetryCount  int       `json:"retry_count"`
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

func (c *Client) EnqueueEmailJob(ctx context.Context, queue string, job EmailJob) (string, error) {
	if !c.Enabled() {
		return "", fmt.Errorf("redis disabled")
	}
	if job.JobID == "" {
		job.JobID = uuid.NewString()
	}
	if job.CreatedAt.IsZero() {
		job.CreatedAt = time.Now().UTC()
	}
	key := c.Key("queue", queue)
	if err := c.rdb.RPush(ctx, key, mustMarshal(job)).Err(); err != nil {
		return "", err
	}
	return job.JobID, nil
}

func mustMarshal(v interface{}) string {
	b, _ := json.Marshal(v)
	return string(b)
}

func (c *Client) QueueDepth(ctx context.Context, queue string) int64 {
	if !c.Enabled() {
		return 0
	}
	n, err := c.rdb.LLen(ctx, c.Key("queue", queue)).Result()
	if err != nil {
		return 0
	}
	return n
}

func (c *Client) DLQDepth(ctx context.Context, queue string) int64 {
	if !c.Enabled() {
		return 0
	}
	n, err := c.rdb.LLen(ctx, c.Key("queue", queue, "dlq")).Result()
	if err != nil {
		return 0
	}
	return n
}

