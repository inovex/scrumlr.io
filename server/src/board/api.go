package board

import (
	"context"
	"github.com/google/uuid"
)

type BoardService interface {
	Create(ctx context.Context, body CreateBoardRequest) (*Board, error)
	Get(ctx context.Context, id uuid.UUID) (*Board, error)
	Update(ctx context.Context, body BoardUpdateRequest) (*Board, error)
	Delete(ctx context.Context, id uuid.UUID) error

	SetTimer(ctx context.Context, id uuid.UUID, minutes uint8) (*Board, error)
	DeleteTimer(ctx context.Context, id uuid.UUID) (*Board, error)
	IncrementTimer(ctx context.Context, id uuid.UUID) (*Board, error)

	FullBoard(ctx context.Context, boardID uuid.UUID) (*FullBoard, error)
	BoardOverview(ctx context.Context, boardIDs []uuid.UUID, user uuid.UUID) ([]*BoardOverview, error)
	GetBoards(ctx context.Context, userID uuid.UUID) ([]uuid.UUID, error)
}
