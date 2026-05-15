package middleware

import (
	"net/http"
	"strings"

	"sawithub/backend/internal/config"
	redisx "sawithub/backend/internal/redis"
)

type statusRecorder struct {
	http.ResponseWriter
	status int
}

func (s *statusRecorder) WriteHeader(code int) {
	s.status = code
	s.ResponseWriter.WriteHeader(code)
}

func InvalidateCacheOnMutation(cfg *config.Config, redisClient *redisx.Client) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if r.Method == http.MethodGet || r.Method == http.MethodHead || r.Method == http.MethodOptions {
				next.ServeHTTP(w, r)
				return
			}

			rec := &statusRecorder{ResponseWriter: w, status: http.StatusOK}
			next.ServeHTTP(rec, r)
			if rec.status >= 400 || redisClient == nil || !redisClient.Enabled() || !cfg.RedisFeatureCache {
				return
			}
			userID, _ := r.Context().Value(UserIDKey).(string)
			if strings.TrimSpace(userID) != "" {
				redisClient.DeleteByPattern(r.Context(), redisClient.Key("cache", "*", userID, "*"), 500)
			}
		})
	}
}

