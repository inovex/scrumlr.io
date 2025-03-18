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
	"scrumlr.io/server/common"
	brokerMock "scrumlr.io/server/mocks/realtime"
	"scrumlr.io/server/realtime"
)

func TestGetSession(t *testing.T) {
	boardId := uuid.New()
	userId := uuid.New()

	mockSessiondb := NewMockSessionDatabase(t)
	mockSessiondb.EXPECT().GetBoardSession(boardId, userId).Return(DatabaseBoardSession{Board: boardId, User: userId}, nil)

	mockBroker := brokerMock.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	sessionService := NewSessionService(mockSessiondb, broker)

	session, err := sessionService.Get(context.Background(), boardId, userId)

	assert.Nil(t, err)
	assert.NotNil(t, session)
}

func TestGetSession_NotFound(t *testing.T) {
	boardId := uuid.New()
	userId := uuid.New()

	mockSessiondb := NewMockSessionDatabase(t)
	mockSessiondb.EXPECT().GetBoardSession(boardId, userId).Return(DatabaseBoardSession{}, sql.ErrNoRows)

	mockBroker := brokerMock.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	sessionService := NewSessionService(mockSessiondb, broker)

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
	mockSessiondb.EXPECT().GetBoardSession(boardId, userId).Return(DatabaseBoardSession{}, errors.New(dbError))

	mockBroker := brokerMock.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	sessionService := NewSessionService(mockSessiondb, broker)

	session, err := sessionService.Get(context.Background(), boardId, userId)

	assert.Nil(t, session)
	assert.NotNil(t, err)
	assert.Equal(t, fmt.Errorf("unable to get session for board: %w", errors.New(dbError)), err)
}

func TestListSessions(t *testing.T) {
	boardId := uuid.New()
	filter := BoardSessionFilter{}

	mockSessiondb := NewMockSessionDatabase(t)
	mockSessiondb.EXPECT().GetBoardSessions(boardId, filter).
		Return([]DatabaseBoardSession{DatabaseBoardSession{Board: boardId}, DatabaseBoardSession{Board: boardId}}, nil)

	mockBroker := brokerMock.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	sessionService := NewSessionService(mockSessiondb, broker)

	boardSessions, err := sessionService.List(context.Background(), boardId, filter)

	assert.Nil(t, err)
	assert.NotNil(t, boardSessions)
}

func TestListSessions_WithFilterConnected(t *testing.T) {
	boardId := uuid.New()
	connected := true
	filter := BoardSessionFilter{Connected: &connected}

	mockSessiondb := NewMockSessionDatabase(t)
	mockSessiondb.EXPECT().GetBoardSessions(boardId, filter).
		Return([]DatabaseBoardSession{DatabaseBoardSession{Board: boardId, Connected: connected}, DatabaseBoardSession{Board: boardId, Connected: connected}}, nil)

	mockBroker := brokerMock.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	sessionService := NewSessionService(mockSessiondb, broker)

	boardSessions, err := sessionService.List(context.Background(), boardId, filter)

	assert.Nil(t, err)
	assert.NotNil(t, boardSessions)
}

func TestListSessions_WithFilterReady(t *testing.T) {
	boardId := uuid.New()
	ready := true
	filter := BoardSessionFilter{Ready: &ready}

	mockSessiondb := NewMockSessionDatabase(t)
	mockSessiondb.EXPECT().GetBoardSessions(boardId, filter).
		Return([]DatabaseBoardSession{DatabaseBoardSession{Board: boardId, Ready: ready}, DatabaseBoardSession{Board: boardId, Ready: ready}}, nil)

	mockBroker := brokerMock.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	sessionService := NewSessionService(mockSessiondb, broker)

	boardSessions, err := sessionService.List(context.Background(), boardId, filter)

	assert.Nil(t, err)
	assert.NotNil(t, boardSessions)
}

