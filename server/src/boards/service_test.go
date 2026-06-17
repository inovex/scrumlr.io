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
	"scrumlr.io/server/users"

	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/suite"
	"scrumlr.io/server/columns"
	"scrumlr.io/server/notes"
	"scrumlr.io/server/reactions"
	"scrumlr.io/server/sessionrequests"
	"scrumlr.io/server/timeprovider"
	"scrumlr.io/server/votings"

	"github.com/google/uuid"
	"scrumlr.io/server/realtime"
)

type BoardServiceTestSuite struct {
	suite.Suite

	service            BoardService
	mockBoardDatabase  *MockBoardDatabase
	sessionsMock       *sessions.MockSessionService
	sessionRequestMock *sessionrequests.MockSessionRequestService
	columnMock         *columns.MockColumnService
	noteMock           *notes.MockNotesService
	reactionMock       *reactions.MockReactionService
	votingMock         *votings.MockVotingService
	userService        *users.MockUserService

	broker     *realtime.Broker
	mockBroker *realtime.MockClient
	mockClock  *timeprovider.MockTimeProvider
	mockHash   *hash.MockHash

	boardID   uuid.UUID
	userID    uuid.UUID
	updatedAt time.Time

	boardName        string
	boardDescription string
	columnName       string
	columnColor      common.Color
}

func TestNotesServiceTestSuite(t *testing.T) {
	suite.Run(t, new(BoardServiceTestSuite))
}

func (suite *BoardServiceTestSuite) SetupTest() {
	suite.mockBoardDatabase = NewMockBoardDatabase(suite.T())
	suite.sessionsMock = sessions.NewMockSessionService(suite.T())
	suite.sessionRequestMock = sessionrequests.NewMockSessionRequestService(suite.T())
	suite.columnMock = columns.NewMockColumnService(suite.T())
	suite.noteMock = notes.NewMockNotesService(suite.T())
	suite.reactionMock = reactions.NewMockReactionService(suite.T())
	suite.votingMock = votings.NewMockVotingService(suite.T())
	suite.userService = users.NewMockUserService(suite.T())

	suite.mockBroker = realtime.NewMockClient(suite.T())
	suite.broker = new(realtime.Broker)
	suite.broker.Con = suite.mockBroker

	suite.mockClock = timeprovider.NewMockTimeProvider(suite.T())
	suite.mockHash = hash.NewMockHash(suite.T())

	suite.service = NewBoardService(suite.mockBoardDatabase, suite.broker, suite.sessionRequestMock, suite.sessionsMock, suite.columnMock, suite.noteMock, suite.reactionMock, suite.votingMock, suite.userService, suite.mockClock, suite.mockHash)

	suite.boardID = uuid.New()
	suite.userID = uuid.New()
	suite.updatedAt = time.Date(2026, 3, 17, 12, 0, 0, 0, time.UTC)

	suite.boardName = "Test Board"
	suite.boardDescription = "A test board"
	suite.columnName = "Test Column"
	suite.columnColor = common.ColorGoalGreen
}

func (suite *BoardServiceTestSuite) TestGet() {

	suite.mockBoardDatabase.EXPECT().GetBoard(mock.Anything, suite.boardID).Return(DatabaseBoard{ID: suite.boardID}, nil)

	result, err := suite.service.Get(context.Background(), suite.boardID)

	suite.NoError(err)
	suite.NotNil(result)
	suite.Equal(suite.boardID, result.ID)
}

func (suite *BoardServiceTestSuite) TestGet_DatabaseError() {
	dbError := errors.New("database error")

	suite.mockBoardDatabase.EXPECT().GetBoard(mock.Anything, suite.boardID).
		Return(DatabaseBoard{}, dbError)

	result, err := suite.service.Get(context.Background(), suite.boardID)

	suite.Error(err)
	suite.Nil(result)
	suite.Equal(dbError, err)
}

func (suite *BoardServiceTestSuite) TestCreate() {
	accessPolicy := Public
	index := 0
	columnDescription := "Test Column Description"

	suite.mockBoardDatabase.EXPECT().CreateBoard(mock.Anything, DatabaseBoardInsert{Name: &suite.boardName, Description: &suite.boardDescription, AccessPolicy: accessPolicy}).
		Return(DatabaseBoard{ID: suite.boardID, Name: &suite.boardName, Description: &suite.boardDescription, AccessPolicy: accessPolicy}, nil)

	suite.columnMock.EXPECT().Create(mock.Anything,
		columns.ColumnRequest{
			Board:       suite.boardID,
			Name:        suite.columnName,
			Description: columnDescription,
			Color:       common.ColorGoalGreen,
			Visible:     nil,
			Index:       &index,
			User:        suite.userID,
		}).
		Return(&columns.Column{ID: uuid.New(), Name: suite.columnName, Description: columnDescription, Color: common.ColorGoalGreen, Visible: false, Index: index}, nil)

	suite.sessionsMock.EXPECT().Create(mock.Anything, sessions.BoardSessionCreateRequest{Board: suite.boardID, User: suite.userID, Role: common.OwnerRole}).
		Return(&sessions.BoardSession{UserID: suite.userID, Board: suite.boardID, Role: common.OwnerRole}, nil)

	board, err := suite.service.Create(context.Background(),
		CreateBoardRequest{
			Name:         &suite.boardName,
			Description:  &suite.boardDescription,
			Owner:        suite.userID,
			AccessPolicy: accessPolicy,
			Columns: []columns.ColumnRequest{
				{
					Board:       suite.boardID,
					Name:        suite.columnName,
					Description: columnDescription,
					Color:       common.ColorGoalGreen,
					Visible:     nil,
					Index:       &index,
					User:        suite.userID,
				},
			}})

	suite.Nil(err)
	suite.Equal(suite.boardID, board.ID)
	suite.Equal(suite.boardName, *board.Name)
	suite.Equal(suite.boardDescription, *board.Description)
	suite.Equal(accessPolicy, board.AccessPolicy)
	suite.Nil(board.Passphrase)
	suite.Nil(board.Salt)
}

