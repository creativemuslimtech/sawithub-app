package handler

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strings"

	"SawitHub/internal/identity"
	redisx "SawitHub/internal/redis"
)

func (h *Handler) Register(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Username string `json:"username"`
		Email    string `json:"email"`
		Password string `json:"password"`
		FullName string `json:"full_name"`
		Phone    string `json:"phone"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		jsonError(w, "invalid request", http.StatusBadRequest)
		return
	}
	req.Email = strings.TrimSpace(strings.ToLower(req.Email))
	req.Username = strings.ToLower(strings.TrimSpace(req.Username))

	if req.Email == "" || req.Password == "" || req.Username == "" {
		jsonError(w, "username, email, dan password wajib diisi", http.StatusBadRequest)
		return
	}
	if len(req.Password) < 8 {
		jsonError(w, "password minimal 8 karakter", http.StatusBadRequest)
		return
	}
	if len(req.Username) < 3 {
		jsonError(w, "username minimal 3 karakter", http.StatusBadRequest)
		return
	}

	emailExists, err := h.identityAuth.EmailExists(r.Context(), req.Email)
	if err != nil {
		jsonError(w, "server error", http.StatusInternalServerError)
		return
	}
	if emailExists {
		jsonError(w, "email sudah terdaftar", http.StatusConflict)
		return
	}
	usernameExists, err := h.identityAuth.UsernameExists(r.Context(), req.Username)
	if err != nil {
		jsonError(w, "server error", http.StatusInternalServerError)
		return
	}
	if usernameExists {
		jsonError(w, "username sudah digunakan", http.StatusConflict)
		return
	}
	user, err := h.identityAuth.Register(r.Context(), identity.RegisterInput{
		Username: req.Username,
		Email:    req.Email,
		Password: req.Password,
		FullName: req.FullName,
		Phone:    req.Phone,
	})
	if err != nil {
		jsonError(w, "server error: "+err.Error(), http.StatusInternalServerError)
		return
	}
	tokenStr, err := h.identitySession.GenerateToken(r.Context(), user.UserID, user.Email, user.Role)
	if err != nil {
		jsonError(w, "server error", http.StatusInternalServerError)
		return
	}
	h.identitySession.MarkUserSeen(r.Context(), user.UserID)

	// Send welcome email (best-effort — don't fail if SMTP not configured)
	if h.mailer.APIKey != "" {
		if h.redis != nil && h.redis.Enabled() && h.cfg.RedisFeatureQueue {
			_, _ = h.redis.EnqueueEmailJob(r.Context(), "email", redisx.EmailJob{
				Type:     "welcome",
				ToEmail:  req.Email,
				FullName: req.FullName,
			})
		} else {
			go h.mailer.SendWelcome(req.Email, req.FullName)
		}
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"token": tokenStr,
		"user": map[string]interface{}{
			"user_id":   user.UserID,
			"public_id": user.PublicID,
			"email":     user.Email,
			"username":  user.Username,
			"full_name": user.FullName,
			"phone":     user.Phone,
			"role":      user.Role,
		},
	})
}

func (h *Handler) Login(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Identifier string `json:"identifier"` // email, username, or phone
		Password   string `json:"password"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		jsonError(w, "invalid request", http.StatusBadRequest)
		return
	}
	req.Identifier = strings.TrimSpace(req.Identifier)

	user, err := h.identityAuth.Authenticate(r.Context(), req.Identifier, req.Password)
	if err == sql.ErrNoRows {
		jsonError(w, "akun tidak ditemukan", http.StatusUnauthorized)
		return
	}
	if err != nil {
		jsonError(w, "password salah", http.StatusUnauthorized)
		return
	}
	tokenStr, err := h.identitySession.GenerateToken(r.Context(), user.UserID, user.Email, user.Role)
	if err != nil {
		jsonError(w, "server error", http.StatusInternalServerError)
		return
	}
	h.identitySession.MarkUserSeen(r.Context(), user.UserID)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"token": tokenStr,
		"user": map[string]interface{}{
			"user_id":   user.UserID,
			"public_id": user.PublicID,
			"email":     user.Email,
			"username":  user.Username,
			"full_name": user.FullName,
			"phone":     user.Phone,
			"role":      user.Role,
		},
	})
}
