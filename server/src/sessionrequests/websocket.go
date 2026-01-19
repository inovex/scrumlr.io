package sessionrequests

import (
	"context"
	"github.com/coder/websocket"
	"github.com/google/uuid"
	"net/http"
	"scrumlr.io/server/identifiers"
	"scrumlr.io/server/logger"
	"scrumlr.io/server/realtime"
	"scrumlr.io/server/technical_helper"
)

type BoardSessionRequestSubscription struct {
	clients       map[uuid.UUID]*websocket.Conn
	subscriptions map[uuid.UUID]chan *realtime.BoardSessionRequestEventType
}

type WS struct {
	checkOrigin                      bool
	realtime                         *realtime.Broker
	boardSessionRequestSubscriptions map[uuid.UUID]*BoardSessionRequestSubscription
}

func NewWebsocket(checkOrigin bool, rt *realtime.Broker) Websocket {
	ws := new(WS)
	ws.checkOrigin = checkOrigin
	ws.realtime = rt
	ws.boardSessionRequestSubscriptions = make(map[uuid.UUID]*BoardSessionRequestSubscription)

	return ws
}

func (session *BoardSessionRequestSubscription) startListeningOnBoardSessionRequest(userId uuid.UUID) {
	msg := <-session.subscriptions[userId]
	logger.Get().Debugw("message received", "message", msg)
	conn := session.clients[userId]
	err := technical_helper.WriteJSON(context.Background(), conn, msg)
	if err != nil {
		logger.Get().Warnw("failed to send message", "message", msg, "err", err)
	}
}

func (socket *WS) OpenSocket(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	log := logger.FromContext(ctx)

	id := ctx.Value(identifiers.BoardIdentifier).(uuid.UUID)
	userID := ctx.Value(identifiers.UserIdentifier).(uuid.UUID)

	conn, err := technical_helper.AcceptWebSocket(w, r, socket.checkOrigin)
	if err != nil {
		log.Errorw("unable to upgrade websocket", "err", err, "board", id, "user", userID)
		return
	}

	websocketOpenedCounter.Add(ctx, 1)
	defer socket.closeSocket(conn)

	socket.listenOnBoardSessionRequest(id, userID, conn)

	for {
		_, _, err := technical_helper.ReadWebSocket(ctx, conn)
		if err != nil {
			if technical_helper.IsNormalClose(err) {
				log.Debugw("websocket to user no longer available, about to disconnect", "user", userID)
				delete(socket.boardSessionRequestSubscriptions[id].clients, userID)
			}
			break
		}
	}
}

func (socket *WS) listenOnBoardSessionRequest(boardID, userID uuid.UUID, conn *websocket.Conn) {
	if _, exist := socket.boardSessionRequestSubscriptions[boardID]; !exist {
		socket.boardSessionRequestSubscriptions[boardID] = &BoardSessionRequestSubscription{
			clients:       make(map[uuid.UUID]*websocket.Conn),
			subscriptions: make(map[uuid.UUID]chan *realtime.BoardSessionRequestEventType),
		}
	}

	b := socket.boardSessionRequestSubscriptions[boardID]
	b.clients[userID] = conn

	// if not already done, start listening to board session request changes
	if _, exist := b.subscriptions[userID]; !exist {
		b.subscriptions[userID] = socket.realtime.GetBoardSessionRequestChannel(context.Background(), boardID, userID)
		go b.startListeningOnBoardSessionRequest(userID)
	}
}

func (socket *WS) closeSocket(conn *websocket.Conn) {
	_ = technical_helper.CloseWebSocket(conn, "")
	websocketClosedCounter.Add(context.Background(), 1)
}
