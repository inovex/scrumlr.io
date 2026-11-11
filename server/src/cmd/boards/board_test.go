package boards

import (
	"bytes"
	"encoding/json"
	"fmt"
	"testing"

	"uuid"
	"github.com/stretchr/testify/assert"
	"github.com/urfave/cli/v3"
	"scrumlr.io/server/boards"
	"scrumlr.io/server/initialize"
	"scrumlr.io/server/initialize/testDbTemplates"
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

func TestList(t *testing.T) {
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
			&cli.StringFlag{Name: "user", Aliases: []string{"u"}},
			&cli.IntFlag{Name: "skip"},
			&cli.IntFlag{Name: "limit"},
		},
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

	b1, err := json.Marshal(createdBoard1)
	assert.NoError(t, err)

	createdBoard2, err := boardDatabase.CreateBoard(ctx, boards.DatabaseBoardInsert{
		Name:         new("Board 2"),
		Description:  new("Description"),
		AccessPolicy: boards.Public,
	})
	assert.NoError(t, err)

	b2, err := json.Marshal(createdBoard2)
	assert.NoError(t, err)

	err = list(ctx, cmd)

	assert.NoError(t, err)
	assert.Contains(t, out.String(), fmt.Sprintf("%s\n", b1))
	assert.Contains(t, out.String(), fmt.Sprintf("%s\n", b2))
}

func TestListNoBoards(t *testing.T) {
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
			&cli.StringFlag{Name: "user", Aliases: []string{"u"}},
			&cli.IntFlag{Name: "skip"},
			&cli.IntFlag{Name: "limit"},
		},
	}

	databaseURL := fmt.Sprintf("postgresql://%s:%s@%s:%s/%s?sslmode=disable", initialize.DATABASE_USERNAME, initialize.DATABASE_PASSWORD, host, mappedPort.Port(), initialize.DATABASE_NAME)
	err = cmd.Set("database", databaseURL)
	assert.NoError(t, err)

	_, err = initialize.InitializeDatabase(ctx, cmd)
	assert.NoError(t, err)

	err = list(ctx, cmd)

	assert.NoError(t, err)
	assert.Empty(t, out.String())
}

func TestListWithLimit(t *testing.T) {
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
			&cli.StringFlag{Name: "user", Aliases: []string{"u"}},
			&cli.IntFlag{Name: "skip"},
			&cli.IntFlag{Name: "limit"},
		},
	}

	databaseURL := fmt.Sprintf("postgresql://%s:%s@%s:%s/%s?sslmode=disable", initialize.DATABASE_USERNAME, initialize.DATABASE_PASSWORD, host, mappedPort.Port(), initialize.DATABASE_NAME)
	err = cmd.Set("database", databaseURL)
	assert.NoError(t, err)

	err = cmd.Set("limit", "1")
	assert.NoError(t, err)

	bunDb, err := initialize.InitializeDatabase(ctx, cmd)
	assert.NoError(t, err)

	boardDatabase := boards.NewBoardDatabase(bunDb, timeprovider.NewClock())

	createdBoard, err := boardDatabase.CreateBoard(ctx, boards.DatabaseBoardInsert{
		Name:         new("Board 1"),
		Description:  new("Description"),
		AccessPolicy: boards.Public,
	})
	assert.NoError(t, err)

	b, err := json.Marshal(createdBoard)
	assert.NoError(t, err)

	_, err = boardDatabase.CreateBoard(ctx, boards.DatabaseBoardInsert{
		Name:         new("Board 2"),
		Description:  new("Description"),
		AccessPolicy: boards.Public,
	})
	assert.NoError(t, err)

	err = list(ctx, cmd)

	assert.NoError(t, err)
	assert.Equal(t, fmt.Sprintf("%s\n", b), out.String())
}

