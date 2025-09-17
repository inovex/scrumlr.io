package sessions

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"net/url"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	mock "github.com/stretchr/testify/mock"
	"scrumlr.io/server/columns"
	"scrumlr.io/server/common"
	"scrumlr.io/server/notes"
	"scrumlr.io/server/realtime"
)

func TestGetSession(t *testing.T) {
	boardId := uuid.New()
	userId := uuid.New()

	mockSessiondb := NewMockSessionDatabase(t)
	mockSessiondb.EXPECT().Get(mock.Anything, boardId, userId).Return(DatabaseBoardSession{Board: boardId, User: userId}, nil)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockColumnService := columns.NewMockColumnService(t)
	mockNoteService := notes.NewMockNotesService(t)

	sessionService := NewSessionService(mockSessiondb, broker, mockColumnService, mockNoteService)

	session, err := sessionService.Get(context.Background(), boardId, userId)

	assert.Nil(t, err)
	assert.NotNil(t, session)
	assert.Equal(t, boardId, session.Board)
	assert.Equal(t, userId, session.User.ID)
}

func TestGetSession_NotFound(t *testing.T) {
	boardId := uuid.New()
	userId := uuid.New()

	mockSessiondb := NewMockSessionDatabase(t)
	mockSessiondb.EXPECT().Get(mock.Anything, boardId, userId).Return(DatabaseBoardSession{}, sql.ErrNoRows)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockColumnService := columns.NewMockColumnService(t)
	mockNoteService := notes.NewMockNotesService(t)

	sessionService := NewSessionService(mockSessiondb, broker, mockColumnService, mockNoteService)

	session, err := sessionService.Get(context.Background(), boardId, userId)

	assert.Nil(t, session)
	assert.NotNil(t, err)
	assert.Equal(t, common.NotFoundError, err)
}

func TestGetSession_DatabaseError(t *testing.T) {
	boardId := uuid.New()
	userId := uuid.New()
	dbError := "unable to execute"

	mockSessiondb := NewMockSessionDatabase(t)
	mockSessiondb.EXPECT().Get(mock.Anything, boardId, userId).Return(DatabaseBoardSession{}, errors.New(dbError))

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockColumnService := columns.NewMockColumnService(t)
	mockNoteService := notes.NewMockNotesService(t)

	sessionService := NewSessionService(mockSessiondb, broker, mockColumnService, mockNoteService)

	session, err := sessionService.Get(context.Background(), boardId, userId)

	assert.Nil(t, session)
	assert.NotNil(t, err)
	assert.Equal(t, fmt.Errorf("unable to get session for board: %w", errors.New(dbError)), err)
}

func TestGetSessions(t *testing.T) {
	boardId := uuid.New()
	firstUserId := uuid.New()
	secondUserId := uuid.New()
	filter := BoardSessionFilter{}

	mockSessiondb := NewMockSessionDatabase(t)
	mockSessiondb.EXPECT().GetAll(mock.Anything, boardId, []BoardSessionFilter{filter}).
		Return([]DatabaseBoardSession{
			{Board: boardId, User: firstUserId},
			{Board: boardId, User: secondUserId},
		}, nil)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockColumnService := columns.NewMockColumnService(t)
	mockNoteService := notes.NewMockNotesService(t)

	sessionService := NewSessionService(mockSessiondb, broker, mockColumnService, mockNoteService)

	boardSessions, err := sessionService.GetAll(context.Background(), boardId, filter)

	assert.Nil(t, err)
	assert.NotNil(t, boardSessions)
	assert.Len(t, boardSessions, 2)

	assert.Equal(t, firstUserId, boardSessions[0].User.ID)
	assert.Equal(t, boardId, boardSessions[0].Board)

	assert.Equal(t, secondUserId, boardSessions[1].User.ID)
	assert.Equal(t, boardId, boardSessions[1].Board)
}

func TestListSessions_WithFilterConnected(t *testing.T) {
	boardId := uuid.New()
	connected := true
	filter := BoardSessionFilter{Connected: &connected}

	mockSessiondb := NewMockSessionDatabase(t)
	mockSessiondb.EXPECT().GetAll(mock.Anything, boardId, []BoardSessionFilter{filter}).
		Return([]DatabaseBoardSession{
			{Board: boardId, Connected: connected},
			{Board: boardId, Connected: connected},
		}, nil)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockColumnService := columns.NewMockColumnService(t)
	mockNoteService := notes.NewMockNotesService(t)

	sessionService := NewSessionService(mockSessiondb, broker, mockColumnService, mockNoteService)

	boardSessions, err := sessionService.GetAll(context.Background(), boardId, filter)

	assert.Nil(t, err)
	assert.NotNil(t, boardSessions)
	assert.Len(t, boardSessions, 2)

	assert.Equal(t, connected, boardSessions[0].Connected)
	assert.Equal(t, boardId, boardSessions[0].Board)

	assert.Equal(t, connected, boardSessions[1].Connected)
	assert.Equal(t, boardId, boardSessions[1].Board)
}

