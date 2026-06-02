package sessionrequests

import (
	"context"
	"net/http"
	"sync"

	"scrumlr.io/server/websocket"

	"github.com/google/uuid"
	"scrumlr.io/server/identifiers"
	"scrumlr.io/server/logger"
	"scrumlr.io/server/realtime"
)

type BoardSessionRequestSubscription struct {
	clients       map[uuid.UUID]websocket.Connection
	subscriptions map[uuid.UUID]chan *realtime.BoardSessionRequestEventType

	mu sync.RWMutex
}

type sessionRequestWebsocket struct {
	websocketService                 websocket.WebSocketInterface
	realtime                         *realtime.Broker
	boardSessionRequestSubscriptions map[uuid.UUID]*BoardSessionRequestSubscription

	subscriptionMu sync.RWMutex
}

func NewSessionRequestWebsocket(webSocketService websocket.WebSocketInterface, rt *realtime.Broker) SessionRequestWebsocket {
	websocket := new(sessionRequestWebsocket)
	websocket.websocketService = webSocketService
	websocket.realtime = rt
	websocket.boardSessionRequestSubscriptions = make(map[uuid.UUID]*BoardSessionRequestSubscription)

	return websocket
}

func (session *BoardSessionRequestSubscription) startListeningOnBoardSessionRequest(userId uuid.UUID) {
	session.mu.RLock()
	ch := session.subscriptions[userId]
	session.mu.RUnlock()
	// if ch is nil we block forever -> potential memory leak?
	msg := <-ch
	logger.Get().Debugw("message received", "message", msg)
	session.mu.RLock()
	conn := session.clients[userId]
	session.mu.RUnlock()
	err := conn.WriteJSON(context.Background(), msg)
	if err != nil {
		logger.Get().Warnw("failed to send message", "message", msg, "err", err)
	}
}

func (socket *sessionRequestWebsocket) OpenSocket(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	log := logger.FromContext(ctx)

	boardId := ctx.Value(identifiers.BoardIdentifier).(uuid.UUID)
	userID := ctx.Value(identifiers.UserIdentifier).(uuid.UUID)

	conn, err := socket.websocketService.Accept(w, r, true)
	if err != nil {
		log.Errorw("unable to upgrade websocket", "err", err, "board", boardId, "user", userID)
		return
	}

	websocketOpenedCounter.Add(ctx, 1)
	defer socket.closeSocket(conn)

	socket.listenOnBoardSessionRequest(boardId, userID, conn)

	for {
		_, _, err := conn.Read(ctx)
		if err != nil {
			if socket.websocketService.IsNormalClose(err) {
				log.Debugw("websocket to user no longer available, about to disconnect", "user", userID)
				socket.subscriptionMu.RLock()
				bs := socket.boardSessionRequestSubscriptions[boardId]
				socket.subscriptionMu.RUnlock()
				if bs != nil {
					bs.mu.Lock()
					delete(bs.clients, userID)
					bs.mu.Unlock()
				}
			}
			break
		}
	}
}

func (socket *sessionRequestWebsocket) listenOnBoardSessionRequest(boardID, userID uuid.UUID, conn websocket.Connection) {
	socket.subscriptionMu.Lock()
	if _, exist := socket.boardSessionRequestSubscriptions[boardID]; !exist {
		socket.boardSessionRequestSubscriptions[boardID] = &BoardSessionRequestSubscription{
			clients:       make(map[uuid.UUID]websocket.Connection),
			subscriptions: make(map[uuid.UUID]chan *realtime.BoardSessionRequestEventType),
		}
	}

	b := socket.boardSessionRequestSubscriptions[boardID]
	socket.subscriptionMu.Unlock()
	b.mu.Lock()
	b.clients[userID] = conn

	// if not already done, start listening to board session request changes
	startListener := false

	if _, exist := b.subscriptions[userID]; !exist {
		// TODO: avoid locking while performing IO
		b.subscriptions[userID] = socket.realtime.GetBoardSessionRequestChannel(context.Background(), boardID, userID)
		startListener = true
	}
	b.mu.Unlock()
	if startListener {
		go b.startListeningOnBoardSessionRequest(userID)
	}
}

func (socket *sessionRequestWebsocket) closeSocket(conn websocket.Connection) {
	_ = conn.Close("")
	websocketClosedCounter.Add(context.Background(), 1)
}
