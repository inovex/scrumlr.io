package sessionrequests

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"scrumlr.io/server/websocket"

	"github.com/google/uuid"
	"scrumlr.io/server/identifiers"
	"scrumlr.io/server/logger"
	"scrumlr.io/server/realtime"
)

type BoardSessionRequestSubscription struct {
	clients       map[uuid.UUID]websocket.Connection
	subscriptions map[uuid.UUID]chan *realtime.BoardSessionRequestEventType
}

type sessionRequestWebsocket struct {
	websocketService                 websocket.Upgrader
	realtime                         *realtime.Broker
	boardSessionRequestSubscriptions map[uuid.UUID]*BoardSessionRequestSubscription
}

const MaxRetries = 10
const SleepBetweenRetries = time.Second * 2

func NewSessionRequestWebsocket(webSocketService websocket.Upgrader, rt *realtime.Broker) SessionRequestWebsocket {
	websocket := new(sessionRequestWebsocket)
	websocket.websocketService = webSocketService
	websocket.realtime = rt
	websocket.boardSessionRequestSubscriptions = make(map[uuid.UUID]*BoardSessionRequestSubscription)

	return websocket
}

func (session *BoardSessionRequestSubscription) startListeningOnBoardSessionRequest(userId uuid.UUID) {
	msg := <-session.subscriptions[userId]
	logger.Get().Debugw("message received", "message", msg)
	conn := session.clients[userId]
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

	socket.listenOnBoardSessionRequest(boardId, userID, conn, SleepBetweenRetries)

	for {
		_, _, err := conn.Read(ctx)
		if err != nil {
			if socket.websocketService.IsNormalClose(err) {
				log.Debugw("websocket to user no longer available, about to disconnect", "user", userID)
				delete(socket.boardSessionRequestSubscriptions[boardId].clients, userID)
			}
			break
		}
	}
}

func (socket *sessionRequestWebsocket) listenOnBoardSessionRequest(boardID, userID uuid.UUID, conn websocket.Connection, retryDelay time.Duration) {
	log := logger.Get()
	if _, exist := socket.boardSessionRequestSubscriptions[boardID]; !exist {
		socket.boardSessionRequestSubscriptions[boardID] = &BoardSessionRequestSubscription{
			clients:       make(map[uuid.UUID]websocket.Connection),
			subscriptions: make(map[uuid.UUID]chan *realtime.BoardSessionRequestEventType),
		}
	}

	b := socket.boardSessionRequestSubscriptions[boardID]
	b.clients[userID] = conn

	// if not already done, start listening to board session request changes
	if _, exist := b.subscriptions[userID]; !exist {
		ch, err := socket.getBoardSessionRequestChannelWithRetry(boardID, userID, retryDelay)
		if err != nil {
			log.Errorw("could not establish board session request subscription after retries", "err", err)
			return
		}
		b.subscriptions[userID] = ch
		go b.startListeningOnBoardSessionRequest(userID)
	}
}

func (socket *sessionRequestWebsocket) getBoardSessionRequestChannelWithRetry(boardID, userID uuid.UUID, retryDelay time.Duration) (chan *realtime.BoardSessionRequestEventType, error) {
	log := logger.Get()

	for attempt := 1; attempt <= MaxRetries; attempt++ {
		ch, err := socket.realtime.GetBoardSessionRequestChannel(context.Background(), boardID, userID)
		if err == nil {
			return ch, nil
		}
		log.Warnw("failed to subscribe to board session request channel, retrying...", "attempt", attempt, "err", err)
		time.Sleep(retryDelay)
	}

	return nil, fmt.Errorf("failed to get session request channel for board %s and user %s after %d retries", boardID, userID, MaxRetries)
}

func (socket *sessionRequestWebsocket) closeSocket(conn websocket.Connection) {
	_ = conn.Close("")
	websocketClosedCounter.Add(context.Background(), 1)
}
