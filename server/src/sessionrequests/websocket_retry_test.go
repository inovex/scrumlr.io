package sessionrequests

import (
	"context"
	"errors"
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
	original := SleepBetweenRetries
	SleepBetweenRetries = time.Millisecond * 10
	defer func() { SleepBetweenRetries = original }()

	boardID := uuid.New()
	userID := uuid.New()
	conn := &mockConn{}

	successChan := make(chan *realtime.BoardSessionRequestEventType, 1)
	mockBroker := new(realtime.MockBrokerInterface)

	// fail 2 times, then succeed
	mockBroker.On("GetBoardSessionRequestChannel", mock.Anything, boardID, userID).Return(nil, errors.New("nats down")).Times(2)
	mockBroker.On("GetBoardSessionRequestChannel", mock.Anything, boardID, userID).Return(successChan, nil).Once()

	socket := &sessionRequestWebsocket{
		websocketService:                 nil,
		realtime:                         mockBroker,
		boardSessionRequestSubscriptions: make(map[uuid.UUID]*BoardSessionRequestSubscription),
	}

	socket.listenOnBoardSessionRequest(boardID, userID, conn)

	mockBroker.AssertExpectations(t)

	sub := socket.boardSessionRequestSubscriptions[boardID]
	if assert.NotNil(t, sub) {
		assert.Equal(t, successChan, sub.subscriptions[userID])
	}
}

// 2) Fails all retries and does not store a subscription
func TestListenOnBoardSessionRequest_FailsAllRetries(t *testing.T) {
	original := SleepBetweenRetries
	SleepBetweenRetries = time.Millisecond * 10
	defer func() { SleepBetweenRetries = original }()

	boardID := uuid.New()
	userID := uuid.New()
	conn := &mockConn{}

	mockBroker := new(realtime.MockBrokerInterface)

	// always fail
	mockBroker.On("GetBoardSessionRequestChannel", mock.Anything, boardID, userID).Return(nil, errors.New("nats down")).Times(MaxRetries)

	socket := &sessionRequestWebsocket{
		websocketService:                 nil,
		realtime:                         mockBroker,
		boardSessionRequestSubscriptions: make(map[uuid.UUID]*BoardSessionRequestSubscription),
	}

	socket.listenOnBoardSessionRequest(boardID, userID, conn)

	mockBroker.AssertExpectations(t)

	sub := socket.boardSessionRequestSubscriptions[boardID]
	if assert.NotNil(t, sub) {
		_, exists := sub.subscriptions[userID]
		assert.False(t, exists, "subscription should not exist after exhausting retries")
	}
}

// 3) If subscription already exists, no call to broker should be made
func TestListenOnBoardSessionRequest_AlreadySubscribed(t *testing.T) {
	boardID := uuid.New()
	userID := uuid.New()
	conn := &mockConn{}

	existingChan := make(chan *realtime.BoardSessionRequestEventType, 1)

	mockBroker := new(realtime.MockBrokerInterface)
	// no expectations set

	socket := &sessionRequestWebsocket{
		websocketService: nil,
		realtime:         mockBroker,
		boardSessionRequestSubscriptions: map[uuid.UUID]*BoardSessionRequestSubscription{
			boardID: {
				clients:       map[uuid.UUID]websocket.Connection{userID: conn},
				subscriptions: map[uuid.UUID]chan *realtime.BoardSessionRequestEventType{userID: existingChan},
			},
		},
	}

	socket.listenOnBoardSessionRequest(boardID, userID, conn)

	// no expectations to assert on mockBroker; just ensure existing subscription unchanged
	sub := socket.boardSessionRequestSubscriptions[boardID]
	if assert.NotNil(t, sub) {
		assert.Equal(t, existingChan, sub.subscriptions[userID])
	}
}
