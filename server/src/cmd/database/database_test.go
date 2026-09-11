package database

import (
	"bytes"
	"fmt"
	"strconv"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/urfave/cli/v3"
	"scrumlr.io/server/initialize"
)

const currentVersion uint = 28

func TestGetVersion(t *testing.T) {
	ctx := t.Context()
	container, err := initialize.StartTestDatabase(ctx)
	if err != nil {
		t.Fatalf("failed to start database %v", err)
	}

	host, err := container.Host(ctx)
	assert.NoError(t, err)

	mappedPort, err := container.MappedPort(ctx, "5432")
	assert.NoError(t, err)

	var out bytes.Buffer
	cmd := &cli.Command{
		Writer: &out,
		Flags: []cli.Flag{
			&cli.StringFlag{Name: "database"},
			&cli.StringFlag{Name: "database-host"},
			&cli.StringFlag{Name: "database-username"},
			&cli.StringFlag{Name: "database-password"},
			&cli.Uint64Flag{Name: "version"},
		},
	}

	err = cmd.Set("database-host", fmt.Sprintf("%s:%s/%s?sslmode=disable", host, mappedPort.Port(), initialize.DATABASE_NAME))
	assert.NoError(t, err)
	err = cmd.Set("database-username", initialize.DATABASE_USERNAME)
	assert.NoError(t, err)
	err = cmd.Set("database-password", initialize.DATABASE_PASSWORD)
	assert.NoError(t, err)

	m, err := getDatabase(ctx, cmd)
	assert.NoError(t, err)

	err = m.Up()
	assert.NoError(t, err)

	err = getVersion(ctx, cmd)

	assert.NoError(t, err)
	assert.Equal(t, fmt.Sprintf("database at migration version %d, all migration applied successfully %t", currentVersion, true), out.String())
}

func TestGetVersionNotMigrated(t *testing.T) {
	ctx := t.Context()
	container, err := initialize.StartTestDatabase(ctx)
	if err != nil {
		t.Fatalf("failed to start database %v", err)
	}

	host, err := container.Host(ctx)
	assert.NoError(t, err)

	mappedPort, err := container.MappedPort(ctx, "5432")
	assert.NoError(t, err)

	var out bytes.Buffer
	cmd := &cli.Command{
		Writer: &out,
		Flags: []cli.Flag{
			&cli.StringFlag{Name: "database"},
			&cli.StringFlag{Name: "database-host"},
			&cli.StringFlag{Name: "database-username"},
			&cli.StringFlag{Name: "database-password"},
			&cli.Uint64Flag{Name: "version"},
		},
	}

	err = cmd.Set("database-host", fmt.Sprintf("%s:%s/%s?sslmode=disable", host, mappedPort.Port(), initialize.DATABASE_NAME))
	assert.NoError(t, err)
	err = cmd.Set("database-username", initialize.DATABASE_USERNAME)
	assert.NoError(t, err)
	err = cmd.Set("database-password", initialize.DATABASE_PASSWORD)
	assert.NoError(t, err)

	err = getVersion(ctx, cmd)

	assert.NoError(t, err)
	assert.Equal(t, "database not yet migrated", out.String())
}

func TestMigrateUp(t *testing.T) {
	ctx := t.Context()
	container, err := initialize.StartTestDatabase(ctx)
	if err != nil {
		t.Fatalf("failed to start database %v", err)
	}

	host, err := container.Host(ctx)
	assert.NoError(t, err)

	mappedPort, err := container.MappedPort(ctx, "5432")
	assert.NoError(t, err)

	var out bytes.Buffer
	cmd := &cli.Command{
		Writer: &out,
		Flags: []cli.Flag{
			&cli.StringFlag{Name: "database"},
			&cli.StringFlag{Name: "database-host"},
			&cli.StringFlag{Name: "database-username"},
			&cli.StringFlag{Name: "database-password"},
			&cli.Uint64Flag{Name: "version"},
		},
	}

	err = cmd.Set("database-host", fmt.Sprintf("%s:%s/%s?sslmode=disable", host, mappedPort.Port(), initialize.DATABASE_NAME))
	assert.NoError(t, err)
	err = cmd.Set("database-username", initialize.DATABASE_USERNAME)
	assert.NoError(t, err)
	err = cmd.Set("database-password", initialize.DATABASE_PASSWORD)
	assert.NoError(t, err)

	err = migrateUp(ctx, cmd)

	assert.NoError(t, err)
	assert.Equal(t, fmt.Sprintf("successfully migrated database to version %d", currentVersion), out.String())
}

