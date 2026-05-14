package middleware

import (
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/go-chi/chi/v5/middleware"
)

const maxLoggedQueryRunes = 200

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

// SafeRequestLogger logs method, path, and a sanitized query (no raw body) — SEC-13.
func SafeRequestLogger(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ww := middleware.NewWrapResponseWriter(w, r.ProtoMajor)
		t1 := time.Now()
		defer func() {
			uri := sanitizeRequestURIForLog(r.URL.RequestURI())
			log.Printf("%s %s %s %d %s", r.RemoteAddr, r.Method, uri, ww.Status(), time.Since(t1))
		}()
		next.ServeHTTP(ww, r)
	})
}
