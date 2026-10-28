package boards

import (
	"bytes"
	"fmt"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/urfave/cli/v3"
	"scrumlr.io/server/boards"
	"scrumlr.io/server/initialize"
	"scrumlr.io/server/timeprovider"
)

func TestCount(t *testing.T) {
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
		},
	}

	databaseURL := fmt.Sprintf("postgresql://%s:%s@%s:%s/%s?sslmode=disable", initialize.DATABASE_USERNAME, initialize.DATABASE_PASSWORD, host, mappedPort.Port(), initialize.DATABASE_NAME)
	err = cmd.Set("database", databaseURL)
	assert.NoError(t, err)

	bunDb, err := initialize.InitializeDatabase(ctx, cmd)
	assert.NoError(t, err)

	boardDatabase := boards.NewBoardDatabase(bunDb, timeprovider.NewClock())

	_, err = boardDatabase.CreateBoard(ctx, boards.DatabaseBoardInsert{
		Name:         new("Board 1"),
		Description:  new("Description"),
		AccessPolicy: boards.Public,
	})
	assert.NoError(t, err)

	_, err = boardDatabase.CreateBoard(ctx, boards.DatabaseBoardInsert{
		Name:         new("Board 2"),
		Description:  new("Description"),
		AccessPolicy: boards.Public,
	})
	assert.NoError(t, err)

	err = count(ctx, cmd)
	assert.NoError(t, err)
	assert.Equal(t, "board count: 2\n", out.String())
}

func TestCountNoBoards(t *testing.T) {
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
		},
	}

	databaseURL := fmt.Sprintf("postgresql://%s:%s@%s:%s/%s?sslmode=disable", initialize.DATABASE_USERNAME, initialize.DATABASE_PASSWORD, host, mappedPort.Port(), initialize.DATABASE_NAME)
	err = cmd.Set("database", databaseURL)
	assert.NoError(t, err)

	_, err = initialize.InitializeDatabase(ctx, cmd)
	assert.NoError(t, err)

	err = count(ctx, cmd)
	assert.NoError(t, err)
	assert.Equal(t, "board count: 0\n", out.String())
}

func TestCountNoDatabaseConnection(t *testing.T) {
	ctx := t.Context()

	var out bytes.Buffer
	cmd := &cli.Command{
		Writer: &out,
		Flags: []cli.Flag{
			&cli.StringFlag{Name: "database"},
			&cli.StringFlag{Name: "database-host"},
			&cli.StringFlag{Name: "database-username"},
			&cli.StringFlag{Name: "database-password"},
		},
	}

	err := count(ctx, cmd)
	assert.Error(t, err)
	assert.ErrorContains(t, err, "failed to connect to database")
}

func TestDelete(t *testing.T) {
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
		},
		Action: delete,
	}

	databaseURL := fmt.Sprintf("postgresql://%s:%s@%s:%s/%s?sslmode=disable", initialize.DATABASE_USERNAME, initialize.DATABASE_PASSWORD, host, mappedPort.Port(), initialize.DATABASE_NAME)
	err = cmd.Set("database", databaseURL)
	assert.NoError(t, err)

	bunDb, err := initialize.InitializeDatabase(ctx, cmd)
	assert.NoError(t, err)

	boardDatabase := boards.NewBoardDatabase(bunDb, timeprovider.NewClock())

	createdBoard, err := boardDatabase.CreateBoard(ctx, boards.DatabaseBoardInsert{
		Name:         new("Board"),
		Description:  new("Description"),
		AccessPolicy: boards.Public,
	})
	assert.NoError(t, err)

	// We need to call run here because arguments cannot be set through the api
	err = cmd.Run(ctx, []string{
		"delete",
		"--database",
		databaseURL,
		createdBoard.ID.String(),
	})
	assert.NoError(t, err)
	assert.Equal(t, fmt.Sprintf("delting board with id %s ...\n", createdBoard.ID), out.String())

	_, err = boardDatabase.GetBoard(ctx, createdBoard.ID)
	assert.Error(t, err)
}