func TestListSessions_WithFilterRaisedHand(t *testing.T) {
	boardId := uuid.New()
	raisedHand := true
	filter := BoardSessionFilter{RaisedHand: &raisedHand}

	mockSessiondb := NewMockSessionDatabase(t)
	mockSessiondb.EXPECT().GetBoardSessions(boardId, filter).
		Return([]DatabaseBoardSession{DatabaseBoardSession{Board: boardId, RaisedHand: raisedHand}, DatabaseBoardSession{Board: boardId, RaisedHand: raisedHand}}, nil)

	mockBroker := brokerMock.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	sessionService := NewSessionService(mockSessiondb, broker)

	boardSessions, err := sessionService.List(context.Background(), boardId, filter)

	assert.Nil(t, err)
	assert.NotNil(t, boardSessions)
}

func TestListSessions_WithFilterRole(t *testing.T) {
	boardId := uuid.New()
	moderatorRole := SessionRoleModerator
	filter := BoardSessionFilter{Role: &moderatorRole}

	mockSessiondb := NewMockSessionDatabase(t)
	mockSessiondb.EXPECT().GetBoardSessions(boardId, filter).
		Return([]DatabaseBoardSession{DatabaseBoardSession{Board: boardId, Role: SessionRoleModerator}, DatabaseBoardSession{Board: boardId, Role: SessionRoleModerator}}, nil)

	mockBroker := brokerMock.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	sessionService := NewSessionService(mockSessiondb, broker)

	boardSessions, err := sessionService.List(context.Background(), boardId, filter)

	assert.Nil(t, err)
	assert.NotNil(t, boardSessions)
}

func TestListSessions_DatabaseError(t *testing.T) {
	boardId := uuid.New()
	dbError := "unable to execute"
	filter := BoardSessionFilter{}

	mockSessiondb := NewMockSessionDatabase(t)
	mockSessiondb.EXPECT().GetBoardSessions(boardId, filter).
		Return([]DatabaseBoardSession{}, errors.New(dbError))

	mockBroker := brokerMock.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	sessionService := NewSessionService(mockSessiondb, broker)

	boardSessions, err := sessionService.List(context.Background(), boardId, filter)

	assert.Nil(t, boardSessions)
	assert.NotNil(t, err)
	assert.Equal(t, errors.New(dbError), nil)
}

func TestCreateSession(t *testing.T) {
	boardId := uuid.New()
	userId := uuid.New()

	mockSessiondb := NewMockSessionDatabase(t)
	mockSessiondb.EXPECT().CreateBoardSession(DatabaseBoardSessionInsert{Board: boardId, User: userId, Role: SessionRoleParticipant}).
		Return(DatabaseBoardSession{Board: boardId, User: userId, Role: SessionRoleParticipant}, nil)

	mockBroker := brokerMock.NewMockClient(t)
	mockBroker.EXPECT().Publish(mock.AnythingOfType("string"), mock.Anything).Return(nil)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	sessionService := NewSessionService(mockSessiondb, broker)

	session, err := sessionService.Create(context.Background(), boardId, userId)

	assert.Nil(t, err)
	assert.NotNil(t, session)
}

func TestCreateSession_DatabaseError(t *testing.T) {
	boardId := uuid.New()
	userId := uuid.New()
	dbError := "unable to create"

	mockSessiondb := NewMockSessionDatabase(t)
	mockSessiondb.EXPECT().CreateBoardSession(DatabaseBoardSessionInsert{Board: boardId, User: userId, Role: SessionRoleParticipant}).
		Return(DatabaseBoardSession{}, errors.New(dbError))

	mockBroker := brokerMock.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	sessionService := NewSessionService(mockSessiondb, broker)

	session, err := sessionService.Create(context.Background(), boardId, userId)

	assert.Nil(t, session)
	assert.NotNil(t, err)
	assert.Equal(t, fmt.Errorf("unable to create board session", "board", boardId, "user", userId, "error", dbError), err)
}

