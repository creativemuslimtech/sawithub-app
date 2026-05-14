package handler

import (
	"encoding/json"
	"net/http"
	"time"

	mw "SawitHub/internal/middleware"
	"SawitHub/internal/observability"
	"SawitHub/internal/reporting"
)

func (h *Handler) Dashboard(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(mw.UserIDKey).(string)
	ctx := r.Context()
	cacheKey := ""
	if h.cacheEnabled() {
		cacheKey = h.cacheKey(userID, "ReportingDashboardService", r.URL.RawQuery)
		var cached reporting.DashboardResponse
		if ok, _ := h.redis.GetJSON(ctx, cacheKey, &cached); ok {
			observability.IncCacheHit()
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(cached)
			return
		}
		observability.IncCacheMiss()
	}

	resp := h.reportingDashboard.Build(ctx, userID, r, time.Now())

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
	if cacheKey != "" {
		h.cacheSetUserPayload(cacheKey, resp, 90*time.Second)
	}
}
