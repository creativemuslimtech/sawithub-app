package middleware

import (
	"context"
	"database/sql"
	"net/http"
	"strings"

	"SawitHubAdmin/internal/config"
	redisx "SawitHubAdmin/internal/redis"

	"github.com/golang-jwt/jwt/v5"
)

func AdminAuth(cfg *config.Config, dbWrite *sql.DB, dbRead *sql.DB, redisClient *redisx.Client) func(http.Handler) http.Handler {
	if dbRead == nil {
		dbRead = dbWrite
	}
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			tokenStr := ""
			if h := r.Header.Get("Authorization"); strings.HasPrefix(h, "Bearer ") {
				tokenStr = strings.TrimPrefix(h, "Bearer ")
			}
			if tokenStr == "" {
				if c, err := r.Cookie("sawit_admin_token"); err == nil {
					tokenStr = c.Value
				}
			}
			if tokenStr == "" {
				http.Error(w, `{"error":"unauthorized"}`, http.StatusUnauthorized)
				return
			}

			token, err := jwt.Parse(tokenStr, func(t *jwt.Token) (interface{}, error) {
				if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
					return nil, jwt.ErrSignatureInvalid
				}
				return []byte(cfg.AdminJWTSecret), nil
			})
			if err != nil || !token.Valid {
				http.Error(w, `{"error":"unauthorized"}`, http.StatusUnauthorized)
				return
			}

			claims, ok := token.Claims.(jwt.MapClaims)
			if !ok {
				http.Error(w, `{"error":"unauthorized"}`, http.StatusUnauthorized)
				return
			}

			adminUserID, _ := claims["user_id"].(string)
			email, _ := claims["email"].(string)
			role, _ := claims["role"].(string)
			jti, _ := claims["jti"].(string)
			tokenSessionVersion, _ := claims["sv"].(float64)
			expFloat, _ := claims["exp"].(float64)
			if tokenSessionVersion <= 0 {
				tokenSessionVersion = 1
			}
			if adminUserID == "" || (role != "admin" && role != "super_admin") {
				http.Error(w, `{"error":"forbidden"}`, http.StatusForbidden)
				return
			}

			redisSessionScope := "admin:" + adminUserID
			if redisClient != nil && redisClient.Enabled() && cfg.RedisFeatureSessions {
				if redisClient.IsRevokedJTI(r.Context(), jti) {
					http.Error(w, `{"error":"unauthorized"}`, http.StatusUnauthorized)
					return
				}
				currentSessionVersion := redisClient.GetSessionVersion(r.Context(), redisSessionScope)
				if int64(tokenSessionVersion) != currentSessionVersion {
					http.Error(w, `{"error":"unauthorized"}`, http.StatusUnauthorized)
					return
				}
			}

			var active int
			err = dbRead.QueryRowContext(r.Context(),
				"SELECT is_active FROM t_sawit_admin_users WHERE admin_user_id = ? AND deleted_at IS NULL", adminUserID).
				Scan(&active)
			if err != nil || active != 1 {
				http.Error(w, `{"error":"unauthorized"}`, http.StatusUnauthorized)
				return
			}

			ctx := context.WithValue(r.Context(), UserIDKey, adminUserID)
			ctx = context.WithValue(ctx, EmailKey, email)
			ctx = context.WithValue(ctx, RoleKey, role)
			ctx = context.WithValue(ctx, TokenJTIKey, jti)
			ctx = context.WithValue(ctx, TokenExpKey, int64(expFloat))
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}
