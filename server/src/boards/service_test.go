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
	mockBoardDatabase  *MockBoardDatabase
	sessionsMock       *sessions.MockSessionService
	sessionRequestMock *sessionrequests.MockSessionRequestService
	columnMock         *columns.MockColumnService
	noteMock           *notes.MockNotesService
	reactionMock       *reactions.MockReactionService
	votingMock         *votings.MockVotingService
	userService        *users.MockUserService
	service            BoardService
	mockBroker         *realtime.MockClient
	broker             *realtime.Broker
	mockClock          *timeprovider.MockTimeProvider
	mockHash           *hash.MockHash
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
}

func (suite *BoardServiceTestSuite) TestGet() {
	boardID := uuid.New()

	suite.mockBoardDatabase.EXPECT().GetBoard(mock.Anything, boardID).Return(DatabaseBoard{ID: boardID}, nil)

	result, err := suite.service.Get(context.Background(), boardID)

	suite.NoError(err)
	suite.NotNil(result)
	suite.Equal(boardID, result.ID)
}

func (suite *BoardServiceTestSuite) TestGet_DatabaseError() {
	boardID := uuid.New()
	dbError := errors.New("database error")

	suite.mockBoardDatabase.EXPECT().GetBoard(mock.Anything, boardID).
		Return(DatabaseBoard{}, dbError)

	result, err := suite.service.Get(context.Background(), boardID)

	suite.Error(err)
	suite.Nil(result)
	suite.Equal(dbError, err)
}

func (suite *BoardServiceTestSuite) TestCreate() {
	boardID := uuid.New()
	userID := uuid.New()
	boardName := "Test Board"
	boardDescription := "A test board"
	accessPolicy := Public
	index := 0

	columnName := "Test Column"
	columnDescription := "Test Column Description"

	suite.mockBoardDatabase.EXPECT().CreateBoard(mock.Anything, DatabaseBoardInsert{Name: &boardName, Description: &boardDescription, AccessPolicy: accessPolicy}).
		Return(DatabaseBoard{ID: boardID, Name: &boardName, Description: &boardDescription, AccessPolicy: accessPolicy}, nil)

	suite.columnMock.EXPECT().Create(mock.Anything,
		columns.ColumnRequest{
			Board:       boardID,
			Name:        columnName,
			Description: columnDescription,
			Color:       common.ColorGoalGreen,
			Visible:     nil,
			Index:       &index,
			User:        userID,
		}).
		Return(&columns.Column{ID: uuid.New(), Name: columnName, Description: columnDescription, Color: common.ColorGoalGreen, Visible: false, Index: index}, nil)

	suite.sessionsMock.EXPECT().Create(mock.Anything, sessions.BoardSessionCreateRequest{Board: boardID, User: userID, Role: common.OwnerRole}).
		Return(&sessions.BoardSession{UserID: userID, Board: boardID, Role: common.OwnerRole}, nil)

	board, err := suite.service.Create(context.Background(),
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
					Color:       common.ColorGoalGreen,
					Visible:     nil,
					Index:       &index,
					User:        userID,
				},
			}})

	suite.Nil(err)
	suite.Equal(boardID, board.ID)
	suite.Equal(boardName, *board.Name)
	suite.Equal(boardDescription, *board.Description)
	suite.Equal(accessPolicy, board.AccessPolicy)
	suite.Nil(board.Passphrase)
	suite.Nil(board.Salt)
}

