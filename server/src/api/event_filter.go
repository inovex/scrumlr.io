package api

import (
	"github.com/google/uuid"
	columnService "scrumlr.io/server/columns"
	"scrumlr.io/server/common/dto"
	"scrumlr.io/server/database/types"
	"scrumlr.io/server/logger"
	"scrumlr.io/server/notes"
	"scrumlr.io/server/realtime"
	"scrumlr.io/server/session_helper"
	"scrumlr.io/server/technical_helper"
	"scrumlr.io/server/votes"
)

func (bs *BoardSubscription) eventFilter(event *realtime.BoardEvent, userID uuid.UUID) *realtime.BoardEvent {
	isMod := session_helper.CheckSessionRole(userID, bs.boardParticipants, []types.SessionRole{types.SessionRoleModerator, types.SessionRoleOwner})

	switch event.Type {
	case realtime.BoardEventColumnsUpdated:
		if updated, ok := bs.columnsUpdated(event, userID, isMod); ok {
			return updated
		}
	case realtime.BoardEventNotesUpdated, realtime.BoardEventNotesSync:
		if updated, ok := bs.notesUpdated(event, userID, isMod); ok {
			return updated
		}
	case realtime.BoardEventBoardUpdated:
		if updated, ok := bs.boardUpdated(event, isMod); ok {
			return updated
		}
	case realtime.BoardEventVotingUpdated:
		if updated, ok := bs.votingUpdated(event, userID, isMod); ok {
			return updated
		}
	case realtime.BoardEventParticipantUpdated:
		_ = bs.participantUpdated(event, isMod)
	case realtime.BoardEventVotesDeleted:
		if updated, ok := bs.votesDeleted(event, userID); ok {
			return updated
		}
	}
	// returns, if no filter match occurred
	return event
}

func (bs *BoardSubscription) columnsUpdated(event *realtime.BoardEvent, userID uuid.UUID, isMod bool) (*realtime.BoardEvent, bool) {
	var columns columnService.ColumnSlice
	columns, err := columnService.UnmarshallColumnData(event.Data)

	if err != nil {
		logger.Get().Errorw("unable to parse columnUpdated in event filter", "board", bs.boardSettings.ID, "session", userID, "err", err)
		return nil, false
	}

	if isMod {
		bs.boardColumns = columns
		return event, true
	} else {
		return &realtime.BoardEvent{
			Type: event.Type,
			Data: columns.FilterVisibleColumns(),
		}, true
	}
}

func (bs *BoardSubscription) notesUpdated(event *realtime.BoardEvent, userID uuid.UUID, isMod bool) (*realtime.BoardEvent, bool) {
	noteSlice, err := notes.UnmarshallNotaData(event.Data)
	if err != nil {
		logger.Get().Errorw("unable to parse notesUpdated or eventNotesSync in event filter", "board", bs.boardSettings.ID, "session", userID, "err", err)
		return nil, false
	}

	if isMod {
		bs.boardNotes = noteSlice
		return event, true
	} else {
		return &realtime.BoardEvent{
			Type: event.Type,
			Data: noteSlice.FilterNotesByBoardSettingsOrAuthorInformation(userID, bs.boardSettings.ShowNotesOfOtherUsers, bs.boardSettings.ShowAuthors, bs.boardColumns),
		}, true
	}
}

func (bs *BoardSubscription) boardUpdated(event *realtime.BoardEvent, isMod bool) (*realtime.BoardEvent, bool) {
	boardSettings, err := technical_helper.Unmarshal[dto.Board](event.Data)
	if err != nil {
		logger.Get().Errorw("unable to parse boardUpdated in event filter", "board", bs.boardSettings.ID, "err", err)
		return nil, false
	}
	if isMod {
		bs.boardSettings = boardSettings
		event.Data = boardSettings
		return event, true
	} else {
		return event, true // after this event, a syncNotes event is triggered from the board service
	}
}

func (bs *BoardSubscription) votesDeleted(event *realtime.BoardEvent, userID uuid.UUID) (*realtime.BoardEvent, bool) {
	//filter deleted votes after user
	votings, err := technical_helper.UnmarshalSlice[dto.Vote](event.Data)
	if err != nil {
		logger.Get().Errorw("unable to parse deleteVotes in event filter", "board", bs.boardSettings.ID, "session", userID, "err", err)
		return nil, false
	}

	ret := realtime.BoardEvent{
		Type: event.Type,
		Data: technical_helper.Filter[*dto.Vote](votings, func(vote *dto.Vote) bool {
			return vote.User == userID
		}),
	}

	return &ret, true
}

func (bs *BoardSubscription) votingUpdated(event *realtime.BoardEvent, userID uuid.UUID, isMod bool) (*realtime.BoardEvent, bool) {
	voting, err := votes.UnmarshallVoteData(event.Data)
	if err != nil {
		logger.Get().Errorw("unable to parse votingUpdated in event filter", "board", bs.boardSettings.ID, "session", userID, "err", err)
		return nil, false
	}

	if isMod {
		return event, true
	} else if voting.Voting.Status != types.VotingStatusClosed {
		return event, true
	} else {
		filteredVotingNotes := voting.Notes.FilterNotesByBoardSettingsOrAuthorInformation(userID, bs.boardSettings.ShowNotesOfOtherUsers, bs.boardSettings.ShowAuthors, bs.boardColumns)
		voting.Notes = filteredVotingNotes
		ret := realtime.BoardEvent{
			Type: event.Type,
			Data: voting.Voting.UpdateVoting(filteredVotingNotes),
		}
		return &ret, true
	}
}

func (bs *BoardSubscription) participantUpdated(event *realtime.BoardEvent, isMod bool) bool {
	participantSession, err := technical_helper.Unmarshal[dto.BoardSession](event.Data)
	if err != nil {
		logger.Get().Errorw("unable to parse participantUpdated in event filter", "board", bs.boardSettings.ID, "err", err)
		return false
	}

	if isMod {
		// Cache the changes of when a participant got updated
		updatedSessions := technical_helper.Map(bs.boardParticipants, func(boardSession *dto.BoardSession) *dto.BoardSession {
			if boardSession.User.ID == participantSession.User.ID {
				return participantSession
			} else {
				return boardSession
			}
		})

		bs.boardParticipants = updatedSessions
	}
	return true
}

func eventInitFilter(event InitEvent, clientID uuid.UUID) InitEvent {
	isMod := session_helper.CheckSessionRole(clientID, event.Data.BoardSessions, []types.SessionRole{types.SessionRoleModerator, types.SessionRoleOwner})

	// filter to only respond with the latest voting and its votes
	if len(event.Data.Votings) != 0 {
		latestVoting := make([]*votes.Voting, 0)
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
	filteredColumns := columnService.ColumnSlice(event.Data.Columns).FilterVisibleColumns()
	// Notes TODO: make to map for easier checks
	filteredNotes := notes.NoteSlice(event.Data.Notes).FilterNotesByBoardSettingsOrAuthorInformation(clientID, event.Data.Board.ShowNotesOfOtherUsers, event.Data.Board.ShowAuthors, event.Data.Columns)
	notesMap := make(map[uuid.UUID]*notes.Note)
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
	visibleVotings := make([]*votes.Voting, 0)
	for _, v := range event.Data.Votings {
		visibleVotings = append(visibleVotings, v.UpdateVoting(filteredNotes).Voting)
	}

	retEvent.Data.Columns = filteredColumns
	retEvent.Data.Notes = filteredNotes
	retEvent.Data.Votes = visibleVotes
	retEvent.Data.Votings = visibleVotings

	return retEvent
}