func TestListWithSkip(t *testing.T) {
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
			&cli.StringFlag{Name: "user", Aliases: []string{"u"}},
			&cli.IntFlag{Name: "skip"},
			&cli.IntFlag{Name: "limit"},
		},
	}

	databaseURL := fmt.Sprintf("postgresql://%s:%s@%s:%s/%s?sslmode=disable", initialize.DATABASE_USERNAME, initialize.DATABASE_PASSWORD, host, mappedPort.Port(), initialize.DATABASE_NAME)
	err = cmd.Set("database", databaseURL)
	assert.NoError(t, err)

	err = cmd.Set("skip", "1")
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

	createdBoard, err := boardDatabase.CreateBoard(ctx, boards.DatabaseBoardInsert{
		Name:         new("Board 2"),
		Description:  new("Description"),
		AccessPolicy: boards.Public,
	})
	assert.NoError(t, err)

	b, err := json.Marshal(createdBoard)
	assert.NoError(t, err)

	err = list(ctx, cmd)

	assert.NoError(t, err)
	assert.Equal(t, fmt.Sprintf("%s\n", b), out.String())
}

func TestListWithUser(t *testing.T) {
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
			&cli.StringFlag{Name: "user", Aliases: []string{"u"}},
			&cli.IntFlag{Name: "skip"},
			&cli.IntFlag{Name: "limit"},
		},
	}

	databaseURL := fmt.Sprintf("postgresql://%s:%s@%s:%s/%s?sslmode=disable", initialize.DATABASE_USERNAME, initialize.DATABASE_PASSWORD, host, mappedPort.Port(), initialize.DATABASE_NAME)
	err = cmd.Set("database", databaseURL)
	assert.NoError(t, err)

	bunDb, err := initialize.InitializeDatabase(ctx, cmd)
	assert.NoError(t, err)

	boardDatabase := boards.NewBoardDatabase(bunDb, timeprovider.NewClock())

	createdBoard, err := boardDatabase.CreateBoard(ctx, boards.DatabaseBoardInsert{
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

	b, err := json.Marshal(createdBoard)
	assert.NoError(t, err)

	userId := uuid.New()
	err = testDbTemplates.InsertUser(bunDb, userId, "Test User", "ANONYMOUS", nil)
	assert.NoError(t, err)

	err = testDbTemplates.InsertSession(bunDb, userId, createdBoard.ID, "OWNER", false, true, true, false)
	assert.NoError(t, err)

	err = cmd.Set("user", userId.String())
	assert.NoError(t, err)

	err = list(ctx, cmd)

	assert.NoError(t, err)
	assert.Equal(t, fmt.Sprintf("%s\n", b), out.String())
}

func TestListWithUserNoBoards(t *testing.T) {
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
			&cli.StringFlag{Name: "user", Aliases: []string{"u"}},
			&cli.IntFlag{Name: "skip"},
			&cli.IntFlag{Name: "limit"},
		},
	}

	databaseURL := fmt.Sprintf("postgresql://%s:%s@%s:%s/%s?sslmode=disable", initialize.DATABASE_USERNAME, initialize.DATABASE_PASSWORD, host, mappedPort.Port(), initialize.DATABASE_NAME)
	err = cmd.Set("database", databaseURL)
	assert.NoError(t, err)

	err = cmd.Set("user", uuid.New().String())
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

	err = list(ctx, cmd)

	assert.NoError(t, err)
	assert.Empty(t, out.String())
}

func TestListInvalidUserUUID(t *testing.T) {
	ctx := t.Context()

	var out bytes.Buffer
	cmd := &cli.Command{
		Writer: &out,
		Flags: []cli.Flag{
			&cli.StringFlag{Name: "database"},
			&cli.StringFlag{Name: "database-host"},
			&cli.StringFlag{Name: "database-username"},
			&cli.StringFlag{Name: "database-password"},
			&cli.StringFlag{Name: "user", Aliases: []string{"u"}},
			&cli.IntFlag{Name: "skip"},
			&cli.IntFlag{Name: "limit"},
		},
	}

	err := cmd.Set("user", "1")
	assert.NoError(t, err)

	err = list(ctx, cmd)

	assert.Error(t, err)
	assert.Empty(t, out.String())
}

