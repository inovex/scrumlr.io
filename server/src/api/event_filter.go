package api

import (
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

type VotingUpdated struct {
	Notes  []*dto.Note `json:"notes"`
	Voting *dto.Voting `json:"voting"`
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
	var visibleNotes = make([]*dto.Note, 0)
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
	if event.Type == realtime.BoardEventColumnsUpdated {
		columns, err := unmarshalSlice[dto.Column](event.Data)
		if err != nil {
			logger.Get().Errorw("unable to parse columnUpdated in event filter", "board", boardSubscription.boardSettings.ID, "session", userID, "err", err)
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

		return &ret // after this event, a syncNotes event is triggered from the board service
	}

	if event.Type == realtime.BoardEventNotesUpdated {
		notes, err := unmarshalSlice[dto.Note](event.Data)
		if err != nil {
			logger.Get().Errorw("unable to parse notesUpdated in event filter", "board", boardSubscription.boardSettings.ID, "session", userID, "err", err)
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
		boardSettings, err := unmarshal[dto.Board](event.Data)
		if err != nil {
			logger.Get().Errorw("unable to parse boardUpdated in event filter", "board", boardSubscription.boardSettings.ID, "session", userID, "err", err)
		}
		if isMod {
			boardSubscription.boardSettings = boardSettings
			event.Data = boardSettings
			return event
		}
		return event // after this event, a syncNotes event is triggered from the board service
	}

	if event.Type == realtime.BoardEventVotingUpdated {
		voting, err := unmarshal[VotingUpdated](event.Data)
		if err != nil {
			logger.Get().Errorw("unable to parse votingUpdated in event filter", "board", boardSubscription.boardSettings.ID, "session", userID, "err", err)
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
		notes, err := unmarshalSlice[dto.Note](event.Data)

		if err != nil {
			logger.Get().Errorw("unable to parse notesUpdated in event filter", "board", boardSubscription.boardSettings.ID, "session", userID, "err", err)
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

	if event.Type == realtime.BoardEventParticipantUpdated {
		participant, err := unmarshal[dto.BoardSession](event.Data)
		if err != nil {
			logger.Get().Errorw("unable to parse participantUpdated in event filter", "board", boardSubscription.boardSettings.ID, "session", userID, "err", err)
		}

		if isMod {
			// Cache the changes of when a participant got updated
			for idx, user := range boardSubscription.boardParticipants {
				if user.User.ID == participant.User.ID {
					boardSubscription.boardParticipants[idx] = participant
				}
			}
		}
	}

	if event.Type == realtime.BoardEventVotesDeleted {
		//filter deleted votes after user
		votes, err := unmarshalSlice[dto.Vote](event.Data)
		if err != nil {
			logger.Get().Errorw("unable to parse deleteVotes in event filter", "board", boardSubscription.boardSettings.ID, "session", userID, "err", err)
		}
		userVotes := make([]*dto.Vote, 0)
		for _, v := range votes {
			if v.User == userID {
				userVotes = append(userVotes, v)
			}
		}

		ret := realtime.BoardEvent{
			Type: event.Type,
			Data: userVotes,
		}

		return &ret
	}

	// returns, if no filter match occured
	return event
}

func eventInitFilter(event InitEvent, clientID uuid.UUID) InitEvent {
	isMod := isModerator(clientID, event.Data.BoardSessions)

	// filter to only respond with the latest voting and its votes
	if len(event.Data.Votings) != 0 {
		latestVoting := make([]*dto.Voting, 0)
		activeNotes := make([]*dto.Vote, 0)

		latestVoting = append(latestVoting, event.Data.Votings[0])

		for _, v := range event.Data.Votes {
			if v.Voting == latestVoting[0].ID {
				if latestVoting[0].Status == types.VotingStatusOpen {
					if v.User == clientID {
						activeNotes = append(activeNotes, v)
					}
				} else {
					activeNotes = append(activeNotes, v)
				}
			}
		}
		event.Data.Votings = latestVoting
		event.Data.Votes = activeNotes
	}

	if isMod {
		return event
	}

	retEvent := InitEvent{
		Type: event.Type,
		Data: dto.FullBoard{
			Board:                event.Data.Board,
			BoardSessions:        event.Data.BoardSessions,
			BoardSessionRequests: event.Data.BoardSessionRequests,
			Notes:                nil,
			Reactions:            event.Data.Reactions,
			Columns:              nil,
			Votings:              event.Data.Votings,
			Votes:                event.Data.Votes,
		},
	}

	// Columns
	filteredColumns := filterColumns(event.Data.Columns)
	// Notes TODO: make to map for easier checks
	filteredNotes := filterNotes(event.Data.Notes, clientID, event.Data.Board, event.Data.Columns)
	notesMap := make(map[uuid.UUID]*dto.Note)
	for _, n := range filteredNotes {
		notesMap[n.ID] = n
	}
	// Votes
	visibleVotes := make([]*dto.Vote, 0)
	for _, vote := range event.Data.Votes {
		if _, exists := notesMap[vote.Note]; exists {
			visibleVotes = append(visibleVotes, vote)
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
