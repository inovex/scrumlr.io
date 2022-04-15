package database

import (
	"context"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

type BoardSessionRequestsObserver interface {
	Observer

	// CreatedSessionRequest will be called if a new session request was created for the board with the specified id.
	CreatedSessionRequest(board uuid.UUID, request BoardSessionRequest)

	// UpdatedSessionRequest will be called if a session request for the board with the specified id was updated.
	UpdatedSessionRequest(board uuid.UUID, request BoardSessionRequest)
}

var _ bun.AfterScanRowHook = (*BoardSessionRequest)(nil)

func (*BoardSessionRequest) AfterScanRow(ctx context.Context) error {
	if ctx.Value("Database") == nil {
		return nil
	}
	d := ctx.Value("Database").(*Database)
	if len(d.observer) > 0 {
		board := ctx.Value("Board").(uuid.UUID)

		operation := ctx.Value("Operation").(string)
		switch operation {
		case "INSERT":
			request := ctx.Value("Result").(*BoardSessionRequest)
			for _, observer := range d.observer {
				if o, ok := observer.(BoardSessionRequestsObserver); ok {
					o.CreatedSessionRequest(board, *request)
					return nil
				}
			}
		case "UPDATE":
			request := ctx.Value("Result").(*BoardSessionRequest)
			for _, observer := range d.observer {
				if o, ok := observer.(BoardSessionRequestsObserver); ok {
					o.UpdatedSessionRequest(board, *request)
					return nil
				}
			}
		}
	}
	return nil
}
