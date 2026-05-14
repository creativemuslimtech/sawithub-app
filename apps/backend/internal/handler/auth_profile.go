package handler

import (
	"database/sql"
	"encoding/json"
	"errors"
	"net/http"
	"regexp"
	"strings"
	"time"

	"SawitHub/internal/identity"
	mw "SawitHub/internal/middleware"
)

var phoneRe = regexp.MustCompile(`^[0-9+\-\s]{8,15}$`)

func (h *Handler) Me(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(mw.UserIDKey).(string)
	user, createdAt, updatedAt, err := h.identityAuth.GetByUserID(r.Context(), userID)
	if err == sql.ErrNoRows {
		jsonError(w, "akun tidak ditemukan", http.StatusNotFound)
		return
	}
	if err != nil {
		jsonError(w, "server error", http.StatusInternalServerError)
		return
	}

	prefs, err := h.identityProfile.GetPreferencesJSON(r.Context(), userID)
	if err != nil {
		jsonError(w, "server error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"user": map[string]interface{}{
			"user_id":     user.UserID,
			"public_id":   user.PublicID,
			"email":       user.Email,
			"username":    user.Username,
			"full_name":   user.FullName,
			"phone":       user.Phone,
			"role":        user.Role,
			"created_at":  createdAt.Format(time.RFC3339),
			"updated_at":  updatedAt.Format(time.RFC3339),
			"preferences": prefs,
		},
	})
}

func (h *Handler) UpdatePreferences(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(mw.UserIDKey).(string)

	var req struct {
		OnboardingDone *bool `json:"onboarding_done"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		jsonError(w, "invalid request", http.StatusBadRequest)
		return
	}
	patch := map[string]interface{}{}
	if req.OnboardingDone != nil {
		patch["onboarding_done"] = *req.OnboardingDone
	}
	if len(patch) == 0 {
		jsonError(w, "tidak ada field yang diubah", http.StatusBadRequest)
		return
	}
	if err := h.identityProfile.MergePreferencesJSON(r.Context(), userID, patch); err != nil {
		if errors.Is(err, identity.ErrUnknownPreferenceField) {
			jsonError(w, "field preferensi tidak valid", http.StatusBadRequest)
			return
		}
		jsonError(w, "server error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "preferensi disimpan"})
}

func (h *Handler) UpdateFullName(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(mw.UserIDKey).(string)

	var req struct {
		NewFullName string `json:"new_full_name"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		jsonError(w, "invalid request", http.StatusBadRequest)
		return
	}
	req.NewFullName = strings.TrimSpace(req.NewFullName)
	if req.NewFullName != "" && len(req.NewFullName) < 3 {
		jsonError(w, "nama lengkap minimal 3 karakter", http.StatusBadRequest)
		return
	}

	if err := h.identityProfile.UpdateFullName(r.Context(), userID, req.NewFullName); err != nil {
		jsonError(w, "server error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "nama lengkap berhasil diubah"})
}

func (h *Handler) UpdateEmail(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(mw.UserIDKey).(string)

	var req struct {
		NewEmail string `json:"new_email"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		jsonError(w, "invalid request", http.StatusBadRequest)
		return
	}
	req.NewEmail = strings.TrimSpace(strings.ToLower(req.NewEmail))
	if req.NewEmail == "" {
		jsonError(w, "email wajib diisi", http.StatusBadRequest)
		return
	}

	ok, err := h.identityProfile.UpdateEmail(r.Context(), userID, req.NewEmail)
	if err != nil {
		jsonError(w, "server error", http.StatusInternalServerError)
		return
	}
	if !ok {
		jsonError(w, "email sudah digunakan", http.StatusConflict)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "email berhasil diubah"})
}

func (h *Handler) UpdatePhone(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(mw.UserIDKey).(string)

	var req struct {
		NewPhone string `json:"new_phone"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		jsonError(w, "invalid request", http.StatusBadRequest)
		return
	}
	req.NewPhone = strings.TrimSpace(req.NewPhone)

	if req.NewPhone != "" && !phoneRe.MatchString(req.NewPhone) {
		jsonError(w, "format nomor telepon tidak valid", http.StatusBadRequest)
		return
	}
	if err := h.identityProfile.UpdatePhone(r.Context(), userID, req.NewPhone); err != nil {
		jsonError(w, "server error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "nomor telepon berhasil diubah"})
}

func (h *Handler) UpdateUsername(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(mw.UserIDKey).(string)

	var req struct {
		NewUsername string `json:"new_username"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		jsonError(w, "invalid request", http.StatusBadRequest)
		return
	}
	req.NewUsername = strings.ToLower(strings.TrimSpace(req.NewUsername))
	if req.NewUsername == "" {
		jsonError(w, "username wajib diisi", http.StatusBadRequest)
		return
	}
	if len(req.NewUsername) < 3 {
		jsonError(w, "username minimal 3 karakter", http.StatusBadRequest)
		return
	}

	ok, err := h.identityProfile.UpdateUsername(r.Context(), userID, req.NewUsername)
	if err != nil {
		jsonError(w, "server error", http.StatusInternalServerError)
		return
	}
	if !ok {
		jsonError(w, "username sudah digunakan", http.StatusConflict)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "username berhasil diubah"})
}
