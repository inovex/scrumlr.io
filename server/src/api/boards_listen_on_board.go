package api

import (
  "context"
  "encoding/json"
  "net/http"

  "scrumlr.io/server/boards"
  "scrumlr.io/server/sessions"

  "scrumlr.io/server/columns"
  "scrumlr.io/server/notes"

  "scrumlr.io/server/identifiers"

  "github.com/google/uuid"
  "github.com/gorilla/websocket"
  "scrumlr.io/server/draglocks"
  "scrumlr.io/server/logger"
  "scrumlr.io/server/reactions"
  "scrumlr.io/server/realtime"
)

type BoardSubscription struct {
  subscription      chan *realtime.BoardEvent
  clients           map[uuid.UUID]*websocket.Conn
  boardParticipants []*sessions.BoardSession
  boardSettings     *boards.Board
  boardColumns      []*columns.Column
  boardNotes        []*notes.Note
  boardReactions    []*reactions.Reaction
}

type InitEvent struct {
  Type realtime.BoardEventType `json:"type"`
  Data boards.FullBoard        `json:"data"`
}

func (s *Server) openBoardSocket(w http.ResponseWriter, r *http.Request) {
  log := logger.FromRequest(r)
  id := r.Context().Value(identifiers.BoardIdentifier).(uuid.UUID)
  userID := r.Context().Value(identifiers.UserIdentifier).(uuid.UUID)

  conn, err := s.upgrader.Upgrade(w, r, nil)
  if err != nil {
    log.Errorw("unable to upgrade websocket",
      "err", err,
      "board", id,
      "user", userID)
    return
  }

  fullBoard, err := s.boards.FullBoard(r.Context(), id)
  if err != nil {
    s.closeBoardSocket(id, userID, conn)
    return
  }

  initEvent := InitEvent{
    Type: realtime.BoardEventInit,
    Data: *fullBoard,
  }

  initEvent = eventInitFilter(initEvent, userID)
  err = conn.WriteJSON(initEvent)
  if err != nil {
    log.Errorw("failed to send init message", "board", id, "user", userID, "err", err)
    s.closeBoardSocket(id, userID, conn)
    return
  }

  err = s.sessions.Connect(r.Context(), id, userID)
  if err != nil {
    logger.Get().Warnw("failed to connect session", "board", id, "user", userID, "err", err)
  }
  defer s.closeBoardSocket(id, userID, conn)

  s.listenOnBoard(id, userID, conn, initEvent.Data)

  for {
    _, message, err := conn.ReadMessage()
    if err != nil {
      if websocket.IsCloseError(err, websocket.CloseGoingAway) {
        logger.Get().Debugw("websocket to user no longer available, about to disconnect", "user", userID)
        delete(s.boardSubscriptions[id].clients, userID)

        // Release any drag locks held by this user when disconnecting
        draglocks.ReleaseUserLocks(r.Context(), s.dragLocks, s.realtime, id, userID)

        err := s.sessions.Disconnect(r.Context(), id, userID)
        if err != nil {
          logger.Get().Warnw("failed to disconnected session", "board", id, "user", userID, "err", err)
        }
      }
      break
    }

    // Handle incoming WebSocket messages
    s.handleWebSocketMessage(r.Context(), id, userID, conn, message)
  }
}

func (s *Server) listenOnBoard(boardID, userID uuid.UUID, conn *websocket.Conn, initEventData boards.FullBoard) {
  if _, exist := s.boardSubscriptions[boardID]; !exist {
    s.boardSubscriptions[boardID] = &BoardSubscription{
      clients: make(map[uuid.UUID]*websocket.Conn),
    }
  }

  b := s.boardSubscriptions[boardID]
  b.clients[userID] = conn
  b.boardParticipants = initEventData.BoardSessions
  b.boardSettings = initEventData.Board
  b.boardColumns = initEventData.Columns
  b.boardNotes = initEventData.Notes
  b.boardReactions = initEventData.Reactions

  // if not already done, start listening to board changes
  if b.subscription == nil {
    b.subscription = s.realtime.GetBoardChannel(boardID)
    go b.startListeningOnBoard()
  }
}

func (bs *BoardSubscription) startListeningOnBoard() {
  for msg := range bs.subscription {
    logger.Get().Debugw("message received", "message", msg)
    for id, conn := range bs.clients {
      filteredMsg := bs.eventFilter(msg, id)
      if err := conn.WriteJSON(filteredMsg); err != nil {
        logger.Get().Warnw("failed to send message", "message", filteredMsg, "err", err)
      }
    }
  }
}

// handleWebSocketMessage routes incoming WebSocket messages to appropriate handlers
func (s *Server) handleWebSocketMessage(ctx context.Context, boardID, userID uuid.UUID, conn *websocket.Conn, rawMessage []byte) {
  var message draglocks.WebSocketMessage
  if err := json.Unmarshal(rawMessage, &message); err != nil {
    logger.Get().Errorw("failed to unmarshal websocket message", "error", err, "message", string(rawMessage))
    return
  }

  switch message.Type {
  case draglocks.WebSocketMessageTypeDragLock:
    draglocks.HandleWebSocketMessage(ctx, s.dragLocks, s.realtime, boardID, userID, conn, message.Data)
  default:
    logger.Get().Debugw("unknown websocket message type", "type", message.Type, "user", userID)
  }
}

func (s *Server) closeBoardSocket(board, user uuid.UUID, conn *websocket.Conn) {
  _ = conn.Close()
  err := s.sessions.Disconnect(context.Background(), board, user)
  if err != nil {
    logger.Get().Warnw("failed to disconnected session", "board", board, "user", user, "err", err)
  }
}
