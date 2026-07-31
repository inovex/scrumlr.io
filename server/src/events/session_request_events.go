package events

import (
	"context"
	"errors"
	"net/http"
	"time"

	"github.com/google/uuid"
	"go.opentelemetry.io/otel/attribute"

	"scrumlr.io/server/identifiers"
	"scrumlr.io/server/logger"
	"scrumlr.io/server/realtime"
	"scrumlr.io/server/websocket"
)

type SessionRequestSubscription struct {
	subscriptions map[uuid.UUID]chan *realtime.BoardSessionRequestEventType
	clients       map[uuid.UUID]websocket.Connection
}

func (listener *eventListener) OpenSessionRequestSocket(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "scrumlr.events.open_session_request_socket")
	defer span.End()
	log := logger.FromContext(ctx)

	boardId := ctx.Value(identifiers.BoardIdentifier).(uuid.UUID)
	userId := ctx.Value(identifiers.UserIdentifier).(uuid.UUID)

	span.SetAttributes(
		attribute.String("scrumlr.events.open_session_request_socket.user", userId.String()),
		attribute.String("scrumlr.events.open_session_request_socket.board", boardId.String()),
	)

	connection, err := listener.openSocket(ctx, w, r)
	if err != nil {
		return
	}

	defer listener.closeSocket(ctx, connection, "", nil, nil, false)

	listener.listenOnSessionRequest(ctx, connection, boardId, userId)

	for {
		_, _, err := connection.Read(ctx)
		if err != nil {
			if listener.websocket.IsNormalClose(err) {
				log.Debugw("websocket to user no longer available, about to disconnect", "user", userId)
				delete(listener.sessionRequestSubscriptions[boardId].clients, userId)
			}
		}
	}
}

func (listener *eventListener) listenOnSessionRequest(ctx context.Context, connection websocket.Connection, boardId, userId uuid.UUID) {
	log := logger.FromContext(ctx)

	_, exists := listener.sessionRequestSubscriptions[boardId]
	if !exists {
		listener.sessionRequestSubscriptions[boardId] = &SessionRequestSubscription{
			clients:       make(map[uuid.UUID]websocket.Connection),
			subscriptions: make(map[uuid.UUID]chan *realtime.BoardSessionRequestEventType),
		}
	}

	subscription := listener.sessionRequestSubscriptions[boardId]
	subscription.clients[userId] = connection

	_, exists = subscription.subscriptions[userId]
	if !exists {
		channel, err := listener.getSessionRequestChannel(ctx, boardId, userId, SleepBetweenRetries)
		if err != nil {
			log.Errorw("failed to subscribe to to session request channel", "board", boardId, "user", userId, "attempts", MaxRetries, "err", err)
			return
		}

		subscription.subscriptions[userId] = channel
		go listener.listenOnSessionRequestEvents(connection, subscription.subscriptions[userId])
	}
}

func (listener *eventListener) listenOnSessionRequestEvents(connection websocket.Connection, eventsChannel chan *realtime.BoardSessionRequestEventType) {
	log := logger.Get()

	message := <-eventsChannel
	log.Debugw("message received", "message", message)

	err := connection.WriteJSON(context.Background(), message)
	if err != nil {
		log.Warnw("failed to send message", "message", message, "err", err)
	}
}

func (listener *eventListener) getSessionRequestChannel(ctx context.Context, boardId, userId uuid.UUID, delay time.Duration) (chan *realtime.BoardSessionRequestEventType, error) {
	log := logger.FromContext(ctx)

	for i := range MaxRetries {
		channel, err := listener.realtime.GetBoardSessionRequestChannel(ctx, boardId, userId)
		if err == nil {
			return channel, err
		}

		log.Warnw("failed to subscribe to session request channel", "board", boardId, "user", userId, "attempt", i, "err", err)
		time.Sleep(delay)
	}

	return nil, errors.New("failed to subscribe to session request channel")
}