func TestMigrateUpToCurrentVersion(t *testing.T) {
	ctx := t.Context()
	container, err := initialize.StartTestDatabase(ctx)
	if err != nil {
		t.Fatalf("failed to start database %v", err)
	}

	host, err := container.Host(ctx)
	assert.NoError(t, err)

	mappedPort, err := container.MappedPort(ctx, "5432")
	assert.NoError(t, err)

	var out bytes.Buffer
	cmd := &cli.Command{
		Writer: &out,
		Flags: []cli.Flag{
			&cli.StringFlag{Name: "database"},
			&cli.StringFlag{Name: "database-host"},
			&cli.StringFlag{Name: "database-username"},
			&cli.StringFlag{Name: "database-password"},
			&cli.Uint64Flag{Name: "version"},
		},
	}

	err = cmd.Set("database-host", fmt.Sprintf("%s:%s/%s?sslmode=disable", host, mappedPort.Port(), initialize.DATABASE_NAME))
	assert.NoError(t, err)
	err = cmd.Set("database-username", initialize.DATABASE_USERNAME)
	assert.NoError(t, err)
	err = cmd.Set("database-password", initialize.DATABASE_PASSWORD)
	assert.NoError(t, err)

	m, err := getDatabase(ctx, cmd)
	assert.NoError(t, err)

	err = m.Migrate(20)
	assert.NoError(t, err)

	err = migrateUp(ctx, cmd)

	assert.NoError(t, err)
	assert.Equal(t, fmt.Sprintf("successfully migrated database to version %d", currentVersion), out.String())
}

func TestMigrateUpNoChange(t *testing.T) {
	ctx := t.Context()
	container, err := initialize.StartTestDatabase(ctx)
	if err != nil {
		t.Fatalf("failed to start database %v", err)
	}

	host, err := container.Host(ctx)
	assert.NoError(t, err)

	mappedPort, err := container.MappedPort(ctx, "5432")
	assert.NoError(t, err)

	var out bytes.Buffer
	cmd := &cli.Command{
		Writer: &out,
		Flags: []cli.Flag{
			&cli.StringFlag{Name: "database"},
			&cli.StringFlag{Name: "database-host"},
			&cli.StringFlag{Name: "database-username"},
			&cli.StringFlag{Name: "database-password"},
			&cli.Uint64Flag{Name: "version"},
		},
	}

	err = cmd.Set("database-host", fmt.Sprintf("%s:%s/%s?sslmode=disable", host, mappedPort.Port(), initialize.DATABASE_NAME))
	assert.NoError(t, err)
	err = cmd.Set("database-username", initialize.DATABASE_USERNAME)
	assert.NoError(t, err)
	err = cmd.Set("database-password", initialize.DATABASE_PASSWORD)
	assert.NoError(t, err)

	m, err := getDatabase(ctx, cmd)
	assert.NoError(t, err)

	err = m.Up()
	assert.NoError(t, err)

	err = migrateUp(ctx, cmd)

	assert.NoError(t, err)
	assert.Equal(t, fmt.Sprintf("successfully migrated database to version %d", currentVersion), out.String())
}

