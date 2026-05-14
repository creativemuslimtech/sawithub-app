package handler

import (
	"encoding/json"
	"net/http"

	mw "SawitHub/internal/middleware"
)

func (h *Handler) ListHarga(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(mw.UserIDKey).(string)
	result, err := h.farmFinanceCommodityPrice.List(r.Context(), userID)
	if err != nil {
		jsonError(w, "server error", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}
