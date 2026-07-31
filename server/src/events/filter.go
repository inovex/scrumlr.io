package events

import (
	"context"
	"slices"

	"github.com/google/uuid"
	"scrumlr.io/server/columns"
	"scrumlr.io/server/logger"
	"scrumlr.io/server/notes"
	"scrumlr.io/server/realtime"
	"scrumlr.io/server/technical_helper"
	"scrumlr.io/server/votings"
)

func (listener *eventListener) filter(ctx context.Context, event *realtime.BoardEvent, boardId, userId uuid.UUID) *realtime.BoardEvent {
	session, err := listener.sessionService.Get(ctx, boardId, userId)
	if err != nil {
		return nil
	}

	switch event.Type {
	case realtime.BoardEventColumnsUpdated:
		update, err := listener.columnsUpdated(ctx, event, session.Role.CanSeeHiddenColumns())
		if err == nil {
			return update
		}
	case realtime.BoardEventNotesUpdated:
		update, err := listener.notesUpdated(ctx, event, boardId, userId, session.Role.CanSeeHiddenColumns())
		if err == nil {
			return update
		}
	case realtime.BoardEventVotingUpdated:
		update, err := listener.votingUpdated(ctx, event, boardId, userId, session.Role.IsModerator())
		if err == nil {
			return update
		}
	case realtime.BoardEventVotesDeleted:
		updated, err := listener.votesDeleted(ctx, event, userId)
		if err == nil {
			return updated
		}
	}

	return event
}

func (listener *eventListener) columnsUpdated(ctx context.Context, event *realtime.BoardEvent, showHiddenColumns bool) (*realtime.BoardEvent, error) {
	log := logger.FromContext(ctx)

	if showHiddenColumns {
		return event, nil
	}

	columns, err := columns.UnmarshallColumnData(event.Data)
	if err != nil {
		log.Errorw("unable to parse columnUpdated in event filter", "err", err)
		return nil, err
	}

	return &realtime.BoardEvent{
		Type: event.Type,
		Data: columns.FilterVisibleColumns(),
	}, nil
}

func (listener *eventListener) notesUpdated(ctx context.Context, event *realtime.BoardEvent, boardId, userId uuid.UUID, showHiddenNotes bool) (*realtime.BoardEvent, error) {
	log := logger.FromContext(ctx)

	if showHiddenNotes {
		return event, nil
	}

	notes, err := notes.UnmarshallNotaData(event.Data)
	if err != nil {
		log.Errorw("unable to parse notesUpdated or eventNotesSync in event filter", "err", err)
		return nil, err
	}

	columns, err := listener.columnService.GetAll(ctx, boardId)
	if err != nil {
		log.Errorw("unable to get columns to filter notes in event filter")
		return nil, err
	}

	visibleColumnIds := make([]uuid.UUID, 0)
	for _, column := range columns {
		if column.Visible {
			visibleColumnIds = append(visibleColumnIds, column.ID)
		}
	}

	// TODO get the board settings (potential cycle import)
	filteredNotes := notes.FilterNotesByBoardSettingsOrAuthorInformation(userId, true, true, visibleColumnIds)

	return &realtime.BoardEvent{
		Type: event.Type,
		Data: filteredNotes,
	}, nil
}

func (listener *eventListener) votingUpdated(ctx context.Context, event *realtime.BoardEvent, boardId, userId uuid.UUID, isMododerator bool) (*realtime.BoardEvent, error) {
	log := logger.FromContext(ctx)

	if isMododerator {
		return event, nil
	}

	voting, err := votings.UnmarshallVoteData(event.Data)
	if err != nil {
		log.Errorw("unable to parse votingUpdated in event filter", "err", err)
	}

	if voting.Voting.Status != votings.Closed {
		return event, nil
	}

	columns, err := listener.columnService.GetAll(ctx, boardId)
	if err != nil {
		log.Errorw("unable to get columns to filter notes in event filter")
		return nil, err
	}

	visibleColumnIds := make([]uuid.UUID, 0)
	for _, column := range columns {
		if column.Visible {
			visibleColumnIds = append(visibleColumnIds, column.ID)
		}
	}

	filteredNotes := make([]votings.Note, 0)
	for _, note := range voting.Notes {
		if slices.Contains(visibleColumnIds, note.Position.Column) {
			// TODO filter with board settings
			filteredNotes = append(filteredNotes, note)
		}
	}

	votingUpdate := &votings.VotingUpdated{
		Notes:  filteredNotes,
		Voting: voting.Voting.UpdateVoting(filteredNotes).Voting,
	}

	return &realtime.BoardEvent{
		Type: event.Type,
		Data: votingUpdate,
	}, nil
}

func (listener *eventListener) votesDeleted(ctx context.Context, event *realtime.BoardEvent, userId uuid.UUID) (*realtime.BoardEvent, error) {
	log := logger.FromContext(ctx)

	votes, err := technical_helper.UnmarshalSlice[votings.Vote](event.Data)
	if err != nil {
		log.Errorw("unable to parse deleteVotes in event filter", "err", err)
		return nil, err
	}

	return &realtime.BoardEvent{
		Type: event.Type,
		Data: technical_helper.Filter(votes, func(vote *votings.Vote) bool {
			return vote.User == userId
		}),
	}, nil
}
