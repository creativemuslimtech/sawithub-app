package identity

import (
	"context"
	"database/sql"
	"fmt"
	"strings"
	"time"

	"SawitHub/internal/config"
	"SawitHub/internal/crypto"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

// IdentityAuthService is the canonical auth domain service name.
// This first step keeps behavior unchanged and prepares gradual refactor.
type IdentityAuthService struct {
	db     *sql.DB
	dbRead *sql.DB
	cfg    *config.Config
}

type RegisterInput struct {
	Username string
	Email    string
	Password string
	FullName string
	Phone    string
}

type AuthUser struct {
	UserID   string
	PublicID string
	Email    string
	Username string
	FullName string
	Phone    string
	Role     string
}

func NewIdentityAuthService(db *sql.DB, dbRead *sql.DB, cfg *config.Config) *IdentityAuthService {
	if dbRead == nil {
		dbRead = db
	}
	return &IdentityAuthService{db: db, dbRead: dbRead, cfg: cfg}
}

func (s *IdentityAuthService) EmailExists(ctx context.Context, email string) (bool, error) {
	var exists int
	emailHash := crypto.Hash(strings.TrimSpace(strings.ToLower(email)))
	err := s.dbRead.QueryRowContext(ctx, "SELECT COUNT(*) FROM t_sawit_hub_users WHERE email_hash=? AND deleted_at IS NULL", emailHash).Scan(&exists)
	return exists > 0, err
}

func (s *IdentityAuthService) UsernameExists(ctx context.Context, username string) (bool, error) {
	var exists int
	err := s.dbRead.QueryRowContext(ctx, "SELECT COUNT(*) FROM t_sawit_hub_users WHERE LOWER(username)=? AND deleted_at IS NULL", strings.ToLower(strings.TrimSpace(username))).Scan(&exists)
	return exists > 0, err
}

func (s *IdentityAuthService) Register(ctx context.Context, in RegisterInput) (AuthUser, error) {
	email := strings.TrimSpace(strings.ToLower(in.Email))
	username := strings.ToLower(strings.TrimSpace(in.Username))
	pwHash, err := bcrypt.GenerateFromPassword([]byte(in.Password), bcrypt.DefaultCost)
	if err != nil {
		return AuthUser{}, err
	}

	emailHash := crypto.Hash(email)
	emailEnc, _ := crypto.Encrypt(email, s.cfg.EncryptionKey)
	fullNameEnc, _ := crypto.Encrypt(in.FullName, s.cfg.EncryptionKey)
	phoneEnc := ""
	phoneHash := ""
	if strings.TrimSpace(in.Phone) != "" {
		phoneEnc, _ = crypto.Encrypt(strings.TrimSpace(in.Phone), s.cfg.EncryptionKey)
		phoneHash = crypto.Hash(strings.TrimSpace(in.Phone))
	}

	publicID := uuid.New().String()
	result, err := s.db.ExecContext(ctx,
		`INSERT INTO t_sawit_hub_users
		 (public_id, username, email_hash, email_enc, full_name_enc, phone_enc, phone_hash, password_hash, role)
		 VALUES (?,?,?,?,?,?,?,?,?)`,
		publicID, username, emailHash, emailEnc, fullNameEnc, phoneEnc, phoneHash, string(pwHash), "user")
	if err != nil {
		return AuthUser{}, err
	}
	id, _ := result.LastInsertId()
	return AuthUser{
		UserID:   fmt.Sprintf("%d", id),
		PublicID: publicID,
		Email:    email,
		Username: username,
		FullName: in.FullName,
		Phone:    strings.TrimSpace(in.Phone),
		Role:     "user",
	}, nil
}

func (s *IdentityAuthService) Authenticate(ctx context.Context, identifier, password string) (AuthUser, error) {
	var user AuthUser
	var pwHash, emailEnc string
	var fullNameEnc, phoneEnc sql.NullString
	identifier = strings.TrimSpace(identifier)

	if strings.Contains(identifier, "@") {
		emailHash := crypto.Hash(strings.ToLower(identifier))
		if err := s.dbRead.QueryRowContext(ctx,
			"SELECT public_id, user_id, password_hash, email_enc, full_name_enc, phone_enc, username, role FROM t_sawit_hub_users WHERE email_hash=? AND deleted_at IS NULL",
			emailHash).Scan(&user.PublicID, &user.UserID, &pwHash, &emailEnc, &fullNameEnc, &phoneEnc, &user.Username, &user.Role); err != nil {
			return AuthUser{}, err
		}
	} else {
		if err := s.dbRead.QueryRowContext(ctx,
			"SELECT public_id, user_id, password_hash, email_enc, full_name_enc, phone_enc, username, role FROM t_sawit_hub_users WHERE LOWER(username)=? AND deleted_at IS NULL",
			strings.ToLower(identifier)).Scan(&user.PublicID, &user.UserID, &pwHash, &emailEnc, &fullNameEnc, &phoneEnc, &user.Username, &user.Role); err != nil {
			return AuthUser{}, err
		}
	}

	if err := bcrypt.CompareHashAndPassword([]byte(pwHash), []byte(password)); err != nil {
		return AuthUser{}, err
	}
	user.Email, _ = crypto.Decrypt(emailEnc, s.cfg.EncryptionKey)
	if fullNameEnc.Valid && fullNameEnc.String != "" {
		user.FullName, _ = crypto.Decrypt(fullNameEnc.String, s.cfg.EncryptionKey)
	}
	if phoneEnc.Valid && phoneEnc.String != "" {
		user.Phone, _ = crypto.Decrypt(phoneEnc.String, s.cfg.EncryptionKey)
	}
	return user, nil
}

func (s *IdentityAuthService) GetByUserID(ctx context.Context, userID string) (AuthUser, time.Time, time.Time, error) {
	var user AuthUser
	var emailEnc string
	var fullNameEnc, phoneEnc sql.NullString
	var createdAt, updatedAt time.Time
	err := s.dbRead.QueryRowContext(ctx,
		`SELECT public_id, username, email_enc, full_name_enc, phone_enc, role, created_at, updated_at
		 FROM t_sawit_hub_users
		 WHERE user_id=? AND deleted_at IS NULL`,
		userID).Scan(&user.PublicID, &user.Username, &emailEnc, &fullNameEnc, &phoneEnc, &user.Role, &createdAt, &updatedAt)
	if err != nil {
		return AuthUser{}, time.Time{}, time.Time{}, err
	}
	user.UserID = userID
	user.Email, _ = crypto.Decrypt(emailEnc, s.cfg.EncryptionKey)
	if fullNameEnc.Valid && fullNameEnc.String != "" {
		user.FullName, _ = crypto.Decrypt(fullNameEnc.String, s.cfg.EncryptionKey)
	}
	if phoneEnc.Valid && phoneEnc.String != "" {
		user.Phone, _ = crypto.Decrypt(phoneEnc.String, s.cfg.EncryptionKey)
	}
	return user, createdAt, updatedAt, nil
}

func (s *IdentityAuthService) ChangePassword(ctx context.Context, userID, currentPassword, newPassword string) error {
	var pwHash string
	err := s.dbRead.QueryRowContext(ctx,
		"SELECT password_hash FROM t_sawit_hub_users WHERE user_id=? AND deleted_at IS NULL", userID).Scan(&pwHash)
	if err != nil {
		return err
	}
	if err := bcrypt.CompareHashAndPassword([]byte(pwHash), []byte(currentPassword)); err != nil {
		return err
	}
	newPwHash, err := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	_, err = s.db.ExecContext(ctx,
		"UPDATE t_sawit_hub_users SET password_hash=? WHERE user_id=? AND deleted_at IS NULL",
		string(newPwHash), userID)
	return err
}

func (s *IdentityAuthService) HasEmail(ctx context.Context, email string) (bool, error) {
	emailHash := crypto.Hash(strings.TrimSpace(strings.ToLower(email)))
	var emailEnc string
	err := s.dbRead.QueryRowContext(ctx,
		"SELECT email_enc FROM t_sawit_hub_users WHERE email_hash=? AND deleted_at IS NULL", emailHash).
		Scan(&emailEnc)
	if err == sql.ErrNoRows {
		return false, nil
	}
	return err == nil, err
}

func (s *IdentityAuthService) CreatePasswordReset(ctx context.Context, email, code string, expiresAt time.Time) error {
	emailHash := crypto.Hash(strings.TrimSpace(strings.ToLower(email)))
	id := uuid.New().String()
	_, err := s.db.ExecContext(ctx,
		`INSERT INTO t_sawit_hub_password_resets (id, email_hash, code, expires_at) VALUES (?,?,?,?)`,
		id, emailHash, code, expiresAt)
	return err
}

func (s *IdentityAuthService) VerifyPasswordResetCode(ctx context.Context, email, code string) (bool, error) {
	emailHash := crypto.Hash(strings.TrimSpace(strings.ToLower(email)))
	var id string
	var expiresAt time.Time
	err := s.dbRead.QueryRowContext(ctx,
		`SELECT id, expires_at FROM t_sawit_hub_password_resets
		 WHERE email_hash=? AND code=? AND used_at IS NULL
		 ORDER BY created_at DESC LIMIT 1`,
		emailHash, code).Scan(&id, &expiresAt)
	if err == sql.ErrNoRows {
		return false, nil
	}
	if err != nil {
		return false, err
	}
	return time.Now().Before(expiresAt), nil
}

func (s *IdentityAuthService) ResetPasswordWithCode(ctx context.Context, email, code, newPassword string) (bool, error) {
	emailHash := crypto.Hash(strings.TrimSpace(strings.ToLower(email)))
	var resetID string
	var expiresAt time.Time
	err := s.dbRead.QueryRowContext(ctx,
		`SELECT id, expires_at FROM t_sawit_hub_password_resets
		 WHERE email_hash=? AND code=? AND used_at IS NULL
		 ORDER BY created_at DESC LIMIT 1`,
		emailHash, code).Scan(&resetID, &expiresAt)
	if err == sql.ErrNoRows {
		return false, nil
	}
	if err != nil || time.Now().After(expiresAt) {
		return false, err
	}
	pwHash, err := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
	if err != nil {
		return false, err
	}
	if _, err = s.db.ExecContext(ctx,
		"UPDATE t_sawit_hub_users SET password_hash=? WHERE email_hash=? AND deleted_at IS NULL",
		string(pwHash), emailHash); err != nil {
		return false, err
	}
	if _, err = s.db.ExecContext(ctx,
		"UPDATE t_sawit_hub_password_resets SET used_at=NOW() WHERE id=?", resetID); err != nil {
		return false, err
	}
	return true, nil
}