func (suite *BoardServiceTestSuite) TestCreate_ByPassphrase() {
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

	suite.mockBoardDatabase.EXPECT().CreateBoard(mock.Anything, DatabaseBoardInsert{Name: &boardName, Description: &boardDescription, AccessPolicy: accessPolicy, Passphrase: &passPhrase, Salt: &salt}).
		Return(DatabaseBoard{ID: boardID, Name: &boardName, Description: &boardDescription, AccessPolicy: accessPolicy, Passphrase: &passPhrase, Salt: &salt}, nil)

	suite.columnMock.EXPECT().Create(mock.Anything,
		columns.ColumnRequest{
			Board:       boardID,
			Name:        columnName,
			Description: columnDescription,
			Color:       common.ColorGoalGreen,
			Visible:     nil,
			Index:       &index,
			User:        userID,
		}).
		Return(&columns.Column{ID: uuid.New(), Name: columnName, Description: columnDescription, Color: common.ColorGoalGreen, Visible: false, Index: index}, nil)

	suite.sessionsMock.EXPECT().Create(mock.Anything, sessions.BoardSessionCreateRequest{Board: boardID, User: userID, Role: common.OwnerRole}).
		Return(&sessions.BoardSession{UserID: userID, Board: boardID, Role: common.OwnerRole}, nil)

	suite.mockHash.EXPECT().HashWithSalt(passPhrase).Return(&passPhrase, &salt, nil)

	board, err := suite.service.Create(context.Background(),
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
					Color:       common.ColorGoalGreen,
					Visible:     nil,
					Index:       &index,
					User:        userID,
				},
			}})

	suite.Nil(err)
	suite.Equal(boardID, board.ID)
	suite.Equal(boardName, *board.Name)
	suite.Equal(boardDescription, *board.Description)
	suite.Equal(accessPolicy, board.AccessPolicy)
	suite.Equal(passPhrase, *board.Passphrase)
	suite.Equal(salt, *board.Salt)
}