func TestListNoDatabaseConnection(t *testing.T) {
	ctx := t.Context()

	var out bytes.Buffer
	cmd := &cli.Command{
		Writer: &out,
		Flags: []cli.Flag{
			&cli.StringFlag{Name: "database"},
			&cli.StringFlag{Name: "database-host"},
			&cli.StringFlag{Name: "database-username"},
			&cli.StringFlag{Name: "database-password"},
			&cli.StringFlag{Name: "user", Aliases: []string{"u"}},
			&cli.IntFlag{Name: "skip"},
			&cli.IntFlag{Name: "limit"},
		},
	}

	err := list(ctx, cmd)

	assert.Error(t, err)
	assert.ErrorContains(t, err, "failed to connect to database")
}

func TestShow(t *testing.T) {
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
		Action: show,
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

	b, err := json.Marshal(createdBoard)
	assert.NoError(t, err)

	err = cmd.Run(ctx, []string{"show", "--database", databaseURL, createdBoard.ID.String()})

	assert.NoError(t, err)
	assert.Equal(t, fmt.Sprintf("%s\n", b), out.String())
}

func TestShowNoArgs(t *testing.T) {
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
		Action: show,
	}

	databaseURL := fmt.Sprintf("postgresql://%s:%s@%s:%s/%s?sslmode=disable", initialize.DATABASE_USERNAME, initialize.DATABASE_PASSWORD, host, mappedPort.Port(), initialize.DATABASE_NAME)
	err = cmd.Set("database", databaseURL)
	assert.NoError(t, err)

	_, err = initialize.InitializeDatabase(ctx, cmd)
	assert.NoError(t, err)

	err = cmd.Run(ctx, []string{"show"})

	assert.NoError(t, err)
	assert.Equal(t, "no board id given\n", out.String())
}

func TestShowMultipleArgs(t *testing.T) {
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
		Action: show,
	}

	err := cmd.Run(ctx, []string{"show", uuid.New().String(), uuid.New().String()})

	assert.Error(t, err)
	assert.ErrorContains(t, err, "only one board id must be given. Got 2")
}

func TestShowInvalidUUID(t *testing.T) {
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
		Action: show,
	}

	err := cmd.Run(ctx, []string{"show", "1"})

	assert.Error(t, err)
	assert.Empty(t, out.String())
}

func TestShowNoDatabaseConnection(t *testing.T) {
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
		Action: show,
	}

	err := cmd.Run(ctx, []string{"show", uuid.New().String()})

	assert.Error(t, err)
	assert.ErrorContains(t, err, "failed to connect to database")
}

func TestShowNonExistentBoard(t *testing.T) {
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
		Action: show,
	}

	databaseURL := fmt.Sprintf("postgresql://%s:%s@%s:%s/%s?sslmode=disable", initialize.DATABASE_USERNAME, initialize.DATABASE_PASSWORD, host, mappedPort.Port(), initialize.DATABASE_NAME)
	err = cmd.Set("database", databaseURL)
	assert.NoError(t, err)

	_, err = initialize.InitializeDatabase(ctx, cmd)
	assert.NoError(t, err)

	id := uuid.New()

	err = cmd.Run(ctx, []string{"show", "--database", databaseURL, id.String()})

	assert.Error(t, err)
	assert.ErrorContains(t, err, "failed to get board")
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
	assert.Equal(t, fmt.Sprintf("deleting board with id %s ...\n", createdBoard.ID), out.String())

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

	expectedOutput := fmt.Sprintf("deleting board with id %s ...\ndeleting board with id %s ...\n", createdBoard1.ID, createdBoard2.ID)
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
	assert.Equal(t, fmt.Sprintf("deleting board with id %s ...\n", id), out.String())
}