func TestListSessions_WithFilterReady(t *testing.T) {
	boardId := uuid.New()
	ready := true
	filter := BoardSessionFilter{Ready: &ready}

	mockSessiondb := NewMockSessionDatabase(t)
	mockSessiondb.EXPECT().GetAll(mock.Anything, boardId, []BoardSessionFilter{filter}).
		Return([]DatabaseBoardSession{
			{Board: boardId, Ready: ready},
			{Board: boardId, Ready: ready},
		}, nil)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockColumnService := columns.NewMockColumnService(t)
	mockNoteService := notes.NewMockNotesService(t)

	sessionService := NewSessionService(mockSessiondb, broker, mockColumnService, mockNoteService)

	boardSessions, err := sessionService.GetAll(context.Background(), boardId, filter)

	assert.Nil(t, err)
	assert.NotNil(t, boardSessions)
	assert.Len(t, boardSessions, 2)

	assert.Equal(t, ready, boardSessions[0].Ready)
	assert.Equal(t, boardId, boardSessions[0].Board)

	assert.Equal(t, ready, boardSessions[1].Ready)
	assert.Equal(t, boardId, boardSessions[1].Board)
}

func TestListSessions_WithFilterRaisedHand(t *testing.T) {
	boardId := uuid.New()
	raisedHand := true
	filter := BoardSessionFilter{RaisedHand: &raisedHand}

	mockSessiondb := NewMockSessionDatabase(t)
	mockSessiondb.EXPECT().GetAll(mock.Anything, boardId, []BoardSessionFilter{filter}).
		Return([]DatabaseBoardSession{
			{Board: boardId, RaisedHand: raisedHand},
			{Board: boardId, RaisedHand: raisedHand},
		}, nil)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockColumnService := columns.NewMockColumnService(t)
	mockNoteService := notes.NewMockNotesService(t)

	sessionService := NewSessionService(mockSessiondb, broker, mockColumnService, mockNoteService)

	boardSessions, err := sessionService.GetAll(context.Background(), boardId, filter)

	assert.Nil(t, err)
	assert.NotNil(t, boardSessions)
	assert.Len(t, boardSessions, 2)

	assert.Equal(t, raisedHand, boardSessions[0].RaisedHand)
	assert.Equal(t, boardId, boardSessions[0].Board)

	assert.Equal(t, raisedHand, boardSessions[1].RaisedHand)
	assert.Equal(t, boardId, boardSessions[1].Board)
}

func TestListSessions_WithFilterRole(t *testing.T) {
	boardId := uuid.New()
	moderatorRole := common.ModeratorRole
	filter := BoardSessionFilter{Role: &moderatorRole}

	mockSessiondb := NewMockSessionDatabase(t)
	mockSessiondb.EXPECT().GetAll(mock.Anything, boardId, []BoardSessionFilter{filter}).
		Return([]DatabaseBoardSession{
			{Board: boardId, Role: common.ModeratorRole},
			{Board: boardId, Role: common.ModeratorRole},
		}, nil)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockColumnService := columns.NewMockColumnService(t)
	mockNoteService := notes.NewMockNotesService(t)

	sessionService := NewSessionService(mockSessiondb, broker, mockColumnService, mockNoteService)

	boardSessions, err := sessionService.GetAll(context.Background(), boardId, filter)

	assert.Nil(t, err)
	assert.NotNil(t, boardSessions)
	assert.Len(t, boardSessions, 2)

	assert.Equal(t, moderatorRole, boardSessions[0].Role)
	assert.Equal(t, boardId, boardSessions[0].Board)

	assert.Equal(t, moderatorRole, boardSessions[1].Role)
	assert.Equal(t, boardId, boardSessions[1].Board)
}

func TestListSessions_DatabaseError(t *testing.T) {
	boardId := uuid.New()
	dbError := "unable to execute"
	filter := BoardSessionFilter{}

	mockSessiondb := NewMockSessionDatabase(t)
	mockSessiondb.EXPECT().GetAll(mock.Anything, boardId, []BoardSessionFilter{filter}).
		Return([]DatabaseBoardSession{}, errors.New(dbError))

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockColumnService := columns.NewMockColumnService(t)
	mockNoteService := notes.NewMockNotesService(t)

	sessionService := NewSessionService(mockSessiondb, broker, mockColumnService, mockNoteService)

	boardSessions, err := sessionService.GetAll(context.Background(), boardId, filter)

	assert.Nil(t, boardSessions)
	assert.NotNil(t, err)
	assert.Equal(t, errors.New(dbError), err)
}

func TestCreateSession(t *testing.T) {
	boardId := uuid.New()
	userId := uuid.New()

	mockSessiondb := NewMockSessionDatabase(t)
	mockSessiondb.EXPECT().Create(mock.Anything, DatabaseBoardSessionInsert{Board: boardId, User: userId, Role: common.ParticipantRole}).
		Return(DatabaseBoardSession{Board: boardId, User: userId, Role: common.ParticipantRole}, nil)

	mockBroker := realtime.NewMockClient(t)
	mockBroker.EXPECT().Publish(mock.Anything, mock.AnythingOfType("string"), mock.Anything).Return(nil)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockColumnService := columns.NewMockColumnService(t)
	mockNoteService := notes.NewMockNotesService(t)

	sessionService := NewSessionService(mockSessiondb, broker, mockColumnService, mockNoteService)

	session, err := sessionService.Create(context.Background(), boardId, userId)

	assert.Nil(t, err)
	assert.NotNil(t, session)

	assert.Equal(t, boardId, session.Board)
	assert.Equal(t, userId, session.User.ID)
	assert.Equal(t, common.ParticipantRole, session.Role)
}

