package database

import (
	"context"
	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

type BoardSessionsObserver interface {
	Observer

	// CreatedSession will be called if a session of the board with the specified id was created.
	CreatedSession(board uuid.UUID, session BoardSession)

	// UpdatedSession will be called if a session of the board with the specified id was updated.
	UpdatedSession(board uuid.UUID, session BoardSession)

	// UpdatedSessions will be called if multiple sessions of the board with the specified id were updated.
	UpdatedSessions(board uuid.UUID, sessions []BoardSession)
}

var _ bun.AfterScanRowHook = (*BoardSession)(nil)
var _ bun.AfterUpdateHook = (*UserUpdate)(nil)

func (*BoardSession) AfterScanRow(ctx context.Context) error {
	if ctx.Value("Database") == nil {
		return nil
	}
	d := ctx.Value("Database").(*Database)
	if len(d.observer) > 0 {
		board := ctx.Value("Board").(uuid.UUID)
		operation := ctx.Value("Operation").(string)
		switch operation {
		case "INSERT":
			session := ctx.Value("Result").(*BoardSession)
			for _, observer := range d.observer {
				if o, ok := observer.(BoardSessionsObserver); ok {
					o.CreatedSession(board, *session)
					return nil
				}
			}
		case "UPDATE":
			session := ctx.Value("Result").(*BoardSession)
			for _, observer := range d.observer {
				if o, ok := observer.(BoardSessionsObserver); ok {
					o.UpdatedSession(board, *session)
					return nil
				}
			}
		}
	}
	return nil
}

func (*UserUpdate) AfterUpdate(ctx context.Context, q *bun.UpdateQuery) error {
	if ctx.Value("Database") == nil {
		return nil
	}
	d := ctx.Value("Database").(*Database)
	user := q.GetModel().Value().(*UserUpdate)

	var connectedBoards []uuid.UUID
	err := d.db.NewSelect().
		Model(&connectedBoards).
		ModelTableExpr("board_sessions AS s").
		Column("s.board").
		Where("s.user = ?", user.ID).
		Where("s.connected").
		Scan(context.Background())

	if err != nil {
		return err
	}

	for _, board := range connectedBoards {
		session, err := d.GetBoardSession(board, user.ID)
		if err != nil {
			return err
		}

		for _, observer := range d.observer {
			if o, ok := observer.(BoardSessionsObserver); ok {
				o.UpdatedSession(board, session)
				return nil
			}
		}
	}

	return nil
}
