package boardreactions

import (
	"context"

	"uuid"
)

type BoardReactionCreater interface {
	Create(ctx context.Context, board uuid.UUID, body BoardReactionCreateRequest)
}
