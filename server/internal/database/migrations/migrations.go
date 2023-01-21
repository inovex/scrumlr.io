package migrations

import (
	"database/sql"
	"embed"
	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database/postgres"
	"github.com/golang-migrate/migrate/v4/source/httpfs"
	"net/http"
	"scrumlr.io/server/internal/logger"
)

//go:embed sql
var Migrations embed.FS

func MigrateDatabase(databaseUrl string) (*sql.DB, error) {
	db, err := sql.Open("postgres", databaseUrl)
	if err != nil {
		return nil, err
	}

	driver, err := postgres.WithInstance(db, &postgres.Config{})
	if err != nil {
		return nil, err
	}

	source, err := httpfs.New(http.FS(Migrations), "sql")
	if err != nil {
		return nil, err
	}

	m, err := migrate.NewWithInstance(
		"httpfs",
		source,
		"postgres",
		driver,
	)
	if err != nil {
		return nil, err
	}

	err = m.Up()
	if err == nil || err == migrate.ErrNoChange {
		logger.Get().Infow("successfully migrated database")
		return db, nil
	}

	return nil, err
}