func TestCreateSession_DatabaseError(t *testing.T) {
	boardId := uuid.New()
	userId := uuid.New()
	dbError := "unable to create"

	mockSessiondb := NewMockSessionDatabase(t)
	mockSessiondb.EXPECT().Create(mock.Anything, DatabaseBoardSessionInsert{Board: boardId, User: userId, Role: common.ParticipantRole}).
		Return(DatabaseBoardSession{}, errors.New(dbError))

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockColumnService := columns.NewMockColumnService(t)
	mockNoteService := notes.NewMockNotesService(t)

	sessionService := NewSessionService(mockSessiondb, broker, mockColumnService, mockNoteService)

	session, err := sessionService.Create(context.Background(), boardId, userId)

	assert.Nil(t, session)
	assert.NotNil(t, err)
	assert.Equal(t, errors.New(dbError), err)
}

func TestUpdateSession_Role(t *testing.T) {
	boardId := uuid.New()
	moderatorId := uuid.New()
	userId := uuid.New()
	firstColumnId := uuid.New()
	secondColumnId := uuid.New()
	moderatorRole := common.ModeratorRole

	mockSessiondb := NewMockSessionDatabase(t)
	mockSessiondb.EXPECT().Get(mock.Anything, boardId, moderatorId).
		Return(DatabaseBoardSession{Board: boardId, User: moderatorId, Role: common.ModeratorRole}, nil)
	mockSessiondb.EXPECT().Get(mock.Anything, boardId, userId).
		Return(DatabaseBoardSession{Board: boardId, User: userId, Role: common.ParticipantRole}, nil)
	mockSessiondb.EXPECT().Update(mock.Anything, DatabaseBoardSessionUpdate{Board: boardId, User: userId, Role: &moderatorRole}).
		Return(DatabaseBoardSession{Board: boardId, User: userId, Role: common.ModeratorRole}, nil)
	mockSessiondb.EXPECT().GetUserConnectedBoards(mock.Anything, userId).
		Return([]DatabaseBoardSession{{Board: boardId, User: userId}}, nil)

	mockBroker := realtime.NewMockClient(t)
	mockBroker.EXPECT().Publish(mock.Anything, mock.AnythingOfType("string"), mock.Anything).Return(nil)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockColumnService := columns.NewMockColumnService(t)
	mockColumnService.EXPECT().GetAll(mock.Anything, boardId).
		Return([]*columns.Column{
			{ID: firstColumnId},
			{ID: secondColumnId},
		}, nil)

	mockNoteService := notes.NewMockNotesService(t)
	mockNoteService.EXPECT().GetAll(mock.Anything, boardId, []uuid.UUID{firstColumnId, secondColumnId}).
		Return([]*notes.Note{
			{ID: uuid.New(), Position: notes.NotePosition{Column: firstColumnId, Rank: 1}},
			{ID: uuid.New(), Position: notes.NotePosition{Column: firstColumnId, Rank: 2}},
			{ID: uuid.New(), Position: notes.NotePosition{Column: secondColumnId, Rank: 1}},
			{ID: uuid.New(), Position: notes.NotePosition{Column: secondColumnId, Rank: 2}},
		}, nil)

	sessionService := NewSessionService(mockSessiondb, broker, mockColumnService, mockNoteService)

	session, err := sessionService.Update(context.Background(), BoardSessionUpdateRequest{
		Board:  boardId,
		Caller: moderatorId,
		User:   userId,
		Role:   &moderatorRole,
	})

	assert.Nil(t, err)
	assert.NotNil(t, session)

	assert.Equal(t, boardId, session.Board)
	assert.Equal(t, userId, session.User.ID)
	assert.Equal(t, common.ModeratorRole, session.Role)
}