func TestMigrateUpToVersion(t *testing.T) {
	ctx := t.Context()

	version := 20

	container, err := initialize.StartTestDatabase(ctx)
	if err != nil {
		t.Fatalf("failed to start database %v", err)
	}

	host, err := container.Host(ctx)
	assert.NoError(t, err)

	mappedPort, err := container.MappedPort(ctx, "5432")
	assert.NoError(t, err)

	var out bytes.Buffer
	cmd := &cli.Command{
		Writer: &out,
		Flags: []cli.Flag{
			&cli.StringFlag{Name: "database"},
			&cli.StringFlag{Name: "database-host"},
			&cli.StringFlag{Name: "database-username"},
			&cli.StringFlag{Name: "database-password"},
			&cli.UintFlag{Name: "version"},
		},
	}

	err = cmd.Set("database-host", fmt.Sprintf("%s:%s/%s?sslmode=disable", host, mappedPort.Port(), initialize.DATABASE_NAME))
	assert.NoError(t, err)
	err = cmd.Set("database-username", initialize.DATABASE_USERNAME)
	assert.NoError(t, err)
	err = cmd.Set("database-password", initialize.DATABASE_PASSWORD)
	assert.NoError(t, err)
	err = cmd.Set("version", strconv.Itoa(version))
	assert.NoError(t, err)

	err = migrateUp(ctx, cmd)

	assert.NoError(t, err)
	assert.Equal(t, fmt.Sprintf("successfully migrated database to version %d", version), out.String())
}

func TestMigrateUpToSmallerVersion(t *testing.T) {
	ctx := t.Context()

	version := 20

	container, err := initialize.StartTestDatabase(ctx)
	if err != nil {
		t.Fatalf("failed to start database %v", err)
	}

	host, err := container.Host(ctx)
	assert.NoError(t, err)

	mappedPort, err := container.MappedPort(ctx, "5432")
	assert.NoError(t, err)

	var out bytes.Buffer
	cmd := &cli.Command{
		Writer: &out,
		Flags: []cli.Flag{
			&cli.StringFlag{Name: "database"},
			&cli.StringFlag{Name: "database-host"},
			&cli.StringFlag{Name: "database-username"},
			&cli.StringFlag{Name: "database-password"},
			&cli.UintFlag{Name: "version"},
		},
	}

	err = cmd.Set("database-host", fmt.Sprintf("%s:%s/%s?sslmode=disable", host, mappedPort.Port(), initialize.DATABASE_NAME))
	assert.NoError(t, err)
	err = cmd.Set("database-username", initialize.DATABASE_USERNAME)
	assert.NoError(t, err)
	err = cmd.Set("database-password", initialize.DATABASE_PASSWORD)
	assert.NoError(t, err)
	err = cmd.Set("version", strconv.Itoa(version))
	assert.NoError(t, err)

	m, err := getDatabase(ctx, cmd)
	assert.NoError(t, err)

	err = m.Up()
	assert.NoError(t, err)

	err = migrateUp(ctx, cmd)

	assert.Error(t, err)
	assert.ErrorContains(t, err, "to downgrade a migration use the down command")
}

func TestMigrateUpToBigVersion(t *testing.T) {
	ctx := t.Context()

	version := 9999

	container, err := initialize.StartTestDatabase(ctx)
	if err != nil {
		t.Fatalf("failed to start database %v", err)
	}

	host, err := container.Host(ctx)
	assert.NoError(t, err)

	mappedPort, err := container.MappedPort(ctx, "5432")
	assert.NoError(t, err)

	var out bytes.Buffer
	cmd := &cli.Command{
		Writer: &out,
		Flags: []cli.Flag{
			&cli.StringFlag{Name: "database"},
			&cli.StringFlag{Name: "database-host"},
			&cli.StringFlag{Name: "database-username"},
			&cli.StringFlag{Name: "database-password"},
			&cli.UintFlag{Name: "version"},
		},
	}

	err = cmd.Set("database-host", fmt.Sprintf("%s:%s/%s?sslmode=disable", host, mappedPort.Port(), initialize.DATABASE_NAME))
	assert.NoError(t, err)
	err = cmd.Set("database-username", initialize.DATABASE_USERNAME)
	assert.NoError(t, err)
	err = cmd.Set("database-password", initialize.DATABASE_PASSWORD)
	assert.NoError(t, err)
	err = cmd.Set("version", strconv.Itoa(version))
	assert.NoError(t, err)

	err = migrateUp(ctx, cmd)

	assert.Error(t, err)
}

