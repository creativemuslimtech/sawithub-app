package middleware

import (
	"log"
	"net/http"
	"strings"
	"time"

	"SawitHub/internal/logger"

	"github.com/go-chi/chi/v5/middleware"
)

const maxLoggedQueryRunes = 200

// sanitizeRequestURIForLog strips CRLF and truncates query strings to limit log injection (SEC-13).
func sanitizeRequestURIForLog(raw string) string {
	raw = strings.ReplaceAll(raw, "\r", "")
	raw = strings.ReplaceAll(raw, "\n", "")
	if len(raw) > maxLoggedQueryRunes {
		runes := []rune(raw)
		if len(runes) > maxLoggedQueryRunes {
			raw = string(runes[:maxLoggedQueryRunes]) + "…"
		}
	}
	return raw
}

// SafeRequestLogger logs method, path, and a sanitized query (no raw body).
// Also ships structured request logs to Loki when configured.
func SafeRequestLogger(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ww := middleware.NewWrapResponseWriter(w, r.ProtoMajor)
		t1 := time.Now()
		defer func() {
			duration := time.Since(t1)
			uri := sanitizeRequestURIForLog(r.URL.RequestURI())
			log.Printf("%s %s %s %d %s", r.RemoteAddr, r.Method, uri, ww.Status(), duration)
			userID, _ := r.Context().Value(UserIDKey).(string)
			logger.Request(r.Method, r.URL.Path, ww.Status(), duration, userID)
		}()
		next.ServeHTTP(ww, r)
	})
}
