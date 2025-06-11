package boards

import (
	"context"
	"errors"
	"scrumlr.io/server/sessions"
	"testing"
	"time"

	"github.com/stretchr/testify/mock"
	"scrumlr.io/server/columns"
	"scrumlr.io/server/notes"
	"scrumlr.io/server/reactions"
	"scrumlr.io/server/sessionrequests"
	"scrumlr.io/server/timeprovider"
	"scrumlr.io/server/votings"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"scrumlr.io/server/realtime"
)

func TestGet(t *testing.T) {
	boardID := uuid.New()

	mockBoardDatabase := NewMockBoardDatabase(t)
	mockBoardDatabase.EXPECT().GetBoard(boardID).Return(DatabaseBoard{ID: boardID}, nil)

	sessionsMock := sessions.NewMockSessionService(t)
	sessionRequestMock := sessionrequests.NewMockSessionRequestService(t)
	columnMock := columns.NewMockColumnService(t)
	noteMock := notes.NewMockNotesService(t)
	reactionMock := reactions.NewMockReactionService(t)
	votingMock := votings.NewMockVotingService(t)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockClock := timeprovider.NewMockTimeProvider(t)

	service := NewBoardService(mockBoardDatabase, broker, sessionRequestMock, sessionsMock, columnMock, noteMock, reactionMock, votingMock, mockClock)
	result, err := service.Get(context.Background(), boardID)

	require.NoError(t, err)
	require.NotNil(t, result)
	assert.Equal(t, boardID, result.ID)
}

func TestGetError(t *testing.T) {
	boardID := uuid.New()
	dbError := errors.New("db error")

	mockBoardDatabase := NewMockBoardDatabase(t)
	mockBoardDatabase.EXPECT().GetBoard(boardID).Return(DatabaseBoard{}, dbError)

	sessionsMock := sessions.NewMockSessionService(t)
	sessionRequestMock := sessionrequests.NewMockSessionRequestService(t)
	columnMock := columns.NewMockColumnService(t)
	noteMock := notes.NewMockNotesService(t)
	reactionMock := reactions.NewMockReactionService(t)
	votingMock := votings.NewMockVotingService(t)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockClock := timeprovider.NewMockTimeProvider(t)

	service := NewBoardService(mockBoardDatabase, broker, sessionRequestMock, sessionsMock, columnMock, noteMock, reactionMock, votingMock, mockClock)
	result, err := service.Get(context.Background(), boardID)

	require.Error(t, err)
	assert.Nil(t, result)
	assert.Equal(t, dbError, err)
}

func TestCreate(t *testing.T) {
	boardID := uuid.New()
	userID := uuid.New()
	boardName := "Test Board"
	boardDescription := "A test board"
	index := 0

	mockBoardDatabase := NewMockBoardDatabase(t)
	mockBoardDatabase.EXPECT().CreateBoard(userID, DatabaseBoardInsert{Name: &boardName, Description: &boardDescription, AccessPolicy: Public},
		[]columns.DatabaseColumnInsert{{Name: boardName, Color: columns.ColorGoalGreen, Visible: nil, Index: &index}}).
		Return(DatabaseBoard{ID: boardID, Name: &boardName, Description: &boardDescription, AccessPolicy: Public}, nil)

	sessionsMock := sessions.NewMockSessionService(t)
	sessionRequestMock := sessionrequests.NewMockSessionRequestService(t)
	columnMock := columns.NewMockColumnService(t)
	noteMock := notes.NewMockNotesService(t)
	reactionMock := reactions.NewMockReactionService(t)
	votingMock := votings.NewMockVotingService(t)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockClock := timeprovider.NewMockTimeProvider(t)

	service := NewBoardService(mockBoardDatabase, broker, sessionRequestMock, sessionsMock, columnMock, noteMock, reactionMock, votingMock, mockClock)
	result, err := service.Create(context.Background(), CreateBoardRequest{Name: &boardName, Description: &boardDescription, Owner: userID, AccessPolicy: Public, Columns: []columns.ColumnRequest{
		{Board: boardID, Name: boardName, Description: boardDescription, Color: columns.ColorGoalGreen, Visible: nil, Index: &index, User: userID},
	}})

	require.NoError(t, err)
	require.NotNil(t, result)
	assert.Equal(t, boardID, result.ID)
}

