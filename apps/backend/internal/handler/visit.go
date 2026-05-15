package handler

import (
	"encoding/json"
	"net/http"

	"sawithub/backend/internal/platform"
)

func (h *Handler) RecordVisit(w http.ResponseWriter, r *http.Request) {
	var req struct {
		SessionID  string `json:"session_id"`
		VisitorID  string `json:"visitor_id"`
		DeviceType string `json:"device_type"`
		Page       string `json:"page"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	if req.DeviceType != "web" && req.DeviceType != "mobile" {
		req.DeviceType = "web"
	}
	h.platformTraffic.EnqueueRecordVisit(platform.VisitInput{
		SessionID:  req.SessionID,
		VisitorID:  req.VisitorID,
		DeviceType: req.DeviceType,
		Page:       req.Page,
		ClientIP:   platform.ClientIPFromRequest(r),
	})
	w.WriteHeader(http.StatusNoContent)
}
