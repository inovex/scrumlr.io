package boardreactions

import (
	"context"

	"github.com/google/uuid"
)

type BoardReactionService interface {
	Create(ctx context.Context, board uuid.UUID, body BoardReactionCreateRequest)
}
