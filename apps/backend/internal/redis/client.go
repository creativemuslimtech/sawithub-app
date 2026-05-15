package redisx

import (
	"context"
	"crypto/tls"
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"time"

	"sawithub/backend/internal/config"

	"github.com/hibiken/asynq"
	goredis "github.com/redis/go-redis/v9"
)

type Client struct {
	enabled bool
	prefix  string
	rdb     *goredis.Client
}

func New(cfg *config.Config) *Client {
	if strings.TrimSpace(cfg.RedisAddr) == "" {
		return &Client{enabled: false, prefix: cfg.RedisPrefix}
	}

	opt := &goredis.Options{
		Addr:      cfg.RedisAddr,
		Password:  cfg.RedisPassword,
		DB:        cfg.RedisDB,
		PoolSize:  cfg.RedisPoolSize,
		TLSConfig: nil,
	}
	if cfg.RedisTLS {
		opt.TLSConfig = &tls.Config{MinVersion: tls.VersionTLS12}
	}

	return &Client{
		enabled: true,
		prefix:  cfg.RedisPrefix,
		rdb:     goredis.NewClient(opt),
	}
}

func (c *Client) Enabled() bool {
	return c != nil && c.enabled && c.rdb != nil
}

func (c *Client) IsHealthy(ctx context.Context) bool {
	if !c.Enabled() {
		return false
	}
	pctx, cancel := context.WithTimeout(ctx, 2*time.Second)
	defer cancel()
	return c.rdb.Ping(pctx).Err() == nil
}

func (c *Client) Health(ctx context.Context) map[string]interface{} {
	out := map[string]interface{}{
		"enabled": c.Enabled(),
		"status":  "disabled",
	}
	if !c.Enabled() {
		return out
	}
	pctx, cancel := context.WithTimeout(ctx, 2*time.Second)
	defer cancel()
	if err := c.rdb.Ping(pctx).Err(); err != nil {
		out["status"] = "down"
		out["error"] = err.Error()
		return out
	}
	out["status"] = "up"
	return out
}

func (c *Client) Close() error {
	if !c.Enabled() {
		return nil
	}
	return c.rdb.Close()
}

func (c *Client) Raw() *goredis.Client {
	if !c.Enabled() {
		return nil
	}
	return c.rdb
}

func (c *Client) Key(parts ...string) string {
	joined := strings.Join(parts, ":")
	if c == nil || c.prefix == "" {
		return joined
	}
	return fmt.Sprintf("%s:%s", c.prefix, joined)
}

func (c *Client) SetJSON(ctx context.Context, key string, value interface{}, ttl time.Duration) error {
	if !c.Enabled() {
		return errors.New("redis disabled")
	}
	buf, err := json.Marshal(value)
	if err != nil {
		return err
	}
	return c.rdb.Set(ctx, key, buf, ttl).Err()
}

func (c *Client) GetJSON(ctx context.Context, key string, out interface{}) (bool, error) {
	if !c.Enabled() {
		return false, errors.New("redis disabled")
	}
	raw, err := c.rdb.Get(ctx, key).Bytes()
	if err != nil {
		if err == goredis.Nil {
			return false, nil
		}
		return false, err
	}
	if err := json.Unmarshal(raw, out); err != nil {
		return false, err
	}
	return true, nil
}

// AsynqRedisOpt returns an asynq.RedisClientOpt using the same Redis connection
// settings as the underlying go-redis client.
func (c *Client) AsynqRedisOpt() asynq.RedisClientOpt {
	if !c.Enabled() {
		return asynq.RedisClientOpt{Addr: "localhost:6379"}
	}
	opt := c.rdb.Options()
	aOpt := asynq.RedisClientOpt{
		Addr:     opt.Addr,
		Password: opt.Password,
		DB:       opt.DB,
		PoolSize: opt.PoolSize,
	}
	if opt.TLSConfig != nil {
		aOpt.TLSConfig = opt.TLSConfig
	}
	return aOpt
}

func (c *Client) DeleteByPattern(ctx context.Context, pattern string, limit int64) int64 {
	if !c.Enabled() {
		return 0
	}
	var cursor uint64
	var total int64
	for {
		keys, next, err := c.rdb.Scan(ctx, cursor, pattern, limit).Result()
		if err != nil {
			return total
		}
		if len(keys) > 0 {
			n, _ := c.rdb.Del(ctx, keys...).Result()
			total += n
		}
		cursor = next
		if cursor == 0 {
			break
		}
	}
	return total
}

