package boards

import (
	"context"
	"errors"
	"fmt"
	"testing"
	"time"

	"scrumlr.io/server/common"
	"scrumlr.io/server/hash"
	"scrumlr.io/server/sessions"

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
	mockBoardDatabase.EXPECT().GetBoard(mock.Anything, boardID).Return(DatabaseBoard{ID: boardID}, nil)

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
	mockHash := hash.NewMockHash(t)

	service := NewBoardService(mockBoardDatabase, broker, sessionRequestMock, sessionsMock, columnMock, noteMock, reactionMock, votingMock, mockClock, mockHash)
	result, err := service.Get(context.Background(), boardID)

	require.NoError(t, err)
	require.NotNil(t, result)
	assert.Equal(t, boardID, result.ID)
}

func TestGet_DatabaseError(t *testing.T) {
	boardID := uuid.New()
	dbError := errors.New("database error")

	mockBoardDatabase := NewMockBoardDatabase(t)
	mockBoardDatabase.EXPECT().GetBoard(mock.Anything, boardID).
		Return(DatabaseBoard{}, dbError)

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
	mockHash := hash.NewMockHash(t)

	service := NewBoardService(mockBoardDatabase, broker, sessionRequestMock, sessionsMock, columnMock, noteMock, reactionMock, votingMock, mockClock, mockHash)
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
	accessPolicy := Public
	index := 0

	columnName := "Test Column"
	columnDescription := "Test Column Description"

	mockBoardDatabase := NewMockBoardDatabase(t)
	mockBoardDatabase.EXPECT().CreateBoard(mock.Anything, DatabaseBoardInsert{Name: &boardName, Description: &boardDescription, AccessPolicy: accessPolicy}).
		Return(DatabaseBoard{ID: boardID, Name: &boardName, Description: &boardDescription, AccessPolicy: accessPolicy}, nil)

	columnMock := columns.NewMockColumnService(t)
	columnMock.EXPECT().Create(mock.Anything,
		columns.ColumnRequest{
			Board:       boardID,
			Name:        columnName,
			Description: columnDescription,
			Color:       columns.ColorGoalGreen,
			Visible:     nil,
			Index:       &index,
			User:        userID,
		}).
		Return(&columns.Column{ID: uuid.New(), Name: columnName, Description: columnDescription, Color: columns.ColorGoalGreen, Visible: false, Index: index}, nil)

	sessionsMock := sessions.NewMockSessionService(t)
	sessionsMock.EXPECT().Create(mock.Anything, sessions.BoardSessionCreateRequest{Board: boardID, User: userID, Role: common.OwnerRole}).
		Return(&sessions.BoardSession{UserID: userID, Board: boardID, Role: common.OwnerRole}, nil)

	sessionRequestMock := sessionrequests.NewMockSessionRequestService(t)
	noteMock := notes.NewMockNotesService(t)
	reactionMock := reactions.NewMockReactionService(t)
	votingMock := votings.NewMockVotingService(t)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockClock := timeprovider.NewMockTimeProvider(t)
	mockHash := hash.NewMockHash(t)

	service := NewBoardService(mockBoardDatabase, broker, sessionRequestMock, sessionsMock, columnMock, noteMock, reactionMock, votingMock, mockClock, mockHash)
	board, err := service.Create(context.Background(),
		CreateBoardRequest{
			Name:         &boardName,
			Description:  &boardDescription,
			Owner:        userID,
			AccessPolicy: accessPolicy,
			Columns: []columns.ColumnRequest{
				{
					Board:       boardID,
					Name:        columnName,
					Description: columnDescription,
					Color:       columns.ColorGoalGreen,
					Visible:     nil,
					Index:       &index,
					User:        userID,
				},
			}})

	assert.Nil(t, err)
	assert.Equal(t, boardID, board.ID)
	assert.Equal(t, boardName, *board.Name)
	assert.Equal(t, boardDescription, *board.Description)
	assert.Equal(t, accessPolicy, board.AccessPolicy)
	assert.Nil(t, board.Passphrase)
	assert.Nil(t, board.Salt)
}