func TestUpdateSession_RaiseHand(t *testing.T) {
	boardId := uuid.New()
	userId := uuid.New()
	firstColumnId := uuid.New()
	secondColumnId := uuid.New()
	raisedHand := true

	mockSessiondb := NewMockSessionDatabase(t)
	mockSessiondb.EXPECT().Get(mock.Anything, boardId, userId).
		Return(DatabaseBoardSession{Board: boardId, User: userId, Role: common.ParticipantRole}, nil)
	mockSessiondb.EXPECT().Update(mock.Anything, DatabaseBoardSessionUpdate{Board: boardId, User: userId, RaisedHand: &raisedHand}).
		Return(DatabaseBoardSession{Board: boardId, User: userId, RaisedHand: raisedHand}, nil)
	mockSessiondb.EXPECT().GetUserConnectedBoards(mock.Anything, userId).
		Return([]DatabaseBoardSession{{Board: boardId, User: userId}}, nil)

	mockBroker := realtime.NewMockClient(t)
	mockBroker.EXPECT().Publish(mock.Anything, mock.AnythingOfType("string"), mock.Anything).Return(nil)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockColumnService := columns.NewMockColumnService(t)
	mockColumnService.EXPECT().GetAll(mock.Anything, boardId).
		Return([]*columns.Column{
			{ID: firstColumnId},
			{ID: secondColumnId},
		}, nil)

	mockNoteService := notes.NewMockNotesService(t)
	mockNoteService.EXPECT().GetAll(mock.Anything, boardId, []uuid.UUID{firstColumnId, secondColumnId}).
		Return([]*notes.Note{
			{ID: uuid.New(), Position: notes.NotePosition{Column: firstColumnId, Rank: 1}},
			{ID: uuid.New(), Position: notes.NotePosition{Column: firstColumnId, Rank: 2}},
			{ID: uuid.New(), Position: notes.NotePosition{Column: secondColumnId, Rank: 1}},
			{ID: uuid.New(), Position: notes.NotePosition{Column: secondColumnId, Rank: 2}},
		}, nil)

	sessionService := NewSessionService(mockSessiondb, broker, mockColumnService, mockNoteService)

	session, err := sessionService.Update(context.Background(), BoardSessionUpdateRequest{
		Board:      boardId,
		Caller:     userId,
		User:       userId,
		RaisedHand: &raisedHand,
	})

	assert.Nil(t, err)
	assert.NotNil(t, session)

	assert.Equal(t, boardId, session.Board)
	assert.Equal(t, userId, session.User.ID)
	assert.Equal(t, raisedHand, session.RaisedHand)
}

func TestUpdateSession_DatbaseErrorGetModerator(t *testing.T) {
	boardId := uuid.New()
	moderatorId := uuid.New()
	userId := uuid.New()
	moderatorRole := common.ModeratorRole
	dbError := "unable to execute"

	mockSessiondb := NewMockSessionDatabase(t)
	mockSessiondb.EXPECT().Get(mock.Anything, boardId, moderatorId).Return(DatabaseBoardSession{}, errors.New(dbError))

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockColumnService := columns.NewMockColumnService(t)
	mockNoteService := notes.NewMockNotesService(t)

	sessionService := NewSessionService(mockSessiondb, broker, mockColumnService, mockNoteService)

	session, err := sessionService.Update(context.Background(), BoardSessionUpdateRequest{
		Board:  boardId,
		Caller: moderatorId,
		User:   userId,
		Role:   &moderatorRole,
	})

	assert.Nil(t, session)
	assert.NotNil(t, err)
	assert.Equal(t, fmt.Errorf("unable to get session for board: %w", errors.New(dbError)), err)
}

func TestUpdateSession_DatbaseErrorGetUserToPromote(t *testing.T) {
	boardId := uuid.New()
	moderatorId := uuid.New()
	userId := uuid.New()
	moderatorRole := common.ModeratorRole
	dbError := "unable to execute"

	mockSessiondb := NewMockSessionDatabase(t)
	mockSessiondb.EXPECT().Get(mock.Anything, boardId, moderatorId).
		Return(DatabaseBoardSession{Board: boardId, User: moderatorId, Role: common.ModeratorRole}, nil)
	mockSessiondb.EXPECT().Get(mock.Anything, boardId, userId).
		Return(DatabaseBoardSession{}, errors.New(dbError))

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockColumnService := columns.NewMockColumnService(t)
	mockNoteService := notes.NewMockNotesService(t)

	sessionService := NewSessionService(mockSessiondb, broker, mockColumnService, mockNoteService)

	session, err := sessionService.Update(context.Background(), BoardSessionUpdateRequest{
		Board:  boardId,
		Caller: moderatorId,
		User:   userId,
		Role:   &moderatorRole,
	})

	assert.Nil(t, session)
	assert.NotNil(t, err)
	assert.Equal(t, fmt.Errorf("unable to get session for board: %w", errors.New(dbError)), err)
}

func TestUpdateSession_DatabaseError(t *testing.T) {
	boardId := uuid.New()
	moderatorId := uuid.New()
	userId := uuid.New()
	moderatorRole := common.ModeratorRole
	dbError := "unable to execute"

	mockSessiondb := NewMockSessionDatabase(t)
	mockSessiondb.EXPECT().Get(mock.Anything, boardId, moderatorId).
		Return(DatabaseBoardSession{Board: boardId, User: moderatorId, Role: common.ModeratorRole}, nil)
	mockSessiondb.EXPECT().Get(mock.Anything, boardId, userId).
		Return(DatabaseBoardSession{Board: boardId, User: userId, Role: common.ParticipantRole}, nil)
	mockSessiondb.EXPECT().Update(mock.Anything, DatabaseBoardSessionUpdate{Board: boardId, User: userId, Role: &moderatorRole}).
		Return(DatabaseBoardSession{}, errors.New(dbError))

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockColumnService := columns.NewMockColumnService(t)
	mockNoteService := notes.NewMockNotesService(t)

	sessionService := NewSessionService(mockSessiondb, broker, mockColumnService, mockNoteService)

	session, err := sessionService.Update(context.Background(), BoardSessionUpdateRequest{
		Board:  boardId,
		Caller: moderatorId,
		User:   userId,
		Role:   &moderatorRole,
	})

	assert.Nil(t, session)
	assert.NotNil(t, err)
	assert.Equal(t, errors.New(dbError), err)
}

