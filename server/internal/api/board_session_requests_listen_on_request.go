package api

import (
	"net/http"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"
	"scrumlr.io/server/internal/logger"
	"scrumlr.io/server/internal/realtime"
)

type BoardSessionRequestSubscription struct {
	clients       map[uuid.UUID]*websocket.Conn
	subscriptions map[uuid.UUID]chan *realtime.BoardSessionRequestEventType
}

func (s *Server) openBoardSessionRequestSocket(w http.ResponseWriter, r *http.Request) {
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
	defer s.closeBoardSessionRequestSocket(conn)

	s.listenOnBoardSessionRequest(id, userID, conn)

	for {
		_, message, err := conn.ReadMessage()
		if err != nil {
			if websocket.IsCloseError(err, websocket.CloseGoingAway) {
				logger.Get().Debugw("websocket to user no longer available, about to disconnect", "user", userID)
				delete(s.boardSessionRequestSubscriptions[id].clients, userID)
			}
			break
		}
		logger.Get().Debugw("received message", "message", message)
	}
}

func (s *Server) listenOnBoardSessionRequest(boardID, userID uuid.UUID, conn *websocket.Conn) {
	if _, exist := s.boardSessionRequestSubscriptions[boardID]; !exist {
		s.boardSessionRequestSubscriptions[boardID] = &BoardSessionRequestSubscription{
			clients:       make(map[uuid.UUID]*websocket.Conn),
			subscriptions: make(map[uuid.UUID]chan *realtime.BoardSessionRequestEventType),
		}
	}

	b := s.boardSessionRequestSubscriptions[boardID]
	b.clients[userID] = conn

	// if not already done, start listening to board session request changes
	if _, exist := b.subscriptions[userID]; !exist {
		b.subscriptions[userID] = s.realtime.GetBoardSessionRequestChannel(boardID, userID)
		go b.startListeningOnBoardSessionRequest(userID)
	}
}

func (b *BoardSessionRequestSubscription) startListeningOnBoardSessionRequest(userId uuid.UUID) {
	for {
		select {
		case msg := <-b.subscriptions[userId]:
			logger.Get().Debugw("message received", "message", msg)
			conn := b.clients[userId]
			err := conn.WriteJSON(msg)
			if err != nil {
				logger.Get().Warnw("failed to send message", "message", msg, "err", err)
			}
		}
	}
}

func (s *Server) closeBoardSessionRequestSocket(conn *websocket.Conn) {
	_ = conn.Close()
}