func (suite *BoardServiceTestSuite) TestCreate_ByPassphrase() {
	accessPolicy := ByPassphrase
	passPhrase := "SuperStrongPassword"
	salt := "Salt"
	index := 0
	columnDescription := "Test Column Description"

	suite.mockBoardDatabase.EXPECT().CreateBoard(mock.Anything, DatabaseBoardInsert{Name: &suite.boardName, Description: &suite.boardDescription, AccessPolicy: accessPolicy, Passphrase: &passPhrase, Salt: &salt}).
		Return(DatabaseBoard{ID: suite.boardID, Name: &suite.boardName, Description: &suite.boardDescription, AccessPolicy: accessPolicy, Passphrase: &passPhrase, Salt: &salt}, nil)

	suite.columnMock.EXPECT().Create(mock.Anything,
		columns.ColumnRequest{
			Board:       suite.boardID,
			Name:        suite.columnName,
			Description: columnDescription,
			Color:       common.ColorGoalGreen,
			Visible:     nil,
			Index:       &index,
			User:        suite.userID,
		}).
		Return(&columns.Column{ID: uuid.New(), Name: suite.columnName, Description: columnDescription, Color: common.ColorGoalGreen, Visible: false, Index: index}, nil)

	suite.sessionsMock.EXPECT().Create(mock.Anything, sessions.BoardSessionCreateRequest{Board: suite.boardID, User: suite.userID, Role: common.OwnerRole}).
		Return(&sessions.BoardSession{UserID: suite.userID, Board: suite.boardID, Role: common.OwnerRole}, nil)

	suite.mockHash.EXPECT().HashWithSalt(passPhrase).Return(&passPhrase, &salt, nil)

	board, err := suite.service.Create(context.Background(),
		CreateBoardRequest{
			Name:         &suite.boardName,
			Description:  &suite.boardDescription,
			Owner:        suite.userID,
			AccessPolicy: accessPolicy,
			Passphrase:   &passPhrase,
			Columns: []columns.ColumnRequest{
				{
					Board:       suite.boardID,
					Name:        suite.columnName,
					Description: columnDescription,
					Color:       common.ColorGoalGreen,
					Visible:     nil,
					Index:       &index,
					User:        suite.userID,
				},
			}})

	suite.Nil(err)
	suite.Equal(suite.boardID, board.ID)
	suite.Equal(suite.boardName, *board.Name)
	suite.Equal(suite.boardDescription, *board.Description)
	suite.Equal(accessPolicy, board.AccessPolicy)
	suite.Equal(passPhrase, *board.Passphrase)
	suite.Equal(salt, *board.Salt)
}

func (suite *BoardServiceTestSuite) TestCreate_ByPassphraseMissing() {

	result, err := suite.service.Create(context.Background(),
		CreateBoardRequest{
			Name:         new("Test Board"),
			Description:  new("A test board"),
			Owner:        suite.userID,
			AccessPolicy: ByPassphrase,
			Columns:      nil,
			Passphrase:   nil,
		},
	)

	suite.Error(err)
	suite.Nil(result)
	suite.Equal(common.BadRequestError(errors.New("passphrase must be set on access policy 'BY_PASSPHRASE'")), err)
}

func (suite *BoardServiceTestSuite) TestDelete() {

	suite.mockBoardDatabase.EXPECT().DeleteBoard(mock.Anything, suite.boardID).Return(nil)

	expectedTopic := fmt.Sprintf("board.%s", suite.boardID)
	expectedEvent := realtime.BoardEvent{Type: realtime.BoardEventBoardDeleted}
	suite.mockBroker.EXPECT().Publish(mock.Anything, expectedTopic, expectedEvent).Return(nil)

	err := suite.service.Delete(context.Background(), suite.boardID)

	suite.NoError(err)
}

