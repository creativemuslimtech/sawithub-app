package handler

import (
	"context"
	"database/sql"
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"sawithub/admin-backend/internal/crypto"
	mw "sawithub/admin-backend/internal/middleware"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

func (h *Handler) generateAdminToken(userID, email, role string) (string, error) {
	sessionVersion := int64(1)
	redisSessionScope := "admin:" + userID
	if h.redis != nil && h.redis.Enabled() && h.cfg.RedisFeatureSessions {
		sessionVersion = h.redis.GetSessionVersion(context.Background(), redisSessionScope)
	}
	jti := uuid.NewString()
	exp := time.Now().Add(30 * 24 * time.Hour).Unix()
	claims := jwt.MapClaims{
		"user_id": userID,
		"email":   email,
		"role":    role,
		"exp":     exp,
		"iat":     time.Now().Unix(),
		"jti":     jti,
		"sv":      sessionVersion,
		"scope":   "admin",
	}
	return jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString([]byte(h.cfg.AdminJWTSecret))
}

func (h *Handler) AdminLogin(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Identifier string `json:"identifier"`
		Password   string `json:"password"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		jsonError(w, "invalid request", http.StatusBadRequest)
		return
	}
	req.Identifier = strings.TrimSpace(req.Identifier)

	var adminUserID, publicID, username, passwordHash, emailEnc, role string
	var fullNameEnc, phoneEnc sql.NullString
	query := `
		SELECT admin_user_id, public_id, username, password_hash, email_enc, full_name_enc, phone_enc, role
		FROM t_sawit_admin_users
		WHERE deleted_at IS NULL
		  AND is_active = 1
		  AND (
		    email_hash = ?
		    OR LOWER(username) = ?
		    OR phone_hash = ?
		  )
		LIMIT 1
	`
	idLower := strings.ToLower(req.Identifier)
	idHash := hashForAdminLookup(req.Identifier)
	err := h.adminDBRead.QueryRowContext(r.Context(), query, idHash, idLower, idHash).Scan(
		&adminUserID,
		&publicID,
		&username,
		&passwordHash,
		&emailEnc,
		&fullNameEnc,
		&phoneEnc,
		&role,
	)
	if err == sql.ErrNoRows {
		jsonError(w, "akun admin tidak ditemukan", http.StatusUnauthorized)
		return
	}
	if err != nil {
		jsonError(w, "server error", http.StatusInternalServerError)
		return
	}
	if err := bcrypt.CompareHashAndPassword([]byte(passwordHash), []byte(req.Password)); err != nil {
		jsonError(w, "password salah", http.StatusUnauthorized)
		return
	}

	email, _ := crypto.Decrypt(emailEnc, h.cfg.EncryptionKey)
	fullName := ""
	if fullNameEnc.Valid && fullNameEnc.String != "" {
		fullName, _ = crypto.Decrypt(fullNameEnc.String, h.cfg.EncryptionKey)
	}
	phone := ""
	if phoneEnc.Valid && phoneEnc.String != "" {
		phone, _ = crypto.Decrypt(phoneEnc.String, h.cfg.EncryptionKey)
	}

	tokenStr, err := h.generateAdminToken(adminUserID, email, role)
	if err != nil {
		jsonError(w, "server error", http.StatusInternalServerError)
		return
	}

	_, _ = h.adminDB.ExecContext(r.Context(),
		`UPDATE t_sawit_admin_users SET last_login_at = NOW() WHERE admin_user_id = ?`,
		adminUserID,
	)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"token": tokenStr,
		"user": map[string]interface{}{
			"user_id":   adminUserID,
			"public_id": publicID,
			"email":     email,
			"username":  username,
			"full_name": fullName,
			"phone":     phone,
			"role":      role,
		},
	})
}

func (h *Handler) AdminMe(w http.ResponseWriter, r *http.Request) {
	adminUserID := r.Context().Value(mw.UserIDKey).(string)
	var publicID, username, emailEnc, role string
	var fullNameEnc, phoneEnc sql.NullString
	var createdAt, updatedAt time.Time
	err := h.adminDBRead.QueryRowContext(r.Context(),
		`SELECT public_id, username, email_enc, full_name_enc, phone_enc, role, created_at, updated_at
		 FROM t_sawit_admin_users
		 WHERE admin_user_id=? AND deleted_at IS NULL AND is_active=1`,
		adminUserID).Scan(&publicID, &username, &emailEnc, &fullNameEnc, &phoneEnc, &role, &createdAt, &updatedAt)
	if err == sql.ErrNoRows {
		jsonError(w, "akun admin tidak ditemukan", http.StatusNotFound)
		return
	}
	if err != nil {
		jsonError(w, "server error", http.StatusInternalServerError)
		return
	}

	email, _ := crypto.Decrypt(emailEnc, h.cfg.EncryptionKey)
	fullName := ""
	if fullNameEnc.Valid && fullNameEnc.String != "" {
		fullName, _ = crypto.Decrypt(fullNameEnc.String, h.cfg.EncryptionKey)
	}
	phone := ""
	if phoneEnc.Valid && phoneEnc.String != "" {
		phone, _ = crypto.Decrypt(phoneEnc.String, h.cfg.EncryptionKey)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"user": map[string]string{
			"user_id":    adminUserID,
			"public_id":  publicID,
			"email":      email,
			"username":   username,
			"full_name":  fullName,
			"phone":      phone,
			"role":       role,
			"created_at": createdAt.Format(time.RFC3339),
			"updated_at": updatedAt.Format(time.RFC3339),
		},
	})
}

func (h *Handler) AdminLogout(w http.ResponseWriter, r *http.Request) {
	adminUserID := r.Context().Value(mw.UserIDKey).(string)
	jti, _ := r.Context().Value(mw.TokenJTIKey).(string)
	expUnix, _ := r.Context().Value(mw.TokenExpKey).(int64)
	if h.redis != nil && h.redis.Enabled() && h.cfg.RedisFeatureSessions && jti != "" {
		h.redis.RevokeJTI(r.Context(), jti, time.Unix(expUnix, 0))
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"message": "logout admin berhasil",
		"user_id": adminUserID,
	})
}

func (h *Handler) AdminLogoutAll(w http.ResponseWriter, r *http.Request) {
	adminUserID := r.Context().Value(mw.UserIDKey).(string)
	if h.redis != nil && h.redis.Enabled() && h.cfg.RedisFeatureSessions {
		h.redis.BumpSessionVersion(r.Context(), "admin:"+adminUserID)
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "logout semua device admin berhasil"})
}

func hashForAdminLookup(identifier string) string {
	cleaned := strings.TrimSpace(identifier)
	if strings.Contains(cleaned, "@") {
		cleaned = strings.ToLower(cleaned)
	}
	return crypto.Hash(cleaned)
}
