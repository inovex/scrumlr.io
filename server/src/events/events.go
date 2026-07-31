package events

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"github.com/google/uuid"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/codes"
	"scrumlr.io/server/columns"
	"scrumlr.io/server/logger"
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

	openSocket(ctx context.Context, w http.ResponseWriter, r *http.Request) (websocket.Connection, error)
	closeSocket(ctx context.Context, connection websocket.Connection, reason string, boardId, userId *uuid.UUID, disconnect bool)
	handleWebsocketMessage(ctx context.Context, connection websocket.Connection, boardId, userId uuid.UUID, rawMessage []byte)

	filter(ctx context.Context, event *realtime.BoardEvent, boardId, userId uuid.UUID) *realtime.BoardEvent
}

type eventListener struct {
	websocket   websocket.Upgrader
	realtime    *realtime.Broker
	checkOrigin bool

	sessionRequestSubscriptions map[uuid.UUID]*SessionRequestSubscription
	boardSubscriptions          map[uuid.UUID]*BoardSubscription

	columnService  columns.ColumnService
	sessionService sessions.SessionService
}

func NewEventListener(ws websocket.Upgrader, rt *realtime.Broker, checkOrigin bool, sessionService sessions.SessionService, columnService columns.ColumnService) EventListener {
	listener := new(eventListener)
	listener.websocket = ws
	listener.realtime = rt
	listener.checkOrigin = checkOrigin
	listener.sessionService = sessionService
	listener.columnService = columnService

	listener.boardSubscriptions = make(map[uuid.UUID]*BoardSubscription)
	listener.sessionRequestSubscriptions = make(map[uuid.UUID]*SessionRequestSubscription)

	return listener
}

func (listener *eventListener) openSocket(ctx context.Context, w http.ResponseWriter, r *http.Request) (websocket.Connection, error) {
	ctx, span := tracer.Start(r.Context(), "scrumlr.events.open_socket")
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

func (listener *eventListener) handleWebsocketMessage(ctx context.Context, connection websocket.Connection, boardId, userId uuid.UUID, rawMessage []byte) {
	ctx, span := tracer.Start(ctx, "scrumlr.events.handle_websocket_message")
	defer span.End()
	log := logger.FromContext(ctx)

	var message WebsocketMessage
	err := json.Unmarshal(rawMessage, &message)
	if err != nil {
		span.SetStatus(codes.Error, "failed to unmarshal websocket message")
		span.RecordError(err)
		log.Errorw("failed to unmarshal websocket message", "error", err, "message", string(rawMessage))
		return
	}

	switch message.Type {
	default:
		log.Debugw("unknown websocket message type", "type", message.Type, "user", userId)
	}
}