func TestUpdateSession_ErrorPromotingUserPermission(t *testing.T) {
	boardId := uuid.New()
	moderatorId := uuid.New()
	userId := uuid.New()
	moderatorRole := common.ModeratorRole

	mockSessiondb := NewMockSessionDatabase(t)
	mockSessiondb.EXPECT().Get(mock.Anything, boardId, moderatorId).
		Return(DatabaseBoardSession{Board: boardId, User: moderatorId, Role: common.ParticipantRole}, nil)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockColumnService := columns.NewMockColumnService(t)
	mockNoteService := notes.NewMockNotesService(t)

	sessionService := NewSessionService(mockSessiondb, broker, mockColumnService, mockNoteService)

	session, err := sessionService.Update(context.Background(), BoardSessionUpdateRequest{
		Board:  boardId,
		Caller: moderatorId,
		User:   userId,
		Role:   &moderatorRole,
	})

	assert.Nil(t, session)
	assert.NotNil(t, err)
	assert.Equal(t, common.ForbiddenError(errors.New("not allowed to change other users session")), err)
}

func TestUpdateSession_ErrorPromoting(t *testing.T) {
	boardId := uuid.New()
	userId := uuid.New()
	moderatorRole := common.ModeratorRole

	mockSessiondb := NewMockSessionDatabase(t)
	mockSessiondb.EXPECT().Get(mock.Anything, boardId, userId).
		Return(DatabaseBoardSession{Board: boardId, User: userId, Role: common.ParticipantRole}, nil)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockColumnService := columns.NewMockColumnService(t)
	mockNoteService := notes.NewMockNotesService(t)

	sessionService := NewSessionService(mockSessiondb, broker, mockColumnService, mockNoteService)

	session, err := sessionService.Update(context.Background(), BoardSessionUpdateRequest{
		Board:  boardId,
		Caller: userId,
		User:   userId,
		Role:   &moderatorRole,
	})

	assert.Nil(t, session)
	assert.NotNil(t, err)
	assert.Equal(t, common.ForbiddenError(errors.New("cannot promote role")), err)
}

func TestUpdateSession_ErrorChangingOwner(t *testing.T) {
	boardId := uuid.New()
	userId := uuid.New()
	moderatorRole := common.ModeratorRole

	mockSessiondb := NewMockSessionDatabase(t)
	mockSessiondb.EXPECT().Get(mock.Anything, boardId, userId).
		Return(DatabaseBoardSession{Board: boardId, User: userId, Role: common.OwnerRole}, nil)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockColumnService := columns.NewMockColumnService(t)
	mockNoteService := notes.NewMockNotesService(t)

	sessionService := NewSessionService(mockSessiondb, broker, mockColumnService, mockNoteService)

	session, err := sessionService.Update(context.Background(), BoardSessionUpdateRequest{
		Board:  boardId,
		Caller: userId,
		User:   userId,
		Role:   &moderatorRole,
	})

	assert.Nil(t, session)
	assert.NotNil(t, err)
	assert.Equal(t, common.ForbiddenError(errors.New("not allowed to change owner role")), err)
}

func TestUpdateSession_ErrorPromotingToOwner(t *testing.T) {
	boardId := uuid.New()
	userId := uuid.New()
	ownerRole := common.OwnerRole

	mockSessiondb := NewMockSessionDatabase(t)
	mockSessiondb.EXPECT().Get(mock.Anything, boardId, userId).
		Return(DatabaseBoardSession{Board: boardId, User: userId, Role: common.ModeratorRole}, nil)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockColumnService := columns.NewMockColumnService(t)
	mockNoteService := notes.NewMockNotesService(t)

	sessionService := NewSessionService(mockSessiondb, broker, mockColumnService, mockNoteService)

	session, err := sessionService.Update(context.Background(), BoardSessionUpdateRequest{
		Board:  boardId,
		Caller: userId,
		User:   userId,
		Role:   &ownerRole,
	})

	assert.Nil(t, session)
	assert.NotNil(t, err)
	assert.Equal(t, common.ForbiddenError(errors.New("not allowed to promote to owner role")), err)
}

