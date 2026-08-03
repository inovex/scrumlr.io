package sessionrequests

import (
	"context"
	"errors"
	"fmt"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"scrumlr.io/server/realtime"
	"scrumlr.io/server/websocket"
)

// mock connection implementing websocket.Connection
type mockConn struct{}

func (m *mockConn) WriteJSON(ctx context.Context, data any) error { return nil }
func (m *mockConn) Read(ctx context.Context) (websocket.MessageType, []byte, error) {
	return websocket.MessageText, nil, nil
}
func (m *mockConn) Close(reason string) error { return nil }

func TestListenOnBoardSessionRequest_RetriesThenSucceeds(t *testing.T) {
	boardID := uuid.New()
	userID := uuid.New()
	conn := &mockConn{}

	successChan := make(chan *realtime.BoardSessionRequestEventType, 1)
	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockBroker.EXPECT().SubscribeToBoardSessionEvents(mock.Anything, fmt.Sprintf("request.%s.%s", boardID, userID)).Return(nil, errors.New("nats down")).Times(2)
	mockBroker.EXPECT().SubscribeToBoardSessionEvents(mock.Anything, fmt.Sprintf("request.%s.%s", boardID, userID)).Return(successChan, nil).Once()

	socket := &sessionRequestWebsocket{
		websocketService:                 nil,
		realtime:                         *broker,
		boardSessionRequestSubscriptions: make(map[uuid.UUID]*BoardSessionRequestSubscription),
	}

	retryDelay := time.Millisecond * 10
	socket.listenOnBoardSessionRequest(boardID, userID, conn, retryDelay)

	mockBroker.AssertExpectations(t)

	sub := socket.boardSessionRequestSubscriptions[boardID]
	if assert.NotNil(t, sub) {
		assert.Equal(t, successChan, sub.subscriptions[userID])
	}
}

func TestListenOnBoardSessionRequest_FailsAllRetries(t *testing.T) {
	boardID := uuid.New()
	userID := uuid.New()
	conn := &mockConn{}

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockBroker.EXPECT().SubscribeToBoardSessionEvents(mock.Anything, fmt.Sprintf("request.%s.%s", boardID, userID)).Return(nil, errors.New("nats down")).Times(MaxRetries)

	socket := &sessionRequestWebsocket{
		websocketService:                 nil,
		realtime:                         *broker,
		boardSessionRequestSubscriptions: make(map[uuid.UUID]*BoardSessionRequestSubscription),
	}

	retryDelay := time.Millisecond * 10
	socket.listenOnBoardSessionRequest(boardID, userID, conn, retryDelay)

	mockBroker.AssertExpectations(t)

	sub := socket.boardSessionRequestSubscriptions[boardID]
	if assert.NotNil(t, sub) {
		_, exists := sub.subscriptions[userID]
		assert.False(t, exists, "subscription should not exist after exhausting retries")
	}
}

func TestListenOnBoardSessionRequest_AlreadySubscribed(t *testing.T) {
	boardID := uuid.New()
	userID := uuid.New()
	conn := &mockConn{}

	existingChan := make(chan *realtime.BoardSessionRequestEventType, 1)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	socket := &sessionRequestWebsocket{
		websocketService: nil,
		realtime:         *broker,
		boardSessionRequestSubscriptions: map[uuid.UUID]*BoardSessionRequestSubscription{
			boardID: {
				clients:       map[uuid.UUID]websocket.Connection{userID: conn},
				subscriptions: map[uuid.UUID]chan *realtime.BoardSessionRequestEventType{userID: existingChan},
			},
		},
	}

	retryDelay := time.Millisecond * 10
	socket.listenOnBoardSessionRequest(boardID, userID, conn, retryDelay)

	// no expectations to assert on mockBroker; just ensure existing subscription unchanged
	sub := socket.boardSessionRequestSubscriptions[boardID]
	if assert.NotNil(t, sub) {
		assert.Equal(t, existingChan, sub.subscriptions[userID])
	}
}
