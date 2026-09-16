package eventfilter

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"scrumlr.io/server/columns"
	"scrumlr.io/server/logger"
	"scrumlr.io/server/realtime"
	"scrumlr.io/server/sessions"
)

type columnEventRules struct {
	sessionService sessions.SessionService
}

func NewColumnRuleFilter(sessionService sessions.SessionService) FilterRule {
	filterRule := new(columnEventRules)
	filterRule.sessionService = sessionService

	return filterRule
}

func (columnRules *columnEventRules) Supports(ctx context.Context, eventType realtime.BoardEventType) bool {
	switch eventType {
	case realtime.BoardEventColumnsUpdated:
		return true
	default:
		return false
	}
}

func (columnRules *columnEventRules) Handle(ctx context.Context, event *realtime.BoardEvent, boardId, userId uuid.UUID) (*realtime.BoardEvent, error) {
	switch event.Type {
	case realtime.BoardEventColumnsUpdated:
		return columnRules.columnUpdate(ctx, event, boardId, userId)
	default:
		return nil, errors.New("event not supported")
	}
}

func (columnRules *columnEventRules) columnUpdate(ctx context.Context, event *realtime.BoardEvent, boardId, userId uuid.UUID) (*realtime.BoardEvent, error) {
	log := logger.FromContext(ctx)

	session, err := columnRules.sessionService.Get(ctx, boardId, userId)
	if err != nil {
		return nil, err
	}

	if session.Role.CanSeeHiddenColumns() {
		return event, nil
	}

	eventColumns, err := columns.UnmarshallColumnData(event.Data)
	if err != nil {
		log.Errorw("unable to parse columnUpdated in event filter", "err", err)
		return nil, err
	}

	return &realtime.BoardEvent{
		Type: event.Type,
		Data: eventColumns.FilterVisibleColumns(),
	}, nil
}
