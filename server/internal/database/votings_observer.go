package database

import (
	"context"
	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

type VotingObserver interface {
	Observer

	// CreatedVoting will be called if a new voting was created for the board with the specified id.
	CreatedVoting(board uuid.UUID, voting Voting)

	// UpdatedVoting will be called if a voting for the board with the specified id was updated.
	UpdatedVoting(board uuid.UUID, voting Voting)
}

var _ bun.AfterInsertHook = (*VotingInsert)(nil)
var _ bun.AfterScanRowHook = (*Voting)(nil)

func (*VotingInsert) AfterInsert(ctx context.Context, _ *bun.InsertQuery) error {
	if ctx.Value("Database") == nil {
		return nil
	}
	d := ctx.Value("Database").(*Database)
	if len(d.observer) > 0 {
		request := ctx.Value("Result").(*Voting)
		for _, observer := range d.observer {
			if o, ok := observer.(VotingObserver); ok {
				o.CreatedVoting(request.Board, *request)
				return nil
			}
		}
	}
	return nil
}

func (*Voting) AfterScanRow(ctx context.Context) error {
	if ctx.Value("Database") == nil {
		return nil
	}
	d := ctx.Value("Database").(*Database)
	if len(d.observer) > 0 {
		request := ctx.Value("Result").(*Voting)
		for _, observer := range d.observer {
			if o, ok := observer.(VotingObserver); ok {
				o.UpdatedVoting(request.Board, *request)
				return nil
			}
		}
	}
	return nil
}