func TestUpdateAllSessions(t *testing.T) {
	boardId := uuid.New()
	firstUserId := uuid.New()
	secondUserId := uuid.New()
	ready := true

	mockSessiondb := NewMockSessionDatabase(t)
	mockSessiondb.EXPECT().UpdateAll(mock.Anything, DatabaseBoardSessionUpdate{Board: boardId, Ready: &ready}).
		Return([]DatabaseBoardSession{
			{Board: boardId, User: firstUserId, Ready: ready},
			{Board: boardId, User: secondUserId, Ready: ready},
		}, nil)

	mockBroker := realtime.NewMockClient(t)
	mockBroker.EXPECT().Publish(mock.Anything, mock.AnythingOfType("string"), mock.Anything).Return(nil)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockColumnService := columns.NewMockColumnService(t)
	mockNoteService := notes.NewMockNotesService(t)

	sessionService := NewSessionService(mockSessiondb, broker, mockColumnService, mockNoteService)

	boardSessions, err := sessionService.UpdateAll(context.Background(), BoardSessionsUpdateRequest{Board: boardId, Ready: &ready})

	assert.Nil(t, err)
	assert.NotNil(t, boardSessions)
	assert.Len(t, boardSessions, 2)

	assert.Equal(t, boardId, boardSessions[0].Board)
	assert.Equal(t, firstUserId, boardSessions[0].User.ID)
	assert.Equal(t, ready, boardSessions[0].Ready)

	assert.Equal(t, boardId, boardSessions[1].Board)
	assert.Equal(t, secondUserId, boardSessions[1].User.ID)
	assert.Equal(t, ready, boardSessions[1].Ready)
}

func TestUpdateAllSessions_DatabaseError(t *testing.T) {
	boardId := uuid.New()
	ready := true
	dbError := "unable to execute"

	mockSessiondb := NewMockSessionDatabase(t)
	mockSessiondb.EXPECT().UpdateAll(mock.Anything, DatabaseBoardSessionUpdate{Board: boardId, Ready: &ready}).
		Return([]DatabaseBoardSession{}, errors.New(dbError))

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockColumnService := columns.NewMockColumnService(t)
	mockNoteService := notes.NewMockNotesService(t)

	sessionService := NewSessionService(mockSessiondb, broker, mockColumnService, mockNoteService)

	boardSessions, err := sessionService.UpdateAll(context.Background(), BoardSessionsUpdateRequest{Board: boardId, Ready: &ready})

	assert.Nil(t, boardSessions)
	assert.NotNil(t, err)
	assert.Equal(t, errors.New(dbError), err)
}

func TestConnectSession(t *testing.T) {
	boardId := uuid.New()
	userId := uuid.New()
	firstColumnId := uuid.New()
	secondColumnId := uuid.New()
	connected := true

	mockSessiondb := NewMockSessionDatabase(t)
	mockSessiondb.EXPECT().Update(mock.Anything, DatabaseBoardSessionUpdate{Board: boardId, User: userId, Connected: &connected}).
		Return(DatabaseBoardSession{Board: boardId, User: userId, Connected: connected}, nil)
	mockSessiondb.EXPECT().GetUserConnectedBoards(mock.Anything, userId).
		Return([]DatabaseBoardSession{{User: userId, Board: boardId}}, nil)
	mockSessiondb.EXPECT().Get(mock.Anything, boardId, userId).
		Return(DatabaseBoardSession{Board: boardId, User: userId}, nil)

	mockBroker := realtime.NewMockClient(t)
	mockBroker.EXPECT().Publish(mock.Anything, mock.AnythingOfType("string"), mock.Anything).Return(nil)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockColumnService := columns.NewMockColumnService(t)
	mockColumnService.EXPECT().GetAll(mock.Anything, boardId).
		Return([]*columns.Column{
			{ID: firstColumnId},
			{ID: secondColumnId},
		}, nil)

	mockNoteService := notes.NewMockNotesService(t)
	mockNoteService.EXPECT().GetAll(mock.Anything, boardId, []uuid.UUID{firstColumnId, secondColumnId}).
		Return([]*notes.Note{
			{ID: uuid.New(), Position: notes.NotePosition{Column: firstColumnId, Rank: 1}},
			{ID: uuid.New(), Position: notes.NotePosition{Column: firstColumnId, Rank: 2}},
			{ID: uuid.New(), Position: notes.NotePosition{Column: secondColumnId, Rank: 1}},
			{ID: uuid.New(), Position: notes.NotePosition{Column: secondColumnId, Rank: 2}},
		}, nil)

	sessionService := NewSessionService(mockSessiondb, broker, mockColumnService, mockNoteService)

	err := sessionService.Connect(context.Background(), boardId, userId)

	assert.Nil(t, err)
}

func TestConnectSession_DatabaseError(t *testing.T) {
	boardId := uuid.New()
	userId := uuid.New()
	dbError := "unable to execute"
	connected := true

	mockSessiondb := NewMockSessionDatabase(t)
	mockSessiondb.EXPECT().Update(mock.Anything, DatabaseBoardSessionUpdate{Board: boardId, User: userId, Connected: &connected}).
		Return(DatabaseBoardSession{}, errors.New(dbError))

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockColumnService := columns.NewMockColumnService(t)
	mockNoteService := notes.NewMockNotesService(t)

	sessionService := NewSessionService(mockSessiondb, broker, mockColumnService, mockNoteService)

	err := sessionService.Connect(context.Background(), boardId, userId)

	assert.NotNil(t, err)
	assert.Equal(t, errors.New(dbError), err)
}

