package boards

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"os"

	"uuid"
	"github.com/uptrace/bun"
	"github.com/uptrace/bun/dialect/pgdialect"
	"github.com/urfave/cli/v3"
	"scrumlr.io/server/boards"
	"scrumlr.io/server/logger"
	"scrumlr.io/server/timeprovider"
)

func RegisterBoardCommands() *cli.Command {
	boardCmd := &cli.Command{
		Name:      "boards",
		Usage:     "Manage scrumlr boards",
		UsageText: "scrumlr boards [sub command] [global options]",
		Category:  "management",
		Writer:    os.Stdout,
		Commands: []*cli.Command{
			{
				Name:      "count",
				Usage:     "Get the current count of boards",
				UsageText: "scrumlr boards count [global options]",
				Action:    count,
				Category:  "boards",
			},
			{
				Name:      "list",
				Aliases:   []string{"ls"},
				Usage:     "Get all boards from the database",
				UsageText: "scrumlr boards list [global options]",
				Action:    list,
				Category:  "boards",
				Flags: []cli.Flag{
					&cli.StringFlag{
						Name:        "user",
						Usage:       "--user, -u <uuid>",
						Aliases:     []string{"u"},
						DefaultText: "Get boards where a specific user joined",
					},
					&cli.IntFlag{
						Name:        "skip",
						Usage:       "--skip <number>",
						DefaultText: "skip board entries",
					},
					&cli.IntFlag{
						Name:        "limit",
						Usage:       "--limit <number>",
						DefaultText: "limit the number of board entries",
					},
				},
			},
			{
				Name:      "show",
				Usage:     "Get a board by its id from the database",
				UsageText: "scrumlr boards show [global options]",
				Action:    show,
				Category:  "boards",
			},
			{
				Name:      "delete",
				Aliases:   []string{"rm"},
				Usage:     "Delete the given boards",
				UsageText: "scrumlr boards delete [global options] [board ids]",
				Action:    delete,
				Category:  "boards",
			},
		},
	}

	return boardCmd
}

func count(ctx context.Context, cmd *cli.Command) error {
	db, err := getDatabase(ctx, cmd)
	if err != nil {
		return fmt.Errorf("failed to connect to database %w", err)
	}

	count, err := db.NewSelect().
		Model((*boards.DatabaseBoard)(nil)).
		Count(ctx)

	if err != nil {
		return err
	}

	_, err = fmt.Fprintf(cmd.Writer, "board count: %d\n", count)
	if err != nil {
		return err
	}

	return nil
}

func list(ctx context.Context, cmd *cli.Command) error {
	skip := cmd.Int("skip")
	limit := cmd.Int("limit")

	user := cmd.String("user")
	userId := uuid.Nil()
	if user != "" {
		var err error
		userId, err = uuid.Parse(user)
		if err != nil {
			return err
		}
	}

	db, err := getDatabase(ctx, cmd)
	if err != nil {
		return fmt.Errorf("failed to connect to database %w", err)
	}

	var retrievedBoards []boards.DatabaseBoard
	querry := db.NewSelect().
		TableExpr("boards As b").
		ColumnExpr("b.*")

	if userId != uuid.Nil() {
		querry = querry.
			Join("INNER JOIN board_sessions AS s ON s.board = b.id").
			Where("s.user = ?", userId)
	}

	if skip != 0 {
		querry = querry.Offset(int64(skip))
	}

	if limit != 0 {
		querry = querry.Limit(int64(limit))
	}

	err = querry.Scan(ctx, &retrievedBoards)
	if err != nil {
		return fmt.Errorf("failed to get boards: %w", err)
	}

	for _, board := range retrievedBoards {
		b, err := json.Marshal(board)
		if err != nil {
			return err
		}

		_, err = fmt.Fprintf(cmd.Writer, "%s\n", b)
		if err != nil {
			return err
		}
	}

	return nil
}

func show(ctx context.Context, cmd *cli.Command) error {
	if !cmd.Args().Present() {
		_, err := fmt.Fprint(cmd.Writer, "no board id given\n")
		return err
	}

	if cmd.Args().Len() > 1 {
		return fmt.Errorf("only one board id must be given. Got %d", cmd.Args().Len())
	}

	boardId, err := uuid.Parse(cmd.Args().First())
	if err != nil {
		return err
	}

	db, err := getDatabase(ctx, cmd)
	if err != nil {
		return fmt.Errorf("failed to connect to database %w", err)
	}

	boardDatabase := boards.NewBoardDatabase(db, timeprovider.NewClock())

	board, err := boardDatabase.GetBoard(ctx, boardId)
	if err != nil {
		return fmt.Errorf("failed to get board: %w", err)
	}

	b, err := json.Marshal(board)
	if err != nil {
		return err
	}
	_, err = fmt.Fprintf(cmd.Writer, "%s\n", b)

	return err
}

func delete(ctx context.Context, cmd *cli.Command) error {
	if !cmd.Args().Present() {
		_, err := fmt.Fprint(cmd.Writer, "no board ids given\n")
		return err
	}

	boardIds := make([]uuid.UUID, cmd.NArg())
	for i := 0; i < cmd.Args().Len(); i++ {
		argId := cmd.Args().Get(i)
		id, err := uuid.Parse(argId)
		if err != nil {
			return err
		}

		boardIds[i] = id
	}

	db, err := getDatabase(ctx, cmd)
	if err != nil {
		return fmt.Errorf("failed to connect to database %w", err)
	}

	boardDatabase := boards.NewBoardDatabase(db, timeprovider.NewClock())

	for _, id := range boardIds {
		_, err := fmt.Fprintf(cmd.Writer, "deleting board with id %s ...\n", id)
		if err != nil {
			return err
		}

		err = boardDatabase.DeleteBoard(ctx, id)
		if err != nil {
			_, _ = fmt.Fprintf(cmd.Writer, "failed to delete board with id %s with error %v\n", id, err)
		}
	}

	return nil
}

func getDatabase(ctx context.Context, cmd *cli.Command) (*bun.DB, error) {
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

	bunDb := bun.NewDB(db, pgdialect.New())

	return bunDb, nil
}
