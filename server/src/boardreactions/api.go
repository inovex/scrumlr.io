package boardreactions

import (
	"context"

	"github.com/google/uuid"
)

type BoardReactionCreater interface {
	Create(ctx context.Context, board uuid.UUID, body BoardReactionCreateRequest)
}
