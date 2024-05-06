package api

import (
	"context"
	"encoding/json"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"
	"net/http"
	"scrumlr.io/server/common/dto"
	"scrumlr.io/server/database/types"
	"scrumlr.io/server/identifiers"
	"scrumlr.io/server/logger"
	"scrumlr.io/server/realtime"
	"sync"
)

type BoardSubscription struct {
	subscription      map[realtime.SessionChannel]chan *realtime.BoardEvent
	clients           map[realtime.SessionChannel]map[uuid.UUID]*websocket.Conn
	boardParticipants []*dto.BoardSession
	boardSettings     *dto.Board
	boardColumns      []*dto.Column
	boardNotes        []*dto.Note
	boardReactions    []*dto.Reaction
	sync.Mutex
}

type InitEvent struct {
	Type realtime.BoardEventType `json:"type"`
	Data EventData               `json:"data"`
}

type EventData struct {
	Board     *dto.Board                 `json:"board"`
	Columns   []*dto.Column              `json:"columns"`
	Notes     []*dto.Note                `json:"notes"`
	Reactions []*dto.Reaction            `json:"reactions"`
	Votings   []*dto.Voting              `json:"votings"`
	Votes     []*dto.Vote                `json:"votes"`
	Sessions  []*dto.BoardSession        `json:"participants"`
	Requests  []*dto.BoardSessionRequest `json:"requests"`
}

func (s *Server) openBoardSocket(w http.ResponseWriter, r *http.Request) {
	boardID := r.Context().Value(identifiers.BoardIdentifier).(uuid.UUID)
	userID := r.Context().Value(identifiers.UserIdentifier).(uuid.UUID)

	userSession, err := s.sessions.Get(context.Background(), boardID, userID)
	if err != nil {
		logger.Get().Errorw("failed to fetch user session", "board", boardID, "user", userID, "err", err)
		return
	}
	isMod := !(userSession.Role == types.SessionRoleParticipant)

	conn, err := s.upgrader.Upgrade(w, r, nil)
	if err != nil {
		logger.FromRequest(r).Errorw("unable to upgrade websocket",
			"err", err,
			"board", boardID,
			"user", userID)
		return
	}

	board, requests, sessions, columns, notes, reactions, votings, votes, err := s.boards.FullBoard(r.Context(), boardID)
	if err != nil {
		logger.Get().Errorw("failed to prepare init message", "board", boardID, "user", userID, "err", err)
		s.closeBoardSocket(boardID, userID, conn)
		return
	}

	initEventData := EventData{
		Board:     board,
		Columns:   columns,
		Notes:     notes,
		Reactions: reactions,
		Votings:   votings,
		Votes:     votes,
		Sessions:  sessions,
		Requests:  requests,
	}

	initEvent := InitEvent{
		Type: realtime.BoardEventInit,
		Data: initEventData,
	}

	initEvent = eventInitFilter(initEvent, userID)
	err = conn.WriteJSON(initEvent)
	if err != nil {
		logger.Get().Errorw("failed to send init message", "board", boardID, "user", userID, "err", err)
		s.closeBoardSocket(boardID, userID, conn)
		return
	}

	err = s.sessions.Connect(r.Context(), boardID, userID)
	if err != nil {
		logger.Get().Warnw("failed to connect session", "board", boardID, "user", userID, "err", err)
	}
	defer s.closeBoardSocket(boardID, userID, conn)

	s.listenOnBoard(boardID, userSession, conn, initEvent.Data, isMod)

	boardSubscription := s.boardSubscriptions[boardID]
	if isMod {
		removeClosedConnection(boardSubscription, realtime.SessionChannelModerator, conn, boardID, userID, s, r)
	} else {
		removeClosedConnection(boardSubscription, realtime.SessionChannelParticipant, conn, boardID, userID, s, r)
	}
}

func removeClosedConnection(b *BoardSubscription, channel realtime.SessionChannel, conn *websocket.Conn, boardID, userID uuid.UUID, s *Server, r *http.Request) {
	for {
		_, message, err := conn.ReadMessage()
		if err != nil {
			if websocket.IsCloseError(err, websocket.CloseGoingAway) {
				logger.Get().Debugw("websocket to user no longer available, about to disconnect", "user", userID)
				delete(b.clients[channel], userID)
				err := s.sessions.Disconnect(r.Context(), boardID, userID)
				if err != nil {
					logger.Get().Warnw("failed to disconnected session", "board", boardID, "user", userID, "err", err)
				}
			}
			break
		}
		logger.Get().Debugw("received message", "message", message)
	}
}

