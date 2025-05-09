package api

import (
  "github.com/google/uuid"
  "scrumlr.io/server/columns"
  "scrumlr.io/server/common/dto"
  "scrumlr.io/server/logger"
  "scrumlr.io/server/notes"
  "scrumlr.io/server/realtime"
  "scrumlr.io/server/sessions"
  "scrumlr.io/server/technical_helper"
  "scrumlr.io/server/voting"
)

func (bs *BoardSubscription) eventFilter(event *realtime.BoardEvent, userID uuid.UUID) *realtime.BoardEvent {
  isMod := sessions.CheckSessionRole(userID, bs.boardParticipants, []sessions.SessionRole{sessions.ModeratorRole, sessions.OwnerRole})

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
  votings, err := technical_helper.UnmarshalSlice[voting.Vote](event.Data)
  if err != nil {
    logger.Get().Errorw("unable to parse deleteVotes in event filter", "board", bs.boardSettings.ID, "session", userID, "err", err)
    return nil, false
  }

  ret := realtime.BoardEvent{
    Type: event.Type,
    Data: technical_helper.Filter[*voting.Vote](votings, func(vote *voting.Vote) bool {
      return vote.User == userID
    }),
  }

  return &ret, true
}

func (bs *BoardSubscription) votingUpdated(event *realtime.BoardEvent, userID uuid.UUID, isMod bool) (*realtime.BoardEvent, bool) {
  voting, err := voting.UnmarshallVoteData(event.Data)
  if err != nil {
    logger.Get().Errorw("unable to parse votingUpdated in event filter", "board", bs.boardSettings.ID, "session", userID, "err", err)
    return nil, false
  }

  if isMod {
    return event, true
  } else if voting.Voting.Status != voting.VotingStatusClosed {
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
  participantSession, err := technical_helper.Unmarshal[sessions.BoardSession](event.Data)
  if err != nil {
    logger.Get().Errorw("unable to parse participantUpdated in event filter", "board", bs.boardSettings.ID, "err", err)
    return false
  }

  if isMod {
    // Cache the changes of when a participant got updated
    updatedSessions := technical_helper.MapSlice(bs.boardParticipants, func(boardSession *sessions.BoardSession) *sessions.BoardSession {
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
  isMod := sessions.CheckSessionRole(clientID, event.Data.BoardSessions, []sessions.SessionRole{sessions.ModeratorRole, sessions.OwnerRole})

  // filter to only respond with the latest voting and its votes
  if len(event.Data.Votings) != 0 {
    latestVoting := event.Data.Votings[0]

    event.Data.Votings = []*voting.Voting{latestVoting}
    event.Data.Votes = technical_helper.Filter[*voting.Vote](event.Data.Votes, func(vote *voting.Vote) bool {
      return vote.Voting == latestVoting.ID && (latestVoting.Status != voting.Open || vote.User == clientID)
    })
  }

  if isMod {
    return event
  }

  filteredNotes := notes.NoteSlice(event.Data.Notes).FilterNotesByBoardSettingsOrAuthorInformation(clientID, event.Data.Board.ShowNotesOfOtherUsers, event.Data.Board.ShowAuthors, event.Data.Columns)

  notesMap := make(map[uuid.UUID]*notes.Note)
  for _, n := range filteredNotes {
    notesMap[n.ID] = n
  }

  return InitEvent{
    Type: event.Type,
    Data: dto.FullBoard{
      Board:                event.Data.Board,
      BoardSessions:        event.Data.BoardSessions,
      BoardSessionRequests: event.Data.BoardSessionRequests,
      Notes:                filteredNotes,
      Reactions:            event.Data.Reactions,
      Columns:              columns.ColumnSlice(event.Data.Columns).FilterVisibleColumns(),
      Votings: technical_helper.MapSlice[*voting.Voting, *voting.Voting](event.Data.Votings, func(voting *voting.Voting) *voting.Voting {
        return voting.UpdateVoting(filteredNotes).Voting
      }),
      Votes: technical_helper.Filter[*voting.Vote](event.Data.Votes, func(vote *voting.Vote) bool {
        _, exists := notesMap[vote.Note]
        return exists
      }),
    },
  }
}
