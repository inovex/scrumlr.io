package database

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"net/http"
	"os"

	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database/postgres"
	"github.com/golang-migrate/migrate/v4/source/httpfs"
	"github.com/urfave/cli/v3"
	"scrumlr.io/server/initialize"
	"scrumlr.io/server/logger"
)

func RegisterDatabaseCommands() *cli.Command {
	databaseCmd := &cli.Command{
		Name:      "database",
		Usage:     "Manage the scrumlr database",
		UsageText: "scrumlr database [sub command] [global options]",
		Category:  "management",
		Writer:    os.Stdout,
		Commands: []*cli.Command{
			{
				Name:      "migrate",
				Usage:     "Manage the database migration",
				UsageText: "scrumlr database migrate [sub command] [global options]",
				Category:  "migrations",
				Commands: []*cli.Command{
					{
						Name:      "version",
						Usage:     "Get the current version of the database migration",
						UsageText: "scrumlr database migrate version [global options]",
						Action:    getVersion,
						Category:  "migrations",
					},
					{
						Name:      "up",
						Usage:     "Apply all migrations up to the latest if to specified with the --version flag",
						UsageText: "scrumlr database migrate up [global options]",
						Action:    migrateUp,
						Category:  "migrations",
						Flags: []cli.Flag{
							&cli.UintFlag{
								Name:  "version",
								Usage: "the migration version to migrate up to",
							},
						},
					},
					{
						Name:      "down",
						Usage:     "Apply the migrations down until the specified version",
						UsageText: "scrumlr database migrate down --version [global options]",
						Action:    migrateDown,
						Category:  "migrations",
						Flags: []cli.Flag{
							&cli.UintFlag{
								Name:     "version",
								Usage:    "the migration version to migrate down to",
								Required: true,
							},
						},
					},
				},
			},
		},
	}

	return databaseCmd
}

func getVersion(ctx context.Context, cmd *cli.Command) error {
	m, err := getDatabase(ctx, cmd)
	if err != nil {
		return err
	}

	version, migrationFailed, err := m.Version()
	if errors.Is(err, migrate.ErrNilVersion) {
		_, err = fmt.Fprint(cmd.Writer, "database not yet migrated")
		if err != nil {
			return err
		}

		return nil
	} else if err != nil {
		return err
	}

	_, err = fmt.Fprintf(cmd.Writer, "database at migration version %d, all migration applied successfully %t", version, !migrationFailed)
	if err != nil {
		return err
	}

	return nil
}

func migrateUp(ctx context.Context, cmd *cli.Command) error {
	m, err := getDatabase(ctx, cmd)
	if err != nil {
		return err
	}

	if !cmd.IsSet("version") {
		err := m.Up()
		if err != nil && !errors.Is(err, migrate.ErrNoChange) {
			return err
		}

		dbVersion, _, err := m.Version()
		if err != nil && !errors.Is(err, migrate.ErrNilVersion) {
			return err
		}

		_, err = fmt.Fprintf(cmd.Writer, "successfully migrated database to version %d", dbVersion)
		if err != nil {
			return err
		}

		return nil
	}

	version := cmd.Uint("version")
	if version <= 0 {
		return errors.New("version must be greater than 0")
	}

	dbVersion, _, err := m.Version()
	if err != nil && !errors.Is(err, migrate.ErrNilVersion) {
		return err
	}

	if dbVersion > version {
		return errors.New("to downgrade a migration use the down command")
	}

	err = m.Migrate(version)
	if err != nil && !errors.Is(err, migrate.ErrNoChange) {
		return err
	}

	_, err = fmt.Fprintf(cmd.Writer, "successfully migrated database to version %d", version)
	if err != nil {
		return err
	}

	return nil
}

func migrateDown(ctx context.Context, cmd *cli.Command) error {
	m, err := getDatabase(ctx, cmd)
	if err != nil {
		return err
	}

	version := cmd.Uint("version")

	dbVersion, _, err := m.Version()
	if errors.Is(err, migrate.ErrNilVersion) {
		return errors.New("database not yet migrated")
	} else if err != nil {
		return err
	}

	if dbVersion < version {
		return errors.New("to upgrade a migration use the up command")
	}

	err = m.Migrate(version)
	if err != nil && !errors.Is(err, migrate.ErrNoChange) {
		return err
	}

	_, err = fmt.Fprintf(cmd.Writer, "successfully migrated database to version %d", version)
	if err != nil {
		return err
	}

	return nil
}

func getDatabase(ctx context.Context, cmd *cli.Command) (*migrate.Migrate, error) {
	log := logger.FromContext(ctx)

	var databaseUrl string
	if cmd.String("database") != "" {
		databaseUrl = cmd.String("database")
		log.Debug("using database url")
	} else if cmd.String("database-host") != "" && cmd.String("database-username") != "" && cmd.String("database-password") != "" {
		databaseUrl = fmt.Sprintf("postgresql://%s:%s@%s", cmd.String("database-username"), cmd.String("database-password"), cmd.String("database-host"))
		log.Debug("using specified database parameters")
	} else {
		return nil, errors.New("no valid database connection found")
	}

	db, err := sql.Open("postgres", databaseUrl)
	if err != nil {
		return nil, err
	}

	driver, err := postgres.WithInstance(db, &postgres.Config{})
	if err != nil {
		return nil, err
	}

	source, err := httpfs.New(http.FS(initialize.Migrations), "migrations/sql")
	if err != nil {
		return nil, err
	}

	m, err := migrate.NewWithInstance(
		"httpfs",
		source,
		"postgres",
		driver,
	)

	return m, err
}
