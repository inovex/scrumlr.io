package events

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"github.com/google/uuid"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/codes"
	"scrumlr.io/server/identifiers"
	"scrumlr.io/server/logger"
	"scrumlr.io/server/notes"
	"scrumlr.io/server/realtime"
	"scrumlr.io/server/sessions"
	"scrumlr.io/server/websocket"
)

const MaxRetries = 10
const SleepBetweenRetries = time.Second * 2

var tracer = otel.Tracer("scrumlr.io/server/events")
var meter = otel.Meter("scrumlr.io/server/events")

type EventListener interface {
	OpenBoardSocket(w http.ResponseWriter, r *http.Request)
	OpenSessionRequestSocket(w http.ResponseWriter, r *http.Request)
}

type BoardConnectionManager interface {
	Register(ctx context.Context, connection websocket.Connection, boardId, userId uuid.UUID) error
	Unregister(ctx context.Context, boardId, userId uuid.UUID)
}

type SessionRequestConnectionManager interface {
	Register(ctx context.Context, connection websocket.Connection, boardId, userId uuid.UUID) error
	Unregister(ctx context.Context, boardId, userId uuid.UUID)
}

type eventListener struct {
	websocket   websocket.Upgrader
	checkOrigin bool

	boardConnection          BoardConnectionManager
	sessionRequestConnection SessionRequestConnectionManager

	sessionService sessions.SessionService
	noteService    notes.NotesService
}

func NewEventListener(
	ws websocket.Upgrader,
	checkOrigin bool,
	boardConnection BoardConnectionManager,
	sessionRequestConnection SessionRequestConnectionManager,
	sessionService sessions.SessionService,
	noteService notes.NotesService,
) EventListener {
	listener := new(eventListener)
	listener.websocket = ws
	listener.checkOrigin = checkOrigin

	listener.boardConnection = boardConnection
	listener.sessionRequestConnection = sessionRequestConnection

	listener.sessionService = sessionService
	listener.noteService = noteService

	return listener
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

	defer func() {
		listener.boardConnection.Unregister(ctx, boardId, userId)
		listener.closeSocket(ctx, connection, "normal close", &boardId, &userId, true)
	}()

	err = listener.sessionService.Connect(ctx, boardId, userId)
	if err != nil {
		span.SetStatus(codes.Error, "failed to connect session")
		span.RecordError(err)
		log.Warnw("failed to connect session", "board", boardId, "user", userId, "err", err)
	}

	err = listener.boardConnection.Register(ctx, connection, boardId, userId)
	if err != nil {
		log.Errorw("failed to register client connection", "boardId", boardId, "userId", userId, "err", err)
		return
	}

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

	for {
		_, message, err := connection.Read(ctx)
		if err != nil {
			if listener.websocket.IsNormalClose(err) {
				log.Debugw("websocket to user is no longer available, about to disconnect", "user", userId)
			}

			break
		}

		err = listener.handleWebsocketMessage(ctx, connection, boardId, userId, message)
		if err != nil {
			log.Debugw("failed to handle websocket message", "board", boardId, "user", userId, "err", err)
		}
	}

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

	defer func() {
		listener.sessionRequestConnection.Unregister(ctx, boardId, userId)
		listener.closeSocket(ctx, connection, "", nil, nil, false)
	}()

	err = listener.sessionRequestConnection.Register(ctx, connection, boardId, userId)
	if err != nil {
		log.Errorw("failed to register client connection", "boardId", boardId, "userId", userId, "err", err)
		return
	}

	for {
		_, _, err := connection.Read(ctx)
		if err != nil {
			if listener.websocket.IsNormalClose(err) {
				log.Debugw("websocket to user no longer available, about to disconnect", "user", userId)
			}

			break
		}
	}
}

func (listener *eventListener) openSocket(ctx context.Context, w http.ResponseWriter, r *http.Request) (websocket.Connection, error) {
	ctx, span := tracer.Start(ctx, "scrumlr.events.open_socket")
	defer span.End()
	log := logger.FromContext(ctx)

	connection, err := listener.websocket.Accept(w, r, listener.checkOrigin)
	if err != nil {
		span.SetStatus(codes.Error, "failed to upgrade connection to websocket")
		span.RecordError(err)
		log.Errorw("unable to upgrade websocket", "err", err)
		return nil, err
	}

	websocketOpenedCounter.Add(ctx, 1)
	return connection, err
}

func (listener *eventListener) closeSocket(ctx context.Context, connection websocket.Connection, reason string, boardId, userId *uuid.UUID, disconnect bool) {
	ctx, span := tracer.Start(ctx, "scrumlr.events.close_socket")
	defer span.End()
	log := logger.FromContext(ctx)

	err := connection.Close(reason)
	if err != nil {
		span.SetStatus(codes.Error, "failed to close websocket")
		span.RecordError(err)
		log.Errorw("unable to close websocket connection", "err", err)
	}

	websocketOpenedCounter.Add(ctx, -1)

	if disconnect && boardId != nil && userId != nil {
		err = listener.sessionService.Disconnect(ctx, *boardId, *userId)
		if err != nil {
			span.SetStatus(codes.Error, "failed to disconnect session")
			span.RecordError(err)
			log.Warnw("failed to disconnected session", "board", boardId, "user", userId, "err", err)
		}
	}
}

func (listener *eventListener) handleWebsocketMessage(ctx context.Context, connection websocket.Connection, boardId, userId uuid.UUID, rawMessage []byte) error {
	ctx, span := tracer.Start(ctx, "scrumlr.events.handle_websocket_message")
	defer span.End()
	log := logger.FromContext(ctx)

	var message WebsocketMessage
	err := json.Unmarshal(rawMessage, &message)
	if err != nil {
		span.SetStatus(codes.Error, "failed to unmarshal websocket message")
		span.RecordError(err)
		log.Errorw("failed to unmarshal websocket message", "error", err, "message", string(rawMessage))
		return err
	}

	switch message.Type {
	case NoteDragLock:
		err := listener.noteService.HandleWebSocketMessage(ctx, boardId, userId, connection, message.Data)
		return err
	}

	return nil
}
