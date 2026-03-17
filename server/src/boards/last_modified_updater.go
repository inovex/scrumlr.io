package boards

import (
	"context"

	"github.com/google/uuid"
	"scrumlr.io/server/timeprovider"
)

type LastModifiedUpdater struct {
	database BoardDatabase
	clock    timeprovider.TimeProvider
}

func NewLastModifiedUpdater(database BoardDatabase, clock timeprovider.TimeProvider) *LastModifiedUpdater {
	return &LastModifiedUpdater{database: database, clock: clock}
}

func (u *LastModifiedUpdater) UpdateLastModified(ctx context.Context, boardID uuid.UUID) error {
	_, err := u.database.UpdateBoard(ctx, DatabaseBoardUpdate{ID: boardID, LastModifiedAt: u.clock.Now()})
	return err
}
