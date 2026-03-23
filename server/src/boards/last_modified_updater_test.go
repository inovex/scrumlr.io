package boards

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"scrumlr.io/server/timeprovider"
)

func TestLastModifiedUpdater_UpdateLastModified(t *testing.T) {
	boardID := uuid.New()
	now := time.Date(2026, 3, 17, 12, 0, 0, 0, time.UTC)

	mockBoardDatabase := NewMockBoardDatabase(t)
	mockClock := timeprovider.NewMockTimeProvider(t)
	mockBoardDatabase.EXPECT().
		UpdateBoard(mock.Anything, DatabaseBoardUpdate{ID: boardID, LastModifiedAt: now}).
		Return(DatabaseBoard{ID: boardID}, nil)

	updater := NewLastModifiedUpdater(mockBoardDatabase, mockClock)
	err := updater.UpdateLastModified(context.Background(), boardID, now)

	assert.NoError(t, err)
}

func TestLastModifiedUpdater_UpdateLastModified_DatabaseError(t *testing.T) {
	boardID := uuid.New()
	dbErr := errors.New("database error")
	now := time.Date(2026, 3, 17, 12, 0, 0, 0, time.UTC)

	mockBoardDatabase := NewMockBoardDatabase(t)
	mockClock := timeprovider.NewMockTimeProvider(t)
	mockBoardDatabase.EXPECT().
		UpdateBoard(mock.Anything, DatabaseBoardUpdate{ID: boardID, LastModifiedAt: now}).
		Return(DatabaseBoard{}, dbErr)

	updater := NewLastModifiedUpdater(mockBoardDatabase, mockClock)
	err := updater.UpdateLastModified(context.Background(), boardID, now)

	assert.ErrorIs(t, err, dbErr)
}
