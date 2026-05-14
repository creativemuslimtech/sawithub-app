package handler

import (
	"encoding/json"
	"net/http"
	"strings"
	"time"

	mw "SawitHub/internal/middleware"
	"SawitHub/internal/observability"
	"SawitHub/internal/reporting"
)

func (h *Handler) GetLaporanKeuangan(w http.ResponseWriter, r *http.Request) {
	params := reporting.ParseLaporanParams(r)
	params.UserID = r.Context().Value(mw.UserIDKey).(string)
	isTrial := false
	if state, err := h.subscription.GetStatus(r.Context(), params.UserID); err == nil && strings.EqualFold(strings.TrimSpace(state.Status), "trialing") {
		isTrial = true
	}
	// Redis cache invalidation: successful mutating requests under /api (panen, perawatan, pendapatan, plot, …)
	// run InvalidateCacheOnMutation, which deletes keys matching the user id (see internal/middleware/cache_invalidate.go).
	cacheKey := ""
	if h.cacheEnabled() {
		cacheKey = h.cacheKey(params.UserID, "ReportingFarmFinanceService", r.URL.RawQuery)
		var cached reporting.LaporanKeuanganResponse
		if ok, _ := h.redis.GetJSON(r.Context(), cacheKey, &cached); ok {
			observability.IncCacheHit()
			// Must match non-cached path: trialing users only see first 2 detail rows.
			if isTrial && len(cached.Detail) > 2 {
				cached.Detail = cached.Detail[:2]
			}
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(cached)
			return
		}
		observability.IncCacheMiss()
	}

	resp := h.reportingFarmFinance.BuildLaporanKeuanganResponse(r.Context(), params)
	if isTrial {
		if len(resp.Detail) > 2 {
			resp.Detail = resp.Detail[:2]
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
	if cacheKey != "" {
		h.cacheSetUserPayload(cacheKey, resp, 2*time.Minute)
	}
}

func (h *Handler) GetReportingReconciliation(w http.ResponseWriter, r *http.Request) {
	params := reporting.ParseLaporanParams(r)
	params.UserID = r.Context().Value(mw.UserIDKey).(string)
	out := h.reportingFarmFinance.BuildRevenueReconciliation(r.Context(), params)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(out)
}
