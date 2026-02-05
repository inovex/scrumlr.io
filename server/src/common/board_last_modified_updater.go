package common

import (
	"context"

	"github.com/google/uuid"
)

type BoardLastModifiedUpdater interface {
	UpdateLastModified(ctx context.Context, boardID uuid.UUID) error
}
