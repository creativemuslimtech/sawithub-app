package handler

import (
	"encoding/json"
	"net"
	"net/http"
	"strings"
	"time"
)

func clientIP(r *http.Request) string {
	if xff := r.Header.Get("X-Forwarded-For"); xff != "" {
		parts := strings.Split(xff, ",")
		return strings.TrimSpace(parts[0])
	}
	if xri := r.Header.Get("X-Real-IP"); xri != "" {
		return strings.TrimSpace(xri)
	}
	host, _, err := net.SplitHostPort(r.RemoteAddr)
	if err == nil {
		return host
	}
	return r.RemoteAddr
}

// allowPublicIPWindow enforces a fixed-window limit per client IP (password-reset and similar public routes).
func (h *Handler) allowPublicIPWindow(w http.ResponseWriter, r *http.Request, bucket string, limit int64, window time.Duration) bool {
	if h.redis == nil || !h.redis.Enabled() || h.cfg == nil || !h.cfg.RedisFeatureRateLimit {
		return true
	}
	ip := clientIP(r)
	if ip == "" {
		ip = "unknown"
	}
	key := h.redis.Key("pwreset", bucket, ip)
	ok, _, err := h.redis.AllowFixedWindow(r.Context(), key, limit, window)
	if err != nil {
		return true
	}
	if !ok {
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Retry-After", "120")
		w.WriteHeader(http.StatusTooManyRequests)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "terlalu banyak permintaan, coba lagi nanti"})
		return false
	}
	return true
}
