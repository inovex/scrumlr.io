package columns

import (
	"context"
	"github.com/google/uuid"
)

type ColumnsService interface {
	Create(ctx context.Context, body ColumnRequest) (*Column, error)
	Delete(ctx context.Context, board, column, user uuid.UUID) error
	Update(ctx context.Context, body ColumnUpdateRequest) (*Column, error)
	Get(ctx context.Context, boardID, columnID uuid.UUID) (*Column, error)
	GetAll(ctx context.Context, boardID uuid.UUID) ([]*Column, error)
}
