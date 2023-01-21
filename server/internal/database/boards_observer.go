package database

import (
	"context"
	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

type BoardObserver interface {
	Observer

	// UpdatedBoard will be called if the specified board received an update.
	UpdatedBoard(board Board)

	// DeletedBoard will be called if the board with the specified id was deleted.
	DeletedBoard(board uuid.UUID)

	// UpdatedBoardTimer will be called if the specified board started/deleted a timer
	UpdatedBoardTimer(board Board)
}

var _ bun.AfterUpdateHook = (*BoardUpdate)(nil)
var _ bun.AfterUpdateHook = (*BoardTimerUpdate)(nil)
var _ bun.AfterDeleteHook = (*Board)(nil)

func (*BoardUpdate) AfterUpdate(ctx context.Context, _ *bun.UpdateQuery) error {
	if ctx.Value("Database") == nil {
		return nil
	}
	d := ctx.Value("Database").(*Database)
	if len(d.observer) > 0 {
		board := ctx.Value("Result").(*Board)
		for _, observer := range d.observer {
			if o, ok := observer.(BoardObserver); ok {
				o.UpdatedBoard(*board)
				return nil
			}
		}
	}
	return nil
}

func (*BoardTimerUpdate) AfterUpdate(ctx context.Context, _ *bun.UpdateQuery) error {
	if ctx.Value("Database") == nil {
		return nil
	}
	d := ctx.Value("Database").(*Database)
	if len(d.observer) > 0 {
		board := ctx.Value("Result").(*Board)
		for _, observer := range d.observer {
			if o, ok := observer.(BoardObserver); ok {
				o.UpdatedBoardTimer(*board)
				return nil
			}
		}
	}
	return nil
}

func (*Board) AfterDelete(ctx context.Context, _ *bun.DeleteQuery) error {
	if ctx.Value("Database") == nil {
		return nil
	}
	d := ctx.Value("Database").(*Database)
	if len(d.observer) > 0 {
		board := ctx.Value("Board").(uuid.UUID)
		for _, observer := range d.observer {
			if o, ok := observer.(BoardObserver); ok {
				o.DeletedBoard(board)
				return nil
			}
		}
	}
	return nil
}
