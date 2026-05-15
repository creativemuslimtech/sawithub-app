package identity

import (
	"context"
	"database/sql"
	"strings"

	"sawithub/backend/internal/config"
	"sawithub/backend/internal/crypto"
)

type IdentityProfileService struct {
	db     *sql.DB
	dbRead *sql.DB
	cfg    *config.Config
}

func NewIdentityProfileService(db, dbRead *sql.DB, cfg *config.Config) *IdentityProfileService {
	if dbRead == nil {
		dbRead = db
	}
	return &IdentityProfileService{db: db, dbRead: dbRead, cfg: cfg}
}

func (s *IdentityProfileService) UpdateFullName(ctx context.Context, userID, fullName string) error {
	fullName = strings.TrimSpace(fullName)
	fullNameEnc := ""
	if fullName != "" {
		fullNameEnc, _ = crypto.Encrypt(fullName, s.cfg.EncryptionKey)
	}
	_, err := s.db.ExecContext(ctx,
		"UPDATE t_sawit_hub_users SET full_name_enc=? WHERE user_id=? AND deleted_at IS NULL",
		fullNameEnc, userID)
	return err
}

func (s *IdentityProfileService) UpdateEmail(ctx context.Context, userID, email string) (bool, error) {
	email = strings.TrimSpace(strings.ToLower(email))
	emailHash := crypto.Hash(email)
	var exists int
	if err := s.dbRead.QueryRowContext(ctx,
		"SELECT COUNT(*) FROM t_sawit_hub_users WHERE email_hash=? AND deleted_at IS NULL", emailHash).Scan(&exists); err != nil {
		return false, err
	}
	if exists > 0 {
		return false, nil
	}
	emailEnc, _ := crypto.Encrypt(email, s.cfg.EncryptionKey)
	_, err := s.db.ExecContext(ctx,
		"UPDATE t_sawit_hub_users SET email_hash=?, email_enc=? WHERE user_id=? AND deleted_at IS NULL",
		emailHash, emailEnc, userID)
	return true, err
}

func (s *IdentityProfileService) UpdatePhone(ctx context.Context, userID, phone string) error {
	phone = strings.TrimSpace(phone)
	phoneEnc := ""
	phoneHash := ""
	if phone != "" {
		phoneEnc, _ = crypto.Encrypt(phone, s.cfg.EncryptionKey)
		phoneHash = crypto.Hash(phone)
	}
	_, err := s.db.ExecContext(ctx,
		"UPDATE t_sawit_hub_users SET phone_enc=?, phone_hash=? WHERE user_id=? AND deleted_at IS NULL",
		phoneEnc, phoneHash, userID)
	return err
}

func (s *IdentityProfileService) UpdateUsername(ctx context.Context, userID, username string) (bool, error) {
	username = strings.ToLower(strings.TrimSpace(username))
	var exists int
	if err := s.dbRead.QueryRowContext(ctx,
		"SELECT COUNT(*) FROM t_sawit_hub_users WHERE username=? AND deleted_at IS NULL AND user_id != ?", username, userID).Scan(&exists); err != nil {
		return false, err
	}
	if exists > 0 {
		return false, nil
	}
	_, err := s.db.ExecContext(ctx,
		"UPDATE t_sawit_hub_users SET username=? WHERE user_id=? AND deleted_at IS NULL",
		username, userID)
	return true, err
}

func (s *IdentityProfileService) GetUserContact(ctx context.Context, userID string) (email, fullName, username string, err error) {
	var emailEnc, fullNameEnc string
	err = s.dbRead.QueryRowContext(ctx, `
		SELECT COALESCE(email_enc,''), COALESCE(full_name_enc,''), COALESCE(username,'')
		  FROM t_sawit_hub_users
		 WHERE user_id = ? AND deleted_at IS NULL`,
		userID).Scan(&emailEnc, &fullNameEnc, &username)
	if err != nil {
		return "", "", "", err
	}
	if emailEnc != "" {
		email, _ = crypto.Decrypt(emailEnc, s.cfg.EncryptionKey)
	}
	if fullNameEnc != "" {
		fullName, _ = crypto.Decrypt(fullNameEnc, s.cfg.EncryptionKey)
	}
	return email, fullName, username, nil
}
