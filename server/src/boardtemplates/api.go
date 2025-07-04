package boardtemplates

import (
	"context"

	"github.com/google/uuid"
)

type BoardTemplateService interface {
	Create(ctx context.Context, body CreateBoardTemplateRequest) (*BoardTemplate, error)
	Get(ctx context.Context, id uuid.UUID) (*BoardTemplate, error)
	GetAll(ctx context.Context, user uuid.UUID) ([]*BoardTemplateFull, error)
	Update(ctx context.Context, body BoardTemplateUpdateRequest) (*BoardTemplate, error)
	Delete(ctx context.Context, id uuid.UUID) error
}
