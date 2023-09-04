package database

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
	"scrumlr.io/server/common/filter"
)

type NotesObserver interface {
	Observer

	// UpdatedNotes will be called if the notes of the board with the specified id were updated.
	UpdatedNotes(board uuid.UUID, notes []Note)

	// PublishCreated will be called if a note has been created.
	CreatedNote(board uuid.UUID, note Note)

	// DeletedNote will be called if a note has been deleted.
	DeletedNote(user, board, note uuid.UUID, votes []Vote, deleteStack bool)
}

var _ bun.AfterInsertHook = (*NoteInsert)(nil)
var _ bun.AfterUpdateHook = (*NoteUpdate)(nil)
var _ bun.AfterDeleteHook = (*Note)(nil)

func (*NoteInsert) AfterInsert(ctx context.Context, bun *bun.InsertQuery) error {
	// return notifyNotesUpdated(ctx)
	// var note Note
	// err := bun.Returning("ID").Scan(ctx, &note)
	// if err != nil {
	// 	return err
	// }
	// return notifyNoteCreated(ctx, note)
	return nil
}

func (*NoteUpdate) AfterUpdate(ctx context.Context, _ *bun.UpdateQuery) error {
	return notifyNotesUpdated(ctx)
}

func (*Note) AfterDelete(ctx context.Context, _ *bun.DeleteQuery) error {
	result := ctx.Value("Result").(*[]Note)
	if len(*result) > 0 {
		return notifyNoteDeleted(ctx)
	}
	return nil
}

func notifyNoteCreated(ctx context.Context, note Note) error {
	if ctx.Value("Database") == nil {
		return nil
	}

	d := ctx.Value("Database").(*Database)
	if len(d.observer) > 0 {
		fmt.Print("DEBUG: -> INSERT HOOK", ctx)

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

func notifyNoteDeleted(ctx context.Context) error {
	if ctx.Value("Database") == nil {
		return nil
	}
	d := ctx.Value("Database").(*Database)
	if len(d.observer) > 0 {
		user := ctx.Value("User").(uuid.UUID)
		board := ctx.Value("Board").(uuid.UUID)
		note := ctx.Value("Note").(uuid.UUID)
		deleteStack := ctx.Value("DeleteStack").(bool)
		votes, err := d.GetVotes(filter.VoteFilter{Board: board})
		if err != nil {
			return err
		}
		for _, observer := range d.observer {
			if o, ok := observer.(NotesObserver); ok {
				o.DeletedNote(user, board, note, votes, deleteStack)
				return nil
			}
		}
	}
	return nil
}
