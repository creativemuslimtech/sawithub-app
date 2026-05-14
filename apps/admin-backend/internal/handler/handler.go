package handler

import (
	"context"
	"database/sql"
	"encoding/json"
	"net/http"
	"sync"
	"time"

	"SawitHubAdmin/internal/config"
	redisx "SawitHubAdmin/internal/redis"
)

type Handler struct {
	db              *sql.DB
	dbRead          *sql.DB
	adminDB         *sql.DB
	adminDBRead     *sql.DB
	cfg             *config.Config
	apiMonitor      *APIMonitor
	presenceEnabled bool
	redis           *redisx.Client

	paymentsRevenueMetaOnce       sync.Once
	paymentsRevenueHasEnvironment bool
}

func New(db *sql.DB, dbRead *sql.DB, adminDB *sql.DB, adminDBRead *sql.DB, cfg *config.Config, apiMonitor *APIMonitor, presenceEnabled bool, redisClient *redisx.Client) *Handler {
	if dbRead == nil {
		dbRead = db
	}
	if adminDBRead == nil {
		adminDBRead = adminDB
	}
	return &Handler{
		db:              db,
		dbRead:          dbRead,
		adminDB:         adminDB,
		adminDBRead:     adminDBRead,
		cfg:             cfg,
		apiMonitor:      apiMonitor,
		presenceEnabled: presenceEnabled,
		redis:           redisClient,
	}
}

func jsonError(w http.ResponseWriter, msg string, code int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	json.NewEncoder(w).Encode(map[string]string{"error": msg})
}

func (h *Handler) cacheEnabled() bool {
	return h.redis != nil && h.redis.Enabled() && h.cfg.RedisFeatureCache
}

func (h *Handler) cacheKey(userID, endpoint, query string) string {
	return h.redis.Key("cache", endpoint, userID, query)
}

func (h *Handler) cacheSetUserPayload(key string, payload interface{}, ttl time.Duration) {
	if !h.cacheEnabled() {
		return
	}
	_ = h.redis.SetJSON(context.Background(), key, payload, ttl)
}