func TestMigrateUpToVersionZero(t *testing.T) {
	ctx := t.Context()

	version := 0

	container, err := initialize.StartTestDatabase(ctx)
	if err != nil {
		t.Fatalf("failed to start database %v", err)
	}

	host, err := container.Host(ctx)
	assert.NoError(t, err)

	mappedPort, err := container.MappedPort(ctx, "5432")
	assert.NoError(t, err)

	var out bytes.Buffer
	cmd := &cli.Command{
		Writer: &out,
		Flags: []cli.Flag{
			&cli.StringFlag{Name: "database"},
			&cli.StringFlag{Name: "database-host"},
			&cli.StringFlag{Name: "database-username"},
			&cli.StringFlag{Name: "database-password"},
			&cli.UintFlag{Name: "version"},
		},
	}

	err = cmd.Set("database-host", fmt.Sprintf("%s:%s/%s?sslmode=disable", host, mappedPort.Port(), initialize.DATABASE_NAME))
	assert.NoError(t, err)
	err = cmd.Set("database-username", initialize.DATABASE_USERNAME)
	assert.NoError(t, err)
	err = cmd.Set("database-password", initialize.DATABASE_PASSWORD)
	assert.NoError(t, err)
	err = cmd.Set("version", strconv.Itoa(version))
	assert.NoError(t, err)

	err = migrateUp(ctx, cmd)

	assert.Error(t, err)
	assert.ErrorContains(t, err, "version must be greater than 0")
}

func TestMigrateDown(t *testing.T) {
	ctx := t.Context()

	version := 20

	container, err := initialize.StartTestDatabase(ctx)
	if err != nil {
		t.Fatalf("failed to start database %v", err)
	}

	host, err := container.Host(ctx)
	assert.NoError(t, err)

	mappedPort, err := container.MappedPort(ctx, "5432")
	assert.NoError(t, err)

	var out bytes.Buffer
	cmd := &cli.Command{
		Writer: &out,
		Flags: []cli.Flag{
			&cli.StringFlag{Name: "database"},
			&cli.StringFlag{Name: "database-host"},
			&cli.StringFlag{Name: "database-username"},
			&cli.StringFlag{Name: "database-password"},
			&cli.UintFlag{Name: "version"},
		},
	}

	err = cmd.Set("database-host", fmt.Sprintf("%s:%s/%s?sslmode=disable", host, mappedPort.Port(), initialize.DATABASE_NAME))
	assert.NoError(t, err)
	err = cmd.Set("database-username", initialize.DATABASE_USERNAME)
	assert.NoError(t, err)
	err = cmd.Set("database-password", initialize.DATABASE_PASSWORD)
	assert.NoError(t, err)
	err = cmd.Set("version", strconv.Itoa(version))
	assert.NoError(t, err)

	m, err := getDatabase(ctx, cmd)
	assert.NoError(t, err)

	err = m.Up()
	assert.NoError(t, err)

	err = migrateDown(ctx, cmd)

	assert.NoError(t, err)
	assert.Equal(t, fmt.Sprintf("successfully migrated database to version %d", version), out.String())
}

