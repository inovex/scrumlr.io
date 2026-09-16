package events

import (
	"context"
	"errors"
	"fmt"
	"sync"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"scrumlr.io/server/realtime"
	"scrumlr.io/server/timeprovider"
	"scrumlr.io/server/websocket"
)

func TestSessionRequestConnectionManagerRegister(t *testing.T) {
	ctx := t.Context()

	boardId := uuid.New()
	userId := uuid.New()

	connection := websocket.NewMockConnection(t)

	sessionRequestChannel := make(chan *realtime.BoardSessionRequestEventType)

	mockBroker := realtime.NewMockClient(t)
	mockBroker.EXPECT().SubscribeToBoardSessionEvents(mock.Anything, mock.Anything).
		Return(sessionRequestChannel, nil)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	clock := timeprovider.NewMockTimeProvider(t)

	manager := NewSessionRequestConnectionManager(broker, clock)

	err := manager.Register(ctx, connection, boardId, userId)

	assert.NoError(t, err)
}

func TestSessionRequestConnectionManagerRegisterMultipleClients(t *testing.T) {
	ctx := t.Context()

	boardId := uuid.New()
	firstUserId := uuid.New()
	secondUserId := uuid.New()

	var wg sync.WaitGroup
	wg.Add(2)

	acceptedEvent := realtime.RequestAccepted

	firstUserConnection := websocket.NewMockConnection(t)
	firstUserConnection.EXPECT().WriteJSON(mock.Anything, &acceptedEvent).
		RunAndReturn(func(ctx context.Context, data any) error {
			wg.Done()
			return nil
		})

	secondUserConnection := websocket.NewMockConnection(t)
	secondUserConnection.EXPECT().WriteJSON(mock.Anything, &acceptedEvent).
		RunAndReturn(func(ctx context.Context, data any) error {
			wg.Done()
			return nil
		})

	firstUserChannel := make(chan *realtime.BoardSessionRequestEventType)
	secondUserChannel := make(chan *realtime.BoardSessionRequestEventType)

	mockBroker := realtime.NewMockClient(t)
	mockBroker.EXPECT().SubscribeToBoardSessionEvents(mock.Anything, fmt.Sprintf("request.%s.%s", boardId, firstUserId)).
		Return(firstUserChannel, nil)
	mockBroker.EXPECT().SubscribeToBoardSessionEvents(mock.Anything, fmt.Sprintf("request.%s.%s", boardId, secondUserId)).
		Return(secondUserChannel, nil)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	clock := timeprovider.NewMockTimeProvider(t)

	manager := NewSessionRequestConnectionManager(broker, clock)

	err := manager.Register(ctx, firstUserConnection, boardId, firstUserId)
	assert.NoError(t, err)

	err = manager.Register(ctx, secondUserConnection, boardId, secondUserId)
	assert.NoError(t, err)

	firstUserChannel <- &acceptedEvent
	secondUserChannel <- &acceptedEvent

	wg.Wait()

	close(firstUserChannel)
	close(secondUserChannel)
}

func TestSessionRequestConnectionManagerRegisterFailedToGetChannel(t *testing.T) {
	ctx := t.Context()

	boardId := uuid.New()
	userId := uuid.New()

	connection := websocket.NewMockConnection(t)

	mockBroker := realtime.NewMockClient(t)
	mockBroker.EXPECT().SubscribeToBoardSessionEvents(mock.Anything, mock.Anything).
		Return(nil, errors.New("failed to get session request channel")).
		Times(10)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	clock := timeprovider.NewMockTimeProvider(t)
	clock.EXPECT().NewTimer(SleepBetweenRetries).
		RunAndReturn(func(duration time.Duration) *time.Timer {
			return time.NewTimer(time.Millisecond)
		}).Times(10)

	manager := NewSessionRequestConnectionManager(broker, clock)

	err := manager.Register(ctx, connection, boardId, userId)

	assert.Error(t, err)
	assert.Equal(t, errors.New("failed to subscribe to session request channel"), err)
}

func TestSessionRequestConnectionManagerUnregister(t *testing.T) {
	ctx := t.Context()

	boardId := uuid.New()
	userId := uuid.New()

	connection := websocket.NewMockConnection(t)

	channel := make(chan *realtime.BoardSessionRequestEventType)

	mockBroker := realtime.NewMockClient(t)
	mockBroker.EXPECT().SubscribeToBoardSessionEvents(mock.Anything, fmt.Sprintf("request.%s.%s", boardId, userId)).
		Return(channel, nil)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	clock := timeprovider.NewMockTimeProvider(t)

	manager := NewSessionRequestConnectionManager(broker, clock)

	err := manager.Register(ctx, connection, boardId, userId)
	assert.NoError(t, err)

	manager.Unregister(ctx, boardId, userId)

	mgr := manager.(*sessionRequestConnectionManager)
	mgr.mux.RLock()
	_, exists := mgr.subscriptions[boardId]
	mgr.mux.RUnlock()

	assert.False(t, exists)
}

