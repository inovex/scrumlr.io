package sessionrequests

import (
	"context"
	"net/http"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"
	"scrumlr.io/server/identifiers"
	"scrumlr.io/server/logger"
	"scrumlr.io/server/realtime"
)

type BoardSessionRequestSubscription struct {
	clients       map[uuid.UUID]*websocket.Conn
	subscriptions map[uuid.UUID]chan *realtime.BoardSessionRequestEventType
}

type WS struct {
	upgrader                         websocket.Upgrader
	realtime                         *realtime.Broker
	boardSessionRequestSubscriptions map[uuid.UUID]*BoardSessionRequestSubscription
}

func NewWebsocket(upgrader websocket.Upgrader, rt *realtime.Broker) Websocket {
	websocket := new(WS)
	websocket.upgrader = upgrader
	websocket.realtime = rt
	websocket.boardSessionRequestSubscriptions = make(map[uuid.UUID]*BoardSessionRequestSubscription)

	return websocket
}

func (session *BoardSessionRequestSubscription) startListeningOnBoardSessionRequest(userId uuid.UUID) {
	msg := <-session.subscriptions[userId]
	logger.Get().Debugw("message received", "message", msg)
	conn := session.clients[userId]
	err := conn.WriteJSON(msg)
	if err != nil {
		logger.Get().Warnw("failed to send message", "message", msg, "err", err)
	}
}

func (socket *WS) OpenSocket(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	log := logger.FromContext(ctx)

	id := ctx.Value(identifiers.BoardIdentifier).(uuid.UUID)
	userID := ctx.Value(identifiers.UserIdentifier).(uuid.UUID)

	conn, err := socket.upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Errorw("unable to upgrade websocket",
			"err", err,
			"board", id,
			"user", userID)
		return
	}

	websocketOpenedCounter.Add(ctx, 1)
	defer socket.closeSocket(conn)

	socket.listenOnBoardSessionRequest(id, userID, conn)

	for {
		_, message, err := conn.ReadMessage()
		if err != nil {
			if websocket.IsCloseError(err, websocket.CloseGoingAway) {
				log.Debugw("websocket to user no longer available, about to disconnect", "user", userID)
				delete(socket.boardSessionRequestSubscriptions[id].clients, userID)
			}
			break
		}
		log.Debugw("received message", "message", message)
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
	_ = conn.Close()
	websocketClosedCounter.Add(context.Background(), 1)
}
