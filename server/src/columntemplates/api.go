package columntemplates

import (
	"context"

	"github.com/google/uuid"
)

type ColumnTemplateService interface {
	Create(ctx context.Context, body ColumnTemplateRequest) (*ColumnTemplate, error)
	Get(ctx context.Context, boardID, columnID uuid.UUID) (*ColumnTemplate, error)
	GetAll(ctx context.Context, board uuid.UUID) ([]*ColumnTemplate, error)
	Update(ctx context.Context, body ColumnTemplateUpdateRequest) (*ColumnTemplate, error)
	Delete(ctx context.Context, board, column, user uuid.UUID) error
}