func (suite *BoardServiceTestSuite) TestUpdate() {

	updatedName := "Updated Board Name"

	suite.mockBoardDatabase.EXPECT().UpdateBoard(mock.Anything, DatabaseBoardUpdate{ID: suite.boardID, Name: &updatedName}).
		Return(DatabaseBoard{ID: suite.boardID, Name: &updatedName}, nil)
	suite.mockBoardDatabase.EXPECT().UpdateBoard(mock.Anything, mock.MatchedBy(func(update DatabaseBoardUpdate) bool {
		return update.ID == suite.boardID && update.LastModifiedAt.Equal(suite.updatedAt)
	})).Return(DatabaseBoard{ID: suite.boardID}, nil)

	suite.columnMock.EXPECT().GetAll(mock.Anything, suite.boardID).
		Return([]*columns.Column{}, nil)

	suite.noteMock.EXPECT().GetAll(mock.Anything, suite.boardID).
		Return([]*notes.Note{}, nil)

	suite.mockBroker.EXPECT().Publish(mock.Anything, mock.AnythingOfType("string"), mock.Anything).Return(nil)
	suite.mockClock.EXPECT().Now().Return(suite.updatedAt)

	board, err := suite.service.Update(context.Background(), BoardUpdateRequest{ID: suite.boardID, Name: &updatedName})

	suite.Nil(err)
	suite.Equal(suite.boardID, board.ID)
	suite.Equal(updatedName, *board.Name)
}

func (suite *BoardServiceTestSuite) TestUpdate_EmptyName() {

	board, err := suite.service.Update(context.Background(), BoardUpdateRequest{ID: suite.boardID, Name: new("")})

	suite.Nil(board)
	suite.NotNil(err)
	suite.Equal(common.BadRequestError(errors.New("name cannot be empty")), err)
}

func (suite *BoardServiceTestSuite) TestUpdate_ToPassphrase() {

	updatedName := "Updated Board Name"
	accessPolicy := ByPassphrase
	passphrase := "SuperStrongPassword"
	salt := "ThisIsTheSalt"

	suite.mockBoardDatabase.EXPECT().UpdateBoard(mock.Anything, DatabaseBoardUpdate{ID: suite.boardID, Name: &updatedName, AccessPolicy: &accessPolicy, Passphrase: &passphrase, Salt: &salt}).
		Return(DatabaseBoard{ID: suite.boardID, Name: &updatedName, AccessPolicy: accessPolicy, Passphrase: &passphrase, Salt: &salt}, nil)
	suite.mockBoardDatabase.EXPECT().UpdateBoard(mock.Anything, mock.MatchedBy(func(update DatabaseBoardUpdate) bool {
		return update.ID == suite.boardID && update.LastModifiedAt.Equal(suite.updatedAt)
	})).Return(DatabaseBoard{ID: suite.boardID}, nil)

	suite.columnMock.EXPECT().GetAll(mock.Anything, suite.boardID).
		Return([]*columns.Column{}, nil)

	suite.noteMock.EXPECT().GetAll(mock.Anything, suite.boardID).
		Return([]*notes.Note{}, nil)

	suite.mockBroker.EXPECT().Publish(mock.Anything, mock.AnythingOfType("string"), mock.Anything).Return(nil)

	suite.mockClock.EXPECT().Now().Return(suite.updatedAt)
	suite.mockHash.EXPECT().HashWithSalt(passphrase).Return(&passphrase, &salt, nil)

	board, err := suite.service.Update(context.Background(), BoardUpdateRequest{ID: suite.boardID, Name: &updatedName, AccessPolicy: &accessPolicy, Passphrase: &passphrase})

	suite.Nil(err)
	suite.Equal(suite.boardID, board.ID)
	suite.Equal(updatedName, *board.Name)
	suite.Equal(passphrase, *board.Passphrase)
	suite.Equal(salt, *board.Salt)
	suite.Equal(accessPolicy, board.AccessPolicy)
}

func (suite *BoardServiceTestSuite) TestUpdate_ToPassphrase_WithoutPassphrase() {

	board, err := suite.service.Update(context.Background(), BoardUpdateRequest{ID: suite.boardID, Name: new("Updated Board Name"), AccessPolicy: new(ByPassphrase)})

	suite.Nil(board)
	suite.NotNil(err)
	suite.Equal(common.BadRequestError(errors.New("passphrase must be set if policy 'BY_PASSPHRASE' is selected")), err)
}

func (suite *BoardServiceTestSuite) TestUpdate_ToPublic() {

	updatedName := "Updated Board Name"
	accessPolicy := Public

	suite.mockBoardDatabase.EXPECT().UpdateBoard(mock.Anything, DatabaseBoardUpdate{ID: suite.boardID, Name: &updatedName, AccessPolicy: &accessPolicy}).
		Return(DatabaseBoard{ID: suite.boardID, Name: &updatedName, AccessPolicy: accessPolicy}, nil)
	suite.mockBoardDatabase.EXPECT().UpdateBoard(mock.Anything, mock.MatchedBy(func(update DatabaseBoardUpdate) bool {
		return update.ID == suite.boardID && update.LastModifiedAt.Equal(suite.updatedAt)
	})).Return(DatabaseBoard{ID: suite.boardID}, nil)

	suite.columnMock.EXPECT().GetAll(mock.Anything, suite.boardID).
		Return([]*columns.Column{}, nil)

	suite.noteMock.EXPECT().GetAll(mock.Anything, suite.boardID).
		Return([]*notes.Note{}, nil)

	suite.mockBroker.EXPECT().Publish(mock.Anything, mock.AnythingOfType("string"), mock.Anything).Return(nil)

	suite.mockClock.EXPECT().Now().Return(suite.updatedAt)

	board, err := suite.service.Update(context.Background(), BoardUpdateRequest{ID: suite.boardID, Name: &updatedName, AccessPolicy: &accessPolicy})

	suite.Nil(err)
	suite.Equal(suite.boardID, board.ID)
	suite.Equal(updatedName, *board.Name)
	suite.Equal(accessPolicy, board.AccessPolicy)
}

