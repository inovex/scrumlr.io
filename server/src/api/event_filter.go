package api

import (
	"context"
	"slices"

	"github.com/google/uuid"
	"scrumlr.io/server/boards"
	"scrumlr.io/server/columns"
	"scrumlr.io/server/common"
	"scrumlr.io/server/logger"
	"scrumlr.io/server/notes"
	"scrumlr.io/server/realtime"
	"scrumlr.io/server/sessions"
	"scrumlr.io/server/technical_helper"
	"scrumlr.io/server/votings"
)

func (s *Server) eventFilter(bs *BoardSubscription, event *realtime.BoardEvent, userID uuid.UUID) *realtime.BoardEvent {
	boardSessions := make([]*sessions.BoardSession, len(bs.boardParticipants))
	for i, session := range bs.boardParticipants {
		boardSessions[i] = &sessions.BoardSession{
			User:              session.User.ID,
			Connected:         session.Connected,
			ShowHiddenColumns: session.ShowHiddenColumns,
			Ready:             session.Ready,
			RaisedHand:        session.RaisedHand,
			Role:              session.Role,
			CreatedAt:         session.CreatedAt,
			Banned:            session.Banned,
		}
	}

	isMod := sessions.CheckSessionRole(userID, boardSessions, []common.SessionRole{common.ModeratorRole, common.OwnerRole})
	switch event.Type {
	case realtime.BoardEventColumnsUpdated:
		if updated, ok := s.columnsUpdated(bs, event, userID, isMod); ok {
			return updated
		}
	case realtime.BoardEventNotesUpdated, realtime.BoardEventNotesSync:
		if updated, ok := s.notesUpdated(bs, event, userID, isMod); ok {
			return updated
		}
	case realtime.BoardEventBoardUpdated:
		if updated, ok := s.boardUpdated(bs, event, isMod); ok {
			return updated
		}
	case realtime.BoardEventVotingUpdated:
		if updated, ok := s.votingUpdated(bs, event, userID, isMod); ok {
			return updated
		}
	case realtime.BoardEventParticipantUpdated:
		_ = s.participantUpdated(bs, event, isMod)
	case realtime.BoardEventVotesDeleted:
		if updated, ok := s.votesDeleted(bs, event, userID); ok {
			return updated
		}
	}
	// returns, if no filter match occurred
	return event
}

func (s *Server) columnsUpdated(bs *BoardSubscription, event *realtime.BoardEvent, userID uuid.UUID, isMod bool) (*realtime.BoardEvent, bool) {
	var updateColumns columns.ColumnSlice
	updateColumns, err := columns.UnmarshallColumnData(event.Data)

	if err != nil {
		logger.Get().Errorw("unable to parse columnUpdated in event filter", "board", bs.boardSettings.ID, "session", userID, "err", err)
		return nil, false
	}

	if isMod {
		bs.boardColumns = updateColumns
		return event, true
	} else {
		return &realtime.BoardEvent{
			Type: event.Type,
			Data: updateColumns.FilterVisibleColumns(),
		}, true
	}
}

func (s *Server) notesUpdated(bs *BoardSubscription, event *realtime.BoardEvent, userID uuid.UUID, isMod bool) (*realtime.BoardEvent, bool) {
	noteSlice, err := notes.UnmarshallNotaData(event.Data)
	if err != nil {
		logger.Get().Errorw("unable to parse notesUpdated or eventNotesSync in event filter", "board", bs.boardSettings.ID, "session", userID, "err", err)
		return nil, false
	}
	if isMod {
		bs.boardNotes = noteSlice
		return event, true
	} else {
		var columnVisibility []notes.ColumnVisability
		for _, column := range bs.boardColumns {
			columnVisibility = append(columnVisibility, notes.ColumnVisability{
				ID:      column.ID,
				Visible: column.Visible,
			})
		}
		return &realtime.BoardEvent{
			Type: event.Type,
			Data: noteSlice.FilterNotesByBoardSettingsOrAuthorInformation(userID, bs.boardSettings.ShowNotesOfOtherUsers, bs.boardSettings.ShowAuthors, columnVisibility),
		}, true
	}
}

