package boards

import (
	"context"

	"github.com/google/uuid"
)

type LastModifiedUpdater struct {
	database BoardDatabase
}

func NewLastModifiedUpdater(database BoardDatabase) *LastModifiedUpdater {
	return &LastModifiedUpdater{database: database}
}

func (u *LastModifiedUpdater) UpdateLastModified(ctx context.Context, boardID uuid.UUID) error {
	_, err := u.database.UpdateBoard(ctx, DatabaseBoardUpdate{ID: boardID})
	return err
}