func (suite *BoardServiceTestSuite) TestUpdate_ToPublic_WithPassphrase() {

	board, err := suite.service.Update(context.Background(), BoardUpdateRequest{ID: suite.boardID, Name: new("Updated Board Name"), AccessPolicy: new(Public), Passphrase: new("SuperStrongPassword")})

	suite.Nil(board)
	suite.NotNil(err)
	suite.Equal(common.BadRequestError(errors.New("passphrase should not be set for policies except 'BY_PASSPHRASE'")), err)
}

func (suite *BoardServiceTestSuite) TestUpdate_ToInvite() {

	updatedName := "Updated Board Name"
	accessPolicy := ByInvite

	suite.mockBoardDatabase.EXPECT().UpdateBoard(mock.Anything, DatabaseBoardUpdate{ID: suite.boardID, Name: &updatedName, AccessPolicy: &accessPolicy}).
		Return(DatabaseBoard{ID: suite.boardID, Name: &updatedName, AccessPolicy: accessPolicy}, nil)
	suite.mockBoardDatabase.EXPECT().UpdateBoard(mock.Anything, mock.MatchedBy(func(update DatabaseBoardUpdate) bool {
		return update.ID == suite.boardID && update.LastModifiedAt.Equal(suite.updatedAt)
	})).Return(DatabaseBoard{ID: suite.boardID}, nil)

	suite.columnMock.EXPECT().GetAll(mock.Anything, suite.boardID).Return([]*columns.Column{}, nil)
	suite.noteMock.EXPECT().GetAll(mock.Anything, suite.boardID).Return([]*notes.Note{}, nil)
	suite.mockBroker.EXPECT().Publish(mock.Anything, mock.AnythingOfType("string"), mock.Anything).Return(nil)
	suite.mockClock.EXPECT().Now().Return(suite.updatedAt)

	board, err := suite.service.Update(context.Background(), BoardUpdateRequest{ID: suite.boardID, Name: &updatedName, AccessPolicy: &accessPolicy})

	suite.Nil(err)
	suite.Equal(suite.boardID, board.ID)
	suite.Equal(updatedName, *board.Name)
	suite.Equal(accessPolicy, board.AccessPolicy)
}

func (suite *BoardServiceTestSuite) TestUpdate_ToInvite_WithPassphrase() {

	board, err := suite.service.Update(context.Background(), BoardUpdateRequest{ID: suite.boardID, Name: new("Updated Board Name"), AccessPolicy: new(ByInvite), Passphrase: new("SuperStrongPassword")})

	suite.Nil(board)
	suite.NotNil(err)
	suite.Equal(common.BadRequestError(errors.New("passphrase should not be set for policies except 'BY_PASSPHRASE'")), err)
}

func (suite *BoardServiceTestSuite) TestSetTimer() {

	timerStart := time.Now().Local()
	timerEnd := timerStart.Add(time.Minute * time.Duration(5))

	suite.mockBoardDatabase.EXPECT().UpdateBoardTimer(mock.Anything, DatabaseBoardTimerUpdate{ID: suite.boardID, TimerStart: &timerStart, TimerEnd: &timerEnd}).
		Return(DatabaseBoard{ID: suite.boardID, TimerEnd: &timerEnd}, nil)

	suite.mockBroker.EXPECT().Publish(mock.Anything, mock.AnythingOfType("string"), mock.Anything).Return(nil)

	suite.mockClock.EXPECT().Now().Return(timerStart)

	result, err := suite.service.SetTimer(context.Background(), suite.boardID, 5)

	suite.NoError(err)
	suite.NotNil(result)
	suite.Equal(suite.boardID, result.ID)
}

func (suite *BoardServiceTestSuite) TestDeleteTimer() {

	suite.mockBoardDatabase.EXPECT().UpdateBoardTimer(mock.Anything, DatabaseBoardTimerUpdate{ID: suite.boardID, TimerStart: nil, TimerEnd: nil}).
		Return(DatabaseBoard{ID: suite.boardID}, nil)

	suite.mockBroker.EXPECT().Publish(mock.Anything, mock.AnythingOfType("string"), mock.Anything).Return(nil)

	result, err := suite.service.DeleteTimer(context.Background(), suite.boardID)

	suite.NoError(err)
	suite.Equal(suite.boardID, result.ID)
	suite.Equal((*time.Time)(nil), result.TimerStart)
	suite.Equal((*time.Time)(nil), result.TimerEnd)
}

