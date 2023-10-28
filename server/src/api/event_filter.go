package api

import (
	"encoding/json"

	"github.com/google/uuid"
	"scrumlr.io/server/common/dto"
	"scrumlr.io/server/database/types"
	"scrumlr.io/server/logger"
	"scrumlr.io/server/realtime"
)

func isModerator(clientID uuid.UUID, sessions []*dto.BoardSession) bool {
	for _, session := range sessions {
		if clientID == session.User.ID {
			if session.Role == types.SessionRoleModerator || session.Role == types.SessionRoleOwner {
				return true
			}
		}
	}
	return false
}

func parseColumnUpdated(data interface{}) ([]*dto.Column, error) {
	var ret []*dto.Column

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

func parseNotesUpdated(data interface{}) ([]*dto.Note, error) {
	var ret []*dto.Note

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

func parseBoardUpdated(data interface{}) (*dto.Board, error) {
	var ret *dto.Board

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

type VotingUpdated struct {
	Notes  []*dto.Note `json:"notes"`
	Voting *dto.Voting `json:"voting"`
}

func parseVotingUpdated(data interface{}) (*VotingUpdated, error) {
	var ret *VotingUpdated

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

func filterColumns(eventColumns []*dto.Column) []*dto.Column {
	var visibleColumns = make([]*dto.Column, 0, len(eventColumns))
	for _, column := range eventColumns {
		if column.Visible {
			visibleColumns = append(visibleColumns, column)
		}
	}

	return visibleColumns
}

func filterNotes(eventNotes []*dto.Note, userID uuid.UUID, boardSettings *dto.Board, columns []*dto.Column) []*dto.Note {
	var visibleNotes = make([]*dto.Note, 0, len(eventNotes))
	for _, note := range eventNotes {
		for _, column := range columns {
			if (note.Position.Column == column.ID) && column.Visible {
				// BoardSettings -> Remove other participant cards
				if boardSettings.ShowNotesOfOtherUsers {
					visibleNotes = append(visibleNotes, note)
				} else if userID == note.Author {
					visibleNotes = append(visibleNotes, note)
				}
			}
		}
	}
	// Authors
	for _, note := range visibleNotes {
		if !boardSettings.ShowAuthors && note.Author != userID {
			note.Author = uuid.Nil
		}
	}

	return visibleNotes
}

func filterVotingUpdated(voting *VotingUpdated, userID uuid.UUID, boardSettings *dto.Board, columns []*dto.Column) *VotingUpdated {
	filteredVoting := voting
	// Filter voting notes
	filteredVotingNotes := filterNotes(voting.Notes, userID, boardSettings, columns)

	// Safeguard if voting is terminated without any votes
	if voting.Voting.VotingResults == nil {
		ret := &VotingUpdated{
			Notes:  filteredVotingNotes,
			Voting: voting.Voting,
		}
		return ret
	}

	// Filter voting results
	filteredVotingResult := &dto.VotingResults{
		Votes: make(map[uuid.UUID]dto.VotingResultsPerNote),
	}
	overallVoteCount := 0
	mappedResultVotes := voting.Voting.VotingResults.Votes
	for _, note := range filteredVotingNotes {
		if voteResults, ok := mappedResultVotes[note.ID]; ok { // Check if note was voted on
			filteredVotingResult.Votes[note.ID] = dto.VotingResultsPerNote{
				Total: voteResults.Total,
				Users: voteResults.Users,
			}
			overallVoteCount += mappedResultVotes[note.ID].Total
		}
	}
	filteredVotingResult.Total = overallVoteCount

	filteredVoting.Notes = filteredVotingNotes
	filteredVoting.Voting.VotingResults = filteredVotingResult

	return filteredVoting
}

func filterVoting(voting *dto.Voting, filteredNotes []*dto.Note) *dto.Voting {
	if voting.VotingResults == nil {
		return voting
	}

	filteredVoting := voting
	filteredVotingResult := &dto.VotingResults{
		Votes: make(map[uuid.UUID]dto.VotingResultsPerNote),
	}
	overallVoteCount := 0
	mappedResultVotes := voting.VotingResults.Votes
	for _, note := range filteredNotes {
		if votingResult, ok := mappedResultVotes[note.ID]; ok { // Check if note was voted on
			filteredVotingResult.Votes[note.ID] = dto.VotingResultsPerNote{
				Total: votingResult.Total,
				Users: votingResult.Users,
			}
			overallVoteCount += mappedResultVotes[note.ID].Total
		}
	}
	filteredVotingResult.Total = overallVoteCount

	filteredVoting.VotingResults = filteredVotingResult

	return filteredVoting
}

func (boardSubscription *BoardSubscription) eventFilter(event *realtime.BoardEvent, userID uuid.UUID) *realtime.BoardEvent {
	isMod := isModerator(userID, boardSubscription.boardParticipants)
	if event.Type == realtime.BoardEventColumnUpdated {
		columns, err := parseColumnUpdated(event.Data)
		if err != nil {
			logger.Get().Errorw("unable to parse columnUpdated in event filter", "board", boardSubscription.boardSettings.ID, "session", userID, "error", err)
		}
		// Cache the incoming changes, mod only since they receive all changes
		if isMod {
			boardSubscription.boardColumns = columns
			return event
		}

		filteredColumns := filterColumns(columns)
		ret := realtime.BoardEvent{
			Type: event.Type,
			Data: filteredColumns,
		}

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

		filteredNotes := filterNotes(notes, userID, boardSubscription.boardSettings, boardSubscription.boardColumns)
		ret := realtime.BoardEvent{
			Type: event.Type,
			Data: filteredNotes,
		}

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
		voting, err := parseVotingUpdated(event.Data)
		if err != nil {
			logger.Get().Errorw("unable to parse votingUpdated in event filter", "board", boardSubscription.boardSettings.ID, "session", userID, "error", err)
		}
		if isMod {
			return event
		}
		if voting.Voting.Status != types.VotingStatusClosed {
			return event
		}

		filteredVoting := filterVotingUpdated(voting, userID, boardSubscription.boardSettings, boardSubscription.boardColumns)
		ret := realtime.BoardEvent{
			Type: event.Type,
			Data: filteredVoting,
		}
		return &ret
	}

	if event.Type == realtime.BoardEventNotesSync {
		notes, err := parseNotesUpdated(event.Data)
		if err != nil {
			logger.Get().Errorw("unable to parse notesUpdated in event filter", "board", boardSubscription.boardSettings.ID, "session", userID, "error", err)
		}

		if isMod {
			boardSubscription.boardNotes = notes
			return event
		}

		filteredNotes := filterNotes(notes, userID, boardSubscription.boardSettings, boardSubscription.boardColumns)
		ret := realtime.BoardEvent{
			Type: event.Type,
			Data: filteredNotes,
		}

		return &ret
	}
	// returns, if no filter match occurred
	return event
}

func eventInitFilter(event InitEvent, clientID uuid.UUID) InitEvent {
	isMod := isModerator(clientID, event.Data.Sessions)
	if isMod {
		return event
	}

	retEvent := InitEvent{
		Type: event.Type,
		Data: EventData{
			WrappedColumns: nil,
			Board:          event.Data.Board,
			Notes:          nil,
			Reactions:      event.Data.Reactions,
			Votings:        event.Data.Votings,
			Votes:          event.Data.Votes,
			Sessions:       event.Data.Sessions,
			Requests:       event.Data.Requests,
			Assignments:    event.Data.Assignments,
		},
	}
	// Columns
	filteredColumns := filterColumns(event.Data.Columns)

	// Notes
	filteredNotes := filterNotes(event.Data.Notes, clientID, event.Data.Board, event.Data.Columns)

	// Votes
	visibleVotes := make([]*dto.Vote, 0)
	for _, v := range event.Data.Votes {
		for _, n := range filteredNotes {
			if v.Note == n.ID {
				aVote := dto.Vote{
					Voting: v.Voting,
					Note:   n.ID,
				}
				visibleVotes = append(visibleVotes, &aVote)
			}
		}
	}
	// Votings
	visibleVotings := make([]*dto.Voting, 0)
	for _, v := range event.Data.Votings {
		filteredVoting := filterVoting(v, filteredNotes)
		visibleVotings = append(visibleVotings, filteredVoting)
	}

	retEvent.Data.Columns = filteredColumns
	retEvent.Data.Notes = filteredNotes
	retEvent.Data.Votes = visibleVotes
	retEvent.Data.Votings = visibleVotings

	return retEvent
}