func TestCreate_ByPassphrase(t *testing.T) {
	boardID := uuid.New()
	userID := uuid.New()
	boardName := "Test Board"
	boardDescription := "A test board"
	accessPolicy := ByPassphrase
	passPhrase := "SuperStrongPassword"
	salt := "Salt"
	index := 0

	columnName := "Test Column"
	columnDescription := "Test Column Description"

	mockBoardDatabase := NewMockBoardDatabase(t)
	mockBoardDatabase.EXPECT().CreateBoard(mock.Anything, DatabaseBoardInsert{Name: &boardName, Description: &boardDescription, AccessPolicy: accessPolicy, Passphrase: &passPhrase, Salt: &salt}).
		Return(DatabaseBoard{ID: boardID, Name: &boardName, Description: &boardDescription, AccessPolicy: accessPolicy, Passphrase: &passPhrase, Salt: &salt}, nil)

	columnMock := columns.NewMockColumnService(t)
	columnMock.EXPECT().Create(mock.Anything,
		columns.ColumnRequest{
			Board:       boardID,
			Name:        columnName,
			Description: columnDescription,
			Color:       columns.ColorGoalGreen,
			Visible:     nil,
			Index:       &index,
			User:        userID,
		}).
		Return(&columns.Column{ID: uuid.New(), Name: columnName, Description: columnDescription, Color: columns.ColorGoalGreen, Visible: false, Index: index}, nil)

	sessionsMock := sessions.NewMockSessionService(t)
	sessionsMock.EXPECT().Create(mock.Anything, sessions.BoardSessionCreateRequest{Board: boardID, User: userID, Role: common.OwnerRole}).
		Return(&sessions.BoardSession{UserID: userID, Board: boardID, Role: common.OwnerRole}, nil)

	sessionRequestMock := sessionrequests.NewMockSessionRequestService(t)
	noteMock := notes.NewMockNotesService(t)
	reactionMock := reactions.NewMockReactionService(t)
	votingMock := votings.NewMockVotingService(t)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockClock := timeprovider.NewMockTimeProvider(t)
	mockHash := hash.NewMockHash(t)
	mockHash.EXPECT().HashWithSalt(passPhrase).Return(&passPhrase, &salt, nil)

	service := NewBoardService(mockBoardDatabase, broker, sessionRequestMock, sessionsMock, columnMock, noteMock, reactionMock, votingMock, mockClock, mockHash)
	board, err := service.Create(context.Background(),
		CreateBoardRequest{
			Name:         &boardName,
			Description:  &boardDescription,
			Owner:        userID,
			AccessPolicy: accessPolicy,
			Passphrase:   &passPhrase,
			Columns: []columns.ColumnRequest{
				{
					Board:       boardID,
					Name:        columnName,
					Description: columnDescription,
					Color:       columns.ColorGoalGreen,
					Visible:     nil,
					Index:       &index,
					User:        userID,
				},
			}})

	assert.Nil(t, err)
	assert.Equal(t, boardID, board.ID)
	assert.Equal(t, boardName, *board.Name)
	assert.Equal(t, boardDescription, *board.Description)
	assert.Equal(t, accessPolicy, board.AccessPolicy)
	assert.Equal(t, passPhrase, *board.Passphrase)
	assert.Equal(t, salt, *board.Salt)
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
	mockHash := hash.NewMockHash(t)

	service := NewBoardService(mockBoardDatabase, broker, sessionRequestMock, sessionsMock, columnMock, noteMock, reactionMock, votingMock, mockClock, mockHash)
	result, err := service.Create(context.Background(),
		CreateBoardRequest{
			Name:         &boardName,
			Description:  &boardDescription,
			Owner:        userID,
			AccessPolicy: ByPassphrase,
			Columns:      nil,
			Passphrase:   nil,
		},
	)

	require.Error(t, err)
	assert.Nil(t, result)
	assert.Equal(t, common.BadRequestError(errors.New("passphrase must be set on access policy 'BY_PASSPHRASE'")), err)
}

