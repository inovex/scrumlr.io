package eventfilter

import (
	"context"

	"github.com/google/uuid"
	"scrumlr.io/server/realtime"
)

type FilterRule interface {
	Supports(ctx context.Context, eventType realtime.BoardEventType) bool
	Handle(ctx context.Context, event *realtime.BoardEvent, boardId, userId uuid.UUID) (*realtime.BoardEvent, error)
}

type EventFilter interface {
	Filter(ctx context.Context, event *realtime.BoardEvent, boardId, userId uuid.UUID) *realtime.BoardEvent
}

type eventFilter struct {
	filterRules []FilterRule
}

func NewEventFilter(filterRules ...FilterRule) EventFilter {
	filter := new(eventFilter)
	filter.filterRules = filterRules

	return filter
}

func (filter *eventFilter) Filter(ctx context.Context, event *realtime.BoardEvent, boardId, userId uuid.UUID) *realtime.BoardEvent {
	for _, filter := range filter.filterRules {
		if filter.Supports(ctx, event.Type) {
			filteredEvent, err := filter.Handle(ctx, event, boardId, userId)
			if err != nil {
				return nil
			}

			return filteredEvent
		}
	}

	return event
}
