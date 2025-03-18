package sessions

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
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
	dbError := "nable to execute"

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
	mockSessiondb.EXPECT().GetBoardSessions(boardId, filter).Return([]DatabaseBoardSession{}, nil)

	mockBroker := brokerMock.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	sessionService := NewSessionService(mockSessiondb, broker)

	boardSessions, err := sessionService.List(context.Background(), boardId, filter)

	assert.Nil(t, err)
	assert.NotNil(t, boardSessions)

}