func (suite *BoardServiceTestSuite) TestCreate_ByPassphraseMissing() {
	userID := uuid.New()

	result, err := suite.service.Create(context.Background(),
		CreateBoardRequest{
			Name:         new("Test Board"),
			Description:  new("A test board"),
			Owner:        userID,
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
	boardID := uuid.New()

	suite.mockBoardDatabase.EXPECT().DeleteBoard(mock.Anything, boardID).Return(nil)

	expectedTopic := fmt.Sprintf("board.%s", boardID)
	expectedEvent := realtime.BoardEvent{Type: realtime.BoardEventBoardDeleted}
	suite.mockBroker.EXPECT().Publish(mock.Anything, expectedTopic, expectedEvent).Return(nil)

	err := suite.service.Delete(context.Background(), boardID)

	suite.NoError(err)
}

func (suite *BoardServiceTestSuite) TestUpdate() {
	boardID := uuid.New()
	updatedName := "Updated Board Name"
	updatedAt := time.Date(2026, 3, 17, 12, 0, 0, 0, time.UTC)

	suite.mockBoardDatabase.EXPECT().UpdateBoard(mock.Anything, DatabaseBoardUpdate{ID: boardID, Name: &updatedName}).
		Return(DatabaseBoard{ID: boardID, Name: &updatedName}, nil)
	suite.mockBoardDatabase.EXPECT().UpdateBoard(mock.Anything, mock.MatchedBy(func(update DatabaseBoardUpdate) bool {
		return update.ID == boardID && update.LastModifiedAt.Equal(updatedAt)
	})).Return(DatabaseBoard{ID: boardID}, nil)

	suite.columnMock.EXPECT().GetAll(mock.Anything, boardID).
		Return([]*columns.Column{}, nil)

	suite.noteMock.EXPECT().GetAll(mock.Anything, boardID).
		Return([]*notes.Note{}, nil)

	suite.mockBroker.EXPECT().Publish(mock.Anything, mock.AnythingOfType("string"), mock.Anything).Return(nil)
	suite.mockClock.EXPECT().Now().Return(updatedAt)

	board, err := suite.service.Update(context.Background(), BoardUpdateRequest{ID: boardID, Name: &updatedName})

	suite.Nil(err)
	suite.Equal(boardID, board.ID)
	suite.Equal(updatedName, *board.Name)
}

func (suite *BoardServiceTestSuite) TestUpdate_EmptyName() {
	boardID := uuid.New()

	board, err := suite.service.Update(context.Background(), BoardUpdateRequest{ID: boardID, Name: new("")})

	suite.Nil(board)
	suite.NotNil(err)
	suite.Equal(common.BadRequestError(errors.New("name cannot be empty")), err)
}

func (suite *BoardServiceTestSuite) TestUpdate_ToPassphrase() {
	boardID := uuid.New()
	updatedName := "Updated Board Name"
	accessPolicy := ByPassphrase
	passphrase := "SuperStrongPassword"
	salt := "ThisIsTheSalt"
	updatedAt := time.Date(2026, 3, 17, 12, 0, 0, 0, time.UTC)

	suite.mockBoardDatabase.EXPECT().UpdateBoard(mock.Anything, DatabaseBoardUpdate{ID: boardID, Name: &updatedName, AccessPolicy: &accessPolicy, Passphrase: &passphrase, Salt: &salt}).
		Return(DatabaseBoard{ID: boardID, Name: &updatedName, AccessPolicy: accessPolicy, Passphrase: &passphrase, Salt: &salt}, nil)
	suite.mockBoardDatabase.EXPECT().UpdateBoard(mock.Anything, mock.MatchedBy(func(update DatabaseBoardUpdate) bool {
		return update.ID == boardID && update.LastModifiedAt.Equal(updatedAt)
	})).Return(DatabaseBoard{ID: boardID}, nil)

	suite.columnMock.EXPECT().GetAll(mock.Anything, boardID).
		Return([]*columns.Column{}, nil)

	suite.noteMock.EXPECT().GetAll(mock.Anything, boardID).
		Return([]*notes.Note{}, nil)

	suite.mockBroker.EXPECT().Publish(mock.Anything, mock.AnythingOfType("string"), mock.Anything).Return(nil)

	suite.mockClock.EXPECT().Now().Return(updatedAt)
	suite.mockHash.EXPECT().HashWithSalt(passphrase).Return(&passphrase, &salt, nil)

	board, err := suite.service.Update(context.Background(), BoardUpdateRequest{ID: boardID, Name: &updatedName, AccessPolicy: &accessPolicy, Passphrase: &passphrase})

	suite.Nil(err)
	suite.Equal(boardID, board.ID)
	suite.Equal(updatedName, *board.Name)
	suite.Equal(passphrase, *board.Passphrase)
	suite.Equal(salt, *board.Salt)
	suite.Equal(accessPolicy, board.AccessPolicy)
}

func (suite *BoardServiceTestSuite) TestUpdate_ToPassphrase_WithoutPassphrase() {
	boardID := uuid.New()

	board, err := suite.service.Update(context.Background(), BoardUpdateRequest{ID: boardID, Name: new("Updated Board Name"), AccessPolicy: new(ByPassphrase)})

	suite.Nil(board)
	suite.NotNil(err)
	suite.Equal(common.BadRequestError(errors.New("passphrase must be set if policy 'BY_PASSPHRASE' is selected")), err)
}

func (suite *BoardServiceTestSuite) TestUpdate_ToPublic() {
	boardID := uuid.New()
	updatedName := "Updated Board Name"
	accessPolicy := Public
	updatedAt := time.Date(2026, 3, 17, 12, 0, 0, 0, time.UTC)

	suite.mockBoardDatabase.EXPECT().UpdateBoard(mock.Anything, DatabaseBoardUpdate{ID: boardID, Name: &updatedName, AccessPolicy: &accessPolicy}).
		Return(DatabaseBoard{ID: boardID, Name: &updatedName, AccessPolicy: accessPolicy}, nil)
	suite.mockBoardDatabase.EXPECT().UpdateBoard(mock.Anything, mock.MatchedBy(func(update DatabaseBoardUpdate) bool {
		return update.ID == boardID && update.LastModifiedAt.Equal(updatedAt)
	})).Return(DatabaseBoard{ID: boardID}, nil)

	suite.columnMock.EXPECT().GetAll(mock.Anything, boardID).
		Return([]*columns.Column{}, nil)

	suite.noteMock.EXPECT().GetAll(mock.Anything, boardID).
		Return([]*notes.Note{}, nil)

	suite.mockBroker.EXPECT().Publish(mock.Anything, mock.AnythingOfType("string"), mock.Anything).Return(nil)

	suite.mockClock.EXPECT().Now().Return(updatedAt)

	board, err := suite.service.Update(context.Background(), BoardUpdateRequest{ID: boardID, Name: &updatedName, AccessPolicy: &accessPolicy})

	suite.Nil(err)
	suite.Equal(boardID, board.ID)
	suite.Equal(updatedName, *board.Name)
	suite.Equal(accessPolicy, board.AccessPolicy)
}

func (suite *BoardServiceTestSuite) TestUpdate_ToPublic_WithPassphrase() {
	boardID := uuid.New()

	board, err := suite.service.Update(context.Background(), BoardUpdateRequest{ID: boardID, Name: new("Updated Board Name"), AccessPolicy: new(Public), Passphrase: new("SuperStrongPassword")})

	suite.Nil(board)
	suite.NotNil(err)
	suite.Equal(common.BadRequestError(errors.New("passphrase should not be set for policies except 'BY_PASSPHRASE'")), err)
}

func (suite *BoardServiceTestSuite) TestUpdate_ToInvite() {
	boardID := uuid.New()
	updatedName := "Updated Board Name"
	accessPolicy := ByInvite
	updatedAt := time.Date(2026, 3, 17, 12, 0, 0, 0, time.UTC)

	suite.mockBoardDatabase.EXPECT().UpdateBoard(mock.Anything, DatabaseBoardUpdate{ID: boardID, Name: &updatedName, AccessPolicy: &accessPolicy}).
		Return(DatabaseBoard{ID: boardID, Name: &updatedName, AccessPolicy: accessPolicy}, nil)
	suite.mockBoardDatabase.EXPECT().UpdateBoard(mock.Anything, mock.MatchedBy(func(update DatabaseBoardUpdate) bool {
		return update.ID == boardID && update.LastModifiedAt.Equal(updatedAt)
	})).Return(DatabaseBoard{ID: boardID}, nil)

	suite.columnMock.EXPECT().GetAll(mock.Anything, boardID).Return([]*columns.Column{}, nil)
	suite.noteMock.EXPECT().GetAll(mock.Anything, boardID).Return([]*notes.Note{}, nil)
	suite.mockBroker.EXPECT().Publish(mock.Anything, mock.AnythingOfType("string"), mock.Anything).Return(nil)
	suite.mockClock.EXPECT().Now().Return(updatedAt)

	board, err := suite.service.Update(context.Background(), BoardUpdateRequest{ID: boardID, Name: &updatedName, AccessPolicy: &accessPolicy})

	suite.Nil(err)
	suite.Equal(boardID, board.ID)
	suite.Equal(updatedName, *board.Name)
	suite.Equal(accessPolicy, board.AccessPolicy)
}

func (suite *BoardServiceTestSuite) TestUpdate_ToInvite_WithPassphrase() {
	boardID := uuid.New()

	board, err := suite.service.Update(context.Background(), BoardUpdateRequest{ID: boardID, Name: new("Updated Board Name"), AccessPolicy: new(ByInvite), Passphrase: new("SuperStrongPassword")})

	suite.Nil(board)
	suite.NotNil(err)
	suite.Equal(common.BadRequestError(errors.New("passphrase should not be set for policies except 'BY_PASSPHRASE'")), err)
}

func (suite *BoardServiceTestSuite) TestSetTimer() {
	boardID := uuid.New()
	timerStart := time.Now().Local()
	timerEnd := timerStart.Add(time.Minute * time.Duration(5))

	suite.mockBoardDatabase.EXPECT().UpdateBoardTimer(mock.Anything, DatabaseBoardTimerUpdate{ID: boardID, TimerStart: &timerStart, TimerEnd: &timerEnd}).
		Return(DatabaseBoard{ID: boardID, TimerEnd: &timerEnd}, nil)

	suite.mockBroker.EXPECT().Publish(mock.Anything, mock.AnythingOfType("string"), mock.Anything).Return(nil)

	suite.mockClock.EXPECT().Now().Return(timerStart)

	result, err := suite.service.SetTimer(context.Background(), boardID, 5)

	suite.NoError(err)
	suite.NotNil(result)
	suite.Equal(boardID, result.ID)
}

func (suite *BoardServiceTestSuite) TestDeleteTimer() {
	boardID := uuid.New()

	suite.mockBoardDatabase.EXPECT().UpdateBoardTimer(mock.Anything, DatabaseBoardTimerUpdate{ID: boardID, TimerStart: nil, TimerEnd: nil}).
		Return(DatabaseBoard{ID: boardID}, nil)

	suite.mockBroker.EXPECT().Publish(mock.Anything, mock.AnythingOfType("string"), mock.Anything).Return(nil)

	result, err := suite.service.DeleteTimer(context.Background(), boardID)

	suite.NoError(err)
	suite.Equal(boardID, result.ID)
	suite.Equal((*time.Time)(nil), result.TimerStart)
	suite.Equal((*time.Time)(nil), result.TimerEnd)
}

func (suite *BoardServiceTestSuite) TestIncrementTimer() {
	boardID := uuid.New()
	now := time.Now().Local()
	updatedTimer := now.Add(time.Duration(1) * time.Minute)
	updatedTimerEnd := updatedTimer.Add(time.Minute * time.Duration(1))

	suite.mockBoardDatabase.EXPECT().GetBoard(mock.Anything, boardID).
		Return(DatabaseBoard{ID: boardID, TimerStart: &now, TimerEnd: &updatedTimer}, nil)
	suite.mockBoardDatabase.EXPECT().UpdateBoardTimer(mock.Anything, DatabaseBoardTimerUpdate{ID: boardID, TimerStart: &now, TimerEnd: &updatedTimerEnd}).
		Return(DatabaseBoard{ID: boardID, TimerStart: &updatedTimer, TimerEnd: &updatedTimerEnd}, nil)

	suite.mockBroker.EXPECT().Publish(mock.Anything, mock.AnythingOfType("string"), mock.Anything).Return(nil)

	suite.mockClock.EXPECT().Now().Return(now)

	result, err := suite.service.IncrementTimer(context.Background(), boardID)

	suite.NoError(err)
	suite.Equal(boardID, result.ID)
	suite.Equal(updatedTimerEnd, *result.TimerEnd)
}

func (suite *BoardServiceTestSuite) TestDelete_BroadcastsCorrectEvent() {
	boardID := uuid.New()

	suite.mockBoardDatabase.EXPECT().DeleteBoard(mock.Anything, boardID).Return(nil)

	// Verify the exact event that's broadcasted
	expectedTopic := fmt.Sprintf("board.%s", boardID)
	expectedEvent := realtime.BoardEvent{
		Type: realtime.BoardEventBoardDeleted,
		Data: nil, // Board deletion event has no data
	}

	// Set up the expectation to capture the broadcast
	suite.mockBroker.EXPECT().Publish(mock.Anything, expectedTopic, expectedEvent).Return(nil).Once()

	// Act
	err := suite.service.Delete(context.Background(), boardID)

	// Assert
	suite.NoError(err)

	// Verify that all expectations were met (including the Publish call)
	suite.mockBroker.AssertExpectations(suite.T())
}

func (suite *BoardServiceTestSuite) TestUpdateLastModified() {
	boardID := uuid.New()
	now := time.Date(2026, 3, 17, 12, 0, 0, 0, time.UTC)

	mockClock := timeprovider.NewMockTimeProvider(suite.T())
	suite.mockBoardDatabase.EXPECT().
		UpdateBoard(mock.Anything, DatabaseBoardUpdate{ID: boardID, LastModifiedAt: now}).
		Return(DatabaseBoard{ID: boardID}, nil)

	updater := NewLastModifiedUpdater(suite.mockBoardDatabase, mockClock)
	err := updater.UpdateLastModified(context.Background(), boardID, now)

	suite.NoError(err)
}

func (suite *BoardServiceTestSuite) TestUpdateLastModified_DatabaseError() {
	boardID := uuid.New()
	dbErr := errors.New("database error")
	now := time.Date(2026, 3, 17, 12, 0, 0, 0, time.UTC)

	mockClock := timeprovider.NewMockTimeProvider(suite.T())
	suite.mockBoardDatabase.EXPECT().
		UpdateBoard(mock.Anything, DatabaseBoardUpdate{ID: boardID, LastModifiedAt: now}).
		Return(DatabaseBoard{}, dbErr)

	updater := NewLastModifiedUpdater(suite.mockBoardDatabase, mockClock)
	err := updater.UpdateLastModified(context.Background(), boardID, now)

	suite.ErrorIs(err, dbErr)
}

func (suite *BoardServiceTestSuite) TestImportSuccess() {
	suite.Equal(true, true)
	//todo
	// also all other cases for that function perhaps steal from api/boards_test
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
	boardID := uuid.New()
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

	columnsMock.EXPECT().GetAll(mock.Anything, boardID).Return([]*columns.Column{{ID: createdColumnID}}, nil)
	suite.userService.EXPECT().GetExistingUserIDs(mock.Anything, []uuid.UUID{deletedAuthorID}).Return([]uuid.UUID{}, nil)
	suite.userService.EXPECT().CreateAnonymous(mock.Anything, "deleted user "+deletedAuthorID.String()[:5]).Return(&users.User{ID: replacementAuthorID}, nil)
	notesMock.EXPECT().Import(mock.Anything, mock.Anything).Return(nil, importError)
	suite.userService.EXPECT().Delete(mock.Anything, replacementAuthorID).Return(nil)

	err := service.processImportedNotes(ctx, boardID, body)

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