func TestDelete(t *testing.T) {
	boardID := uuid.New()

	mockBoardDatabase := NewMockBoardDatabase(t)
	mockBoardDatabase.EXPECT().DeleteBoard(mock.Anything, boardID).Return(nil)

	sessionsMock := sessions.NewMockSessionService(t)
	sessionRequestMock := sessionrequests.NewMockSessionRequestService(t)
	columnMock := columns.NewMockColumnService(t)
	noteMock := notes.NewMockNotesService(t)
	reactionMock := reactions.NewMockReactionService(t)
	votingMock := votings.NewMockVotingService(t)

	mockBroker := realtime.NewMockClient(t)
	expectedTopic := fmt.Sprintf("board.%s", boardID)
	expectedEvent := realtime.BoardEvent{Type: realtime.BoardEventBoardDeleted}
	mockBroker.EXPECT().Publish(mock.Anything, expectedTopic, expectedEvent).Return(nil)

	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockClock := timeprovider.NewMockTimeProvider(t)
	mockHash := hash.NewMockHash(t)

	service := NewBoardService(mockBoardDatabase, broker, sessionRequestMock, sessionsMock, columnMock, noteMock, reactionMock, votingMock, mockClock, mockHash)
	err := service.Delete(context.Background(), boardID)

	require.NoError(t, err)
}

func TestUpdate(t *testing.T) {
	boardID := uuid.New()
	updatedName := "Updated Board Name"

	mockBoardDatabase := NewMockBoardDatabase(t)
	mockBoardDatabase.EXPECT().UpdateBoard(mock.Anything, DatabaseBoardUpdate{ID: boardID, Name: &updatedName}).
		Return(DatabaseBoard{ID: boardID, Name: &updatedName}, nil)

	sessionsMock := sessions.NewMockSessionService(t)
	sessionRequestMock := sessionrequests.NewMockSessionRequestService(t)
	reactionMock := reactions.NewMockReactionService(t)
	votingMock := votings.NewMockVotingService(t)

	columnMock := columns.NewMockColumnService(t)
	columnMock.EXPECT().GetAll(mock.Anything, boardID).
		Return([]*columns.Column{}, nil)

	noteMock := notes.NewMockNotesService(t)
	noteMock.EXPECT().GetAll(mock.Anything, boardID).
		Return([]*notes.Note{}, nil)

	mockBroker := realtime.NewMockClient(t)
	mockBroker.EXPECT().Publish(mock.Anything, mock.AnythingOfType("string"), mock.Anything).Return(nil)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockClock := timeprovider.NewMockTimeProvider(t)
	mockHash := hash.NewMockHash(t)

	service := NewBoardService(mockBoardDatabase, broker, sessionRequestMock, sessionsMock, columnMock, noteMock, reactionMock, votingMock, mockClock, mockHash)
	board, err := service.Update(context.Background(), BoardUpdateRequest{ID: boardID, Name: &updatedName})

	assert.Nil(t, err)
	assert.Equal(t, boardID, board.ID)
	assert.Equal(t, updatedName, *board.Name)
}

func TestUpdate_EmptyName(t *testing.T) {
	boardID := uuid.New()
	updatedName := ""

	mockBoardDatabase := NewMockBoardDatabase(t)

	sessionsMock := sessions.NewMockSessionService(t)
	sessionRequestMock := sessionrequests.NewMockSessionRequestService(t)
	reactionMock := reactions.NewMockReactionService(t)
	votingMock := votings.NewMockVotingService(t)
	columnMock := columns.NewMockColumnService(t)
	noteMock := notes.NewMockNotesService(t)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockClock := timeprovider.NewMockTimeProvider(t)
	mockHash := hash.NewMockHash(t)

	service := NewBoardService(mockBoardDatabase, broker, sessionRequestMock, sessionsMock, columnMock, noteMock, reactionMock, votingMock, mockClock, mockHash)
	board, err := service.Update(context.Background(), BoardUpdateRequest{ID: boardID, Name: &updatedName})

	assert.Nil(t, board)
	assert.NotNil(t, err)
	assert.Equal(t, common.BadRequestError(errors.New("name cannot be empty")), err)
}

