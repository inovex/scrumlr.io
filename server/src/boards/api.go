package boards

import (
	"context"
	"net/http"

	"github.com/google/uuid"
)

type BoardService interface {
	Create(ctx context.Context, body CreateBoardRequest) (*Board, error)
	Import(ctx context.Context, owner uuid.UUID, body ImportBoardRequest) (*ImportBoardResponse, error)
	Join(ctx context.Context, board *Board, user uuid.UUID, request JoinBoardRequest) (string, int, error)
	Get(ctx context.Context, id uuid.UUID) (*Board, error)
	GetBoards(ctx context.Context, userID uuid.UUID) ([]uuid.UUID, error)
	BoardOverview(ctx context.Context, boardIDs []uuid.UUID, user uuid.UUID) ([]*BoardOverview, error)
	FullBoard(ctx context.Context, boardID uuid.UUID) (*FullBoard, error)
	Update(ctx context.Context, body BoardUpdateRequest) (*Board, error)
	Delete(ctx context.Context, id uuid.UUID) error
	SetTimer(ctx context.Context, id uuid.UUID, minutes uint8) (*Board, error)
	IncrementTimer(ctx context.Context, id uuid.UUID) (*Board, error)
	DeleteTimer(ctx context.Context, id uuid.UUID) (*Board, error)
	BoardEditableContext(next http.Handler) http.Handler
}