func TestMigrateDownSameVersion(t *testing.T) {
	ctx := t.Context()

	container, err := initialize.StartTestDatabase(ctx)
	if err != nil {
		t.Fatalf("failed to start database %v", err)
	}

	host, err := container.Host(ctx)
	assert.NoError(t, err)

	mappedPort, err := container.MappedPort(ctx, "5432")
	assert.NoError(t, err)

	var out bytes.Buffer
	cmd := &cli.Command{
		Writer: &out,
		Flags: []cli.Flag{
			&cli.StringFlag{Name: "database"},
			&cli.StringFlag{Name: "database-host"},
			&cli.StringFlag{Name: "database-username"},
			&cli.StringFlag{Name: "database-password"},
			&cli.UintFlag{Name: "version"},
		},
	}

	err = cmd.Set("database-host", fmt.Sprintf("%s:%s/%s?sslmode=disable", host, mappedPort.Port(), initialize.DATABASE_NAME))
	assert.NoError(t, err)
	err = cmd.Set("database-username", initialize.DATABASE_USERNAME)
	assert.NoError(t, err)
	err = cmd.Set("database-password", initialize.DATABASE_PASSWORD)
	assert.NoError(t, err)
	err = cmd.Set("version", strconv.Itoa(int(currentVersion)))
	assert.NoError(t, err)

	m, err := getDatabase(ctx, cmd)
	assert.NoError(t, err)

	err = m.Up()
	assert.NoError(t, err)

	err = migrateDown(ctx, cmd)

	assert.NoError(t, err)
	assert.Equal(t, fmt.Sprintf("successfully migrated database to version %d", currentVersion), out.String())
}

func TestMigrateDownToGreaterVersion(t *testing.T) {
	ctx := t.Context()

	version := 20

	container, err := initialize.StartTestDatabase(ctx)
	if err != nil {
		t.Fatalf("failed to start database %v", err)
	}

	host, err := container.Host(ctx)
	assert.NoError(t, err)

	mappedPort, err := container.MappedPort(ctx, "5432")
	assert.NoError(t, err)

	var out bytes.Buffer
	cmd := &cli.Command{
		Writer: &out,
		Flags: []cli.Flag{
			&cli.StringFlag{Name: "database"},
			&cli.StringFlag{Name: "database-host"},
			&cli.StringFlag{Name: "database-username"},
			&cli.StringFlag{Name: "database-password"},
			&cli.UintFlag{Name: "version"},
		},
	}

	err = cmd.Set("database-host", fmt.Sprintf("%s:%s/%s?sslmode=disable", host, mappedPort.Port(), initialize.DATABASE_NAME))
	assert.NoError(t, err)
	err = cmd.Set("database-username", initialize.DATABASE_USERNAME)
	assert.NoError(t, err)
	err = cmd.Set("database-password", initialize.DATABASE_PASSWORD)
	assert.NoError(t, err)
	err = cmd.Set("version", strconv.Itoa(int(currentVersion)))
	assert.NoError(t, err)

	m, err := getDatabase(ctx, cmd)
	assert.NoError(t, err)

	err = m.Migrate(uint(version))
	assert.NoError(t, err)

	err = migrateDown(ctx, cmd)

	assert.Error(t, err)
	assert.ErrorContains(t, err, "to upgrade a migration use the up command")
}

func TestMigrateDownUnMigratedDatabase(t *testing.T) {
	ctx := t.Context()

	version := 20

	container, err := initialize.StartTestDatabase(ctx)
	if err != nil {
		t.Fatalf("failed to start database %v", err)
	}

	host, err := container.Host(ctx)
	assert.NoError(t, err)

	mappedPort, err := container.MappedPort(ctx, "5432")
	assert.NoError(t, err)

	var out bytes.Buffer
	cmd := &cli.Command{
		Writer: &out,
		Flags: []cli.Flag{
			&cli.StringFlag{Name: "database"},
			&cli.StringFlag{Name: "database-host"},
			&cli.StringFlag{Name: "database-username"},
			&cli.StringFlag{Name: "database-password"},
			&cli.UintFlag{Name: "version"},
		},
	}

	err = cmd.Set("database-host", fmt.Sprintf("%s:%s/%s?sslmode=disable", host, mappedPort.Port(), initialize.DATABASE_NAME))
	assert.NoError(t, err)
	err = cmd.Set("database-username", initialize.DATABASE_USERNAME)
	assert.NoError(t, err)
	err = cmd.Set("database-password", initialize.DATABASE_PASSWORD)
	assert.NoError(t, err)
	err = cmd.Set("version", strconv.Itoa(version))
	assert.NoError(t, err)

	err = migrateDown(ctx, cmd)

	assert.Error(t, err)
	assert.ErrorContains(t, err, "database not yet migrated")
}
