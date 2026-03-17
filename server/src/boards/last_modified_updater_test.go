package boards

import (
	"context"
	"errors"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

func TestLastModifiedUpdater_UpdateLastModified(t *testing.T) {
	boardID := uuid.New()

	mockBoardDatabase := NewMockBoardDatabase(t)
	mockBoardDatabase.EXPECT().
		UpdateBoard(mock.Anything, DatabaseBoardUpdate{ID: boardID}).
		Return(DatabaseBoard{ID: boardID}, nil)

	updater := NewLastModifiedUpdater(mockBoardDatabase)
	err := updater.UpdateLastModified(context.Background(), boardID)

	assert.NoError(t, err)
}

func TestLastModifiedUpdater_UpdateLastModified_DatabaseError(t *testing.T) {
	boardID := uuid.New()
	dbErr := errors.New("database error")

	mockBoardDatabase := NewMockBoardDatabase(t)
	mockBoardDatabase.EXPECT().
		UpdateBoard(mock.Anything, DatabaseBoardUpdate{ID: boardID}).
		Return(DatabaseBoard{}, dbErr)

	updater := NewLastModifiedUpdater(mockBoardDatabase)
	err := updater.UpdateLastModified(context.Background(), boardID)

	assert.ErrorIs(t, err, dbErr)
}