func TestSessionRequestConnectionManagerUnregisterPartialClients(t *testing.T) {
	ctx := t.Context()

	boardId := uuid.New()
	firstUserId := uuid.New()
	secondUserId := uuid.New()

	firstUserConnection := websocket.NewMockConnection(t)
	secondUserConnection := websocket.NewMockConnection(t)

	firstUserChannel := make(chan *realtime.BoardSessionRequestEventType)
	secondUserChannel := make(chan *realtime.BoardSessionRequestEventType)

	mockBroker := realtime.NewMockClient(t)
	mockBroker.EXPECT().SubscribeToBoardSessionEvents(mock.Anything, fmt.Sprintf("request.%s.%s", boardId, firstUserId)).
		Return(firstUserChannel, nil)
	mockBroker.EXPECT().SubscribeToBoardSessionEvents(mock.Anything, fmt.Sprintf("request.%s.%s", boardId, secondUserId)).
		Return(secondUserChannel, nil)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	clock := timeprovider.NewMockTimeProvider(t)

	manager := NewSessionRequestConnectionManager(broker, clock)

	err := manager.Register(ctx, firstUserConnection, boardId, firstUserId)
	assert.NoError(t, err)

	err = manager.Register(ctx, secondUserConnection, boardId, secondUserId)
	assert.NoError(t, err)

	manager.Unregister(ctx, boardId, firstUserId)

	mgr := manager.(*sessionRequestConnectionManager)
	mgr.mux.RLock()
	subscriptions, exists := mgr.subscriptions[boardId]
	mgr.mux.RUnlock()

	assert.True(t, exists)

	subscriptions.mux.RLock()
	assert.Len(t, subscriptions.cancel, 1)
	assert.Len(t, subscriptions.clients, 1)
	assert.Len(t, subscriptions.subscriptions, 1)
	subscriptions.mux.RUnlock()
}

func TestSessionRequestConnectionManagerUnregisterNonExistingSubscription(t *testing.T) {
	ctx := t.Context()

	boardId := uuid.New()
	userId := uuid.New()

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	clock := timeprovider.NewMockTimeProvider(t)

	manager := NewSessionRequestConnectionManager(broker, clock)

	assert.NotPanics(t, func() {
		manager.Unregister(ctx, boardId, userId)
	})
}

func TestSessionRequestConnectionManagerGetSessionRequestChannel(t *testing.T) {
	ctx := t.Context()

	boardId := uuid.New()
	userId := uuid.New()

	sessionRequestChannel := make(chan *realtime.BoardSessionRequestEventType)

	mockBroker := realtime.NewMockClient(t)
	mockBroker.EXPECT().SubscribeToBoardSessionEvents(mock.Anything, mock.Anything).
		Return(sessionRequestChannel, nil)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	clock := timeprovider.NewMockTimeProvider(t)

	manager := NewSessionRequestConnectionManager(broker, clock)
	mgr := manager.(*sessionRequestConnectionManager)

	channel, err := mgr.getSessionRequestChannel(ctx, boardId, userId)

	assert.NoError(t, err)
	assert.Equal(t, sessionRequestChannel, channel)
}

func TestSessionRequestConnectionManagerGetSessionRequestChannelWithRetry(t *testing.T) {
	ctx := t.Context()

	boardId := uuid.New()
	userId := uuid.New()

	sessionRequestChannel := make(chan *realtime.BoardSessionRequestEventType)

	mockBroker := realtime.NewMockClient(t)
	mockBroker.EXPECT().SubscribeToBoardSessionEvents(mock.Anything, mock.Anything).
		Return(nil, errors.New("failed to subscribe to board channel")).
		Times(3)
	mockBroker.EXPECT().SubscribeToBoardSessionEvents(mock.Anything, mock.Anything).
		Return(sessionRequestChannel, nil).
		Once()
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	clock := timeprovider.NewMockTimeProvider(t)
	clock.EXPECT().NewTimer(SleepBetweenRetries).
		RunAndReturn(func(duration time.Duration) *time.Timer {
			return time.NewTimer(time.Millisecond)
		}).Times(3)

	manager := NewSessionRequestConnectionManager(broker, clock)
	mgr := manager.(*sessionRequestConnectionManager)

	channel, err := mgr.getSessionRequestChannel(ctx, boardId, userId)

	assert.NoError(t, err)
	assert.Equal(t, sessionRequestChannel, channel)
}

func TestSessionRequestConnectionManagerGetSessionRequestChannelFail(t *testing.T) {
	ctx := t.Context()

	boardId := uuid.New()
	userId := uuid.New()

	mockBroker := realtime.NewMockClient(t)
	mockBroker.EXPECT().SubscribeToBoardSessionEvents(mock.Anything, mock.Anything).
		Return(nil, errors.New("failed to subscribe to session request channel")).
		Times(10)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	clock := timeprovider.NewMockTimeProvider(t)
	clock.EXPECT().NewTimer(SleepBetweenRetries).
		RunAndReturn(func(duration time.Duration) *time.Timer {
			return time.NewTimer(time.Millisecond)
		}).Times(10)

	manager := NewSessionRequestConnectionManager(broker, clock)
	mgr := manager.(*sessionRequestConnectionManager)

	channel, err := mgr.getSessionRequestChannel(ctx, boardId, userId)

	assert.Error(t, err)
	assert.Equal(t, errors.New("failed to subscribe to session request channel"), err)
	assert.Nil(t, channel)
}

func TestSessionRequestConnectionManagerGetSessionRequestChannelCancel(t *testing.T) {
	ctx, cancel := context.WithCancel(t.Context())
	cancel()

	boardId := uuid.New()
	userId := uuid.New()

	mockBroker := realtime.NewMockClient(t)
	mockBroker.EXPECT().SubscribeToBoardSessionEvents(mock.Anything, mock.Anything).
		Return(nil, errors.New("failed to subscribe to session request channel")).
		Once()
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	clock := timeprovider.NewMockTimeProvider(t)
	clock.EXPECT().NewTimer(SleepBetweenRetries).
		RunAndReturn(func(duration time.Duration) *time.Timer {
			return time.NewTimer(time.Millisecond)
		}).Once()

	manager := NewSessionRequestConnectionManager(broker, clock)
	mgr := manager.(*sessionRequestConnectionManager)

	channel, err := mgr.getSessionRequestChannel(ctx, boardId, userId)

	assert.Error(t, err)
	assert.Equal(t, context.Canceled, err)
	assert.Nil(t, channel)
}