func (suite *BoardServiceTestSuite) TestIncrementTimer() {

	now := time.Now().Local()
	updatedTimer := now.Add(time.Duration(1) * time.Minute)
	updatedTimerEnd := updatedTimer.Add(time.Minute * time.Duration(1))

	suite.mockBoardDatabase.EXPECT().GetBoard(mock.Anything, suite.boardID).
		Return(DatabaseBoard{ID: suite.boardID, TimerStart: &now, TimerEnd: &updatedTimer}, nil)
	suite.mockBoardDatabase.EXPECT().UpdateBoardTimer(mock.Anything, DatabaseBoardTimerUpdate{ID: suite.boardID, TimerStart: &now, TimerEnd: &updatedTimerEnd}).
		Return(DatabaseBoard{ID: suite.boardID, TimerStart: &updatedTimer, TimerEnd: &updatedTimerEnd}, nil)

	suite.mockBroker.EXPECT().Publish(mock.Anything, mock.AnythingOfType("string"), mock.Anything).Return(nil)

	suite.mockClock.EXPECT().Now().Return(now)

	result, err := suite.service.IncrementTimer(context.Background(), suite.boardID)

	suite.NoError(err)
	suite.Equal(suite.boardID, result.ID)
	suite.Equal(updatedTimerEnd, *result.TimerEnd)
}

func (suite *BoardServiceTestSuite) TestDelete_BroadcastsCorrectEvent() {

	suite.mockBoardDatabase.EXPECT().DeleteBoard(mock.Anything, suite.boardID).Return(nil)

	// Verify the exact event that's broadcasted
	expectedTopic := fmt.Sprintf("board.%s", suite.boardID)
	expectedEvent := realtime.BoardEvent{
		Type: realtime.BoardEventBoardDeleted,
		Data: nil, // Board deletion event has no data
	}

	// Set up the expectation to capture the broadcast
	suite.mockBroker.EXPECT().Publish(mock.Anything, expectedTopic, expectedEvent).Return(nil).Once()

	// Act
	err := suite.service.Delete(context.Background(), suite.boardID)

	// Assert
	suite.NoError(err)

	// Verify that all expectations were met (including the Publish call)
	suite.mockBroker.AssertExpectations(suite.T())
}

func (suite *BoardServiceTestSuite) TestUpdateLastModified() {

	now := time.Date(2026, 3, 17, 12, 0, 0, 0, time.UTC)

	mockClock := timeprovider.NewMockTimeProvider(suite.T())
	suite.mockBoardDatabase.EXPECT().
		UpdateBoard(mock.Anything, DatabaseBoardUpdate{ID: suite.boardID, LastModifiedAt: now}).
		Return(DatabaseBoard{ID: suite.boardID}, nil)

	updater := NewLastModifiedUpdater(suite.mockBoardDatabase, mockClock)
	err := updater.UpdateLastModified(context.Background(), suite.boardID, now)

	suite.NoError(err)
}

func (suite *BoardServiceTestSuite) TestUpdateLastModified_DatabaseError() {

	dbErr := errors.New("database error")
	now := time.Date(2026, 3, 17, 12, 0, 0, 0, time.UTC)

	mockClock := timeprovider.NewMockTimeProvider(suite.T())
	suite.mockBoardDatabase.EXPECT().
		UpdateBoard(mock.Anything, DatabaseBoardUpdate{ID: suite.boardID, LastModifiedAt: now}).
		Return(DatabaseBoard{}, dbErr)

	updater := NewLastModifiedUpdater(suite.mockBoardDatabase, mockClock)
	err := updater.UpdateLastModified(context.Background(), suite.boardID, now)

	suite.ErrorIs(err, dbErr)
}

func (suite *BoardServiceTestSuite) TestCreateImportedBoard() {
	service := &Service{
		database:       suite.mockBoardDatabase,
		columnService:  suite.columnMock,
		sessionService: suite.sessionsMock,
	}

	ctx := context.Background()
	owner := uuid.New()

	columnVisible := true
	columnIndex := 0
	importColumnID := uuid.New()

	body := ImportBoardRequest{
		Board: &CreateBoardRequest{
			Name:         &suite.boardName,
			Description:  &suite.boardDescription,
			AccessPolicy: Public,
		},
		Columns: []columns.Column{{
			ID:      importColumnID,
			Name:    suite.columnName,
			Color:   suite.columnColor,
			Visible: columnVisible,
			Index:   columnIndex,
		}},
	}

	suite.mockBoardDatabase.EXPECT().CreateBoard(mock.Anything, DatabaseBoardInsert{
		Name:         &suite.boardName,
		Description:  &suite.boardDescription,
		AccessPolicy: Public,
	}).Return(DatabaseBoard{
		ID:           suite.boardID,
		Name:         &suite.boardName,
		Description:  &suite.boardDescription,
		AccessPolicy: Public,
	}, nil)

	suite.columnMock.EXPECT().Create(mock.Anything, columns.ColumnRequest{
		Board:   suite.boardID,
		User:    owner,
		Name:    suite.columnName,
		Color:   suite.columnColor,
		Visible: &columnVisible,
		Index:   &columnIndex,
	}).Return(&columns.Column{ID: uuid.New()}, nil)

	suite.sessionsMock.EXPECT().Create(mock.Anything, sessions.BoardSessionCreateRequest{
		Board: suite.boardID,
		User:  owner,
		Role:  common.OwnerRole,
	}).Return(&sessions.BoardSession{Board: suite.boardID, UserID: owner, Role: common.OwnerRole}, nil)

	board, err := service.createImportedBoard(ctx, owner, body)

	suite.NoError(err)
	suite.NotNil(board)
	suite.Equal(suite.boardID, board.ID)
	suite.Equal(suite.boardName, *board.Name)
	suite.Equal(suite.boardDescription, *board.Description)
	suite.Equal(Public, board.AccessPolicy)
}

