package handler

import (
	"encoding/json"
	"net/http"
	"strconv"

	mw "SawitHub/internal/middleware"
)

// ListBillingPaymentTransactions returns the current user's payment history (BE-05).
func (h *Handler) ListBillingPaymentTransactions(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(mw.UserIDKey).(string)

	page := 1
	if raw := r.URL.Query().Get("page"); raw != "" {
		if p, err := strconv.Atoi(raw); err == nil && p > 0 {
			page = p
		}
	}
	limit := 20
	if raw := r.URL.Query().Get("limit"); raw != "" {
		if n, err := strconv.Atoi(raw); err == nil && n > 0 {
			limit = n
		}
	}

	items, next, err := h.billingPayment.ListTransactions(r.Context(), userID, page, limit)
	if err != nil {
		jsonError(w, "gagal memuat riwayat pembayaran", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"items":        items,
		"next_cursor":  next,
	})
}
