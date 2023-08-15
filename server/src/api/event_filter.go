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

type VoteUpdated struct {
	Notes  []*dto2.Note `json:"notes"`
	Voting *dto2.Voting `json:"voting"`
}

func parseVotingUpdatedEvent(data interface{}) (*VoteUpdated, error) {
	var ret *VoteUpdated
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
		return event
	}

	if event.Type == realtime.BoardEventVotingUpdated {
		voting, err := parseVotingUpdatedEvent(event.Data)
		if err != nil {
			logger.Get().Errorw("unable to parse votingUpdated in event filter", "board", boardSubscription.boardSettings.ID, "session", userID, "error", err)
		}
		if isMod {
			return event
		}

		if voting.Voting.Status != "CLOSED" {
			return event
		}

		ret := realtime.BoardEvent{
			Type: realtime.BoardEventVotingUpdated,
			Data: nil,
		}

		var filteredData = VoteUpdated{}
		var seeableNotes = make([]*dto2.Note, 0)
		if voting.Notes != nil {
			for _, note := range voting.Notes {
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
			filteredData.Notes = seeableNotes
		}

		// More filtering needed for voting results
		seeableVotingNotes := &dto2.VotingResults{}
		overallVoteCount := 0
		if voting.Notes != nil || len(voting.Notes) > 0 {
			allVotingResults := voting.Voting.VotingResults.Votes
			seeableVotingResults := make(map[uuid.UUID]dto2.VotingResultsPerNote)
			for _, note := range seeableNotes {
				if _, ok := allVotingResults[note.ID]; ok { // Check if note was voted on
					votingResult := seeableVotingResults[note.ID]
					votingResult.Total = allVotingResults[note.ID].Total
					votingResult.Users = allVotingResults[note.ID].Users

					seeableVotingResults[note.ID] = votingResult
					overallVoteCount += allVotingResults[note.ID].Total
				}
			}
			seeableVotingNotes.Total = overallVoteCount
			seeableVotingNotes.Votes = seeableVotingResults
		}
		filteredData.Notes = seeableNotes
		filteredData.Voting = voting.Voting                    // To keep voting settings
		filteredData.Voting.VotingResults = seeableVotingNotes // override just the filtered data

		ret.Data = filteredData
		return &ret
	}
	// returns, if no filter match occured
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

	// Votes
	seeableVotes := make([]*dto2.Vote, 0)
	for _, v := range event.Data.Votes {
		for _, n := range seeableNotes {
			if v.Note == n.ID {
				aVote := dto2.Vote{
					Voting: v.Voting,
					Note:   n.ID,
				}
				seeableVotes = append(seeableVotes, &aVote)
			}
		}
	}

	// Votings
	seeableVotings := make([]*dto2.Voting, 0)
	for _, v := range event.Data.Votings {
		overallVoteCount := 0
		seeableVoting := v

		allVotingResults := v.VotingResults.Votes
		seeableVotingResults := make(map[uuid.UUID]dto2.VotingResultsPerNote)
		for _, note := range seeableNotes {
			if _, ok := allVotingResults[note.ID]; ok { // Check if note was voted on
				votingResult := seeableVotingResults[note.ID]
				votingResult.Total = allVotingResults[note.ID].Total
				votingResult.Users = allVotingResults[note.ID].Users

				seeableVotingResults[note.ID] = votingResult
				overallVoteCount += allVotingResults[note.ID].Total
			}
		}
		seeableVoting.VotingResults.Total = overallVoteCount
		seeableVoting.VotingResults.Votes = seeableVotingResults
		seeableVotings = append(seeableVotings, seeableVoting)
	}

	retEvent.Data.Columns = seeableColumns
	retEvent.Data.Notes = seeableNotes
	retEvent.Data.Votes = seeableVotes
	retEvent.Data.Votings = seeableVotings
	return retEvent
}