func TestUpdateSession_Role(t *testing.T) {
	boardId := uuid.New()
	moderatorId := uuid.New()
	userId := uuid.New()
	moderatorRole := SessionRoleModerator

	mockSessiondb := NewMockSessionDatabase(t)
	mockSessiondb.EXPECT().GetBoardSession(boardId, moderatorId).
		Return(DatabaseBoardSession{Board: boardId, User: moderatorId, Role: SessionRoleModerator}, nil)
	mockSessiondb.EXPECT().GetBoardSession(boardId, userId).
		Return(DatabaseBoardSession{Board: boardId, User: userId, Role: SessionRoleParticipant}, nil)
	mockSessiondb.EXPECT().UpdateBoardSession(DatabaseBoardSessionUpdate{Board: boardId, User: userId, Role: &moderatorRole}).
		Return(DatabaseBoardSession{Board: boardId, User: userId, Role: SessionRoleModerator}, nil)

	mockBroker := brokerMock.NewMockClient(t)
	mockBroker.EXPECT().Publish(mock.AnythingOfType("string"), mock.Anything).Return(nil)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	sessionService := NewSessionService(mockSessiondb, broker)

	session, err := sessionService.Update(context.Background(), BoardSessionUpdateRequest{
		Board:  boardId,
		Caller: moderatorId,
		User:   userId,
		Role:   &moderatorRole,
	})

	assert.Nil(t, err)
	assert.NotNil(t, session)
}

func TestUpdateSession_RaiseHand(t *testing.T) {
	boardId := uuid.New()
	userId := uuid.New()
	raisedHand := true

	mockSessiondb := NewMockSessionDatabase(t)
	mockSessiondb.EXPECT().GetBoardSession(boardId, userId).
		Return(DatabaseBoardSession{Board: boardId, User: userId, Role: SessionRoleParticipant}, nil)
	mockSessiondb.EXPECT().UpdateBoardSession(DatabaseBoardSessionUpdate{Board: boardId, User: userId, RaisedHand: &raisedHand}).
		Return(DatabaseBoardSession{Board: boardId, User: userId, RaisedHand: raisedHand}, nil)

	mockBroker := brokerMock.NewMockClient(t)
	mockBroker.EXPECT().Publish(mock.AnythingOfType("string"), mock.Anything).Return(nil)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	sessionService := NewSessionService(mockSessiondb, broker)

	session, err := sessionService.Update(context.Background(), BoardSessionUpdateRequest{
		Board:      boardId,
		Caller:     userId,
		User:       userId,
		RaisedHand: &raisedHand,
	})

	assert.Nil(t, err)
	assert.NotNil(t, session)
}

func TestUpdateSession_DatbaseErrorGetModerator(t *testing.T) {
	boardId := uuid.New()
	moderatorId := uuid.New()
	userId := uuid.New()
	moderatorRole := SessionRoleModerator
	dbError := "unable to execute"

	mockSessiondb := NewMockSessionDatabase(t)
	mockSessiondb.EXPECT().GetBoardSession(boardId, moderatorId).Return(DatabaseBoardSession{}, errors.New(dbError))

	mockBroker := brokerMock.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	sessionService := NewSessionService(mockSessiondb, broker)

	session, err := sessionService.Update(context.Background(), BoardSessionUpdateRequest{
		Board:  boardId,
		Caller: moderatorId,
		User:   userId,
		Role:   &moderatorRole,
	})

	assert.Nil(t, session)
	assert.NotNil(t, err)
	assert.Equal(t, fmt.Errorf("unable to get session for board: %w", dbError), err)
}

func TestUpdateSession_DatbaseErrorGetUserToPromote(t *testing.T) {
	boardId := uuid.New()
	moderatorId := uuid.New()
	userId := uuid.New()
	moderatorRole := SessionRoleModerator
	dbError := "unable to execute"

	mockSessiondb := NewMockSessionDatabase(t)
	mockSessiondb.EXPECT().GetBoardSession(boardId, moderatorId).
		Return(DatabaseBoardSession{Board: boardId, User: moderatorId, Role: SessionRoleModerator}, nil)
	mockSessiondb.EXPECT().GetBoardSession(boardId, userId).
		Return(DatabaseBoardSession{}, errors.New(dbError))

	mockBroker := brokerMock.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	sessionService := NewSessionService(mockSessiondb, broker)

	session, err := sessionService.Update(context.Background(), BoardSessionUpdateRequest{
		Board:  boardId,
		Caller: moderatorId,
		User:   userId,
		Role:   &moderatorRole,
	})

	assert.Nil(t, session)
	assert.NotNil(t, err)
	assert.Equal(t, fmt.Errorf("unable to get session for board: %w", dbError), err)
}

