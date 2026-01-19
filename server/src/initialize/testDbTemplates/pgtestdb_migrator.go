package testDbTemplates

import (
	"context"
	"database/sql"
	"embed"
	"errors"
	"fmt"
	"net/http"
	"scrumlr.io/server/initialize"

	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/source/httpfs"
	"github.com/peterldowns/pgtestdb"
	"github.com/peterldowns/pgtestdb/migrators/common"
	"github.com/uptrace/bun"
	"go.uber.org/zap/zapcore"
)

type SeededMigrator struct {
	migrations embed.FS
	path       string
	seedFunc   func(*bun.DB)
	seedHash   string
}

func NewSeededMigrator(seedFunc func(*bun.DB), seedHash string) *SeededMigrator {
	return &SeededMigrator{
		migrations: initialize.Migrations,
		path:       "migrations/sql",
		seedFunc:   seedFunc,
		seedHash:   seedHash,
	}
}

func (m *SeededMigrator) Hash() (string, error) {
	baseHash, err := common.HashDirs(m.migrations, "**/*.sql", m.path)
	if err != nil {
		return "", err
	}
	return baseHash + "_seed_" + m.seedHash, nil
}

func (m *SeededMigrator) Migrate(_ context.Context, db *sql.DB, config pgtestdb.Config) error {
	source, err := httpfs.New(http.FS(m.migrations), m.path)
	if err != nil {
		return fmt.Errorf("failed to create httpfs source: %w", err)
	}

	databaseURL := fmt.Sprintf("postgres://%s:%s@%s:%s/%s?%s",
		config.User,
		config.Password,
		config.Host,
		config.Port,
		config.Database,
		config.Options,
	)

	mig, err := migrate.NewWithSourceInstance(
		"httpfs",
		source,
		databaseURL,
	)
	if err != nil {
		return fmt.Errorf("failed to create migrator: %w", err)
	}
	defer func() {
		_, _ = mig.Close()
	}()

	if err := mig.Up(); err != nil && !errors.Is(err, migrate.ErrNoChange) {
		return fmt.Errorf("failed to run migrations: %w", err)
	}

	if m.seedFunc != nil {
		bunDB := initialize.InitializeBun(db, zapcore.ErrorLevel)
		m.seedFunc(bunDB)
	}

	return nil
}
