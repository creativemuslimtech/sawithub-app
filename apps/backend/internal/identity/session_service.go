package identity

import (
	"context"
	"database/sql"
	"strings"
	"time"

	"sawithub/backend/internal/config"
	redisx "sawithub/backend/internal/redis"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

type IdentitySessionService struct {
	cfg             *config.Config
	db              *sql.DB
	redis           *redisx.Client
	presenceEnabled bool
}

func NewIdentitySessionService(cfg *config.Config, db *sql.DB, redis *redisx.Client, presenceEnabled bool) *IdentitySessionService {
	return &IdentitySessionService{
		cfg:             cfg,
		db:              db,
		redis:           redis,
		presenceEnabled: presenceEnabled,
	}
}

func (s *IdentitySessionService) MarkUserSeen(ctx context.Context, userID string) {
	if !s.presenceEnabled || strings.TrimSpace(userID) == "" {
		return
	}
	_, _ = s.db.ExecContext(ctx,
		`UPDATE t_sawit_hub_users
		 SET last_seen_at = NOW()
		 WHERE user_id = ? AND deleted_at IS NULL`,
		userID)
	if s.redis != nil && s.redis.Enabled() && s.cfg.RedisFeaturePresence {
		s.redis.SetPresence(ctx, userID, 5*time.Minute)
	}
}

func (s *IdentitySessionService) GenerateToken(ctx context.Context, userID, email, role string) (string, error) {
	sessionVersion := int64(1)
	if s.redis != nil && s.redis.Enabled() && s.cfg.RedisFeatureSessions {
		sessionVersion = s.redis.GetSessionVersion(ctx, userID)
	}
	jti := uuid.NewString()
	exp := time.Now().Add(30 * 24 * time.Hour).Unix()
	claims := jwt.MapClaims{
		"user_id": userID,
		"email":   email,
		"role":    role,
		"exp":     exp,
		"iat":     time.Now().Unix(),
		"jti":     jti,
		"sv":      sessionVersion,
	}
	return jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString([]byte(s.cfg.JWTSecret))
}
