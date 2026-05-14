package handler

import (
	"encoding/json"
	"errors"
	"net/http"

	mw "SawitHub/internal/middleware"
	"SawitHub/internal/reporting"
)

func (h *Handler) EmailLaporanKeuanganExport(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(mw.UserIDKey).(string)

	var req reporting.FarmFinanceExportEmailRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		jsonError(w, "request export tidak valid", http.StatusBadRequest)
		return
	}

	body, err := h.reportingExport.SendFarmFinanceExportEmail(r.Context(), userID, req)
	if err != nil {
		var he *reporting.HTTPError
		if errors.As(err, &he) {
			if he.Status == http.StatusPaymentRequired {
				jsonSubscriptionRequired(w, he.Message)
				return
			}
			jsonError(w, he.Message, he.Status)
			return
		}
		jsonError(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(body)
}
