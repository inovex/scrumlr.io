package database

import (
	"context"
	"github.com/google/uuid"
	"github.com/uptrace/bun"
	"scrumlr.io/server/common/filter"
)

type ColumnsObserver interface {
	Observer

	// UpdatedColumns will be called if the columns of the board with the specified id were updated.
	UpdatedColumns(board uuid.UUID, columns []Column)
	DeletedColumn(user, board, column uuid.UUID, notes []Note, votes []Vote)
}

var _ bun.AfterInsertHook = (*ColumnInsert)(nil)
var _ bun.AfterUpdateHook = (*ColumnUpdate)(nil)
var _ bun.AfterDeleteHook = (*Column)(nil)

func (*ColumnInsert) AfterInsert(ctx context.Context, _ *bun.InsertQuery) error {
	return notifyColumnsUpdated(ctx)
}

func (*ColumnUpdate) AfterUpdate(ctx context.Context, _ *bun.UpdateQuery) error {
	return notifyColumnsUpdated(ctx)
}

func (*Column) AfterDelete(ctx context.Context, _ *bun.DeleteQuery) error {
	result := ctx.Value("Result").(*[]Column)
	if len(*result) > 0 {
		return notifyColumnDeleted(ctx)
	}
	return nil
}

func notifyColumnsUpdated(ctx context.Context) error {
	if ctx.Value("Database") == nil {
		return nil
	}
	d := ctx.Value("Database").(*Database)
	if len(d.observer) > 0 {
		board := ctx.Value("Board").(uuid.UUID)
		columns, err := d.GetColumns(board)
		if err != nil {
			return err
		}
		for _, observer := range d.observer {
			if o, ok := observer.(ColumnsObserver); ok {
				o.UpdatedColumns(board, columns)
				return nil
			}
		}
	}
	return nil
}

func notifyColumnDeleted(ctx context.Context) error {
	if ctx.Value("Database") == nil {
		return nil
	}
	d := ctx.Value("Database").(*Database)
	if len(d.observer) > 0 {
		user := ctx.Value("User").(uuid.UUID)
		board := ctx.Value("Board").(uuid.UUID)
		column := ctx.Value("Column").(uuid.UUID)
		notes, err := d.GetNotes(board)
		votes, err := d.GetVotes(filter.VoteFilter{Board: board})
		if err != nil {
			return err
		}
		for _, observer := range d.observer {
			if o, ok := observer.(ColumnsObserver); ok {
				o.DeletedColumn(user, board, column, notes, votes)
				return nil
			}
		}
	}
	return nil

}