func TestUpdateSession_DatabaseError(t *testing.T) {
	boardId := uuid.New()
	moderatorId := uuid.New()
	userId := uuid.New()
	moderatorRole := SessionRoleModerator
	dbError := "unable to execute"

	mockSessiondb := NewMockSessionDatabase(t)
	mockSessiondb.EXPECT().GetBoardSession(boardId, moderatorId).
		Return(DatabaseBoardSession{Board: boardId, User: moderatorId, Role: SessionRoleModerator}, nil)
	mockSessiondb.EXPECT().GetBoardSession(boardId, userId).
		Return(DatabaseBoardSession{Board: boardId, User: userId, Role: SessionRoleParticipant}, nil)
	mockSessiondb.EXPECT().UpdateBoardSession(DatabaseBoardSessionUpdate{Board: boardId, User: userId, Role: &moderatorRole}).
		Return(DatabaseBoardSession{}, errors.New(dbError))

	mockBroker := brokerMock.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	sessionService := NewSessionService(mockSessiondb, broker)

	session, err := sessionService.Update(context.Background(), BoardSessionUpdateRequest{
		Board:  boardId,
		Caller: moderatorId,
		User:   userId,
		Role:   &moderatorRole,
	})

	assert.Nil(t, session)
	assert.NotNil(t, err)
	assert.Equal(t, fmt.Errorf("unable to update board session", "board", boardId, "error", dbError), err)
}

func TestUpdateSession_ErrorPromotingUserPermission(t *testing.T) {
	boardId := uuid.New()
	moderatorId := uuid.New()
	userId := uuid.New()
	moderatorRole := SessionRoleModerator

	mockSessiondb := NewMockSessionDatabase(t)
	mockSessiondb.EXPECT().GetBoardSession(boardId, moderatorId).
		Return(DatabaseBoardSession{Board: boardId, User: moderatorId, Role: SessionRoleParticipant}, nil)

	mockBroker := brokerMock.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	sessionService := NewSessionService(mockSessiondb, broker)

	session, err := sessionService.Update(context.Background(), BoardSessionUpdateRequest{
		Board:  boardId,
		Caller: moderatorId,
		User:   userId,
		Role:   &moderatorRole,
	})

	assert.Nil(t, session)
	assert.NotNil(t, err)
	assert.Equal(t, fmt.Errorf("not allowed to change other users session"), err)
}

func TestUpdateSession_ErrorPromoting(t *testing.T) {
	boardId := uuid.New()
	userId := uuid.New()
	moderatorRole := SessionRoleModerator

	mockSessiondb := NewMockSessionDatabase(t)
	mockSessiondb.EXPECT().GetBoardSession(boardId, userId).
		Return(DatabaseBoardSession{Board: boardId, User: userId, Role: SessionRoleParticipant}, nil)

	mockBroker := brokerMock.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	sessionService := NewSessionService(mockSessiondb, broker)

	session, err := sessionService.Update(context.Background(), BoardSessionUpdateRequest{
		Board:  boardId,
		Caller: userId,
		User:   userId,
		Role:   &moderatorRole,
	})

	assert.Nil(t, session)
	assert.NotNil(t, err)
	assert.Equal(t, errors.New("cannot promote role"), err)
}