func (suite *BoardServiceTestSuite) TestCreateImportedBoard_CreateFails() {
	service := &Service{
		database:       suite.mockBoardDatabase,
		columnService:  suite.columnMock,
		sessionService: suite.sessionsMock,
	}

	ctx := context.Background()
	owner := uuid.New()

	columnVisible := true
	columnIndex := 0

	body := ImportBoardRequest{
		Board: &CreateBoardRequest{
			Name:         &suite.boardName,
			Description:  &suite.boardDescription,
			AccessPolicy: Public,
		},
		Columns: []columns.Column{{
			ID:      uuid.New(),
			Name:    suite.columnName,
			Color:   suite.columnColor,
			Visible: columnVisible,
			Index:   columnIndex,
		}},
	}

	suite.mockBoardDatabase.EXPECT().CreateBoard(mock.Anything, DatabaseBoardInsert{
		Name:         &suite.boardName,
		Description:  &suite.boardDescription,
		AccessPolicy: Public,
	}).Return(DatabaseBoard{}, errors.New("create failed"))

	board, err := service.createImportedBoard(ctx, owner, body)

	suite.Nil(board)
	suite.Equal(common.InternalServerError, err)
}

func (suite *BoardServiceTestSuite) TestImportSuccess() {
	service := &Service{
		database:       suite.mockBoardDatabase,
		columnService:  suite.columnMock,
		sessionService: suite.sessionsMock,
		userService:    suite.userService,
	}

	ctx := context.Background()
	owner := uuid.New()

	columnVisible := true
	columnIndex := 0
	importColumnID := uuid.New()
	createdColumnID := uuid.New()

	body := ImportBoardRequest{
		Board: &CreateBoardRequest{
			Name:         &suite.boardName,
			Description:  &suite.boardDescription,
			AccessPolicy: Public,
		},
		Columns: []columns.Column{{
			ID:      importColumnID,
			Name:    suite.columnName,
			Color:   suite.columnColor,
			Visible: columnVisible,
			Index:   columnIndex,
		}},
		Notes: []notes.Note{},
	}

	suite.mockBoardDatabase.EXPECT().CreateBoard(mock.Anything, DatabaseBoardInsert{
		Name:         &suite.boardName,
		Description:  &suite.boardDescription,
		AccessPolicy: Public,
	}).Return(DatabaseBoard{
		ID:           suite.boardID,
		Name:         &suite.boardName,
		Description:  &suite.boardDescription,
		AccessPolicy: Public,
	}, nil)

	suite.columnMock.EXPECT().Create(mock.Anything, columns.ColumnRequest{
		Board:   suite.boardID,
		User:    owner,
		Name:    suite.columnName,
		Color:   suite.columnColor,
		Visible: &columnVisible,
		Index:   &columnIndex,
	}).Return(&columns.Column{ID: createdColumnID}, nil)

	suite.sessionsMock.EXPECT().Create(mock.Anything, sessions.BoardSessionCreateRequest{
		Board: suite.boardID,
		User:  owner,
		Role:  common.OwnerRole,
	}).Return(&sessions.BoardSession{Board: suite.boardID, UserID: owner, Role: common.OwnerRole}, nil)

	suite.columnMock.EXPECT().GetAll(mock.Anything, suite.boardID).Return([]*columns.Column{{ID: createdColumnID}}, nil)

	board, err := service.Import(ctx, owner, body)

	suite.NoError(err)
	suite.NotNil(board)
	suite.Equal(suite.boardID, board.ID)
}

