package handler

import (
	"encoding/json"
	"net/http"
)

func (h *Handler) GetThemeConfig(w http.ResponseWriter, r *http.Request) {
	t := h.platformTheme.PublicConfig(r.Context())
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Cache-Control", "public, max-age=300")
	json.NewEncoder(w).Encode(t)
}