func TestDeleteMultipleBoards(t *testing.T) {
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
		},
		Action: delete,
	}

	databaseURL := fmt.Sprintf("postgresql://%s:%s@%s:%s/%s?sslmode=disable", initialize.DATABASE_USERNAME, initialize.DATABASE_PASSWORD, host, mappedPort.Port(), initialize.DATABASE_NAME)
	err = cmd.Set("database", databaseURL)
	assert.NoError(t, err)

	bunDb, err := initialize.InitializeDatabase(ctx, cmd)
	assert.NoError(t, err)

	boardDatabase := boards.NewBoardDatabase(bunDb, timeprovider.NewClock())

	createdBoard1, err := boardDatabase.CreateBoard(ctx, boards.DatabaseBoardInsert{
		Name:         new("Board 1"),
		Description:  new("Description"),
		AccessPolicy: boards.Public,
	})
	assert.NoError(t, err)

	createdBoard2, err := boardDatabase.CreateBoard(ctx, boards.DatabaseBoardInsert{
		Name:         new("Board 2"),
		Description:  new("Description"),
		AccessPolicy: boards.Public,
	})
	assert.NoError(t, err)

	err = cmd.Run(ctx, []string{
		"delete",
		"--database",
		databaseURL,
		createdBoard1.ID.String(),
		createdBoard2.ID.String(),
	})
	assert.NoError(t, err)

	expectedOutput := fmt.Sprintf("delting board with id %s ...\ndelting board with id %s ...\n", createdBoard1.ID, createdBoard2.ID)
	assert.Equal(t, expectedOutput, out.String())

	_, err = boardDatabase.GetBoard(ctx, createdBoard1.ID)
	assert.Error(t, err)

	_, err = boardDatabase.GetBoard(ctx, createdBoard2.ID)
	assert.Error(t, err)
}

func TestDeleteNoDatabaseConnection(t *testing.T) {
	ctx := t.Context()

	var out bytes.Buffer
	cmd := &cli.Command{
		Writer: &out,
		Flags: []cli.Flag{
			&cli.StringFlag{Name: "database"},
			&cli.StringFlag{Name: "database-host"},
			&cli.StringFlag{Name: "database-username"},
			&cli.StringFlag{Name: "database-password"},
		},
		Action: delete,
	}

	err := cmd.Run(ctx, []string{"delete", uuid.New().String()})
	assert.Error(t, err)
	assert.ErrorContains(t, err, "failed to connect to database")
}

func TestDeleteInvalidUUID(t *testing.T) {
	ctx := t.Context()

	var out bytes.Buffer
	cmd := &cli.Command{
		Writer: &out,
		Flags: []cli.Flag{
			&cli.StringFlag{Name: "database"},
			&cli.StringFlag{Name: "database-host"},
			&cli.StringFlag{Name: "database-username"},
			&cli.StringFlag{Name: "database-password"},
		},
		Action: delete,
	}

	err := cmd.Run(ctx, []string{"delete", "not-a-valid-uuid"})
	assert.Error(t, err)
	assert.Empty(t, out.String())
}

func TestDeleteNoArgs(t *testing.T) {
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
		},
		Action: delete,
	}

	databaseURL := fmt.Sprintf("postgresql://%s:%s@%s:%s/%s?sslmode=disable", initialize.DATABASE_USERNAME, initialize.DATABASE_PASSWORD, host, mappedPort.Port(), initialize.DATABASE_NAME)
	err = cmd.Set("database", databaseURL)
	assert.NoError(t, err)

	_, err = initialize.InitializeDatabase(ctx, cmd)
	assert.NoError(t, err)

	err = cmd.Run(ctx, []string{
		"delete",
		"--database",
		databaseURL,
	})
	assert.NoError(t, err)
	assert.Equal(t, "no board ids given\n", out.String())
}

func TestDeleteNonExistentBoard(t *testing.T) {
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
		},
		Action: delete,
	}

	databaseURL := fmt.Sprintf("postgresql://%s:%s@%s:%s/%s?sslmode=disable", initialize.DATABASE_USERNAME, initialize.DATABASE_PASSWORD, host, mappedPort.Port(), initialize.DATABASE_NAME)
	err = cmd.Set("database", databaseURL)
	assert.NoError(t, err)

	_, err = initialize.InitializeDatabase(ctx, cmd)
	assert.NoError(t, err)

	id := uuid.New()
	err = cmd.Run(ctx, []string{"delete", "--database", databaseURL, id.String()})
	assert.NoError(t, err)
	assert.Equal(t, fmt.Sprintf("delting board with id %s ...\n", id), out.String())
}
