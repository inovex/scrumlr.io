package events

import (
	"context"
	"errors"
	"sync"

	"github.com/google/uuid"
	"scrumlr.io/server/eventfilter"
	"scrumlr.io/server/logger"
	"scrumlr.io/server/realtime"
	"scrumlr.io/server/timeprovider"
	"scrumlr.io/server/websocket"
)

type boardConnectionManager struct {
	sync.RWMutex

	realtime *realtime.Broker
	clock    timeprovider.TimeProvider
	filter   eventfilter.EventFilter

	subscriptions map[uuid.UUID]*BoardSubscription
}

type BoardSubscription struct {
	sync.RWMutex
	boardId       uuid.UUID
	eventsChannel chan *realtime.BoardEvent
	clients       map[uuid.UUID]websocket.Connection
	cancel        context.CancelFunc
}

func NewBoardConnectionManager(rt *realtime.Broker, clock timeprovider.TimeProvider, filter eventfilter.EventFilter) BoardConnectionManager {
	manager := new(boardConnectionManager)
	manager.realtime = rt
	manager.clock = clock
	manager.filter = filter
	manager.subscriptions = make(map[uuid.UUID]*BoardSubscription)

	return manager
}

func (manager *boardConnectionManager) Register(ctx context.Context, connection websocket.Connection, boardId, userId uuid.UUID) error {
	ctx, span := tracer.Start(ctx, "scrumlr.events.board_connection_manager.register")
	defer span.End()
	log := logger.FromContext(ctx)

	manager.Lock()
	defer manager.Unlock()

	subscription, exists := manager.subscriptions[boardId]
	if !exists {
		subCtx, cancel := context.WithCancel(context.Background())
		channel, err := manager.getBoardChannel(ctx, boardId)
		if err != nil {
			log.Warnw("failed to get board channel", "boardId", boardId, "err", err)
			cancel()
			return err
		}

		subscription = &BoardSubscription{
			boardId:       boardId,
			eventsChannel: channel,
			clients:       make(map[uuid.UUID]websocket.Connection),
			cancel:        cancel,
		}

		manager.subscriptions[boardId] = subscription

		go manager.listen(subCtx, subscription)
	}

	subscription.Lock()
	subscription.clients[userId] = connection
	subscription.Unlock()

	return nil
}

func (manager *boardConnectionManager) Unregister(ctx context.Context, boardId, userId uuid.UUID) {
	ctx, span := tracer.Start(ctx, "scrumlr.events.board_connection_manager.unregister")
	defer span.End()
	log := logger.FromContext(ctx)

	manager.Lock()
	defer manager.Unlock()

	subscription, exists := manager.subscriptions[boardId]
	if !exists {
		log.Debugw("subscriptions for board does not exists", "boardId", boardId)
		return
	}

	subscription.Lock()
	delete(subscription.clients, userId)
	connectedClients := len(subscription.clients)
	subscription.Unlock()

	if connectedClients == 0 {
		subscription.cancel()
		delete(manager.subscriptions, boardId)
	}
}

func (manager *boardConnectionManager) listen(ctx context.Context, subscription *BoardSubscription) {
	for {
		select {
		case <-ctx.Done():
			return
		case event, ok := <-subscription.eventsChannel:
			if !ok {
				return
			}
			manager.broadcast(ctx, subscription, event)
		}
	}
}

func (manager *boardConnectionManager) broadcast(ctx context.Context, subscription *BoardSubscription, event *realtime.BoardEvent) {
	log := logger.FromContext(ctx)

	subscription.RLock()
	clients := make(map[uuid.UUID]websocket.Connection, len(subscription.clients))
	for userId, connection := range subscription.clients {
		clients[userId] = connection
	}
	subscription.RUnlock()

	for userId, connection := range clients {
		filteredEvent := manager.filter.Filter(ctx, event, subscription.boardId, userId)

		err := connection.WriteJSON(ctx, filteredEvent)
		if err != nil {
			log.Warnw("failed to send event to client", "event", filteredEvent, "err", err)
		}
	}
}

func (manager *boardConnectionManager) getBoardChannel(ctx context.Context, boardId uuid.UUID) (chan *realtime.BoardEvent, error) {
	log := logger.FromContext(ctx)

	for i := range MaxRetries {
		channel, err := manager.realtime.GetBoardChannel(ctx, boardId)
		if err == nil {
			return channel, err
		}

		log.Warnw("failed to subscribe to board channel", "board", boardId, "attempt", i, "err", err)

		// context aware sleep. If the user aborted the session, we are not stuck until
		// the retries are done and can also abort the function.
		timer := manager.clock.NewTimer(SleepBetweenRetries)
		select {
		case <-ctx.Done():
			timer.Stop()
			return nil, ctx.Err()
		case <-timer.C:
		}
	}

	return nil, errors.New("failed to subscribe to board channel")
}