func TestUpdate_ToPassphrase(t *testing.T) {
	boardID := uuid.New()
	updatedName := "Updated Board Name"
	accessPolicy := ByPassphrase
	passphrase := "SuperStrongPassword"
	salt := "ThisIsTheSalt"

	mockBoardDatabase := NewMockBoardDatabase(t)
	mockBoardDatabase.EXPECT().UpdateBoard(mock.Anything, DatabaseBoardUpdate{ID: boardID, Name: &updatedName, AccessPolicy: &accessPolicy, Passphrase: &passphrase, Salt: &salt}).
		Return(DatabaseBoard{ID: boardID, Name: &updatedName, AccessPolicy: accessPolicy, Passphrase: &passphrase, Salt: &salt}, nil)

	sessionsMock := sessions.NewMockSessionService(t)
	sessionRequestMock := sessionrequests.NewMockSessionRequestService(t)
	reactionMock := reactions.NewMockReactionService(t)
	votingMock := votings.NewMockVotingService(t)

	columnMock := columns.NewMockColumnService(t)
	columnMock.EXPECT().GetAll(mock.Anything, boardID).
		Return([]*columns.Column{}, nil)

	noteMock := notes.NewMockNotesService(t)
	noteMock.EXPECT().GetAll(mock.Anything, boardID).
		Return([]*notes.Note{}, nil)

	mockBroker := realtime.NewMockClient(t)
	mockBroker.EXPECT().Publish(mock.Anything, mock.AnythingOfType("string"), mock.Anything).Return(nil)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockClock := timeprovider.NewMockTimeProvider(t)
	mockHash := hash.NewMockHash(t)
	mockHash.EXPECT().HashWithSalt(passphrase).Return(&passphrase, &salt, nil)

	service := NewBoardService(mockBoardDatabase, broker, sessionRequestMock, sessionsMock, columnMock, noteMock, reactionMock, votingMock, mockClock, mockHash)
	board, err := service.Update(context.Background(), BoardUpdateRequest{ID: boardID, Name: &updatedName, AccessPolicy: &accessPolicy, Passphrase: &passphrase})

	assert.Nil(t, err)
	assert.Equal(t, boardID, board.ID)
	assert.Equal(t, updatedName, *board.Name)
	assert.Equal(t, passphrase, *board.Passphrase)
	assert.Equal(t, salt, *board.Salt)
	assert.Equal(t, accessPolicy, board.AccessPolicy)
}

func TestUpdate_ToPassphrase_WithoutPassphrase(t *testing.T) {
	boardID := uuid.New()
	updatedName := "Updated Board Name"
	accessPolicy := ByPassphrase

	mockBoardDatabase := NewMockBoardDatabase(t)

	sessionsMock := sessions.NewMockSessionService(t)
	sessionRequestMock := sessionrequests.NewMockSessionRequestService(t)
	reactionMock := reactions.NewMockReactionService(t)
	votingMock := votings.NewMockVotingService(t)
	columnMock := columns.NewMockColumnService(t)
	noteMock := notes.NewMockNotesService(t)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockClock := timeprovider.NewMockTimeProvider(t)
	mockHash := hash.NewMockHash(t)

	service := NewBoardService(mockBoardDatabase, broker, sessionRequestMock, sessionsMock, columnMock, noteMock, reactionMock, votingMock, mockClock, mockHash)
	board, err := service.Update(context.Background(), BoardUpdateRequest{ID: boardID, Name: &updatedName, AccessPolicy: &accessPolicy})

	assert.Nil(t, board)
	assert.NotNil(t, err)
	assert.Equal(t, common.BadRequestError(errors.New("passphrase must be set if policy 'BY_PASSPHRASE' is selected")), err)
}

