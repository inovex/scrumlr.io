package api

import (
  "context"
  "encoding/json"
  "net/http"

  "scrumlr.io/server/websocket"

  "github.com/google/uuid"
  "go.opentelemetry.io/otel/codes"
  "scrumlr.io/server/boards"
  "scrumlr.io/server/columns"
  "scrumlr.io/server/identifiers"
  "scrumlr.io/server/logger"
  "scrumlr.io/server/notes"
  "scrumlr.io/server/reactions"
  "scrumlr.io/server/realtime"
  "scrumlr.io/server/sessions"
)

type BoardSubscription struct {
  subscription      chan *realtime.BoardEvent
  clients           map[uuid.UUID]websocket.Connection
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
  ctx, span := tracer.Start(r.Context(), "scrumlr.listen.api.socket.open")
  defer span.End()
  log := logger.FromContext(ctx)

  id := ctx.Value(identifiers.BoardIdentifier).(uuid.UUID)
  userID := ctx.Value(identifiers.UserIdentifier).(uuid.UUID)

  conn, err := s.wsService.Accept(w, r, s.checkOrigin)
  if err != nil {
    span.SetStatus(codes.Error, "failed to upgrade websocket")
    span.RecordError(err)
    log.Errorw("unable to upgrade websocket", "err", err, "board", id, "user", userID)
    return
  }

  err = s.sessions.Connect(ctx, id, userID)
  if err != nil {
    span.SetStatus(codes.Error, "failed to connect session")
    span.RecordError(err)
    log.Warnw("failed to connect session", "board", id, "user", userID, "err", err)
  }
  defer s.closeBoardSocket(context.Background(), id, userID, conn, "normal closure")

  fullBoard, err := s.boards.FullBoard(ctx, id)
  if err != nil {
    message := "failed to get full board"
    span.SetStatus(codes.Error, message)
    span.RecordError(err)
    s.closeBoardSocket(ctx, id, userID, conn, message)
    return
  }

  initEvent := InitEvent{
    Type: realtime.BoardEventInit,
    Data: *fullBoard,
  }

  initEvent = eventInitFilter(initEvent, userID)

  err = conn.WriteJSON(ctx, initEvent)
  if err != nil {
    message := "failed to send init message"
    span.SetStatus(codes.Error, message)
    span.RecordError(err)
    log.Errorw(message, "board", id, "user", userID, "err", err)
    s.closeBoardSocket(ctx, id, userID, conn, message)
    return
  }

  s.listenOnBoard(ctx, id, userID, conn, initEvent.Data)

	for {
		_, message, err := conn.Read(ctx)
		if err != nil {
			if s.wsService.IsNormalClose(err) {
				log.Debugw("websocket to user no longer available, about to disconnect", "user", userID)
				delete(s.boardSubscriptions[id].clients, userID)
				err := s.sessions.Disconnect(ctx, id, userID)
				if err != nil {
					span.SetStatus(codes.Error, "failed to disconnect session")
					span.RecordError(err)
					log.Warnw("failed to disconnected session", "board", id, "user", userID, "err", err)
				}
			}
			break
		}
		// Handle incoming WebSocket messages
		s.handleWebSocketMessage(ctx, id, userID, conn, message)
	}
}

func (s *Server) listenOnBoard(ctx context.Context, boardID, userID uuid.UUID, conn websocket.Connection, initEventData boards.FullBoard) {
  if _, exist := s.boardSubscriptions[boardID]; !exist {
    s.boardSubscriptions[boardID] = &BoardSubscription{
      clients: make(map[uuid.UUID]websocket.Connection),
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
    b.subscription = s.realtime.GetBoardChannel(ctx, boardID)
    go b.startListeningOnBoard()
  }
}

func (bs *BoardSubscription) startListeningOnBoard() {
  for boardEvent := range bs.subscription {
    logger.Get().Debugw("board event received", "boardEvent", boardEvent)
    for id, conn := range bs.clients {
      filteredBoardEvent := bs.eventFilter(boardEvent, id)
      if err := conn.WriteJSON(context.Background(), filteredBoardEvent); err != nil {
        logger.Get().Warnw("failed to send board event to client", "filteredBoardEvent", filteredBoardEvent, "err", err)
      }
    }
  }
}

// handleWebSocketMessage routes incoming WebSocket messages to appropriate handlers
func (s *Server) handleWebSocketMessage(ctx context.Context, boardID, userID uuid.UUID, conn websocket.Connection, rawMessage []byte) {
	var message notes.WebSocketMessage
	if err := json.Unmarshal(rawMessage, &message); err != nil {
		logger.FromContext(ctx).Errorw("failed to unmarshal websocket message", "error", err, "message", string(rawMessage))
		return
	}

	switch message.Type {
	case notes.WebSocketMessageTypeDragLock:
		s.notes.HandleWebSocketMessage(ctx, boardID, userID, conn, message.Data)
	default:
		logger.FromContext(ctx).Debugw("unknown websocket message type", "type", message.Type, "user", userID)
	}
}

func (s *Server) closeBoardSocket(ctx context.Context, board, user uuid.UUID, conn websocket.Connection, reason string) {
  ctx, span := tracer.Start(ctx, "scrumlr.listen.api.socket.close")
  defer span.End()
  log := logger.FromContext(ctx)

	_ = conn.Close(reason)
	err := s.sessions.Disconnect(ctx, board, user)
	if err != nil {
		span.SetStatus(codes.Error, "failed to disconnect session")
		span.RecordError(err)
		log.Warnw("failed to disconnected session", "board", board, "user", user, "err", err)
	}
}
