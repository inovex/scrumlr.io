package databaseinitialize

import (
	"context"
	"log"

	"github.com/testcontainers/testcontainers-go"
	"github.com/testcontainers/testcontainers-go/modules/postgres"
	"github.com/uptrace/bun"
	"go.uber.org/zap/zapcore"
)

const POSTGRES_IMAGE = "postgres:17.5-alpine"
const DATABASE_NAME = "scrumlr_test"
const DATABASE_USERNAME = "stan"
const DATABASE_PASSWORD = "scrumlr"

func StartTestDatabase() (*postgres.PostgresContainer, *bun.DB) {
	ctx := context.Background()
	pgcontainer, err := postgres.Run( //creating database
		ctx,
		POSTGRES_IMAGE,
		postgres.WithDatabase(DATABASE_NAME),
		postgres.WithUsername(DATABASE_USERNAME),
		postgres.WithPassword(DATABASE_PASSWORD),
		postgres.BasicWaitStrategies(),
	)

	if err != nil {
		log.Fatalf("Failed to start container: %s", err)
	}

	connectionString, err := pgcontainer.ConnectionString(ctx, "sslmode=disable")
	if err != nil {
		log.Fatalf("Failed to get connection string %s", err)
	}

	db, err := InitializeDatabase(connectionString) //migrating database
	if err != nil {
		log.Fatalf("Failed to initialize database %s", err)
	}

	bunDb := InitializeBun(db, zapcore.DebugLevel) // setup bun

	return pgcontainer, bunDb
}

func StopTestDatabase(container *postgres.PostgresContainer) {
	if err := testcontainers.TerminateContainer(container); err != nil {
		log.Fatalf("Failed to terminate container: %s", err)
	}
}
