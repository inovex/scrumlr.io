package events

import (
	"context"
	"errors"
	"net/http"
	"time"

	"github.com/google/uuid"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/codes"
	"scrumlr.io/server/identifiers"
	"scrumlr.io/server/logger"
	"scrumlr.io/server/realtime"
	"scrumlr.io/server/websocket"
)

type BoardSubscription struct {
	eventsChannel chan *realtime.BoardEvent
	clients       map[uuid.UUID]websocket.Connection
}

func (listener *eventListener) OpenBoardSocket(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "scrumlr.events.open_board_socket")
	defer span.End()
	log := logger.FromContext(ctx)

	boardId := ctx.Value(identifiers.BoardIdentifier).(uuid.UUID)
	userId := ctx.Value(identifiers.UserIdentifier).(uuid.UUID)

	span.SetAttributes(
		attribute.String("scrumlr.events.open_board_socket.user", userId.String()),
		attribute.String("scrumlr.events.open_board_socket.board", boardId.String()),
	)

	connection, err := listener.openSocket(ctx, w, r)
	if err != nil {
		return
	}

	defer listener.closeSocket(ctx, connection, "normal close", &boardId, &userId, true)

	initEvent := &realtime.BoardEvent{
		Type: realtime.BoardEventInit,
		Data: boardId,
	}

	err = connection.WriteJSON(ctx, initEvent)
	if err != nil {
		reason := "failed to send init message"
		span.SetStatus(codes.Error, reason)
		span.RecordError(err)
		log.Errorw(reason, "board", boardId, "user", userId, "err", err)
		listener.closeSocket(ctx, connection, reason, &boardId, &userId, true)
		return
	}

	listener.listenOnBoard(ctx, connection, boardId, userId)

	for {
		_, message, err := connection.Read(ctx)
		if err != nil {
			if listener.websocket.IsNormalClose(err) {
				log.Debugw("websocket to user is no longer available, about to disconnect", "user", userId)
				delete(listener.boardSubscriptions[boardId].clients, userId)

				err := listener.sessionService.Disconnect(ctx, boardId, userId)
				if err != nil {
					span.SetStatus(codes.Error, "failed to disconnect session")
					span.RecordError(err)
					log.Warnw("failed to disconnected session", "board", boardId, "user", userId, "err", err)
				}
			}
			break
		}

		listener.handleWebsocketMessage(ctx, connection, boardId, userId, message)
	}

}

func (listener *eventListener) listenOnBoard(ctx context.Context, connection websocket.Connection, boardId, userId uuid.UUID) {
	log := logger.FromContext(ctx)

	_, exists := listener.boardSubscriptions[boardId]
	if !exists {
		listener.boardSubscriptions[boardId] = &BoardSubscription{
			clients: make(map[uuid.UUID]websocket.Connection),
		}
	}

	subscription := listener.boardSubscriptions[boardId]
	subscription.clients[userId] = connection

	if subscription.eventsChannel == nil {
		channel, err := listener.getBoardChannel(ctx, boardId, SleepBetweenRetries)
		if err != nil {
			log.Errorw("failed to subscribe to to session request channel", "board", boardId, "user", userId, "attempts", MaxRetries, "err", err)
			return
		}

		subscription.eventsChannel = channel
		go listener.listenOnBoardEvents(subscription.eventsChannel, subscription.clients, boardId)
	}
}

func (listener *eventListener) listenOnBoardEvents(eventsChannel chan *realtime.BoardEvent, connections map[uuid.UUID]websocket.Connection, boardId uuid.UUID) {
	ctx := context.Background()
	log := logger.FromContext(ctx)

	for event := range eventsChannel {
		log.Debugw("board event received", "event", event)

		for client, connection := range connections {
			event = listener.filter(ctx, event, boardId, client)

			err := connection.WriteJSON(ctx, event)
			if err != nil {
				log.Warnw("failed to send event to client", "event", event, "err", err)
			}
		}
	}
}

func (listener *eventListener) getBoardChannel(ctx context.Context, boardId uuid.UUID, delay time.Duration) (chan *realtime.BoardEvent, error) {
	log := logger.FromContext(ctx)

	for i := range MaxRetries {
		channel, err := listener.realtime.GetBoardChannel(ctx, boardId)
		if err == nil {
			return channel, err
		}

		log.Warnw("failed to subscribe to board channel", "board", boardId, "attempt", i, "err", err)
		time.Sleep(delay)
	}

	return nil, errors.New("failed to subscribe to board channel")
}