func TestDisconnectSession(t *testing.T) {
	boardId := uuid.New()
	userId := uuid.New()
	firstColumnId := uuid.New()
	secondColumnId := uuid.New()
	connected := false

	mockSessiondb := NewMockSessionDatabase(t)
	mockSessiondb.EXPECT().Update(mock.Anything, DatabaseBoardSessionUpdate{Board: boardId, User: userId, Connected: &connected}).
		Return(DatabaseBoardSession{Board: boardId, User: userId, Connected: connected}, nil)
	mockSessiondb.EXPECT().GetUserConnectedBoards(mock.Anything, userId).
		Return([]DatabaseBoardSession{{User: userId, Board: boardId}}, nil)
	mockSessiondb.EXPECT().Get(mock.Anything, boardId, userId).
		Return(DatabaseBoardSession{Board: boardId, User: userId}, nil)

	mockBroker := realtime.NewMockClient(t)
	mockBroker.EXPECT().Publish(mock.Anything, mock.AnythingOfType("string"), mock.Anything).Return(nil)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockColumnService := columns.NewMockColumnService(t)
	mockColumnService.EXPECT().GetAll(mock.Anything, boardId).
		Return([]*columns.Column{
			{ID: firstColumnId},
			{ID: secondColumnId},
		}, nil)

	mockNoteService := notes.NewMockNotesService(t)
	mockNoteService.EXPECT().GetAll(mock.Anything, boardId, []uuid.UUID{firstColumnId, secondColumnId}).
		Return([]*notes.Note{
			{ID: uuid.New(), Position: notes.NotePosition{Column: firstColumnId, Rank: 1}},
			{ID: uuid.New(), Position: notes.NotePosition{Column: firstColumnId, Rank: 2}},
			{ID: uuid.New(), Position: notes.NotePosition{Column: secondColumnId, Rank: 1}},
			{ID: uuid.New(), Position: notes.NotePosition{Column: secondColumnId, Rank: 2}},
		}, nil)

	sessionService := NewSessionService(mockSessiondb, broker, mockColumnService, mockNoteService)

	err := sessionService.Disconnect(context.Background(), boardId, userId)

	assert.Nil(t, err)
}

func TestDisconnectSession_DatabaseError(t *testing.T) {
	boardId := uuid.New()
	userId := uuid.New()
	dbError := "unable to execute"
	connected := false

	mockSessiondb := NewMockSessionDatabase(t)
	mockSessiondb.EXPECT().Update(mock.Anything, DatabaseBoardSessionUpdate{Board: boardId, User: userId, Connected: &connected}).
		Return(DatabaseBoardSession{}, errors.New(dbError))

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockColumnService := columns.NewMockColumnService(t)
	mockNoteService := notes.NewMockNotesService(t)

	sessionService := NewSessionService(mockSessiondb, broker, mockColumnService, mockNoteService)

	err := sessionService.Disconnect(context.Background(), boardId, userId)

	assert.NotNil(t, err)
	assert.Equal(t, errors.New(dbError), err)
}

func TestSessionExists(t *testing.T) {
	boardId := uuid.New()
	userId := uuid.New()

	mockSessiondb := NewMockSessionDatabase(t)
	mockSessiondb.EXPECT().Exists(mock.Anything, boardId, userId).Return(true, nil)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockColumnService := columns.NewMockColumnService(t)
	mockNoteService := notes.NewMockNotesService(t)

	sessionService := NewSessionService(mockSessiondb, broker, mockColumnService, mockNoteService)

	exists, err := sessionService.Exists(context.Background(), boardId, userId)

	assert.Nil(t, err)
	assert.True(t, exists)
}

func TestSessionExists_DatabaseError(t *testing.T) {
	boardId := uuid.New()
	userId := uuid.New()
	dbError := "unable to execute"

	mockSessiondb := NewMockSessionDatabase(t)
	mockSessiondb.EXPECT().Exists(mock.Anything, boardId, userId).Return(false, errors.New(dbError))

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockColumnService := columns.NewMockColumnService(t)
	mockNoteService := notes.NewMockNotesService(t)

	sessionService := NewSessionService(mockSessiondb, broker, mockColumnService, mockNoteService)

	exists, err := sessionService.Exists(context.Background(), boardId, userId)

	assert.NotNil(t, err)
	assert.Equal(t, errors.New(dbError), err)
	assert.False(t, exists)
}

func TestModeratorSessionExists(t *testing.T) {
	boardId := uuid.New()
	userId := uuid.New()

	mockSessiondb := NewMockSessionDatabase(t)
	mockSessiondb.EXPECT().ModeratorExists(mock.Anything, boardId, userId).Return(true, nil)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockColumnService := columns.NewMockColumnService(t)
	mockNoteService := notes.NewMockNotesService(t)

	sessionService := NewSessionService(mockSessiondb, broker, mockColumnService, mockNoteService)

	exists, err := sessionService.ModeratorSessionExists(context.Background(), boardId, userId)

	assert.Nil(t, err)
	assert.True(t, exists)
}

