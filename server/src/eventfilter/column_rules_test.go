package eventfilter

import (
	"errors"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"scrumlr.io/server/columns"
	"scrumlr.io/server/common"
	"scrumlr.io/server/realtime"
	"scrumlr.io/server/role"
	"scrumlr.io/server/sessions"
)

func TestColumnRuleSupportUpdatedEvent(t *testing.T) {
	ctx := t.Context()

	mockSessionService := sessions.NewMockSessionService(t)

	filterRule := NewColumnRuleFilter(mockSessionService)

	supports := filterRule.Supports(ctx, realtime.BoardEventColumnsUpdated)

	assert.True(t, supports)
}

func TestColumnRuleSupportDeletedEvent(t *testing.T) {
	ctx := t.Context()

	mockSessionService := sessions.NewMockSessionService(t)

	filterRule := NewColumnRuleFilter(mockSessionService)

	supports := filterRule.Supports(ctx, realtime.BoardEventColumnDeleted)

	assert.False(t, supports)
}

func TestColumnRuleHandleUpdatedEventAsOwner(t *testing.T) {
	ctx := t.Context()
	boardId := uuid.New()
	userId := uuid.New()

	event := &realtime.BoardEvent{
		Type: realtime.BoardEventColumnsUpdated,
		Data: []columns.Column{
			{ID: uuid.New(), Color: common.ColorBacklogBlue, Visible: true},
			{ID: uuid.New(), Color: common.ColorGoalGreen, Visible: false},
		},
	}

	mockSessionService := sessions.NewMockSessionService(t)
	mockSessionService.EXPECT().Get(mock.Anything, boardId, userId).
		Return(&sessions.BoardSession{UserID: userId, Board: boardId, Role: role.OwnerRole}, nil)

	columnFilter := NewColumnRuleFilter(mockSessionService)

	filteredEvent, err := columnFilter.Handle(ctx, event, boardId, userId)

	assert.NoError(t, err)
	assert.NotNil(t, filteredEvent)

	filteredColumns, err := columns.UnmarshallColumnData(filteredEvent.Data)
	assert.NoError(t, err)
	assert.Len(t, filteredColumns, 2)
}

func TestColumnRuleHandleUpdatedEventAsModerator(t *testing.T) {
	ctx := t.Context()
	boardId := uuid.New()
	userId := uuid.New()

	event := &realtime.BoardEvent{
		Type: realtime.BoardEventColumnsUpdated,
		Data: []columns.Column{
			{ID: uuid.New(), Color: common.ColorBacklogBlue, Visible: true},
			{ID: uuid.New(), Color: common.ColorGoalGreen, Visible: false},
		},
	}

	mockSessionService := sessions.NewMockSessionService(t)
	mockSessionService.EXPECT().Get(mock.Anything, boardId, userId).
		Return(&sessions.BoardSession{UserID: userId, Board: boardId, Role: role.ModeratorRole}, nil)

	columnFilter := NewColumnRuleFilter(mockSessionService)

	filteredEvent, err := columnFilter.Handle(ctx, event, boardId, userId)

	assert.NoError(t, err)
	assert.NotNil(t, filteredEvent)

	filteredColumns, err := columns.UnmarshallColumnData(filteredEvent.Data)
	assert.NoError(t, err)
	assert.Len(t, filteredColumns, 2)
}

func TestColumnRuleHandleUpdatedEventAsParticipant(t *testing.T) {
	ctx := t.Context()
	boardId := uuid.New()
	userId := uuid.New()

	event := &realtime.BoardEvent{
		Type: realtime.BoardEventColumnsUpdated,
		Data: []columns.Column{
			{ID: uuid.New(), Color: common.ColorBacklogBlue, Visible: true},
			{ID: uuid.New(), Color: common.ColorGoalGreen, Visible: false},
		},
	}

	mockSessionService := sessions.NewMockSessionService(t)
	mockSessionService.EXPECT().Get(mock.Anything, boardId, userId).
		Return(&sessions.BoardSession{UserID: userId, Board: boardId, Role: role.ParticipantRole}, nil)

	columnFilter := NewColumnRuleFilter(mockSessionService)

	filteredEvent, err := columnFilter.Handle(ctx, event, boardId, userId)

	assert.NoError(t, err)
	assert.NotNil(t, filteredEvent)

	filteredColumns, err := columns.UnmarshallColumnData(filteredEvent.Data)
	assert.NoError(t, err)
	assert.Len(t, filteredColumns, 1)
}

func TestColumnRuleHandleDeletedEvent(t *testing.T) {
	ctx := t.Context()

	boardId := uuid.New()
	userId := uuid.New()

	event := &realtime.BoardEvent{
		Type: realtime.BoardEventColumnDeleted,
		Data: uuid.New(),
	}

	mockSessionService := sessions.NewMockSessionService(t)

	filterRule := NewColumnRuleFilter(mockSessionService)

	filteredEvent, err := filterRule.Handle(ctx, event, boardId, userId)

	assert.Error(t, err)
	assert.Equal(t, errors.New("event not supported"), err)
	assert.Nil(t, filteredEvent)
}

func TestColumnRuleHandleUpdatedEventSessionServiceError(t *testing.T) {
	ctx := t.Context()

	boardId := uuid.New()
	userId := uuid.New()

	event := &realtime.BoardEvent{
		Type: realtime.BoardEventColumnsUpdated,
		Data: []columns.Column{
			{ID: uuid.New(), Color: common.ColorBacklogBlue, Visible: true},
			{ID: uuid.New(), Color: common.ColorGoalGreen, Visible: false},
		},
	}

	mockSessionService := sessions.NewMockSessionService(t)
	mockSessionService.EXPECT().Get(mock.Anything, boardId, userId).
		Return(&sessions.BoardSession{}, errors.New("failed to retrieve session"))

	filterRule := NewColumnRuleFilter(mockSessionService)

	filteredEvent, err := filterRule.Handle(ctx, event, boardId, userId)

	assert.Error(t, err)
	assert.Equal(t, errors.New("failed to retrieve session"), err)
	assert.Nil(t, filteredEvent)
}

func TestColumnRuleHandleUpdatedEventUnmarshalError(t *testing.T) {
	ctx := t.Context()

	boardId := uuid.New()
	userId := uuid.New()

	event := &realtime.BoardEvent{
		Type: realtime.BoardEventColumnsUpdated,
		Data: uuid.New(),
	}

	mockSessionService := sessions.NewMockSessionService(t)
	mockSessionService.EXPECT().Get(mock.Anything, boardId, userId).
		Return(&sessions.BoardSession{UserID: userId, Board: boardId, Role: role.ParticipantRole}, nil)

	filterRule := NewColumnRuleFilter(mockSessionService)

	filteredEvent, err := filterRule.Handle(ctx, event, boardId, userId)

	assert.Error(t, err)
	assert.Nil(t, filteredEvent)
}
