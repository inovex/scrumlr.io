package boards

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"os"

	"github.com/google/uuid"
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
				Name:      "delete",
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
		_, err := fmt.Fprintf(cmd.Writer, "delting board with id %s ...\n", id)
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