func TestModeratorSessionExists_DatabaseError(t *testing.T) {
	boardId := uuid.New()
	userId := uuid.New()
	dbError := "unable to execute"

	mockSessiondb := NewMockSessionDatabase(t)
	mockSessiondb.EXPECT().ModeratorExists(mock.Anything, boardId, userId).Return(false, errors.New(dbError))

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockColumnService := columns.NewMockColumnService(t)
	mockNoteService := notes.NewMockNotesService(t)

	sessionService := NewSessionService(mockSessiondb, broker, mockColumnService, mockNoteService)

	exists, err := sessionService.ModeratorSessionExists(context.Background(), boardId, userId)

	assert.NotNil(t, err)
	assert.Equal(t, errors.New(dbError), err)
	assert.False(t, exists)
}

func TestIsParticipantBanned(t *testing.T) {
	boardId := uuid.New()
	userId := uuid.New()

	mockSessiondb := NewMockSessionDatabase(t)
	mockSessiondb.EXPECT().IsParticipantBanned(mock.Anything, boardId, userId).Return(true, nil)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockColumnService := columns.NewMockColumnService(t)
	mockNoteService := notes.NewMockNotesService(t)

	sessionService := NewSessionService(mockSessiondb, broker, mockColumnService, mockNoteService)

	banned, err := sessionService.IsParticipantBanned(context.Background(), boardId, userId)

	assert.Nil(t, err)
	assert.True(t, banned)
}

func TestIsParticipantBanned_DatabaseError(t *testing.T) {
	boardId := uuid.New()
	userId := uuid.New()
	dbError := "unable to execute"

	mockSessiondb := NewMockSessionDatabase(t)
	mockSessiondb.EXPECT().IsParticipantBanned(mock.Anything, boardId, userId).Return(false, errors.New(dbError))

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockColumnService := columns.NewMockColumnService(t)
	mockNoteService := notes.NewMockNotesService(t)

	sessionService := NewSessionService(mockSessiondb, broker, mockColumnService, mockNoteService)

	banned, err := sessionService.IsParticipantBanned(context.Background(), boardId, userId)

	assert.NotNil(t, err)
	assert.Equal(t, errors.New(dbError), err)
	assert.False(t, banned)
}

func TestFilterfromQueryString_EmptyQuery(t *testing.T) {
	mockSessiondb := NewMockSessionDatabase(t)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockColumnService := columns.NewMockColumnService(t)
	mockNoteService := notes.NewMockNotesService(t)

	sessionService := NewSessionService(mockSessiondb, broker, mockColumnService, mockNoteService)

	query := url.Values{}
	filter := sessionService.BoardSessionFilterTypeFromQueryString(query)

	assert.Equal(t, BoardSessionFilter{}, filter)
}

func TestFilterfromQueryString_Connected(t *testing.T) {
	mockSessiondb := NewMockSessionDatabase(t)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockColumnService := columns.NewMockColumnService(t)
	mockNoteService := notes.NewMockNotesService(t)

	sessionService := NewSessionService(mockSessiondb, broker, mockColumnService, mockNoteService)

	connected := true
	query := url.Values{}
	query.Add("connected", "true")
	filter := sessionService.BoardSessionFilterTypeFromQueryString(query)

	assert.Equal(t, BoardSessionFilter{Connected: &connected}, filter)
}

func TestFilterfromQueryString_Ready(t *testing.T) {
	mockSessiondb := NewMockSessionDatabase(t)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockColumnService := columns.NewMockColumnService(t)
	mockNoteService := notes.NewMockNotesService(t)

	sessionService := NewSessionService(mockSessiondb, broker, mockColumnService, mockNoteService)

	ready := true
	query := url.Values{}
	query.Add("ready", "true")
	filter := sessionService.BoardSessionFilterTypeFromQueryString(query)

	assert.Equal(t, BoardSessionFilter{Ready: &ready}, filter)
}

func TestFilterfromQueryString_Raisedhand(t *testing.T) {
	mockSessiondb := NewMockSessionDatabase(t)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockColumnService := columns.NewMockColumnService(t)
	mockNoteService := notes.NewMockNotesService(t)

	sessionService := NewSessionService(mockSessiondb, broker, mockColumnService, mockNoteService)

	raisedHand := true
	query := url.Values{}
	query.Add("raisedHand", "true")
	filter := sessionService.BoardSessionFilterTypeFromQueryString(query)

	assert.Equal(t, BoardSessionFilter{RaisedHand: &raisedHand}, filter)
}

func TestFilterfromQueryString_Role(t *testing.T) {
	mockSessiondb := NewMockSessionDatabase(t)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockColumnService := columns.NewMockColumnService(t)
	mockNoteService := notes.NewMockNotesService(t)

	sessionService := NewSessionService(mockSessiondb, broker, mockColumnService, mockNoteService)

	role := common.OwnerRole
	query := url.Values{}
	query.Add("role", "OWNER")
	filter := sessionService.BoardSessionFilterTypeFromQueryString(query)

	assert.Equal(t, BoardSessionFilter{Role: &role}, filter)
}
