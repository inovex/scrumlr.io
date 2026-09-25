package eventfilter

import (
	"context"
	"errors"
	"slices"

	"github.com/google/uuid"
	"scrumlr.io/server/boards"
	"scrumlr.io/server/columns"
	"scrumlr.io/server/logger"
	"scrumlr.io/server/realtime"
	"scrumlr.io/server/sessions"
	"scrumlr.io/server/votings"
)

type votingEventRules struct {
	boardService   boards.BoardService
	sessionService sessions.SessionService
	columnService  columns.ColumnService
}

func NewVotingRuleFilter(boardService boards.BoardService, columnService columns.ColumnService, sessionService sessions.SessionService) FilterRule {
	filterRule := new(votingEventRules)
	filterRule.boardService = boardService
	filterRule.columnService = columnService
	filterRule.sessionService = sessionService

	return filterRule
}

func (votingRules *votingEventRules) Supports(ctx context.Context, eventType realtime.BoardEventType) bool {
	switch eventType {
	case realtime.BoardEventVotingUpdated:
		return true
	default:
		return false
	}
}

func (votingRules *votingEventRules) Handle(ctx context.Context, event *realtime.BoardEvent, boardId, userId uuid.UUID) (*realtime.BoardEvent, error) {
	switch event.Type {
	case realtime.BoardEventVotingUpdated:
		return votingRules.votingUpdate(ctx, event, boardId, userId)
	default:
		return nil, errors.New("evnt not supported")
	}
}

func (votingRules *votingEventRules) votingUpdate(ctx context.Context, event *realtime.BoardEvent, boardId, userId uuid.UUID) (*realtime.BoardEvent, error) {
	log := logger.FromContext(ctx)

	session, err := votingRules.sessionService.Get(ctx, boardId, userId)
	if err != nil {
		return nil, err
	}

	if session.Role.IsModerator() {
		return event, nil
	}

	voting, err := votings.UnmarshallVoteData(event.Data)
	if err != nil {
		log.Errorw("unable to parse votingUpdated in event filter", "err", err)
		return nil, err
	}

	if voting.Voting.Status != votings.Closed {
		return event, nil
	}

	columns, err := votingRules.columnService.GetAll(ctx, boardId)
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

	board, err := votingRules.boardService.Get(ctx, boardId)
	if err != nil {
		log.Errorw("unable to get board", "err", err)
		return nil, err
	}

	filteredNotes := make([]votings.Note, 0)
	for _, note := range voting.Notes {
		if slices.Contains(visibleColumnIds, note.Position.Column) {
			if board.ShowNotesOfOtherUsers || userId == note.Author {
				if !board.ShowAuthors && note.Author != userId {
					note.Author = uuid.Nil
				}

				filteredNotes = append(filteredNotes, note)
			}
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
