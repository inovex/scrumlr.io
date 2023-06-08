package api

import (
	"context"
	"encoding/json"
	"net/http"
	"sort"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"
	dto2 "scrumlr.io/server/common/dto"
	"scrumlr.io/server/database/types"
	"scrumlr.io/server/logger"
	"scrumlr.io/server/realtime"
)

type BoardSubscription struct {
	subscription      chan *realtime.BoardEvent
	clients           map[uuid.UUID]*websocket.Conn
	boardParticipants []*dto2.BoardSession
	boardSettings     *dto2.Board
	boardColumns      []*dto2.Column
	boardNotes        []*dto2.Note
}

type InitEvent struct {
	Type realtime.BoardEventType `json:"type"`
	Data EventData               `json:"data"`
}

type EventData struct {
	Board       *dto2.Board                 `json:"board"`
	Columns     []*dto2.Column              `json:"columns"`
	Notes       []*dto2.Note                `json:"notes"`
	Votings     []*dto2.Voting              `json:"votings"`
	Votes       []*dto2.Vote                `json:"votes"`
	Sessions    []*dto2.BoardSession        `json:"participants"`
	Requests    []*dto2.BoardSessionRequest `json:"requests"`
	Assignments []*dto2.Assignment          `json:"assignments"`
}

type Event struct {
	Type realtime.BoardEventType `json:"type"`
	Data interface{}             `json:"data"`
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

	eventData := EventData{
		Board:       board,
		Columns:     columns,
		Notes:       notes,
		Votings:     votings,
		Votes:       votes,
		Sessions:    sessions,
		Requests:    requests,
		Assignments: assignments,
	}

	initEvent := InitEvent{
		Type: realtime.BoardEventInit,
		Data: eventData,
	}

	initEvent = eventInitFilter(initEvent, userID)
	err = conn.WriteJSON(initEvent)
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

	s.listenOnBoard(id, userID, conn, initEvent)

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

func (s *Server) listenOnBoard(boardID, userID uuid.UUID, conn *websocket.Conn, initEvent InitEvent) {
	if _, exist := s.boardSubscriptions[boardID]; !exist {
		s.boardSubscriptions[boardID] = &BoardSubscription{
			clients: make(map[uuid.UUID]*websocket.Conn),
		}
	}

	b := s.boardSubscriptions[boardID]
	b.clients[userID] = conn
	b.boardParticipants = initEvent.Data.Sessions
	b.boardSettings = initEvent.Data.Board
	b.boardColumns = initEvent.Data.Columns
	b.boardNotes = initEvent.Data.Notes

	// if not already done, start listening to board changes
	if b.subscription == nil {
		b.subscription = s.realtime.GetBoardChannel(boardID)
		go b.startListeningOnBoard()
	}
}

// Refactor this client sorting, since it copies the websocket conn, which is a mutex
type client struct {
	userID uuid.UUID
	conn   websocket.Conn
	role   types.SessionRole
}

type ByRole []client

func (b ByRole) Len() int {
	return len(b)
}

func (b ByRole) Less(i, j int) bool {
	return b[i].role < b[j].role
}

func (b ByRole) Swap(i, j int) {
	b[i], b[j] = b[j], b[i]
}

func (b *BoardSubscription) startListeningOnBoard() {
	for {
		select {
		case msg := <-b.subscription:
			logger.Get().Debugw("message received", "message", msg)

			sortedClients := make([]client, 0, len(b.clients))
			for id := range b.clients {
				var role types.SessionRole
				// retrieve role
				for _, user := range b.boardParticipants {
					if id == user.User.ID {
						role = user.Role
					}
				}
				// create client
				aClient := client{
					userID: id,
					conn:   *b.clients[id],
					role:   role,
				}

				// Add client to sortedClients slice
				sortedClients = append(sortedClients, aClient)
			}

			// Sort new slice via Role and iterate over it
			sort.Sort(ByRole(sortedClients))

			for _, user := range sortedClients {
				msg = b.eventFilter(msg, user.userID)
				err := user.conn.WriteJSON(msg)
				if err != nil {
					logger.Get().Warnw("failed to send message", "message", msg, "err", err)
				}
			}
		}
	}
}

func isModerator(clientID uuid.UUID, sessions []*dto2.BoardSession) bool {
	for _, session := range sessions {
		if clientID == session.User.ID {
			if session.Role == types.SessionRoleModerator || session.Role == types.SessionRoleOwner {
				return true
			}
		}
	}
	return false
}

func parseColumnUpdatedEvent(data interface{}) ([]*dto2.Column, error) {
	var ret []*dto2.Column
	b, err := json.Marshal(data)
	if err != nil {
		return nil, err
	}
	err = json.Unmarshal(b, &ret)
	if err != nil {
		return nil, err
	}
	return ret, nil
}

func parseNotesUpdated(data interface{}) ([]*dto2.Note, error) {
	var ret []*dto2.Note

	b, err := json.Marshal(data)
	if err != nil {
		return nil, err
	}
	err = json.Unmarshal(b, &ret)
	if err != nil {
		return nil, err
	}
	return ret, nil
}

func parseBoardUpdated(data interface{}) (*dto2.Board, error) {
	var ret *dto2.Board

	b, err := json.Marshal(data)
	if err != nil {
		return nil, err
	}
	err = json.Unmarshal(b, &ret)
	if err != nil {
		return nil, err
	}
	return ret, nil
}

func (boardSubscription *BoardSubscription) eventFilter(event *realtime.BoardEvent, userID uuid.UUID) *realtime.BoardEvent {
	isMod := isModerator(userID, boardSubscription.boardParticipants)

	if event.Type == realtime.BoardEventColumnsUpdated {
		columns, err := parseColumnUpdatedEvent(event.Data)
		if err != nil {
			logger.Get().Errorw("unable to parse columnUpdated in event filter", "board", boardSubscription.boardSettings.ID, "session", userID, "error", err)
		}

		// Cache the incoming changes, mod only since they receive all changes
		if isMod {
			boardSubscription.boardColumns = columns
			return event
		}

		var ret realtime.BoardEvent
		var seeableColumns = make([]*dto2.Column, 0, len(boardSubscription.boardColumns))

		for _, column := range columns {
			if column.Visible && !isMod {
				seeableColumns = append(seeableColumns, column)
			}
		}
		ret.Type = event.Type
		ret.Data = seeableColumns

		return &ret
	}

	if event.Type == realtime.BoardEventNotesUpdated {
		notes, err := parseNotesUpdated(event.Data)
		if err != nil {
			logger.Get().Errorw("unable to parse notesUpdated in event filter", "board", boardSubscription.boardSettings.ID, "session", userID, "error", err)
		}

		if isMod {
			boardSubscription.boardNotes = notes
			return event

			// // New Code
			// newSlice := make([]*dto2.Note, len(boardSubscription.boardNotes)+1, cap(boardSubscription.boardNotes)+1)

			// // copy the original slice to the new slice
			// copy(newSlice, boardSubscription.boardNotes)

			// // create a new MyStruct instance for the new entry
			// newEntry := notes[len(notes)-1]

			// // append the new entry to the new slice
			// newSlice[len(newSlice)-1] = newEntry

			// // update the pointer reference to point to the new slice
			// boardSubscription.boardNotes = newSlice

			// return event
		}

		var ret realtime.BoardEvent
		var seeableNotes = make([]*dto2.Note, 0, len(boardSubscription.boardNotes))

		for _, note := range notes {
			for _, column := range boardSubscription.boardColumns {
				if (note.Position.Column == column.ID) && column.Visible {
					seeableNotes = append(seeableNotes, note)
				}
			}
		}
		ret.Type = event.Type
		ret.Data = seeableNotes

		return &ret

		// // Authors
		// for id, note := range ret.Data {
		// 	if !boardSubscription.boardSettings.ShowAuthors && note.Author != userID {
		// 		notes[id].Author = uuid.Nil
		// 	}
		// }
		// event.Data = notes
	}

	if event.Type == realtime.BoardEventBoardUpdated {
		boardSettings, err := parseBoardUpdated(event.Data)
		if err != nil {
			logger.Get().Errorw("unable to parse boardUpdated in event filter", "board", boardSubscription.boardSettings.ID, "session", userID, "error", err)
		}
		if isMod {
			boardSubscription.boardSettings = boardSettings
			event.Data = boardSettings
			return event
		}
	}

	return event
}

func eventInitFilter(event InitEvent, clientID uuid.UUID) InitEvent {
	isMod := isModerator(clientID, event.Data.Sessions)
	if isMod {
		return event
	}

	var seeableColumns = make([]*dto2.Column, 0)
	var seeableNotes = make([]*dto2.Note, 0)
	retEvent := InitEvent{
		Type: event.Type,
		Data: EventData{
			Board:       event.Data.Board,
			Notes:       nil,
			Columns:     nil,
			Votings:     event.Data.Votings,
			Votes:       event.Data.Votes,
			Sessions:    event.Data.Sessions,
			Requests:    event.Data.Requests,
			Assignments: event.Data.Assignments,
		},
	}

	// Columns
	for _, column := range event.Data.Columns {
		if column.Visible {
			seeableColumns = append(seeableColumns, column)
		}
	}

	// Notes
	for _, note := range event.Data.Notes {
		for _, column := range seeableColumns {
			if note.Position.Column == column.ID {
				seeableNotes = append(seeableNotes, note)
			}
		}
	}

	retEvent.Data.Columns = seeableColumns
	retEvent.Data.Notes = seeableNotes

	return retEvent
}

func (s *Server) closeBoardSocket(board, user uuid.UUID, conn *websocket.Conn) {
	_ = conn.Close()
	err := s.sessions.Disconnect(context.Background(), board, user)
	if err != nil {
		logger.Get().Warnw("failed to disconnected session", "board", board, "user", user, "err", err)
	}
}
