package database

import (
	"context"
	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

type NotesObserver interface {
	Observer

	// UpdatedNotes will be called if the notes of the board with the specified id were updated.
	UpdatedNotes(board uuid.UUID, notes []Note)
}

var _ bun.AfterInsertHook = (*NoteInsert)(nil)
var _ bun.AfterUpdateHook = (*NoteUpdate)(nil)
var _ bun.AfterDeleteHook = (*Note)(nil)

func (*NoteInsert) AfterInsert(ctx context.Context, _ *bun.InsertQuery) error {
	return notifyNotesUpdated(ctx)
}

func (*NoteUpdate) AfterUpdate(ctx context.Context, _ *bun.UpdateQuery) error {
	return notifyNotesUpdated(ctx)
}

func (*Note) AfterDelete(ctx context.Context, _ *bun.DeleteQuery) error {
	result := ctx.Value("Result").(*[]Note)
	if len(*result) > 0 {
		return notifyNotesUpdated(ctx)
	}
	return nil
}

func notifyNotesUpdated(ctx context.Context) error {
	if ctx.Value("Database") == nil {
		return nil
	}
	d := ctx.Value("Database").(*Database)
	if len(d.observer) > 0 {
		board := ctx.Value("Board").(uuid.UUID)
		notes, err := d.GetNotes(board)
		if err != nil {
			return err
		}
		for _, observer := range d.observer {
			if o, ok := observer.(NotesObserver); ok {
				o.UpdatedNotes(board, notes)
				return nil
			}
		}
	}
	return nil
}
