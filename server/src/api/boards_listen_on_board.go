package api

import (
	"context"
	"net/http"
	"time"

	"scrumlr.io/server/boards"
	"scrumlr.io/server/common"
	"scrumlr.io/server/users"
	"scrumlr.io/server/votings"

	"scrumlr.io/server/columns"
	"scrumlr.io/server/notes"
	"scrumlr.io/server/sessionrequests"

	"scrumlr.io/server/identifiers"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"
	"scrumlr.io/server/logger"
	"scrumlr.io/server/reactions"
	"scrumlr.io/server/realtime"
)

type BoardSubscription struct {
	subscription      chan *realtime.BoardEvent
	clients           map[uuid.UUID]*websocket.Conn
	boardParticipants []*FullSession
	boardSettings     *boards.Board
	boardColumns      []*columns.Column
	boardNotes        []*notes.Note
	boardReactions    []*reactions.Reaction
}

type InitEvent struct {
	Type realtime.BoardEventType `json:"type"`
	Data FullBoard               `json:"data"`
}

type FullSession struct {
	User              users.User         `json:"user"`
	Connected         bool               `json:"connected"`
	ShowHiddenColumns bool               `json:"showHiddenColumns"`
	Ready             bool               `json:"ready"`
	RaisedHand        bool               `json:"raisedHand"`
	Role              common.SessionRole `json:"role"`
	CreatedAt         time.Time          `json:"createdAt"`
	Banned            bool               `json:"banned"`
}

type FullBoard struct {
	Board                *boards.Board                          `json:"board"`
	BoardSessionRequests []*sessionrequests.BoardSessionRequest `json:"requests"`
	BoardSessions        []*FullSession                         `json:"participants"`
	Columns              []*columns.Column                      `json:"columns"`
	Notes                []*notes.Note                          `json:"notes"`
	Reactions            []*reactions.Reaction                  `json:"reactions"`
	Votings              []*votings.Voting                      `json:"votings"`
	Votes                []*votings.Vote                        `json:"votes"`
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

	board, err := s.boards.FullBoard(r.Context(), id)
	if err != nil {
		s.closeBoardSocket(id, userID, conn)
		return
	}

	fullSessions := make([]*FullSession, len(board.BoardSessions))
	for i, session := range board.BoardSessions {
		user, err := s.users.Get(r.Context(), session.User)
		if err != nil {
			common.Throw(w, r, err)
			return
		}

		fullSessions[i] = &FullSession{
			User:              *user,
			Connected:         session.Connected,
			ShowHiddenColumns: session.ShowHiddenColumns,
			Ready:             session.Ready,
			RaisedHand:        session.RaisedHand,
			Role:              session.Role,
			CreatedAt:         session.CreatedAt,
			Banned:            session.Banned,
		}
	}

	fullBoard := FullBoard{
		Board:                board.Board,
		BoardSessionRequests: board.BoardSessionRequests,
		BoardSessions:        fullSessions,
		Columns:              board.Columns,
		Notes:                board.Notes,
		Reactions:            board.Reactions,
		Votings:              board.Votings,
		Votes:                board.Votes,
	}

	initEvent := InitEvent{
		Type: realtime.BoardEventInit,
		Data: fullBoard,
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

func (s *Server) listenOnBoard(boardID, userID uuid.UUID, conn *websocket.Conn, initEventData FullBoard) {
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
		go s.startListeningOnBoard(b)
	}
}

func (s *Server) startListeningOnBoard(bs *BoardSubscription) {
	for msg := range bs.subscription {
		logger.Get().Debugw("message received", "message", msg)
		for id, conn := range bs.clients {
			filteredMsg := s.eventFilter(bs, msg, id)
			if err := conn.WriteJSON(filteredMsg); err != nil {
				logger.Get().Warnw("failed to send message", "message", filteredMsg, "err", err)
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
