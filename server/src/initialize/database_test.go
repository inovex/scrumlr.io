package initialize

import (
	"context"
	"errors"
	"flag"
	"fmt"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/testcontainers/testcontainers-go"
	"github.com/testcontainers/testcontainers-go/modules/postgres"
	"github.com/urfave/cli/v2"
)

const POSTGRES_IMAGE = "postgres:18.1-alpine"
const DATABASE_NAME = "scrumlr_test"
const DATABASE_USERNAME = "stan"
const DATABASE_PASSWORD = "scrumlr"

func TestInitializeDatabase_DatabaseUrl(t *testing.T) {
	ctx := context.Background()
	container, err := postgres.Run(
		ctx,
		POSTGRES_IMAGE,
		postgres.WithDatabase(DATABASE_NAME),
		postgres.WithUsername(DATABASE_USERNAME),
		postgres.WithPassword(DATABASE_PASSWORD),
		postgres.BasicWaitStrategies(),
	)

	assert.NoError(t, err, "failed to create test container")

	mappedPort, err := container.MappedPort(ctx, "5432")
	assert.NoError(t, err, "failed to map container port")

	host, err := container.Host(ctx)
	assert.NoError(t, err, "failed to get host from container")

	flagset := flag.NewFlagSet("scrumlr-tests", flag.ExitOnError)
	flagset.String("database", "", "")
	flagset.String("database-host", "", "")
	flagset.String("database-username", "", "")
	flagset.String("database-password", "", "")
	init := cli.NewContext(nil, flagset, nil)

	err = init.Set("database", fmt.Sprintf("postgresql://%s:%s@%s:%s/%s?sslmode=disable", DATABASE_USERNAME, DATABASE_PASSWORD, host, mappedPort.Port(), DATABASE_NAME))
	assert.NoError(t, err)

	bun, err := InitializeDatabase(init)

	assert.NoError(t, err)
	assert.NotNil(t, bun)
	assert.NotNil(t, bun.DB)

	if err := testcontainers.TerminateContainer(container); err != nil {
		fmt.Printf("failed to terminate container: %s", err)
	}
}

func TestInitializeDatabase_DatabaseParameter(t *testing.T) {
	ctx := context.Background()
	container, err := postgres.Run(
		ctx,
		POSTGRES_IMAGE,
		postgres.WithDatabase(DATABASE_NAME),
		postgres.WithUsername(DATABASE_USERNAME),
		postgres.WithPassword(DATABASE_PASSWORD),
		postgres.BasicWaitStrategies(),
	)

	assert.NoError(t, err, "failed to create test container")

	mappedPort, err := container.MappedPort(ctx, "5432")
	assert.NoError(t, err, "failed to map container port")

	host, err := container.Host(ctx)
	assert.NoError(t, err, "failed to get host from container")

	flagset := flag.NewFlagSet("scrumlr-tests", flag.ExitOnError)
	flagset.String("database", "", "")
	flagset.String("database-host", "", "")
	flagset.String("database-username", "", "")
	flagset.String("database-password", "", "")
	init := cli.NewContext(nil, flagset, nil)

	err = init.Set("database-host", fmt.Sprintf("%s:%s/%s?sslmode=disable", host, mappedPort.Port(), DATABASE_NAME))
	assert.NoError(t, err)
	err = init.Set("database-username", DATABASE_USERNAME)
	assert.NoError(t, err)
	err = init.Set("database-password", DATABASE_PASSWORD)
	assert.NoError(t, err)

	bun, err := InitializeDatabase(init)

	assert.NoError(t, err)
	assert.NotNil(t, bun)
	assert.NotNil(t, bun.DB)

	if err := testcontainers.TerminateContainer(container); err != nil {
		fmt.Printf("failed to terminate container: %s", err)
	}
}

func TestInitializeDatabase_NotConfigured(t *testing.T) {
	ctx := context.Background()
	container, err := postgres.Run(
		ctx,
		POSTGRES_IMAGE,
		postgres.WithDatabase(DATABASE_NAME),
		postgres.WithUsername(DATABASE_USERNAME),
		postgres.WithPassword(DATABASE_PASSWORD),
		postgres.BasicWaitStrategies(),
	)

	assert.NoError(t, err, "failed to create test container")

	flagset := flag.NewFlagSet("scrumlr-tests", flag.ExitOnError)
	flagset.String("database", "", "")
	flagset.String("database-host", "", "")
	flagset.String("database-username", "", "")
	flagset.String("database-password", "", "")
	init := cli.NewContext(nil, flagset, nil)

	bun, err := InitializeDatabase(init)

	assert.Error(t, err)
	assert.Equal(t, errors.New("no valid database connection found"), err)
	assert.Nil(t, bun)

	if err := testcontainers.TerminateContainer(container); err != nil {
		fmt.Printf("failed to terminate container: %s", err)
	}
}

func TestInitializeDatabase_PrefereDatabaseUrl(t *testing.T) {
	ctx := context.Background()
	container, err := postgres.Run(
		ctx,
		POSTGRES_IMAGE,
		postgres.WithDatabase(DATABASE_NAME),
		postgres.WithUsername(DATABASE_USERNAME),
		postgres.WithPassword(DATABASE_PASSWORD),
		postgres.BasicWaitStrategies(),
	)

	assert.NoError(t, err, "failed to create test container")

	mappedPort, err := container.MappedPort(ctx, "5432")
	assert.NoError(t, err, "failed to map container port")

	host, err := container.Host(ctx)
	assert.NoError(t, err, "failed to get host from container")

	flagset := flag.NewFlagSet("scrumlr-tests", flag.ExitOnError)
	flagset.String("database", "", "")
	flagset.String("database-host", "", "")
	flagset.String("database-username", "", "")
	flagset.String("database-password", "", "")
	init := cli.NewContext(nil, flagset, nil)

	err = init.Set("database", fmt.Sprintf("postgresql://%s:%s@%s:%s/%s?sslmode=disable", DATABASE_USERNAME, DATABASE_PASSWORD, host, mappedPort.Port(), DATABASE_NAME))
	assert.NoError(t, err)
	err = init.Set("database-host", "notvalid:-1/notvalid?sslmode=disable")
	assert.NoError(t, err)
	err = init.Set("database-username", DATABASE_USERNAME)
	assert.NoError(t, err)
	err = init.Set("database-password", DATABASE_PASSWORD)
	assert.NoError(t, err)

	bun, err := InitializeDatabase(init)

	assert.NoError(t, err)
	assert.NotNil(t, bun)
	assert.NotNil(t, bun.DB)

	if err := testcontainers.TerminateContainer(container); err != nil {
		fmt.Printf("failed to terminate container: %s", err)
	}
}