func TestUpdateSession_ErrorChangingOwner(t *testing.T) {
	boardId := uuid.New()
	userId := uuid.New()
	moderatorRole := SessionRoleModerator

	mockSessiondb := NewMockSessionDatabase(t)
	mockSessiondb.EXPECT().GetBoardSession(boardId, userId).
		Return(DatabaseBoardSession{Board: boardId, User: userId, Role: SessionRoleOwner}, nil)

	mockBroker := brokerMock.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	sessionService := NewSessionService(mockSessiondb, broker)

	session, err := sessionService.Update(context.Background(), BoardSessionUpdateRequest{
		Board:  boardId,
		Caller: userId,
		User:   userId,
		Role:   &moderatorRole,
	})

	assert.Nil(t, session)
	assert.NotNil(t, err)
	assert.Equal(t, errors.New("not allowed to change owner role"), err)
}

func TestUpdateSession_ErrorPromotingToOwner(t *testing.T) {
	boardId := uuid.New()
	userId := uuid.New()
	ownerRole := SessionRoleOwner

	mockSessiondb := NewMockSessionDatabase(t)
	mockSessiondb.EXPECT().GetBoardSession(boardId, userId).
		Return(DatabaseBoardSession{Board: boardId, User: userId, Role: SessionRoleModerator}, nil)

	mockBroker := brokerMock.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	sessionService := NewSessionService(mockSessiondb, broker)

	session, err := sessionService.Update(context.Background(), BoardSessionUpdateRequest{
		Board:  boardId,
		Caller: userId,
		User:   userId,
		Role:   &ownerRole,
	})

	assert.Nil(t, session)
	assert.NotNil(t, err)
	assert.Equal(t, errors.New("not allowed to promote to owner role"), err)
}

func TestUpdateAllSessions(t *testing.T) {
	boardId := uuid.New()
	ready := true

	mockSessiondb := NewMockSessionDatabase(t)
	mockSessiondb.EXPECT().UpdateBoardSessions(DatabaseBoardSessionUpdate{Board: boardId, Ready: &ready}).
		Return([]DatabaseBoardSession{DatabaseBoardSession{Board: boardId, User: uuid.New(), Ready: ready}, DatabaseBoardSession{Board: boardId, User: uuid.New(), Ready: ready}}, nil)

	mockBroker := brokerMock.NewMockClient(t)
	mockBroker.EXPECT().Publish(mock.AnythingOfType("string"), mock.Anything).Return(nil)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	sessionService := NewSessionService(mockSessiondb, broker)

	boardSessions, err := sessionService.UpdateAll(context.Background(), BoardSessionsUpdateRequest{Board: boardId, Ready: &ready})

	assert.Nil(t, err)
	assert.NotNil(t, boardSessions)
}

func TestUpdateAllSessions_DatabaseError(t *testing.T) {
	boardId := uuid.New()
	ready := true
	dbError := "unable to execute"

	mockSessiondb := NewMockSessionDatabase(t)
	mockSessiondb.EXPECT().UpdateBoardSessions(DatabaseBoardSessionUpdate{Board: boardId, Ready: &ready}).
		Return([]DatabaseBoardSession{}, errors.New(dbError))

	mockBroker := brokerMock.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	sessionService := NewSessionService(mockSessiondb, broker)

	boardSessions, err := sessionService.UpdateAll(context.Background(), BoardSessionsUpdateRequest{Board: boardId, Ready: &ready})

	assert.Nil(t, boardSessions)
	assert.NotNil(t, err)
	assert.Equal(t, errors.New(dbError), err)
}

func TestConnectSession(t *testing.T) {
	boardId := uuid.New()
	userId := uuid.New()
	connected := true

	mockSessiondb := NewMockSessionDatabase(t)
	mockSessiondb.EXPECT().UpdateBoardSession(DatabaseBoardSessionUpdate{Board: boardId, User: userId, Connected: &connected}).
		Return(DatabaseBoardSession{Board: boardId, User: userId, Connected: connected}, nil)

	mockBroker := brokerMock.NewMockClient(t)
	mockBroker.EXPECT().Publish(mock.AnythingOfType("string"), mock.Anything).Return(nil)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	sessionService := NewSessionService(mockSessiondb, broker)

	err := sessionService.Connect(context.Background(), boardId, userId)

	assert.Nil(t, err)
}

