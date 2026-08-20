package eventfilter

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"scrumlr.io/server/boards"
	"scrumlr.io/server/columns"
	"scrumlr.io/server/logger"
	"scrumlr.io/server/notes"
	"scrumlr.io/server/realtime"
	"scrumlr.io/server/sessions"
)

type noteEventRules struct {
	boardService   boards.BoardService
	sessionService sessions.SessionService
	columnService  columns.ColumnService
}

func NewNoteRuleFilter(boardService boards.BoardService, columnService columns.ColumnService, sessionService sessions.SessionService) FilterRule {
	filterRule := new(noteEventRules)
	filterRule.boardService = boardService
	filterRule.columnService = columnService
	filterRule.sessionService = sessionService

	return filterRule
}

func (noteRules *noteEventRules) Supports(ctx context.Context, eventType realtime.BoardEventType) bool {
	switch eventType {
	case realtime.BoardEventNotesUpdated:
		return true
	default:
		return false
	}
}

func (noteRules *noteEventRules) Handle(ctx context.Context, event *realtime.BoardEvent, boardId, userId uuid.UUID) (*realtime.BoardEvent, error) {
	switch event.Type {
	case realtime.BoardEventNotesUpdated:
		return noteRules.noteUpdated(ctx, event, boardId, userId)
	default:
		return nil, errors.New("event not supported")
	}
}

func (noteRules *noteEventRules) noteUpdated(ctx context.Context, event *realtime.BoardEvent, boardId, userId uuid.UUID) (*realtime.BoardEvent, error) {
	log := logger.FromContext(ctx)

	session, err := noteRules.sessionService.Get(ctx, boardId, userId)
	if err != nil {
		return nil, err
	}

	if session.Role.CanSeeHiddenColumns() {
		return event, nil
	}

	eventNotes, err := notes.UnmarshallNoteData(event.Data)
	if err != nil {
		log.Errorw("unable to parse notesUpdated or eventNotesSync in event filter", "err", err)
		return nil, err
	}

	columns, err := noteRules.columnService.GetAll(ctx, boardId)
	if err != nil {
		log.Errorw("unable to get columns to filter notes in event filter", "err", err)
		return nil, err
	}

	visibleColumnIds := make([]uuid.UUID, 0)
	for _, column := range columns {
		if column.Visible {
			visibleColumnIds = append(visibleColumnIds, column.ID)
		}
	}

	board, err := noteRules.boardService.Get(ctx, boardId)
	if err != nil {
		log.Errorw("unable to get board", "err", err)
		return nil, err
	}

	filteredNotes := eventNotes.FilterNotesByBoardSettingsOrAuthorInformation(userId, board.ShowNotesOfOtherUsers, board.ShowAuthors, visibleColumnIds)

	return &realtime.BoardEvent{
		Type: event.Type,
		Data: filteredNotes,
	}, nil
}
