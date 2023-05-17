package database

import (
	"context"
	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

type ReactionsObserver interface {
	Observer

	// AddedReaction will be called if a reaction was added to the board
	AddedReaction(board uuid.UUID, reaction Reaction)

	// DeletedReaction will be called if a reaction was deleted
	DeletedReaction(board, reaction uuid.UUID)
}

// ensure that model implements a hook interface (compile time check)
// note that there's no AfterInsertHook because of issues with the ID not being known at time of creation
var _ bun.AfterDeleteHook = (*Reaction)(nil)

func (*Reaction) AfterDelete(ctx context.Context, _ *bun.DeleteQuery) error {
	return notifyReactionDeleted(ctx)
}

func notifyReactionDeleted(ctx context.Context) error {
	if ctx.Value("Database") == nil {
		return nil
	}
	d := ctx.Value("Database").(*Database)

	if len(d.observer) > 0 {
		board := ctx.Value("Board").(uuid.UUID)
		reaction := ctx.Value("Reaction").(uuid.UUID)

		for _, observer := range d.observer {
			if o, ok := observer.(ReactionsObserver); ok {
				o.DeletedReaction(board, reaction)
				return nil
			}
		}
	}

	return nil
}
