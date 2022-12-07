package database

import (
	"context"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

type VotesObserver interface {
  Observer
  UpdatedVotes(board uuid.UUID)
}

var _ bun.AfterInsertHook = (*Vote)(nil)
var _ bun.AfterDeleteHook = (*Vote)(nil)

func (*Vote) AfterInsert(ctx context.Context, _ *bun.InsertQuery) error {
  return notifyVotesUpdated(ctx)
}

func (*Vote) AfterDelete(ctx context.Context, _ *bun.DeleteQuery) error {
  return notifyVotesUpdated(ctx)
}

func notifyVotesUpdated(ctx context.Context) error {
  if ctx.Value("Database") == nil {
    return nil
  }

  d := ctx.Value("Database").(*Database)
  if len(d.observer) > 0 {
    board := ctx.Value("Board").(uuid.UUID)
    for _, observer := range d.observer {
      if o, ok := observer.(VotesObserver); ok {
        o.UpdatedVotes(board)
        return nil
      }
    }
  }
  return nil
}
