package events

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"scrumlr.io/server/eventfilter"
	"scrumlr.io/server/realtime"
	"scrumlr.io/server/timeprovider"
	"scrumlr.io/server/websocket"
)

func TestBoardConnectionManagerRegister(t *testing.T) {
	ctx := t.Context()

	boardId := uuid.New()
	userId := uuid.New()

	event := realtime.BoardEvent{
		Type: realtime.BoardEventBoardTimerUpdated,
		Data: boardId,
	}

	connection := websocket.NewMockConnection(t)
	connection.EXPECT().WriteJSON(mock.Anything, &event).
		Return(nil)

	boardChannel := make(chan *realtime.BoardEvent)

	mockBroker := realtime.NewMockClient(t)
	mockBroker.EXPECT().SubscribeToBoardEvents(mock.Anything, mock.Anything).
		Return(boardChannel, nil)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	clock := timeprovider.NewMockTimeProvider(t)

	filter := eventfilter.NewMockEventFilter(t)
	filter.EXPECT().Filter(mock.Anything, &event, boardId, userId).
		Return(&event)

	manager := NewBoardConnectionManager(broker, clock, filter)

	err := manager.Register(ctx, connection, boardId, userId)

	assert.NoError(t, err)

	boardChannel <- &event
	close(boardChannel)
}

func TestBoardConnectionManagerRegisterMultipleClients(t *testing.T) {
	ctx := t.Context()

	boardId := uuid.New()
	firstUserId := uuid.New()
	secondUserId := uuid.New()

	event := realtime.BoardEvent{
		Type: realtime.BoardEventBoardTimerUpdated,
		Data: boardId,
	}

	firstUserConnection := websocket.NewMockConnection(t)
	firstUserConnection.EXPECT().WriteJSON(mock.Anything, &event).
		Return(nil)
	secondUserConnection := websocket.NewMockConnection(t)
	secondUserConnection.EXPECT().WriteJSON(mock.Anything, &event).
		Return(nil)

	boardChannel := make(chan *realtime.BoardEvent)

	mockBroker := realtime.NewMockClient(t)
	mockBroker.EXPECT().SubscribeToBoardEvents(mock.Anything, mock.Anything).
		Return(boardChannel, nil)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	clock := timeprovider.NewMockTimeProvider(t)

	filter := eventfilter.NewMockEventFilter(t)
	filter.EXPECT().Filter(mock.Anything, &event, boardId, firstUserId).
		Return(&event)
	filter.EXPECT().Filter(mock.Anything, &event, boardId, secondUserId).
		Return(&event)

	manager := NewBoardConnectionManager(broker, clock, filter)

	err := manager.Register(ctx, firstUserConnection, boardId, firstUserId)
	assert.NoError(t, err)

	err = manager.Register(ctx, secondUserConnection, boardId, secondUserId)
	assert.NoError(t, err)

	boardChannel <- &event
	close(boardChannel)
}

func TestBoardConnectionManagerRegisterFailedToGetBoardChannel(t *testing.T) {
	ctx := t.Context()

	boardId := uuid.New()
	userId := uuid.New()

	connection := websocket.NewMockConnection(t)

	mockBroker := realtime.NewMockClient(t)
	mockBroker.EXPECT().SubscribeToBoardEvents(mock.Anything, mock.Anything).
		Return(nil, errors.New("failed to subscribe to board channel")).
		Times(10)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	clock := timeprovider.NewMockTimeProvider(t)
	clock.EXPECT().NewTimer(SleepBetweenRetries).
		RunAndReturn(func(duration time.Duration) *time.Timer {
			return time.NewTimer(time.Millisecond)
		}).Times(10)

	filter := eventfilter.NewMockEventFilter(t)

	manager := NewBoardConnectionManager(broker, clock, filter)

	err := manager.Register(ctx, connection, boardId, userId)

	assert.Error(t, err)
	assert.Equal(t, errors.New("failed to subscribe to board channel"), err)
}

func TestBoardConnectionManagerUnregister(t *testing.T) {
	ctx := t.Context()

	boardId := uuid.New()
	userId := uuid.New()

	connection := websocket.NewMockConnection(t)

	boardChannel := make(chan *realtime.BoardEvent)

	mockBroker := realtime.NewMockClient(t)
	mockBroker.EXPECT().SubscribeToBoardEvents(mock.Anything, mock.Anything).
		Return(boardChannel, nil)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	clock := timeprovider.NewMockTimeProvider(t)

	filter := eventfilter.NewMockEventFilter(t)

	manager := NewBoardConnectionManager(broker, clock, filter)

	err := manager.Register(ctx, connection, boardId, userId)
	assert.NoError(t, err)

	manager.Unregister(ctx, boardId, userId)

	mgr := manager.(*boardConnectionManager)
	mgr.RLock()
	_, exists := mgr.subscriptions[boardId]
	mgr.RUnlock()

	assert.False(t, exists)
}