func (s *Server) listenOnBoard(boardID uuid.UUID, userSession *dto.BoardSession, conn *websocket.Conn, initEventData EventData, isMod bool) {
	if _, exist := s.boardSubscriptions[boardID]; !exist {
		s.boardSubscriptions[boardID] = &BoardSubscription{
			clients: make(map[realtime.SessionChannel]map[uuid.UUID]*websocket.Conn),
		}
		s.boardSubscriptions[boardID].clients[realtime.SessionChannelModerator] = make(map[uuid.UUID]*websocket.Conn)
		s.boardSubscriptions[boardID].clients[realtime.SessionChannelParticipant] = make(map[uuid.UUID]*websocket.Conn)
		s.boardSubscriptions[boardID].subscription = make(map[realtime.SessionChannel]chan *realtime.BoardEvent)
	}

	b := s.boardSubscriptions[boardID]
	if isMod {
		b.clients[realtime.SessionChannelModerator][userSession.User.ID] = conn
	} else {
		b.clients[realtime.SessionChannelParticipant][userSession.User.ID] = conn
	}

	b.boardParticipants = initEventData.Sessions
	b.boardSettings = initEventData.Board
	b.boardColumns = initEventData.Columns
	b.boardNotes = initEventData.Notes
	b.boardReactions = initEventData.Reactions

	if b.subscription[realtime.SessionChannelModerator] == nil {
		b.subscription[realtime.SessionChannelModerator] = s.realtime.GetBoardChannel(boardID, realtime.SessionChannelModerator)
		go b.startListeningOnBoard(realtime.SessionChannelModerator)
	}

	if b.subscription[realtime.SessionChannelParticipant] == nil {
		b.subscription[realtime.SessionChannelParticipant] = s.realtime.GetBoardChannel(boardID, realtime.SessionChannelParticipant)
		go b.startListeningOnBoard(realtime.SessionChannelParticipant)
	}

}

func (b *BoardSubscription) startListeningOnBoard(channel realtime.SessionChannel) {

	for msg := range b.subscription[channel] {
		targetedSession := parseBoardSession(msg.Data)
		logger.Get().Debugw("message received", "message", msg)
		clients := b.clients[channel]

		for id, conn := range clients {
			filteredMsg := b.eventFilter(msg, id)
			if msg.Type == realtime.BoardEventParticipantUpdated && id == targetedSession.User.ID {
				b.changeChannel(channel, targetedSession)
			}
			b.Lock()
			err := conn.WriteJSON(filteredMsg)
			b.Unlock()
			if err != nil {
				logger.Get().Warnw("failed to send message", "message", filteredMsg, "err", err)
			}
		}

	}
}

func (b *BoardSubscription) changeChannel(channel realtime.SessionChannel, oldSession *dto.BoardSession) {
	if oldSession.Role == types.SessionRoleOwner {
		return
	}
	if oldSession.Role == types.SessionRoleModerator && channel == realtime.SessionChannelModerator || oldSession.Role == types.SessionRoleParticipant && channel == realtime.SessionChannelParticipant {
		return
	}

	conn := b.clients[channel][oldSession.User.ID]
	delete(b.clients[channel], oldSession.User.ID)
	if channel == realtime.SessionChannelModerator {
		b.clients[realtime.SessionChannelParticipant][oldSession.User.ID] = conn
		return
	} else {
		b.clients[realtime.SessionChannelModerator][oldSession.User.ID] = conn
		return
	}
}

func (s *Server) closeBoardSocket(board, user uuid.UUID, conn *websocket.Conn) {
	_ = conn.Close()
	err := s.sessions.Disconnect(context.Background(), board, user)
	if err != nil {
		logger.Get().Warnw("failed to disconnected session", "board", board, "user", user, "err", err)
	}
}

func parseBoardSession(data interface{}) *dto.BoardSession {
	session := new(dto.BoardSession)
	b, err := json.Marshal(data)
	if err != nil {
		return nil
	}
	err = json.Unmarshal(b, session)
	if err != nil {
		return nil
	}
	return session
}