func TestUpdate_ToPublic(t *testing.T) {
	boardID := uuid.New()
	updatedName := "Updated Board Name"
	accessPolicy := Public

	mockBoardDatabase := NewMockBoardDatabase(t)
	mockBoardDatabase.EXPECT().UpdateBoard(mock.Anything, DatabaseBoardUpdate{ID: boardID, Name: &updatedName, AccessPolicy: &accessPolicy}).
		Return(DatabaseBoard{ID: boardID, Name: &updatedName, AccessPolicy: accessPolicy}, nil)

	sessionsMock := sessions.NewMockSessionService(t)
	sessionRequestMock := sessionrequests.NewMockSessionRequestService(t)
	reactionMock := reactions.NewMockReactionService(t)
	votingMock := votings.NewMockVotingService(t)

	columnMock := columns.NewMockColumnService(t)
	columnMock.EXPECT().GetAll(mock.Anything, boardID).
		Return([]*columns.Column{}, nil)

	noteMock := notes.NewMockNotesService(t)
	noteMock.EXPECT().GetAll(mock.Anything, boardID).
		Return([]*notes.Note{}, nil)

	mockBroker := realtime.NewMockClient(t)
	mockBroker.EXPECT().Publish(mock.Anything, mock.AnythingOfType("string"), mock.Anything).Return(nil)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockClock := timeprovider.NewMockTimeProvider(t)
	mockHash := hash.NewMockHash(t)

	service := NewBoardService(mockBoardDatabase, broker, sessionRequestMock, sessionsMock, columnMock, noteMock, reactionMock, votingMock, mockClock, mockHash)
	board, err := service.Update(context.Background(), BoardUpdateRequest{ID: boardID, Name: &updatedName, AccessPolicy: &accessPolicy})

	assert.Nil(t, err)
	assert.Equal(t, boardID, board.ID)
	assert.Equal(t, updatedName, *board.Name)
	assert.Equal(t, accessPolicy, board.AccessPolicy)
}

func TestUpdate_ToPublic_WithPassphrase(t *testing.T) {
	boardID := uuid.New()
	updatedName := "Updated Board Name"
	accessPolicy := Public
	passphrase := "SuperStrongPassword"

	mockBoardDatabase := NewMockBoardDatabase(t)

	sessionsMock := sessions.NewMockSessionService(t)
	sessionRequestMock := sessionrequests.NewMockSessionRequestService(t)
	reactionMock := reactions.NewMockReactionService(t)
	votingMock := votings.NewMockVotingService(t)
	columnMock := columns.NewMockColumnService(t)
	noteMock := notes.NewMockNotesService(t)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockClock := timeprovider.NewMockTimeProvider(t)
	mockHash := hash.NewMockHash(t)

	service := NewBoardService(mockBoardDatabase, broker, sessionRequestMock, sessionsMock, columnMock, noteMock, reactionMock, votingMock, mockClock, mockHash)
	board, err := service.Update(context.Background(), BoardUpdateRequest{ID: boardID, Name: &updatedName, AccessPolicy: &accessPolicy, Passphrase: &passphrase})

	assert.Nil(t, board)
	assert.NotNil(t, err)
	assert.Equal(t, common.BadRequestError(errors.New("passphrase should not be set for policies except 'BY_PASSPHRASE'")), err)
}

func TestUpdate_ToInvite(t *testing.T) {
	boardID := uuid.New()
	updatedName := "Updated Board Name"
	accessPolicy := ByInvite

	mockBoardDatabase := NewMockBoardDatabase(t)
	mockBoardDatabase.EXPECT().UpdateBoard(mock.Anything, DatabaseBoardUpdate{ID: boardID, Name: &updatedName, AccessPolicy: &accessPolicy}).
		Return(DatabaseBoard{ID: boardID, Name: &updatedName, AccessPolicy: accessPolicy}, nil)

	sessionsMock := sessions.NewMockSessionService(t)
	sessionRequestMock := sessionrequests.NewMockSessionRequestService(t)
	reactionMock := reactions.NewMockReactionService(t)
	votingMock := votings.NewMockVotingService(t)

	columnMock := columns.NewMockColumnService(t)
	columnMock.EXPECT().GetAll(mock.Anything, boardID).
		Return([]*columns.Column{}, nil)

	noteMock := notes.NewMockNotesService(t)
	noteMock.EXPECT().GetAll(mock.Anything, boardID).
		Return([]*notes.Note{}, nil)

	mockBroker := realtime.NewMockClient(t)
	mockBroker.EXPECT().Publish(mock.Anything, mock.AnythingOfType("string"), mock.Anything).Return(nil)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockClock := timeprovider.NewMockTimeProvider(t)
	mockHash := hash.NewMockHash(t)

	service := NewBoardService(mockBoardDatabase, broker, sessionRequestMock, sessionsMock, columnMock, noteMock, reactionMock, votingMock, mockClock, mockHash)
	board, err := service.Update(context.Background(), BoardUpdateRequest{ID: boardID, Name: &updatedName, AccessPolicy: &accessPolicy})

	assert.Nil(t, err)
	assert.Equal(t, boardID, board.ID)
	assert.Equal(t, updatedName, *board.Name)
	assert.Equal(t, accessPolicy, board.AccessPolicy)
}