func TestConnectSession_DatabaseError(t *testing.T) {
	boardId := uuid.New()
	userId := uuid.New()
	dbError := "unable to execute"
	connected := true

	mockSessiondb := NewMockSessionDatabase(t)
	mockSessiondb.EXPECT().UpdateBoardSession(DatabaseBoardSessionUpdate{Board: boardId, User: userId, Connected: &connected}).
		Return(DatabaseBoardSession{}, errors.New(dbError))

	mockBroker := brokerMock.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	sessionService := NewSessionService(mockSessiondb, broker)

	err := sessionService.Connect(context.Background(), boardId, userId)

	assert.NotNil(t, err)
	assert.Equal(t, errors.New(dbError), err)
}

func TestDisconnectSession(t *testing.T) {
	boardId := uuid.New()
	userId := uuid.New()
	connected := false

	mockSessiondb := NewMockSessionDatabase(t)
	mockSessiondb.EXPECT().UpdateBoardSession(DatabaseBoardSessionUpdate{Board: boardId, User: userId, Connected: &connected}).
		Return(DatabaseBoardSession{Board: boardId, User: userId, Connected: connected}, nil)

	mockBroker := brokerMock.NewMockClient(t)
	mockBroker.EXPECT().Publish(mock.AnythingOfType("string"), mock.Anything).Return(nil)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	sessionService := NewSessionService(mockSessiondb, broker)

	err := sessionService.Disconnect(context.Background(), boardId, userId)

	assert.Nil(t, err)
}

func TestDisconnectSession_DatabaseError(t *testing.T) {
	boardId := uuid.New()
	userId := uuid.New()
	dbError := "unable to execute"
	connected := false

	mockSessiondb := NewMockSessionDatabase(t)
	mockSessiondb.EXPECT().UpdateBoardSession(DatabaseBoardSessionUpdate{Board: boardId, User: userId, Connected: &connected}).
		Return(DatabaseBoardSession{}, errors.New(dbError))

	mockBroker := brokerMock.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	sessionService := NewSessionService(mockSessiondb, broker)

	err := sessionService.Disconnect(context.Background(), boardId, userId)

	assert.NotNil(t, err)
	assert.Equal(t, errors.New(dbError), err)
}

func TestSessionExists(t *testing.T) {
	boardId := uuid.New()
	userId := uuid.New()

	mockSessiondb := NewMockSessionDatabase(t)
	mockSessiondb.EXPECT().BoardSessionExists(boardId, userId).Return(true, nil)

	mockBroker := brokerMock.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	sessionService := NewSessionService(mockSessiondb, broker)

	exists, err := sessionService.SessionExists(context.Background(), boardId, userId)

	assert.Nil(t, err)
	assert.True(t, exists)
}

func TestSessionExists_DatabaseError(t *testing.T) {
	boardId := uuid.New()
	userId := uuid.New()
	dbError := "unable to execute"

	mockSessiondb := NewMockSessionDatabase(t)
	mockSessiondb.EXPECT().BoardSessionExists(boardId, userId).Return(false, errors.New(dbError))

	mockBroker := brokerMock.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	sessionService := NewSessionService(mockSessiondb, broker)

	exists, err := sessionService.SessionExists(context.Background(), boardId, userId)

	assert.NotNil(t, err)
	assert.Equal(t, errors.New(dbError), err)
	assert.False(t, exists)
}

func TestModeratorSessionExists(t *testing.T) {
	boardId := uuid.New()
	userId := uuid.New()

	mockSessiondb := NewMockSessionDatabase(t)
	mockSessiondb.EXPECT().BoardModeratorSessionExists(boardId, userId).Return(true, nil)

	mockBroker := brokerMock.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	sessionService := NewSessionService(mockSessiondb, broker)

	exists, err := sessionService.ModeratorSessionExists(context.Background(), boardId, userId)

	assert.Nil(t, err)
	assert.True(t, exists)
}

