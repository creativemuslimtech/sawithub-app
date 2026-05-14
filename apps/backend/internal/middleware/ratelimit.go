package middleware

import (
	"net/http"
	"strings"
	"sync"
	"time"

	"SawitHub/internal/config"
	"SawitHub/internal/observability"
	redisx "SawitHub/internal/redis"
)

type RateLimiter struct {
	mu            sync.RWMutex
	buckets       map[string]*tokenBucket
	maxTokens     int
	refillRate    int // tokens per second
	cleanupTicker *time.Ticker
	cfg           *config.Config
	redis         *redisx.Client
}

type tokenBucket struct {
	tokens    float64
	lastRefill time.Time
}

func NewRateLimiter(cfg *config.Config, redisClient *redisx.Client, maxTokens int, tokensPerSecond int) *RateLimiter {
	rl := &RateLimiter{
		buckets:       make(map[string]*tokenBucket),
		maxTokens:     maxTokens,
		refillRate:    tokensPerSecond,
		cleanupTicker: time.NewTicker(1 * time.Minute),
		cfg:           cfg,
		redis:         redisClient,
	}

	go func() {
		for range rl.cleanupTicker.C {
			rl.cleanup()
		}
	}()

	return rl
}

func (rl *RateLimiter) Allow(userID string) bool {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	bucket, exists := rl.buckets[userID]
	if !exists {
		bucket = &tokenBucket{
			tokens:    float64(rl.maxTokens),
			lastRefill: time.Now(),
		}
		rl.buckets[userID] = bucket
	}

	now := time.Now()
	elapsed := now.Sub(bucket.lastRefill).Seconds()
	bucket.tokens += elapsed * float64(rl.refillRate)
	if bucket.tokens > float64(rl.maxTokens) {
		bucket.tokens = float64(rl.maxTokens)
	}
	bucket.lastRefill = now

	if bucket.tokens >= 1 {
		bucket.tokens--
		return true
	}
	return false
}

func (rl *RateLimiter) cleanup() {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	now := time.Now()
	for userID, bucket := range rl.buckets {
		if now.Sub(bucket.lastRefill) > 5*time.Minute {
			delete(rl.buckets, userID)
		}
	}
}

func (rl *RateLimiter) Stop() {
	rl.cleanupTicker.Stop()
}

func RateLimit(rl *RateLimiter) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			userID := r.Context().Value(UserIDKey).(string)
			limit := int64(rl.maxTokens)
			window := time.Minute
			path := r.URL.Path
			if strings.Contains(path, "/auth/login") || strings.Contains(path, "/auth/register") || strings.Contains(path, "/auth/reset-password") {
				limit = 20
			}

			allowed := false
			redisChecked := false
			redisErrored := false
			if rl.redis != nil && rl.redis.Enabled() && rl.cfg != nil && rl.cfg.RedisFeatureRateLimit {
				key := rl.redis.Key("rate", userID, path)
				ok, _, err := rl.redis.AllowFixedWindow(r.Context(), key, limit, window)
				redisChecked = true
				if err == nil {
					allowed = ok
				} else {
					redisErrored = true
					observability.IncLimiterFallback()
				}
			}
			if (!redisChecked || redisErrored) && !allowed {
				allowed = rl.Allow(userID)
			}

			if !allowed {
				observability.IncLimiterDeny()
				w.Header().Set("Content-Type", "application/json")
				w.Header().Set("Retry-After", "1")
				http.Error(w, `{"error":"rate limit exceeded"}`, http.StatusTooManyRequests)
				return
			}
			observability.IncLimiterAllow()

			next.ServeHTTP(w, r)
		})
	}
}