func TestUpdate_ToInvite_WithPassphrase(t *testing.T) {
	boardID := uuid.New()
	updatedName := "Updated Board Name"
	accessPolicy := ByInvite
	passphrase := "SuperStrongPassword"

	mockBoardDatabase := NewMockBoardDatabase(t)

	sessionsMock := sessions.NewMockSessionService(t)
	sessionRequestMock := sessionrequests.NewMockSessionRequestService(t)
	reactionMock := reactions.NewMockReactionService(t)
	votingMock := votings.NewMockVotingService(t)
	columnMock := columns.NewMockColumnService(t)
	noteMock := notes.NewMockNotesService(t)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockClock := timeprovider.NewMockTimeProvider(t)
	mockHash := hash.NewMockHash(t)

	service := NewBoardService(mockBoardDatabase, broker, sessionRequestMock, sessionsMock, columnMock, noteMock, reactionMock, votingMock, mockClock, mockHash)
	board, err := service.Update(context.Background(), BoardUpdateRequest{ID: boardID, Name: &updatedName, AccessPolicy: &accessPolicy, Passphrase: &passphrase})

	assert.Nil(t, board)
	assert.NotNil(t, err)
	assert.Equal(t, common.BadRequestError(errors.New("passphrase should not be set for policies except 'BY_PASSPHRASE'")), err)
}

func TestSetTimer(t *testing.T) {
	boardID := uuid.New()
	timerStart := time.Now().Local()
	timerEnd := timerStart.Add(time.Minute * time.Duration(5))

	mockBoardDatabase := NewMockBoardDatabase(t)
	mockBoardDatabase.EXPECT().UpdateBoardTimer(mock.Anything, DatabaseBoardTimerUpdate{ID: boardID, TimerStart: &timerStart, TimerEnd: &timerEnd}).
		Return(DatabaseBoard{ID: boardID, TimerEnd: &timerEnd}, nil)

	sessionsMock := sessions.NewMockSessionService(t)
	sessionRequestMock := sessionrequests.NewMockSessionRequestService(t)
	columnMock := columns.NewMockColumnService(t)
	noteMock := notes.NewMockNotesService(t)
	reactionMock := reactions.NewMockReactionService(t)
	votingMock := votings.NewMockVotingService(t)

	mockBroker := realtime.NewMockClient(t)
	mockBroker.EXPECT().Publish(mock.Anything, mock.AnythingOfType("string"), mock.Anything).Return(nil)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockClock := timeprovider.NewMockTimeProvider(t)
	mockClock.EXPECT().Now().Return(timerStart)
	mockHash := hash.NewMockHash(t)

	service := NewBoardService(mockBoardDatabase, broker, sessionRequestMock, sessionsMock, columnMock, noteMock, reactionMock, votingMock, mockClock, mockHash)
	result, err := service.SetTimer(context.Background(), boardID, 5)

	require.NoError(t, err)
	require.NotNil(t, result)
	assert.Equal(t, boardID, result.ID)
}

