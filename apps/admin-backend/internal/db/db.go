package db

import (
	"database/sql"
	"fmt"
	"log"
	"time"

	"sawithub/admin-backend/internal/config"

	mysql "github.com/go-sql-driver/mysql"
)

func Connect(cfg *config.Config) (*sql.DB, error) {
	if cfg.DatabaseURL == "" {
		return nil, fmt.Errorf("DATABASE_URL is not set")
	}
	return connectDSN(cfg.DatabaseURL)
}

func ConnectRead(cfg *config.Config) (*sql.DB, error) {
	if cfg.DatabaseURLRead == "" {
		return nil, fmt.Errorf("DATABASE_URL_READ is not set")
	}
	return connectDSN(cfg.DatabaseURLRead)
}

func ConnectAdmin(cfg *config.Config) (*sql.DB, error) {
	if cfg.AdminDatabaseURL == "" {
		return nil, fmt.Errorf("ADMIN_DATABASE_URL is not set")
	}
	return connectDSN(cfg.AdminDatabaseURL)
}

func ConnectAdminRead(cfg *config.Config) (*sql.DB, error) {
	if cfg.AdminDatabaseURLRead == "" {
		return nil, fmt.Errorf("ADMIN_DATABASE_URL_READ is not set")
	}
	return connectDSN(cfg.AdminDatabaseURLRead)
}

func connectDSN(rawDSN string) (*sql.DB, error) {
	dsn, err := mysql.ParseDSN(rawDSN)
	if err != nil {
		return nil, fmt.Errorf("invalid DSN: %w", err)
	}

	if dsn.Params == nil {
		dsn.Params = map[string]string{}
	}
	if _, ok := dsn.Params["time_zone"]; !ok {
		dsn.Params["time_zone"] = "'+07:00'"
	}
	if !dsn.ParseTime {
		dsn.ParseTime = true
	}
	if dsn.Loc == nil || dsn.Loc.String() != "Asia/Jakarta" {
		jakarta, loadErr := time.LoadLocation("Asia/Jakarta")
		if loadErr != nil {
			return nil, fmt.Errorf("load Asia/Jakarta timezone: %w", loadErr)
		}
		dsn.Loc = jakarta
	}

	db, err := sql.Open("mysql", dsn.FormatDSN())
	if err != nil {
		return nil, err
	}
	if err := db.Ping(); err != nil {
		return nil, err
	}

	// Tuned connection pool settings for production load
	db.SetMaxOpenConns(50)                 // Increased from 25
	db.SetMaxIdleConns(25)                 // Increased from 10
	db.SetConnMaxLifetime(5 * time.Minute) // Prevent stale connections
	db.SetConnMaxIdleTime(1 * time.Minute) // Clean up idle connections faster

	return db, nil
}

// ConnectWithRetry attempts to connect to the database with retry logic
// This is useful for container startup scenarios where DB might not be ready immediately
func ConnectWithRetry(cfg *config.Config, maxRetries int, retryDelay time.Duration) (*sql.DB, error) {
	var db *sql.DB
	var err error

	for i := 0; i < maxRetries; i++ {
		db, err = Connect(cfg)
		if err == nil {
			log.Printf("Database connected successfully on attempt %d/%d", i+1, maxRetries)
			return db, nil
		}

		log.Printf("Database connection attempt %d/%d failed: %v", i+1, maxRetries, err)

		if i < maxRetries-1 {
			log.Printf("Retrying in %v...", retryDelay)
			time.Sleep(retryDelay)
		}
	}

	return nil, fmt.Errorf("failed to connect to database after %d attempts: %w", maxRetries, err)
}

func EnsureRuntimeSchema(db *sql.DB) (bool, error) {
	if db == nil {
		return false, fmt.Errorf("db is nil")
	}

	presenceEnabled, err := ensureUserPresenceColumn(db)
	if err != nil {
		return false, err
	}
	if presenceEnabled {
		if err := ensureUserPresenceIndex(db); err != nil {
			return true, err
		}
	}
	return presenceEnabled, nil
}

func HasColumn(db *sql.DB, tableName, columnName string) (bool, error) {
	var count int
	if err := db.QueryRow(`
		SELECT COUNT(*)
		FROM information_schema.columns
		WHERE table_schema = DATABASE()
		  AND table_name = ?
		  AND column_name = ?
	`, tableName, columnName).Scan(&count); err != nil {
		return false, fmt.Errorf("check %s.%s: %w", tableName, columnName, err)
	}
	return count > 0, nil
}

func ensureUserPresenceColumn(db *sql.DB) (bool, error) {
	exists, err := HasColumn(db, "t_sawit_hub_users", "last_seen_at")
	if err != nil {
		return false, err
	}
	if exists {
		return true, nil
	}

	if _, err := db.Exec(`
		ALTER TABLE t_sawit_hub_users
		ADD COLUMN last_seen_at DATETIME DEFAULT NULL AFTER updated_at
	`); err != nil {
		return false, fmt.Errorf("add t_sawit_hub_users.last_seen_at: %w", err)
	}
	return true, nil
}

func ensureUserPresenceIndex(db *sql.DB) error {
	var count int
	if err := db.QueryRow(`
		SELECT COUNT(*)
		FROM information_schema.statistics
		WHERE table_schema = DATABASE()
		  AND table_name = 't_sawit_hub_users'
		  AND index_name = 'idx_deleted_at_last_seen_at'
	`).Scan(&count); err != nil {
		return fmt.Errorf("check idx_deleted_at_last_seen_at: %w", err)
	}
	if count > 0 {
		return nil
	}

	if _, err := db.Exec(`
		ALTER TABLE t_sawit_hub_users
		ADD KEY idx_deleted_at_last_seen_at (deleted_at, last_seen_at)
	`); err != nil {
		return fmt.Errorf("add idx_deleted_at_last_seen_at: %w", err)
	}
	return nil
}

func SeedTheme(db *sql.DB, baseURL string) error {
	var count int
	if err := db.QueryRow(`SELECT COUNT(*) FROM t_sawit_hub_theme_configs`).Scan(&count); err != nil {
		return err
	}
	if count > 0 {
		return nil
	}
	_, err := db.Exec(`
		INSERT INTO t_sawit_hub_theme_configs (primary_color, background_color)
		VALUES ('#7a5cff', '#0f0f23')
	`)
	return err
}