func (suite *BoardServiceTestSuite) TestImport_FailsWhenCreateImportedBoardFails() {
	service := &Service{
		database:       suite.mockBoardDatabase,
		columnService:  suite.columnMock,
		sessionService: suite.sessionsMock,
		userService:    suite.userService,
	}

	ctx := context.Background()
	owner := uuid.New()

	body := ImportBoardRequest{
		Board: &CreateBoardRequest{
			Name:         &suite.boardName,
			Description:  &suite.boardDescription,
			AccessPolicy: Public,
		},
		Columns: []columns.Column{{
			ID:      uuid.New(),
			Name:    "Start",
			Color:   common.ColorGoalGreen,
			Visible: true,
			Index:   0,
		}},
	}

	suite.mockBoardDatabase.EXPECT().CreateBoard(mock.Anything, DatabaseBoardInsert{
		Name:         &suite.boardName,
		Description:  &suite.boardDescription,
		AccessPolicy: Public,
	}).Return(DatabaseBoard{}, errors.New("create failed"))

	board, err := service.Import(ctx, owner, body)

	suite.Nil(board)
	suite.Equal(common.InternalServerError, err)
}

func (suite *BoardServiceTestSuite) TestImport_FailsWhenProcessImportedNotesFails() {
	service := &Service{
		database:       suite.mockBoardDatabase,
		columnService:  suite.columnMock,
		sessionService: suite.sessionsMock,
		userService:    suite.userService,
	}

	ctx := context.Background()
	owner := uuid.New()

	columnVisible := true
	columnIndex := 0

	body := ImportBoardRequest{
		Board: &CreateBoardRequest{
			Name:         &suite.boardName,
			Description:  &suite.boardDescription,
			AccessPolicy: Public,
		},
		Columns: []columns.Column{{
			ID:      uuid.New(),
			Name:    suite.columnName,
			Color:   suite.columnColor,
			Visible: columnVisible,
			Index:   columnIndex,
		}},
	}

	suite.mockBoardDatabase.EXPECT().CreateBoard(mock.Anything, DatabaseBoardInsert{
		Name:         &suite.boardName,
		Description:  &suite.boardDescription,
		AccessPolicy: Public,
	}).Return(DatabaseBoard{
		ID:           suite.boardID,
		Name:         &suite.boardName,
		Description:  &suite.boardDescription,
		AccessPolicy: Public,
	}, nil)

	suite.columnMock.EXPECT().Create(mock.Anything, columns.ColumnRequest{
		Board:   suite.boardID,
		User:    owner,
		Name:    suite.columnName,
		Color:   suite.columnColor,
		Visible: &columnVisible,
		Index:   &columnIndex,
	}).Return(&columns.Column{ID: uuid.New()}, nil)

	suite.sessionsMock.EXPECT().Create(mock.Anything, sessions.BoardSessionCreateRequest{
		Board: suite.boardID,
		User:  owner,
		Role:  common.OwnerRole,
	}).Return(&sessions.BoardSession{Board: suite.boardID, UserID: owner, Role: common.OwnerRole}, nil)

	getColumnsErr := errors.New("failed to get imported columns")
	suite.columnMock.EXPECT().GetAll(mock.Anything, suite.boardID).Return(nil, getColumnsErr)

	board, err := service.Import(ctx, owner, body)

	suite.Nil(board)
	suite.Equal(getColumnsErr, err)

}

func (suite *BoardServiceTestSuite) TestImportChildNotes() {
	notesMock := notes.NewMockNotesService(suite.T())
	service := &Service{notesService: notesMock}

	ctx := context.Background()

	parentID := uuid.New()
	columnID := uuid.New()

	organizedNotes := []parentChildNotes{{
		Parent: notes.Note{
			ID: parentID,
			Position: notes.NotePosition{
				Column: columnID,
			},
		},
		Children: []notes.Note{
			{
				Author: uuid.New(),
				Text:   "child-1",
				Position: notes.NotePosition{
					Rank: 1,
				},
			},
			{
				Author: uuid.New(),
				Text:   "child-2",
				Position: notes.NotePosition{
					Rank: 2,
				},
			},
		},
	}}

	for _, child := range organizedNotes[0].Children {
		notesMock.EXPECT().Import(mock.Anything, notes.NoteImportRequest{
			Text:  child.Text,
			Board: suite.boardID,
			User:  child.Author,
			Position: notes.NotePosition{
				Column: columnID,
				Rank:   child.Position.Rank,
				Stack: uuid.NullUUID{
					UUID:  parentID,
					Valid: true,
				},
			},
		}).Return(&notes.Note{ID: uuid.New()}, nil).Once()
	}

	err := service.importChildNotes(ctx, suite.boardID, organizedNotes)

	suite.NoError(err)
	notesMock.AssertExpectations(suite.T())
}

