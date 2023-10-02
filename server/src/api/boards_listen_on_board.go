package api

import (
	"context"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"
	"net/http"
	dto2 "scrumlr.io/server/common/dto"
	"scrumlr.io/server/logger"
	"scrumlr.io/server/realtime"
)

type BoardSubscription struct {
	subscription chan *realtime.BoardEvent
	clients      map[uuid.UUID]*websocket.Conn
}

func (s *Server) openBoardSocket(w http.ResponseWriter, r *http.Request) {
	id := r.Context().Value("Board").(uuid.UUID)
	userID := r.Context().Value("User").(uuid.UUID)

	conn, err := s.upgrader.Upgrade(w, r, nil)
	if err != nil {
		logger.FromRequest(r).Errorw("unable to upgrade websocket",
			"err", err,
			"board", id,
			"user", userID)
		return
	}

	board, requests, sessions, columns, notes, votings, votes, assignments, err := s.boards.FullBoard(r.Context(), id)
	if err != nil {
		logger.Get().Errorw("failed to prepare init message", "board", id, "user", userID, "err", err)
		s.closeBoardSocket(id, userID, conn)
		return
	}

	err = conn.WriteJSON(struct {
		Type realtime.BoardEventType `json:"type"`
		Data interface{}             `json:"data"`
	}{
		Type: realtime.BoardEventInit,
		Data: struct {
			Board       *dto2.Board                 `json:"board"`
			Columns     *dto2.WrappedColumns        `json:"columns"`
			Notes       []*dto2.Note                `json:"notes"`
			Votings     []*dto2.Voting              `json:"votings"`
			Votes       []*dto2.Vote                `json:"votes"`
			Sessions    []*dto2.BoardSession        `json:"participants"`
			Requests    []*dto2.BoardSessionRequest `json:"requests"`
			Assignments []*dto2.Assignment          `json:"assignments"`
		}{
			Board:       board,
			Columns:     columns,
			Notes:       notes,
			Votings:     votings,
			Votes:       votes,
			Sessions:    sessions,
			Requests:    requests,
			Assignments: assignments,
		},
	})
	if err != nil {
		logger.Get().Errorw("failed to send init message", "board", id, "user", userID, "err", err)
		s.closeBoardSocket(id, userID, conn)
		return
	}

	err = s.sessions.Connect(r.Context(), id, userID)
	if err != nil {
		logger.Get().Warnw("failed to connect session", "board", id, "user", userID, "err", err)
	}
	defer s.closeBoardSocket(id, userID, conn)

	s.listenOnBoard(id, userID, conn)

	for {
		_, message, err := conn.ReadMessage()
		if err != nil {
			if websocket.IsCloseError(err, websocket.CloseGoingAway) {
				logger.Get().Debugw("websocket to user no longer available, about to disconnect", "user", userID)
				delete(s.boardSubscriptions[id].clients, userID)
				err := s.sessions.Disconnect(r.Context(), id, userID)
				if err != nil {
					logger.Get().Warnw("failed to disconnected session", "board", id, "user", userID, "err", err)
				}
			}
			break
		}
		logger.Get().Debugw("received message", "message", message)
	}
}

func (s *Server) listenOnBoard(boardID, userID uuid.UUID, conn *websocket.Conn) {
	if _, exist := s.boardSubscriptions[boardID]; !exist {
		s.boardSubscriptions[boardID] = &BoardSubscription{
			clients: make(map[uuid.UUID]*websocket.Conn),
		}
	}

	b := s.boardSubscriptions[boardID]
	b.clients[userID] = conn

	// if not already done, start listening to board changes
	if b.subscription == nil {
		b.subscription = s.realtime.GetBoardChannel(boardID)
		go b.startListeningOnBoard()
	}
}

func (b *BoardSubscription) startListeningOnBoard() {
	for {
		select {
		case msg := <-b.subscription:
			logger.Get().Debugw("message received", "message", msg)
			for _, conn := range b.clients {
				err := conn.WriteJSON(msg)
				if err != nil {
					logger.Get().Warnw("failed to send message", "message", msg, "err", err)
				}
			}
		}
	}
}

func (s *Server) closeBoardSocket(board, user uuid.UUID, conn *websocket.Conn) {
	_ = conn.Close()
	err := s.sessions.Disconnect(context.Background(), board, user)
	if err != nil {
		logger.Get().Warnw("failed to disconnected session", "board", board, "user", user, "err", err)
	}
}