func (s *Server) boardUpdated(bs *BoardSubscription, event *realtime.BoardEvent, isMod bool) (*realtime.BoardEvent, bool) {
	boardSettings, err := technical_helper.Unmarshal[boards.Board](event.Data)
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

func (s *Server) votesDeleted(bs *BoardSubscription, event *realtime.BoardEvent, userID uuid.UUID) (*realtime.BoardEvent, bool) {
	//filter deleted votes after user
	votes, err := technical_helper.UnmarshalSlice[votings.Vote](event.Data)
	if err != nil {
		logger.Get().Errorw("unable to parse deleteVotes in event filter", "board", bs.boardSettings.ID, "session", userID, "err", err)
		return nil, false
	}

	ret := realtime.BoardEvent{
		Type: event.Type,
		Data: technical_helper.Filter[*votings.Vote](votes, func(vote *votings.Vote) bool {
			return vote.User == userID
		}),
	}
	return &ret, true
}

func (s *Server) votingUpdated(bs *BoardSubscription, event *realtime.BoardEvent, userID uuid.UUID, isMod bool) (*realtime.BoardEvent, bool) {
	voting, err := votings.UnmarshallVoteData(event.Data)
	if err != nil {
		logger.Get().Errorw("unable to parse votingUpdated in event filter", "board", bs.boardSettings.ID, "session", userID, "err", err)
		return nil, false
	}

	if isMod {
		return event, true
	} else if voting.Voting.Status != votings.Closed {
		return event, true
	} else {

		var noteSlice notes.NoteSlice
		var notesID []uuid.UUID
		for _, note := range bs.boardNotes {
			if slices.Contains(voting.Notes, note.ID) {
				noteSlice = append(noteSlice, note)
				notesID = append(notesID, note.ID)
			}
		}

		var columnVisibility []notes.ColumnVisability
		for _, column := range bs.boardColumns {
			columnVisibility = append(columnVisibility, notes.ColumnVisability{
				ID:      column.ID,
				Visible: column.Visible,
			})
		}

		filteredVotingNotes := noteSlice.FilterNotesByBoardSettingsOrAuthorInformation(userID, bs.boardSettings.ShowNotesOfOtherUsers, bs.boardSettings.ShowAuthors, columnVisibility)
		filteredvotingNotesIDs := make([]uuid.UUID, len(filteredVotingNotes))
		for index, note := range filteredVotingNotes {
			filteredvotingNotesIDs[index] = note.ID
		}

		votingUpdate := &votings.VotingUpdated{
			Notes:  filteredvotingNotesIDs,
			Voting: voting.Voting.UpdateVoting(filteredvotingNotesIDs).Voting,
		}
		ret := realtime.BoardEvent{
			Type: event.Type,
			Data: votingUpdate,
		}
		return &ret, true
	}
}

func (s *Server) participantUpdated(bs *BoardSubscription, event *realtime.BoardEvent, isMod bool) bool {
	participantSession, err := technical_helper.Unmarshal[sessions.BoardSession](event.Data)
	if err != nil {
		logger.Get().Errorw("unable to parse participantUpdated in event filter", "board", bs.boardSettings.ID, "err", err)
		return false
	}

	if isMod {
		// Cache the changes of when a participant got updated
		updatedSessions := technical_helper.MapSlice(bs.boardParticipants, func(boardSession *FullSession) *FullSession {
			if boardSession.User.ID == participantSession.User {
				user, err := s.users.Get(context.Background(), boardSession.User.ID)
				if err != nil {
					logger.Get().Errorw("unable to get user with id", boardSession.User.ID)
					return nil
				}

				return &FullSession{
					User:              *user,
					Connected:         participantSession.Connected,
					ShowHiddenColumns: participantSession.ShowHiddenColumns,
					Ready:             participantSession.Ready,
					RaisedHand:        participantSession.RaisedHand,
					Role:              participantSession.Role,
					CreatedAt:         participantSession.CreatedAt,
					Banned:            participantSession.Banned,
				}
			} else {
				return boardSession
			}
		})

		bs.boardParticipants = updatedSessions
	}
	return true
}

func eventInitFilter(event InitEvent, clientID uuid.UUID) InitEvent {
	boardSessions := make([]*sessions.BoardSession, len(event.Data.BoardSessions))
	for i, session := range event.Data.BoardSessions {
		boardSessions[i] = &sessions.BoardSession{
			User:              session.User.ID,
			Connected:         session.Connected,
			ShowHiddenColumns: session.ShowHiddenColumns,
			Ready:             session.Ready,
			RaisedHand:        session.RaisedHand,
			Role:              session.Role,
			CreatedAt:         session.CreatedAt,
			Banned:            session.Banned,
		}
	}

	isMod := sessions.CheckSessionRole(clientID, boardSessions, []common.SessionRole{common.ModeratorRole, common.OwnerRole})
	// filter to only respond with the latest voting and its votes
	if len(event.Data.Votings) != 0 {
		latestVoting := event.Data.Votings[0]
		event.Data.Votings = []*votings.Voting{latestVoting}
		event.Data.Votes = technical_helper.Filter[*votings.Vote](event.Data.Votes, func(vote *votings.Vote) bool {
			return vote.Voting == latestVoting.ID && (latestVoting.Status != votings.Open || vote.User == clientID)
		})
	}
	if isMod {
		return event
	}

	var noteSlice notes.NoteSlice
	noteSlice = event.Data.Notes

	var columnVisibility []notes.ColumnVisability
	for _, column := range event.Data.Columns {
		columnVisibility = append(columnVisibility, notes.ColumnVisability{
			ID:      column.ID,
			Visible: column.Visible,
		})
	}

	filteredNotes := noteSlice.FilterNotesByBoardSettingsOrAuthorInformation(clientID, event.Data.Board.ShowNotesOfOtherUsers, event.Data.Board.ShowAuthors, columnVisibility)
	notesMap := make(map[uuid.UUID]*notes.Note)
	for _, n := range filteredNotes {
		notesMap[n.ID] = n
	}

	var notesID []uuid.UUID
	for _, note := range filteredNotes {
		notesID = append(notesID, note.ID)
	}

	return InitEvent{
		Type: event.Type,
		Data: FullBoard{
			Board:                event.Data.Board,
			BoardSessions:        event.Data.BoardSessions,
			BoardSessionRequests: event.Data.BoardSessionRequests,
			Notes:                filteredNotes,
			Reactions:            event.Data.Reactions,
			Columns:              columns.ColumnSlice(event.Data.Columns).FilterVisibleColumns(),
			Votings: technical_helper.MapSlice[*votings.Voting, *votings.Voting](event.Data.Votings, func(voting *votings.Voting) *votings.Voting {
				return voting.UpdateVoting(notesID).Voting
			}),
			Votes: technical_helper.Filter[*votings.Vote](event.Data.Votes, func(vote *votings.Vote) bool {
				_, exists := notesMap[vote.Note]
				return exists
			}),
		},
	}
}