func TestDeleteTimer(t *testing.T) {
	boardID := uuid.New()

	mockBoardDatabase := NewMockBoardDatabase(t)
	mockBoardDatabase.EXPECT().UpdateBoardTimer(mock.Anything, DatabaseBoardTimerUpdate{ID: boardID, TimerStart: nil, TimerEnd: nil}).
		Return(DatabaseBoard{ID: boardID}, nil)

	sessionsMock := sessions.NewMockSessionService(t)
	sessionRequestMock := sessionrequests.NewMockSessionRequestService(t)
	columnMock := columns.NewMockColumnService(t)
	noteMock := notes.NewMockNotesService(t)
	reactionMock := reactions.NewMockReactionService(t)
	votingMock := votings.NewMockVotingService(t)

	mockBroker := realtime.NewMockClient(t)
	mockBroker.EXPECT().Publish(mock.Anything, mock.AnythingOfType("string"), mock.Anything).Return(nil)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockClock := timeprovider.NewMockTimeProvider(t)
	mockHash := hash.NewMockHash(t)

	service := NewBoardService(mockBoardDatabase, broker, sessionRequestMock, sessionsMock, columnMock, noteMock, reactionMock, votingMock, mockClock, mockHash)
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
	mockBoardDatabase.EXPECT().GetBoard(mock.Anything, boardID).
		Return(DatabaseBoard{ID: boardID, TimerStart: &now, TimerEnd: &updatedTimer}, nil)
	mockBoardDatabase.EXPECT().UpdateBoardTimer(mock.Anything, DatabaseBoardTimerUpdate{ID: boardID, TimerStart: &now, TimerEnd: &updatedTimerEnd}).
		Return(DatabaseBoard{ID: boardID, TimerStart: &updatedTimer, TimerEnd: &updatedTimerEnd}, nil)

	sessionsMock := sessions.NewMockSessionService(t)
	sessionRequestMock := sessionrequests.NewMockSessionRequestService(t)
	columnMock := columns.NewMockColumnService(t)
	noteMock := notes.NewMockNotesService(t)
	reactionMock := reactions.NewMockReactionService(t)
	votingMock := votings.NewMockVotingService(t)

	mockBroker := realtime.NewMockClient(t)
	mockBroker.EXPECT().Publish(mock.Anything, mock.AnythingOfType("string"), mock.Anything).Return(nil)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockClock := timeprovider.NewMockTimeProvider(t)
	mockClock.EXPECT().Now().Return(now)
	mockHash := hash.NewMockHash(t)

	service := NewBoardService(mockBoardDatabase, broker, sessionRequestMock, sessionsMock, columnMock, noteMock, reactionMock, votingMock, mockClock, mockHash)
	result, err := service.IncrementTimer(context.Background(), boardID)

	require.NoError(t, err)
	assert.Equal(t, boardID, result.ID)
	assert.Equal(t, updatedTimerEnd, *result.TimerEnd)
}

func TestDelete_BroadcastsCorrectEvent(t *testing.T) {
	boardID := uuid.New()

	mockBoardDatabase := NewMockBoardDatabase(t)
	mockBoardDatabase.EXPECT().DeleteBoard(mock.Anything, boardID).Return(nil)

	sessionsMock := sessions.NewMockSessionService(t)
	sessionRequestMock := sessionrequests.NewMockSessionRequestService(t)
	columnMock := columns.NewMockColumnService(t)
	noteMock := notes.NewMockNotesService(t)
	reactionMock := reactions.NewMockReactionService(t)
	votingMock := votings.NewMockVotingService(t)

	mockBroker := realtime.NewMockClient(t)

	// Verify the exact event that's broadcasted
	expectedTopic := fmt.Sprintf("board.%s", boardID)
	expectedEvent := realtime.BoardEvent{
		Type: realtime.BoardEventBoardDeleted,
		Data: nil, // Board deletion event has no data
	}

	// Set up the expectation to capture the broadcast
	mockBroker.EXPECT().Publish(mock.Anything, expectedTopic, expectedEvent).Return(nil).Once()

	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockClock := timeprovider.NewMockTimeProvider(t)
	mockHash := hash.NewMockHash(t)

	service := NewBoardService(mockBoardDatabase, broker, sessionRequestMock, sessionsMock, columnMock, noteMock, reactionMock, votingMock, mockClock, mockHash)

	// Act
	err := service.Delete(context.Background(), boardID)

	// Assert
	require.NoError(t, err)

	// Verify that all expectations were met (including the Publish call)
	mockBroker.AssertExpectations(t)
}
