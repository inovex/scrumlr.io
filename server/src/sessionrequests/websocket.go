package sessionrequests

import (
  "context"
  "net/http"

  "github.com/google/uuid"
  "scrumlr.io/server/identifiers"
  "scrumlr.io/server/logger"
  "scrumlr.io/server/realtime"
  "scrumlr.io/server/technical_helper"
)

type BoardSessionRequestSubscription struct {
  clients       map[uuid.UUID]technical_helper.Connection
  subscriptions map[uuid.UUID]chan *realtime.BoardSessionRequestEventType
}

type sessionRequestWebsocket struct {
  websocketService                 technical_helper.WebSocketService
  realtime                         *realtime.Broker
  boardSessionRequestSubscriptions map[uuid.UUID]*BoardSessionRequestSubscription
}

func NewSessionRequestWebsocket(webSocketService technical_helper.WebSocketService, rt *realtime.Broker) SessionRequestWebsocket {
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

  socket.listenOnBoardSessionRequest(boardId, userID, conn)

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

func (socket *sessionRequestWebsocket) listenOnBoardSessionRequest(boardID, userID uuid.UUID, conn technical_helper.Connection) {
  if _, exist := socket.boardSessionRequestSubscriptions[boardID]; !exist {
    socket.boardSessionRequestSubscriptions[boardID] = &BoardSessionRequestSubscription{
      clients:       make(map[uuid.UUID]technical_helper.Connection),
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

func (socket *sessionRequestWebsocket) closeSocket(conn technical_helper.Connection) {
  _ = conn.Close("")
  websocketClosedCounter.Add(context.Background(), 1)
}