func TestCreate_ByPassphraseMissing(t *testing.T) {
	userID := uuid.New()
	boardName := "Test Board"
	boardDescription := "A test board"

	mockBoardDatabase := NewMockBoardDatabase(t)

	sessionsMock := sessions.NewMockSessionService(t)
	sessionRequestMock := sessionrequests.NewMockSessionRequestService(t)
	columnMock := columns.NewMockColumnService(t)
	noteMock := notes.NewMockNotesService(t)
	reactionMock := reactions.NewMockReactionService(t)
	votingMock := votings.NewMockVotingService(t)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockClock := timeprovider.NewMockTimeProvider(t)

	service := NewBoardService(mockBoardDatabase, broker, sessionRequestMock, sessionsMock, columnMock, noteMock, reactionMock, votingMock, mockClock)
	result, err := service.Create(context.Background(), CreateBoardRequest{Name: &boardName, Description: &boardDescription, Owner: userID, AccessPolicy: ByPassphrase, Columns: nil, Passphrase: nil})

	require.Error(t, err)
	assert.Nil(t, result)
	assert.Equal(t, errors.New("passphrase must be set on access policy 'BY_PASSPHRASE'"), err)
}

func TestDelete(t *testing.T) {
	boardID := uuid.New()

	mockBoardDatabase := NewMockBoardDatabase(t)
	mockBoardDatabase.EXPECT().DeleteBoard(boardID).Return(nil)

	sessionsMock := sessions.NewMockSessionService(t)
	sessionRequestMock := sessionrequests.NewMockSessionRequestService(t)
	columnMock := columns.NewMockColumnService(t)
	noteMock := notes.NewMockNotesService(t)
	reactionMock := reactions.NewMockReactionService(t)
	votingMock := votings.NewMockVotingService(t)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockClock := timeprovider.NewMockTimeProvider(t)

	service := NewBoardService(mockBoardDatabase, broker, sessionRequestMock, sessionsMock, columnMock, noteMock, reactionMock, votingMock, mockClock)
	err := service.Delete(context.Background(), boardID)

	require.NoError(t, err)
}

func TestUpdate(t *testing.T) {
	boardID := uuid.New()
	updatedName := "Updated Board Name"

	mockBoardDatabase := NewMockBoardDatabase(t)
	mockBoardDatabase.EXPECT().UpdateBoard(DatabaseBoardUpdate{ID: boardID, Name: &updatedName}).
		Return(DatabaseBoard{ID: boardID, Name: &updatedName}, nil)

	sessionsMock := sessions.NewMockSessionService(t)
	sessionRequestMock := sessionrequests.NewMockSessionRequestService(t)
	reactionMock := reactions.NewMockReactionService(t)
	votingMock := votings.NewMockVotingService(t)

	columnMock := columns.NewMockColumnService(t)
	columnMock.EXPECT().GetAll(context.Background(), boardID).Return([]*columns.Column{}, nil)

	noteMock := notes.NewMockNotesService(t)
	noteMock.EXPECT().GetAll(context.Background(), boardID).Return([]*notes.Note{}, nil)

	mockBroker := realtime.NewMockClient(t)
	mockBroker.EXPECT().Publish(mock.AnythingOfType("string"), mock.Anything).Return(nil)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockClock := timeprovider.NewMockTimeProvider(t)

	service := NewBoardService(mockBoardDatabase, broker, sessionRequestMock, sessionsMock, columnMock, noteMock, reactionMock, votingMock, mockClock)
	result, err := service.Update(context.Background(), BoardUpdateRequest{ID: boardID, Name: &updatedName})

	require.NoError(t, err)
	assert.Equal(t, boardID, result.ID)
}

