package api

import (
	"encoding/json"
	"sort"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"
	dto2 "scrumlr.io/server/common/dto"
	"scrumlr.io/server/database/types"
	"scrumlr.io/server/logger"
	"scrumlr.io/server/realtime"
)

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

// ToDo: Refactor the client sorting or even find a better solution to avoid it
type client struct {
	userID uuid.UUID
	conn   *websocket.Conn
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

func sortClientsByRole(clients map[uuid.UUID]*websocket.Conn, boardParticipants []*dto2.BoardSession) []client {
	mappedClients := make([]client, 0, len(clients))
	for id := range clients {
		var role types.SessionRole
		// retrieve role
		for _, user := range boardParticipants {
			if id == user.User.ID {
				role = user.Role
			}
		}
		aClient := client{
			userID: id,
			conn:   clients[id],
			role:   role,
		}
		mappedClients = append(mappedClients, aClient)
	}

	// Sort new slice via Role and iterate over it
	sort.Sort(ByRole(mappedClients))
	return mappedClients
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
		}

		var ret realtime.BoardEvent
		var seeableNotes = make([]*dto2.Note, 0, len(boardSubscription.boardNotes))
		for _, note := range notes {
			for _, column := range boardSubscription.boardColumns {
				if (note.Position.Column == column.ID) && column.Visible {
					// BoardSettings -> Remove other participant cards
					if boardSubscription.boardSettings.ShowNotesOfOtherUsers {
						seeableNotes = append(seeableNotes, note)
					} else if !boardSubscription.boardSettings.ShowNotesOfOtherUsers && (userID == note.Author) {
						seeableNotes = append(seeableNotes, note)
					}
				}
			}
		}
		// Authors
		for _, note := range seeableNotes {
			if !boardSubscription.boardSettings.ShowAuthors && note.Author != userID {
				note.Author = uuid.Nil
			}
		}

		ret.Type = event.Type
		ret.Data = seeableNotes
		return &ret
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
				// BoardSettings -> Remove other participant cards
				if retEvent.Data.Board.ShowNotesOfOtherUsers {
					seeableNotes = append(seeableNotes, note)
				} else if !retEvent.Data.Board.ShowNotesOfOtherUsers && (clientID == note.Author) {
					seeableNotes = append(seeableNotes, note)
				}
			}
		}
	}
	// BoardSettings -> Author
	for _, note := range seeableNotes {
		if !retEvent.Data.Board.ShowAuthors && note.Author != clientID {
			note.Author = uuid.Nil
		}
	}

	retEvent.Data.Columns = seeableColumns
	retEvent.Data.Notes = seeableNotes
	return retEvent
}