func TestBoardConnectionManagerUnregisterPartialClients(t *testing.T) {
	ctx := t.Context()

	boardId := uuid.New()
	firstUserId := uuid.New()
	secondUserId := uuid.New()

	firstUserConnection := websocket.NewMockConnection(t)
	secondUserConnection := websocket.NewMockConnection(t)

	boardChannel := make(chan *realtime.BoardEvent)

	mockBroker := realtime.NewMockClient(t)
	mockBroker.EXPECT().SubscribeToBoardEvents(mock.Anything, mock.Anything).
		Return(boardChannel, nil)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	clock := timeprovider.NewMockTimeProvider(t)

	filter := eventfilter.NewMockEventFilter(t)

	manager := NewBoardConnectionManager(broker, clock, filter)

	err := manager.Register(ctx, firstUserConnection, boardId, firstUserId)
	assert.NoError(t, err)

	err = manager.Register(ctx, secondUserConnection, boardId, secondUserId)
	assert.NoError(t, err)

	manager.Unregister(ctx, boardId, firstUserId)

	mgr := manager.(*boardConnectionManager)
	mgr.RLock()
	subscription, exists := mgr.subscriptions[boardId]
	mgr.RUnlock()

	assert.True(t, exists)

	subscription.RLock()
	assert.Len(t, subscription.clients, 1)
	subscription.RUnlock()
}

func TestBoardConnectionManagerUnregisterNonExistingSubscription(t *testing.T) {
	ctx := t.Context()

	boardId := uuid.New()
	userId := uuid.New()

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	clock := timeprovider.NewMockTimeProvider(t)

	filter := eventfilter.NewMockEventFilter(t)

	manager := NewBoardConnectionManager(broker, clock, filter)

	assert.NotPanics(t, func() {
		manager.Unregister(ctx, boardId, userId)
	})
}

func TestBoardConnectionManagerGetBoardChannel(t *testing.T) {
	ctx := t.Context()

	boardId := uuid.New()

	boardChannel := make(chan *realtime.BoardEvent)

	mockBroker := realtime.NewMockClient(t)
	mockBroker.EXPECT().SubscribeToBoardEvents(mock.Anything, mock.Anything).
		Return(boardChannel, nil)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	clock := timeprovider.NewMockTimeProvider(t)

	filter := eventfilter.NewMockEventFilter(t)

	manager := NewBoardConnectionManager(broker, clock, filter)
	mgr := manager.(*boardConnectionManager)

	channel, err := mgr.getBoardChannel(ctx, boardId)

	assert.NoError(t, err)
	assert.Equal(t, boardChannel, channel)
}

func TestBoardConnectionManagerGetBoardChannelWithRetry(t *testing.T) {
	ctx := t.Context()

	boardId := uuid.New()

	boardChannel := make(chan *realtime.BoardEvent)

	mockBroker := realtime.NewMockClient(t)
	mockBroker.EXPECT().SubscribeToBoardEvents(mock.Anything, mock.Anything).
		Return(nil, errors.New("failed to subscribe to board channel")).
		Times(3)
	mockBroker.EXPECT().SubscribeToBoardEvents(mock.Anything, mock.Anything).
		Return(boardChannel, nil).
		Once()
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	clock := timeprovider.NewMockTimeProvider(t)
	clock.EXPECT().NewTimer(SleepBetweenRetries).
		RunAndReturn(func(duration time.Duration) *time.Timer {
			return time.NewTimer(time.Millisecond)
		}).Times(3)

	filter := eventfilter.NewMockEventFilter(t)

	manager := NewBoardConnectionManager(broker, clock, filter)
	mgr := manager.(*boardConnectionManager)

	channel, err := mgr.getBoardChannel(ctx, boardId)

	assert.NoError(t, err)
	assert.Equal(t, boardChannel, channel)
}

func TestBoardConnectionManagerGetBoardChannelFail(t *testing.T) {
	ctx := t.Context()

	boardId := uuid.New()

	mockBroker := realtime.NewMockClient(t)
	mockBroker.EXPECT().SubscribeToBoardEvents(mock.Anything, mock.Anything).
		Return(nil, errors.New("failed to subscribe to board channel")).
		Times(10)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	clock := timeprovider.NewMockTimeProvider(t)
	clock.EXPECT().NewTimer(SleepBetweenRetries).
		RunAndReturn(func(duration time.Duration) *time.Timer {
			return time.NewTimer(time.Millisecond)
		}).Times(10)

	filter := eventfilter.NewMockEventFilter(t)

	manager := NewBoardConnectionManager(broker, clock, filter)
	mgr := manager.(*boardConnectionManager)

	channel, err := mgr.getBoardChannel(ctx, boardId)

	assert.Error(t, err)
	assert.Equal(t, errors.New("failed to subscribe to board channel"), err)
	assert.Nil(t, channel)
}

func TestBoardConnectionManagerGetBoardChannelCancel(t *testing.T) {
	ctx, cancel := context.WithCancel(t.Context())
	cancel()

	boardId := uuid.New()

	mockBroker := realtime.NewMockClient(t)
	mockBroker.EXPECT().SubscribeToBoardEvents(mock.Anything, mock.Anything).
		Return(nil, errors.New("failed to subscribe to board channel")).
		Once()
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	clock := timeprovider.NewMockTimeProvider(t)
	clock.EXPECT().NewTimer(SleepBetweenRetries).
		RunAndReturn(func(duration time.Duration) *time.Timer {
			return time.NewTimer(time.Millisecond)
		}).Once()

	filter := eventfilter.NewMockEventFilter(t)

	manager := NewBoardConnectionManager(broker, clock, filter)
	mgr := manager.(*boardConnectionManager)

	channel, err := mgr.getBoardChannel(ctx, boardId)

	assert.Error(t, err)
	assert.Equal(t, context.Canceled, err)
	assert.Nil(t, channel)
}
