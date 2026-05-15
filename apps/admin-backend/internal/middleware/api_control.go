package middleware

import (
	"context"
	"encoding/json"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"

	redisx "sawithub/admin-backend/internal/redis"
)

const apiEnabledKeySuffix = "control:api_enabled"
const apiEndpointKeyPrefix = "control:api_endpoint_disabled"

func normalizeAPIPath(path string) string {
	path = strings.TrimSpace(path)
	if path == "" {
		return ""
	}
	path = strings.Split(path, "?")[0]
	path = strings.TrimSuffix(path, "/*")
	if !strings.HasPrefix(path, "/") {
		path = "/" + path
	}
	if len(path) > 1 {
		path = strings.TrimRight(path, "/")
	}
	return path
}

func routePatternForGate(r *http.Request) string {
	if routeCtx := chi.RouteContext(r.Context()); routeCtx != nil {
		if pattern := normalizeAPIPath(routeCtx.RoutePattern()); pattern != "" {
			return pattern
		}
	}
	return normalizeAPIPath(r.URL.Path)
}

func apiEndpointToggleKey(method, path string) string {
	normalizedMethod := strings.ToUpper(strings.TrimSpace(method))
	normalizedPath := normalizeAPIPath(path)
	return apiEndpointKeyPrefix + ":" + url.QueryEscape(normalizedMethod+" "+normalizedPath)
}

func APIGate(redisClient *redisx.Client) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if redisClient == nil || !redisClient.Enabled() {
				next.ServeHTTP(w, r)
				return
			}

			path := r.URL.Path
			if path == "/health" || path == "/api/health" || !strings.HasPrefix(path, "/api/") {
				next.ServeHTTP(w, r)
				return
			}
			// Admin endpoints stay reachable so API can be turned on again.
			// Keep parity with backend-sawithub APIGate: user login path for shared Redis gate semantics.
			if strings.HasPrefix(path, "/api/admin/") || path == "/api/IdentityAuthService/login" || path == "/api/auth/login" {
				next.ServeHTTP(w, r)
				return
			}

			method := strings.ToUpper(strings.TrimSpace(r.Method))
			routePath := routePatternForGate(r)

			ctx := r.Context()
			cctx, cancel := context.WithTimeout(ctx, 500*time.Millisecond)
			defer cancel()

			raw, err := redisClient.Raw().Get(cctx, redisClient.Key(apiEnabledKeySuffix)).Result()
			if err != nil {
				next.ServeHTTP(w, r)
				return
			}

			v := strings.ToLower(strings.TrimSpace(raw))
			if v == "0" || v == "false" || v == "off" || v == "disabled" {
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusServiceUnavailable)
				_ = json.NewEncoder(w).Encode(map[string]string{
					"error": "api sedang dinonaktifkan oleh admin",
				})
				return
			}

			endpointRaw, endpointErr := redisClient.Raw().Get(cctx, redisClient.Key(apiEndpointToggleKey(method, routePath))).Result()
			if endpointErr == nil {
				v = strings.ToLower(strings.TrimSpace(endpointRaw))
				if v == "1" || v == "true" || v == "off" || v == "disabled" {
					w.Header().Set("Content-Type", "application/json")
					w.WriteHeader(http.StatusServiceUnavailable)
					_ = json.NewEncoder(w).Encode(map[string]string{
						"error": "endpoint api dinonaktifkan oleh admin",
					})
					return
				}
			}

			next.ServeHTTP(w, r)
		})
	}
}
