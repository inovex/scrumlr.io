package events

import (
	"context"
	"errors"
	"sync"

	"github.com/google/uuid"
	"scrumlr.io/server/logger"
	"scrumlr.io/server/realtime"
	"scrumlr.io/server/timeprovider"
	"scrumlr.io/server/websocket"
)

type sessionRequestConnectionManager struct {
	mux sync.RWMutex

	realtime *realtime.Broker
	clock    timeprovider.TimeProvider

	subscriptions map[uuid.UUID]*SessionRequestSubscription
}

type SessionRequestSubscription struct {
	mux           sync.RWMutex
	subscriptions map[uuid.UUID]chan *realtime.BoardSessionRequestEventType
	clients       map[uuid.UUID]websocket.Connection
	cancel        map[uuid.UUID]context.CancelFunc
}

func NewSessionRequestConnectionManager(rt *realtime.Broker, clock timeprovider.TimeProvider) SessionRequestConnectionManager {
	manager := new(sessionRequestConnectionManager)
	manager.realtime = rt
	manager.clock = clock
	manager.subscriptions = make(map[uuid.UUID]*SessionRequestSubscription)

	return manager
}

func (manager *sessionRequestConnectionManager) Register(ctx context.Context, connection websocket.Connection, boardId, userId uuid.UUID) error {
	ctx, span := tracer.Start(ctx, "scrumlr.events.session_request_connection_manager.register")
	defer span.End()
	log := logger.FromContext(ctx)

	manager.mux.Lock()
	defer manager.mux.Unlock()

	subscription, exists := manager.subscriptions[boardId]
	if !exists {
		subscription = &SessionRequestSubscription{
			subscriptions: make(map[uuid.UUID]chan *realtime.BoardSessionRequestEventType),
			clients:       make(map[uuid.UUID]websocket.Connection),
			cancel:        make(map[uuid.UUID]context.CancelFunc),
		}

		manager.subscriptions[boardId] = subscription
	}

	subCtx, cancel := context.WithCancel(context.Background())
	channel, err := manager.getSessionRequestChannel(ctx, boardId, userId)
	if err != nil {
		log.Warnw("failed to get session request channel", "boardId", boardId, "userId", userId, "err", err)
		cancel()
		return err
	}

	subscription.mux.Lock()
	subscription.subscriptions[userId] = channel
	subscription.clients[userId] = connection
	subscription.cancel[userId] = cancel
	subscription.mux.Unlock()

	go manager.listen(subCtx, subscription, userId)

	return nil
}

func (manager *sessionRequestConnectionManager) Unregister(ctx context.Context, boardId, userId uuid.UUID) {
	ctx, span := tracer.Start(ctx, "scrumlr.events.session_request_connection_manager.unregister")
	defer span.End()
	log := logger.FromContext(ctx)

	manager.mux.Lock()
	defer manager.mux.Unlock()

	subscription, exists := manager.subscriptions[boardId]
	if !exists {
		log.Debugw("session requests subscriptions for board do not exists", "boardId", boardId)
		return
	}

	subscription.mux.Lock()
	delete(subscription.clients, userId)
	delete(subscription.subscriptions, userId)

	cancel, exists := subscription.cancel[userId]
	if exists {
		cancel()
		delete(subscription.cancel, userId)
	}

	if len(subscription.clients) == 0 {
		delete(manager.subscriptions, boardId)
	}
	subscription.mux.Unlock()
}

func (manager *sessionRequestConnectionManager) listen(ctx context.Context, subscription *SessionRequestSubscription, userId uuid.UUID) {
	log := logger.FromContext(ctx)

	select {
	case <-ctx.Done():
		return
	case message, ok := <-subscription.subscriptions[userId]:
		if !ok {
			return
		}

		err := subscription.clients[userId].WriteJSON(ctx, message)
		if err != nil {
			log.Warnw("failed to send message", "message", message, "err", err)
		}
	}
}

func (manager *sessionRequestConnectionManager) getSessionRequestChannel(ctx context.Context, boardId, userId uuid.UUID) (chan *realtime.BoardSessionRequestEventType, error) {
	log := logger.FromContext(ctx)

	for i := range MaxRetries {
		channel, err := manager.realtime.GetBoardSessionRequestChannel(ctx, boardId, userId)
		if err == nil {
			return channel, err
		}

		log.Warnw("failed to subscribe to session request channel", "board", boardId, "user", userId, "attempt", i, "err", err)

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

	return nil, errors.New("failed to subscribe to session request channel")
}
