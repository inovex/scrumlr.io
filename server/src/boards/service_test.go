package boards

import (
	"context"
	"errors"
	"github.com/stretchr/testify/mock"
	"scrumlr.io/server/columns"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"scrumlr.io/server/realtime"
)

func TestGet(t *testing.T) {
	ctx := context.Background()
	mockDB := NewMockBoardDatabase(t)
	mockRealtime := new(realtime.Broker)

	service := NewBoardService(mockDB, mockRealtime)

	boardID := uuid.New()
	mockBoard := DatabaseBoard{ID: boardID}

	mockDB.EXPECT().GetBoard(boardID).Return(mockBoard, nil)

	result, err := service.Get(ctx, boardID)
	require.NoError(t, err)
	require.NotNil(t, result)
	assert.Equal(t, boardID, result.ID)
}

func TestGetError(t *testing.T) {
	ctx := context.Background()
	mockDB := NewMockBoardDatabase(t)
	mockRealtime := new(realtime.Broker)

	service := NewBoardService(mockDB, mockRealtime)

	boardID := uuid.New()
	mockDB.EXPECT().GetBoard(boardID).Return(DatabaseBoard{}, errors.New("db error"))

	result, err := service.Get(ctx, boardID)
	require.Error(t, err)
	assert.Nil(t, result)
}

func TestCreate(t *testing.T) {
	ctx := context.Background()
	mockDB := NewMockBoardDatabase(t)
	mockRealtime := new(realtime.Broker)

	service := NewBoardService(mockDB, mockRealtime)

	boardID := uuid.New()
	userID := uuid.New()

	boardName := "Test Board"
	boardDescription := "A test board"

	req := CreateBoardRequest{
		Name:         &boardName,
		Description:  &boardDescription,
		Owner:        userID,
		AccessPolicy: Public,
		Columns: []columns.ColumnRequest{{
			Name:        boardName,
			Description: boardDescription,
			Color:       columns.ColorGoalGreen,
			Visible:     nil,
			Index:       nil,
			Board:       boardID,
			User:        userID,
		}},
	}

	expectedBoard := DatabaseBoard{ID: boardID}
	mockDB.EXPECT().CreateBoard(userID, mock.Anything, mock.Anything).Return(expectedBoard, nil)

	result, err := service.Create(ctx, req)
	require.NoError(t, err)
	require.NotNil(t, result)
	assert.Equal(t, boardID, result.ID)
}

func TestCreate_ByPassphraseMissing(t *testing.T) {
	ctx := context.Background()
	mockDB := NewMockBoardDatabase(t)
	mockRealtime := new(realtime.Broker)

	service := NewBoardService(mockDB, mockRealtime)

	userID := uuid.New()

	boardName := "Test Board"
	boardDescription := "A test board"

	req := CreateBoardRequest{
		Name:         &boardName,
		Description:  &boardDescription,
		Owner:        userID,
		AccessPolicy: ByPassphrase,
		Columns:      nil,
		Passphrase:   nil,
	}

	result, err := service.Create(ctx, req)
	require.Error(t, err)
	assert.Nil(t, result)
}

func TestDelete(t *testing.T) {
	ctx := context.Background()
	mockDB := NewMockBoardDatabase(t)
	mockRealtime := new(realtime.Broker)

	service := NewBoardService(mockDB, mockRealtime)

	boardID := uuid.New()
	mockDB.EXPECT().DeleteBoard(boardID).Return(nil)

	err := service.Delete(ctx, boardID)
	require.NoError(t, err)
}

func TestUpdate(t *testing.T) {
	ctx := context.Background()
	mockDB := NewMockBoardDatabase(t)
	mockRealtime := new(realtime.Broker)

	service := NewBoardService(mockDB, mockRealtime)

	boardID := uuid.New()
	updatedName := "Updated Board Name"

	updateReq := BoardUpdateRequest{
		ID:   boardID,
		Name: &updatedName,
	}

	expectedBoard := DatabaseBoard{ID: boardID}
	mockDB.EXPECT().UpdateBoard(mock.Anything).Return(expectedBoard, nil)

	result, err := service.Update(ctx, updateReq)
	require.NoError(t, err)
	assert.Equal(t, boardID, result.ID)
}

func TestSetTimer(t *testing.T) {
	ctx := context.Background()
	mockDB := NewMockBoardDatabase(t)
	mockRealtime := new(realtime.Broker)

	service := NewBoardService(mockDB, mockRealtime)

	boardID := uuid.New()
	mockDB.EXPECT().UpdateBoardTimer(mock.Anything).Return(DatabaseBoard{ID: boardID}, nil)

	result, err := service.SetTimer(ctx, boardID, 5)
	require.NoError(t, err)
	assert.Equal(t, boardID, result.ID)
}

func TestDeleteTimer(t *testing.T) {
	ctx := context.Background()
	mockDB := NewMockBoardDatabase(t)
	mockRealtime := new(realtime.Broker)

	service := NewBoardService(mockDB, mockRealtime)

	boardID := uuid.New()
	mockDB.EXPECT().UpdateBoardTimer(mock.Anything).Return(DatabaseBoard{ID: boardID}, nil)

	result, err := service.DeleteTimer(ctx, boardID)
	require.NoError(t, err)
	assert.Equal(t, boardID, result.ID)
}

func TestIncrementTimer(t *testing.T) {
	ctx := context.Background()
	mockDB := NewMockBoardDatabase(t)
	mockRealtime := new(realtime.Broker)

	service := NewBoardService(mockDB, mockRealtime)

	boardID := uuid.New()
	now := time.Now()

	updatedTimer := now.Add(1 * time.Minute)
	mockBoard := DatabaseBoard{
		ID:         boardID,
		TimerStart: &now,
		TimerEnd:   &updatedTimer,
	}

	mockDB.EXPECT().GetBoard(boardID).Return(mockBoard, nil)
	mockDB.EXPECT().UpdateBoardTimer(mock.Anything).Return(mockBoard, nil)

	result, err := service.IncrementTimer(ctx, boardID)
	require.NoError(t, err)
	assert.Equal(t, boardID, result.ID)
}
