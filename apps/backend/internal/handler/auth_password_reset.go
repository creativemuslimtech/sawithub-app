package handler

import (
	"encoding/json"
	"fmt"
	"math/rand"
	"net/http"
	"strings"
	"time"

	redisx "sawithub/backend/internal/redis"
)

func (h *Handler) ForgotPassword(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Email string `json:"email"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		jsonError(w, "invalid request", http.StatusBadRequest)
		return
	}
	req.Email = strings.TrimSpace(strings.ToLower(req.Email))
	if req.Email == "" {
		jsonError(w, "email wajib diisi", http.StatusBadRequest)
		return
	}

	exists, err := h.identityAuth.HasEmail(r.Context(), req.Email)
	if err != nil {
		jsonError(w, "server error", http.StatusInternalServerError)
		return
	}
	// Always return OK for unknown email to prevent enumeration.
	if !exists {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"message": "ok"})
		return
	}

	// Generate 6-digit OTP
	code := fmt.Sprintf("%06d", rand.Intn(1000000))
	expires := time.Now().Add(15 * time.Minute)
	if err := h.identityAuth.CreatePasswordReset(r.Context(), req.Email, code, expires); err != nil {
		jsonError(w, "server error", http.StatusInternalServerError)
		return
	}

	// Send email (best-effort — don't fail if SMTP not configured)
	if h.mailer.APIKey != "" {
		if h.redis != nil && h.redis.Enabled() && h.cfg.RedisFeatureQueue {
			_, _ = h.redis.EnqueueEmailJob(r.Context(), "email", redisx.EmailJob{
				Type:    "reset_code",
				ToEmail: req.Email,
				Code:    code,
			})
		} else {
			go h.mailer.SendResetCode(req.Email, code)
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "ok"})
}

func (h *Handler) VerifyReset(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Email string `json:"email"`
		Code  string `json:"code"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		jsonError(w, "invalid request", http.StatusBadRequest)
		return
	}
	req.Email = strings.TrimSpace(strings.ToLower(req.Email))

	ok, err := h.identityAuth.VerifyPasswordResetCode(r.Context(), req.Email, req.Code)
	if err != nil {
		jsonError(w, "server error", http.StatusInternalServerError)
		return
	}
	if !ok {
		jsonError(w, "kode tidak valid atau sudah kedaluwarsa", http.StatusUnauthorized)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "ok"})
}

func (h *Handler) ResetPassword(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Email    string `json:"email"`
		Code     string `json:"code"`
		Password string `json:"password"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		jsonError(w, "invalid request", http.StatusBadRequest)
		return
	}
	req.Email = strings.TrimSpace(strings.ToLower(req.Email))
	if len(req.Password) < 8 {
		jsonError(w, "password minimal 8 karakter", http.StatusBadRequest)
		return
	}

	ok, err := h.identityAuth.ResetPasswordWithCode(r.Context(), req.Email, req.Code, req.Password)
	if err != nil {
		jsonError(w, "server error", http.StatusInternalServerError)
		return
	}
	if !ok {
		jsonError(w, "kode tidak valid atau sudah kedaluwarsa", http.StatusUnauthorized)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "password berhasil diubah"})
}
