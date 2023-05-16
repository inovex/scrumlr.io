package database

import (
	"context"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

type ReactionsObserver interface {
	Observer

	// UpdatedReactions will be called if the reactions of the board were updated (i.e. added)
	UpdatedReactions(board uuid.UUID, reactions []Reaction)

	// DeletedReaction will be called if a reaction was deleted
	DeletedReaction(board, reaction uuid.UUID)
}

// ensure that model implements a hook interface (compile time check)
var _ bun.AfterInsertHook = (*NoteInsert)(nil)

func (*ReactionInsert) AfterInsert(ctx context.Context, _ *bun.InsertQuery) error {
	return notifyReactionsUpdated(ctx)
}

func notifyReactionsUpdated(ctx context.Context) error {
	if ctx.Value("Database") == nil {
		return nil
	}
	d := ctx.Value("Database").(*Database)
	if len(d.observer) > 0 {
		board := ctx.Value("Board").(uuid.UUID)
		reactions, err := d.GetReactions(board)
		if err != nil {
			return err
		}
		for _, observer := range d.observer {
			if o, ok := observer.(ReactionsObserver); ok {
				o.UpdatedReactions(board, reactions)
				return nil
			}
		}
	}
	return nil
}