func (suite *BoardServiceTestSuite) TestImportChildNotes_ReturnsErrorAndStopsOnFirstFailure() {
	notesMock := notes.NewMockNotesService(suite.T())
	service := &Service{notesService: notesMock}

	ctx := context.Background()

	parentID := uuid.New()
	columnID := uuid.New()
	firstChildAuthor := uuid.New()
	secondChildAuthor := uuid.New()
	importErr := errors.New("import child note failed")

	organizedNotes := []parentChildNotes{{
		Parent: notes.Note{
			ID:       parentID,
			Position: notes.NotePosition{Column: columnID},
		},
		Children: []notes.Note{
			{
				Author:   firstChildAuthor,
				Text:     "child-1",
				Position: notes.NotePosition{Rank: 1},
			},
			{
				Author:   secondChildAuthor,
				Text:     "child-2",
				Position: notes.NotePosition{Rank: 2},
			},
		},
	}}

	notesMock.EXPECT().Import(mock.Anything, notes.NoteImportRequest{
		Text:  "child-1",
		Board: suite.boardID,
		User:  firstChildAuthor,
		Position: notes.NotePosition{
			Column: columnID,
			Rank:   1,
			Stack:  uuid.NullUUID{UUID: parentID, Valid: true},
		},
	}).Return(nil, importErr).Once()

	err := service.importChildNotes(ctx, suite.boardID, organizedNotes)

	suite.Error(err)
	suite.Equal(importErr, err)
	notesMock.AssertNotCalled(suite.T(), "Import", mock.Anything, mock.MatchedBy(func(req notes.NoteImportRequest) bool {
		return req.Text == "child-2" && req.User == secondChildAuthor
	}))
	notesMock.AssertExpectations(suite.T())
}

func (suite *BoardServiceTestSuite) TestImportChildNotes_NoChildrenNoOp() {
	notesMock := notes.NewMockNotesService(suite.T())
	service := &Service{notesService: notesMock}

	ctx := context.Background()

	organizedNotes := []parentChildNotes{
		{
			Parent:   notes.Note{ID: uuid.New(), Position: notes.NotePosition{Column: uuid.New()}},
			Children: []notes.Note{},
		},
		{
			Parent:   notes.Note{ID: uuid.New(), Position: notes.NotePosition{Column: uuid.New()}},
			Children: nil,
		},
	}

	err := service.importChildNotes(ctx, suite.boardID, organizedNotes)

	suite.NoError(err)
	notesMock.AssertNotCalled(suite.T(), "Import", mock.Anything, mock.Anything)
	notesMock.AssertExpectations(suite.T())
}

func (suite *BoardServiceTestSuite) TestProcessImportedNotes_CleansUpCreatedParticipantsOnImportFailure() {
	columnsMock := columns.NewMockColumnService(suite.T())
	notesMock := notes.NewMockNotesService(suite.T())

	service := &Service{
		columnService: columnsMock,
		notesService:  notesMock,
		userService:   suite.userService,
	}

	ctx := context.Background()

	importColumnID := uuid.New()
	createdColumnID := uuid.New()
	deletedAuthorID := uuid.New()
	replacementAuthorID := uuid.New()
	importError := errors.New("import failed")

	body := ImportBoardRequest{
		Columns: []columns.Column{{ID: importColumnID}},
		Notes: []notes.Note{{
			ID:     uuid.New(),
			Author: deletedAuthorID,
			Text:   "Imported note",
			Position: notes.NotePosition{
				Column: importColumnID,
				Stack:  uuid.NullUUID{},
				Rank:   0,
			},
		}},
	}

	columnsMock.EXPECT().GetAll(mock.Anything, suite.boardID).Return([]*columns.Column{{ID: createdColumnID}}, nil)
	suite.userService.EXPECT().GetExistingUserIDs(mock.Anything, []uuid.UUID{deletedAuthorID}).Return([]uuid.UUID{}, nil)
	suite.userService.EXPECT().CreateAnonymous(mock.Anything, "deleted user "+deletedAuthorID.String()[:5]).Return(&users.User{ID: replacementAuthorID}, nil)
	notesMock.EXPECT().Import(mock.Anything, mock.Anything).Return(nil, importError)
	suite.userService.EXPECT().Delete(mock.Anything, replacementAuthorID).Return(nil)

	err := service.processImportedNotes(ctx, suite.boardID, body)

	suite.Error(err)
	suite.Equal(importError, err)

}

func (suite *BoardServiceTestSuite) TestReplaceDeletedParticipants_CleansUpOnAnonymousCreationFailure() {

	service := &Service{
		userService: suite.userService,
	}

	ctx := context.Background()
	firstDeletedAuthorID := uuid.New()
	secondDeletedAuthorID := uuid.New()
	firstReplacementAuthorID := uuid.New()
	createError := errors.New("create failed")

	body := ImportBoardRequest{
		Notes: []notes.Note{
			{ID: uuid.New(), Author: firstDeletedAuthorID},
			{ID: uuid.New(), Author: secondDeletedAuthorID},
		},
	}

	suite.userService.EXPECT().GetExistingUserIDs(mock.Anything, []uuid.UUID{firstDeletedAuthorID, secondDeletedAuthorID}).Return([]uuid.UUID{}, nil)
	suite.userService.EXPECT().CreateAnonymous(mock.Anything, "deleted user "+firstDeletedAuthorID.String()[:5]).Return(&users.User{ID: firstReplacementAuthorID}, nil)
	suite.userService.EXPECT().CreateAnonymous(mock.Anything, "deleted user "+secondDeletedAuthorID.String()[:5]).Return(nil, createError)
	suite.userService.EXPECT().Delete(mock.Anything, firstReplacementAuthorID).Return(nil)

	_, _, err := service.replaceDeletedParticipants(ctx, body)

	suite.Error(err)
	suite.Equal(createError, err)
}
