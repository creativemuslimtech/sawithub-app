package handler

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"time"

	mw "sawithub/backend/internal/middleware"
)

func (h *Handler) Ping(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusNoContent)
}

func (h *Handler) UpdatePassword(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(mw.UserIDKey).(string)

	var req struct {
		CurrentPassword string `json:"current_password"`
		NewPassword     string `json:"new_password"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		jsonError(w, "invalid request", http.StatusBadRequest)
		return
	}

	if len(req.NewPassword) < 8 {
		jsonError(w, "password minimal 8 karakter", http.StatusBadRequest)
		return
	}

	if err := h.identityAuth.ChangePassword(r.Context(), userID, req.CurrentPassword, req.NewPassword); err == sql.ErrNoRows {
		jsonError(w, "user tidak ditemukan", http.StatusUnauthorized)
		return
	} else if err != nil {
		jsonError(w, "password saat ini salah", http.StatusUnauthorized)
		return
	}
	if h.redis != nil && h.redis.Enabled() && h.cfg.RedisFeatureSessions {
		h.redis.BumpSessionVersion(r.Context(), userID)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "password berhasil diubah"})
}

func (h *Handler) Logout(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(mw.UserIDKey).(string)
	jti, _ := r.Context().Value(mw.TokenJTIKey).(string)
	expUnix, _ := r.Context().Value(mw.TokenExpKey).(int64)
	if h.redis != nil && h.redis.Enabled() && h.cfg.RedisFeatureSessions && jti != "" {
		h.redis.RevokeJTI(r.Context(), jti, time.Unix(expUnix, 0))
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"message": "logout berhasil",
		"user_id": userID,
	})
}

func (h *Handler) LogoutAll(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(mw.UserIDKey).(string)
	if h.redis != nil && h.redis.Enabled() && h.cfg.RedisFeatureSessions {
		h.redis.BumpSessionVersion(r.Context(), userID)
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "logout semua device berhasil"})
}