func TestModeratorSessionExists_DatabaseError(t *testing.T) {
	boardId := uuid.New()
	userId := uuid.New()
	dbError := "unable to execute"

	mockSessiondb := NewMockSessionDatabase(t)
	mockSessiondb.EXPECT().BoardModeratorSessionExists(boardId, userId).Return(false, errors.New(dbError))

	mockBroker := brokerMock.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	sessionService := NewSessionService(mockSessiondb, broker)

	exists, err := sessionService.ModeratorSessionExists(context.Background(), boardId, userId)

	assert.NotNil(t, err)
	assert.Equal(t, errors.New(dbError), err)
	assert.False(t, exists)
}

func TestParticipantBanned(t *testing.T) {
	boardId := uuid.New()
	userId := uuid.New()

	mockSessiondb := NewMockSessionDatabase(t)
	mockSessiondb.EXPECT().BoardModeratorSessionExists(boardId, userId).Return(true, nil)

	mockBroker := brokerMock.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	sessionService := NewSessionService(mockSessiondb, broker)

	exists, err := sessionService.ParticipantBanned(context.Background(), boardId, userId)

	assert.Nil(t, err)
	assert.True(t, exists)
}

func TestParticipantBanned_DatabaseError(t *testing.T) {
	boardId := uuid.New()
	userId := uuid.New()
	dbError := "unable to execute"

	mockSessiondb := NewMockSessionDatabase(t)
	mockSessiondb.EXPECT().BoardModeratorSessionExists(boardId, userId).Return(false, errors.New(dbError))

	mockBroker := brokerMock.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	sessionService := NewSessionService(mockSessiondb, broker)

	exists, err := sessionService.ParticipantBanned(context.Background(), boardId, userId)

	assert.NotNil(t, err)
	assert.Equal(t, errors.New(dbError), err)
	assert.False(t, exists)
}

func TestFilterfromQueryString_EmptyQuery(t *testing.T) {
	mockSessiondb := NewMockSessionDatabase(t)
	mockBroker := brokerMock.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	sessionService := NewSessionService(mockSessiondb, broker)

	query := url.Values{}
	filter := sessionService.BoardSessionFilterTypeFromQueryString(query)

	assert.Equal(t, BoardSessionFilter{}, filter)
}

func TestFilterfromQueryString_Connected(t *testing.T) {
	mockSessiondb := NewMockSessionDatabase(t)
	mockBroker := brokerMock.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	sessionService := NewSessionService(mockSessiondb, broker)

	connected := true
	query := url.Values{}
	query.Add("connected", "true")
	filter := sessionService.BoardSessionFilterTypeFromQueryString(query)

	assert.Equal(t, BoardSessionFilter{Connected: &connected}, filter)
}

func TestFilterfromQueryString_Ready(t *testing.T) {
	mockSessiondb := NewMockSessionDatabase(t)
	mockBroker := brokerMock.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	sessionService := NewSessionService(mockSessiondb, broker)

	ready := true
	query := url.Values{}
	query.Add("ready", "true")
	filter := sessionService.BoardSessionFilterTypeFromQueryString(query)

	assert.Equal(t, BoardSessionFilter{Ready: &ready}, filter)
}

func TestFilterfromQueryString_Raisedhand(t *testing.T) {
	mockSessiondb := NewMockSessionDatabase(t)
	mockBroker := brokerMock.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	sessionService := NewSessionService(mockSessiondb, broker)

	raisedHand := true
	query := url.Values{}
	query.Add("raisedHand", "true")
	filter := sessionService.BoardSessionFilterTypeFromQueryString(query)

	assert.Equal(t, BoardSessionFilter{RaisedHand: &raisedHand}, filter)
}

func TestFilterfromQueryString_Role(t *testing.T) {
	mockSessiondb := NewMockSessionDatabase(t)
	mockBroker := brokerMock.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	sessionService := NewSessionService(mockSessiondb, broker)

	role := SessionRoleOwner
	query := url.Values{}
	query.Add("role", "OWNER")
	filter := sessionService.BoardSessionFilterTypeFromQueryString(query)

	assert.Equal(t, BoardSessionFilter{Role: &role}, filter)
}
