package db

import (
	"database/sql"
	"fmt"
	"log"

	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database/mysql"
	_ "github.com/golang-migrate/migrate/v4/source/file"
)

// RunMigrations runs all pending up migrations from the given directory.
// It is safe to call on every startup — already-applied migrations are skipped.
func RunMigrations(db *sql.DB, migrationsPath string) error {
	driver, err := mysql.WithInstance(db, &mysql.Config{})
	if err != nil {
		return fmt.Errorf("create migrate driver: %w", err)
	}

	m, err := migrate.NewWithDatabaseInstance(
		fmt.Sprintf("file://%s", migrationsPath),
		"mysql",
		driver,
	)
	if err != nil {
		return fmt.Errorf("create migrator: %w", err)
	}

	migrateErr := m.Up()
	if migrateErr != nil && migrateErr != migrate.ErrNoChange {
		return fmt.Errorf("run migrations: %w", migrateErr)
	}

	version, dirty, _ := m.Version()
	if migrateErr == migrate.ErrNoChange {
		log.Printf("migrations: no change (version %d)", version)
	} else {
		log.Printf("migrations: applied up to version %d (dirty=%v)", version, dirty)
	}
	return nil
}
