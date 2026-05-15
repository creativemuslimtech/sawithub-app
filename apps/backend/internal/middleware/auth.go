package middleware

import (
	"context"
	"database/sql"
	"net/http"
	"strings"
	"time"

	"sawithub/backend/internal/config"
	redisx "sawithub/backend/internal/redis"

	"github.com/golang-jwt/jwt/v5"
)

type contextKey string

const UserIDKey contextKey = "user_id"
const EmailKey contextKey = "email"
const RoleKey contextKey = "role"
const TokenJTIKey contextKey = "token_jti"
const TokenExpKey contextKey = "token_exp"

const presenceWriteIntervalMinutes = 1

func Auth(cfg *config.Config, dbWrite *sql.DB, dbRead *sql.DB, presenceEnabled bool, redisClient *redisx.Client) func(http.Handler) http.Handler {
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
				if c, err := r.Cookie("sawit_token"); err == nil {
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
				return []byte(cfg.JWTSecret), nil
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

			userID, _ := claims["user_id"].(string)
			email, _ := claims["email"].(string)
			jti, _ := claims["jti"].(string)
			tokenSessionVersion, _ := claims["sv"].(float64)
			expFloat, _ := claims["exp"].(float64)
			if tokenSessionVersion <= 0 {
				tokenSessionVersion = 1
			}
			if userID == "" {
				http.Error(w, `{"error":"unauthorized"}`, http.StatusUnauthorized)
				return
			}

			if redisClient != nil && redisClient.Enabled() && cfg.RedisFeatureSessions {
				if redisClient.IsRevokedJTI(r.Context(), jti) {
					http.Error(w, `{"error":"unauthorized"}`, http.StatusUnauthorized)
					return
				}
				currentSessionVersion := redisClient.GetSessionVersion(r.Context(), userID)
				if int64(tokenSessionVersion) != currentSessionVersion {
					http.Error(w, `{"error":"unauthorized"}`, http.StatusUnauthorized)
					return
				}
			}

			var role string
			err = dbRead.QueryRowContext(r.Context(),
				"SELECT role FROM t_sawit_hub_users WHERE user_id = ? AND deleted_at IS NULL", userID).
				Scan(&role)
			if err != nil {
				http.Error(w, `{"error":"unauthorized"}`, http.StatusUnauthorized)
				return
			}

			if presenceEnabled {
				_, _ = dbWrite.ExecContext(r.Context(),
					`UPDATE t_sawit_hub_users
					 SET last_seen_at = NOW()
					 WHERE user_id = ?
					   AND deleted_at IS NULL
					   AND (last_seen_at IS NULL OR last_seen_at < DATE_SUB(NOW(), INTERVAL ? MINUTE))`,
					userID, presenceWriteIntervalMinutes)
				if redisClient != nil && redisClient.Enabled() && cfg.RedisFeaturePresence {
					redisClient.SetPresence(r.Context(), userID, 5*time.Minute)
				}
			}

			ctx := context.WithValue(r.Context(), UserIDKey, userID)
			ctx = context.WithValue(ctx, EmailKey, email)
			ctx = context.WithValue(ctx, RoleKey, role)
			ctx = context.WithValue(ctx, TokenJTIKey, jti)
			ctx = context.WithValue(ctx, TokenExpKey, int64(expFloat))
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}