func TestSetTimer(t *testing.T) {
	boardID := uuid.New()
	timerStart := time.Now().Local()
	timerEnd := timerStart.Add(time.Minute * time.Duration(5))

	mockBoardDatabase := NewMockBoardDatabase(t)
	mockBoardDatabase.EXPECT().UpdateBoardTimer(DatabaseBoardTimerUpdate{ID: boardID, TimerStart: &timerStart, TimerEnd: &timerEnd}).
		Return(DatabaseBoard{ID: boardID, TimerEnd: &timerEnd}, nil)

	sessionsMock := sessions.NewMockSessionService(t)
	sessionRequestMock := sessionrequests.NewMockSessionRequestService(t)
	columnMock := columns.NewMockColumnService(t)
	noteMock := notes.NewMockNotesService(t)
	reactionMock := reactions.NewMockReactionService(t)
	votingMock := votings.NewMockVotingService(t)

	mockBroker := realtime.NewMockClient(t)
	mockBroker.EXPECT().Publish(mock.AnythingOfType("string"), mock.Anything).Return(nil)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockClock := timeprovider.NewMockTimeProvider(t)
	mockClock.EXPECT().Now().Return(timerStart)

	service := NewBoardService(mockBoardDatabase, broker, sessionRequestMock, sessionsMock, columnMock, noteMock, reactionMock, votingMock, mockClock)
	result, err := service.SetTimer(context.Background(), boardID, 5)

	require.NoError(t, err)
	require.NotNil(t, result)
	assert.Equal(t, boardID, result.ID)
}

func TestDeleteTimer(t *testing.T) {
	boardID := uuid.New()

	mockBoardDatabase := NewMockBoardDatabase(t)
	mockBoardDatabase.EXPECT().UpdateBoardTimer(DatabaseBoardTimerUpdate{ID: boardID, TimerStart: nil, TimerEnd: nil}).
		Return(DatabaseBoard{ID: boardID}, nil)

	sessionsMock := sessions.NewMockSessionService(t)
	sessionRequestMock := sessionrequests.NewMockSessionRequestService(t)
	columnMock := columns.NewMockColumnService(t)
	noteMock := notes.NewMockNotesService(t)
	reactionMock := reactions.NewMockReactionService(t)
	votingMock := votings.NewMockVotingService(t)

	mockBroker := realtime.NewMockClient(t)
	mockBroker.EXPECT().Publish(mock.AnythingOfType("string"), mock.Anything).Return(nil)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockClock := timeprovider.NewMockTimeProvider(t)

	service := NewBoardService(mockBoardDatabase, broker, sessionRequestMock, sessionsMock, columnMock, noteMock, reactionMock, votingMock, mockClock)
	result, err := service.DeleteTimer(context.Background(), boardID)

	require.NoError(t, err)
	assert.Equal(t, boardID, result.ID)
	assert.Equal(t, (*time.Time)(nil), result.TimerStart)
	assert.Equal(t, (*time.Time)(nil), result.TimerEnd)
}

func TestIncrementTimer(t *testing.T) {
	boardID := uuid.New()
	now := time.Now().Local()
	updatedTimer := now.Add(time.Duration(1) * time.Minute)
	updatedTimerEnd := updatedTimer.Add(time.Minute * time.Duration(1))

	mockBoardDatabase := NewMockBoardDatabase(t)
	mockBoardDatabase.EXPECT().GetBoard(boardID).
		Return(DatabaseBoard{ID: boardID, TimerStart: &now, TimerEnd: &updatedTimer}, nil)
	mockBoardDatabase.EXPECT().UpdateBoardTimer(DatabaseBoardTimerUpdate{ID: boardID, TimerStart: &now, TimerEnd: &updatedTimerEnd}).
		Return(DatabaseBoard{ID: boardID, TimerStart: &updatedTimer, TimerEnd: &updatedTimerEnd}, nil)

	sessionsMock := sessions.NewMockSessionService(t)
	sessionRequestMock := sessionrequests.NewMockSessionRequestService(t)
	columnMock := columns.NewMockColumnService(t)
	noteMock := notes.NewMockNotesService(t)
	reactionMock := reactions.NewMockReactionService(t)
	votingMock := votings.NewMockVotingService(t)

	mockBroker := realtime.NewMockClient(t)
	mockBroker.EXPECT().Publish(mock.AnythingOfType("string"), mock.Anything).Return(nil)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockClock := timeprovider.NewMockTimeProvider(t)
	mockClock.EXPECT().Now().Return(now)

	service := NewBoardService(mockBoardDatabase, broker, sessionRequestMock, sessionsMock, columnMock, noteMock, reactionMock, votingMock, mockClock)
	result, err := service.IncrementTimer(context.Background(), boardID)

	require.NoError(t, err)
	assert.Equal(t, boardID, result.ID)
	assert.Equal(t, updatedTimerEnd, *result.TimerEnd)
}
