package eventfilter

import (
	"errors"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"scrumlr.io/server/boards"
	"scrumlr.io/server/columns"
	"scrumlr.io/server/common"
	"scrumlr.io/server/notes"
	"scrumlr.io/server/realtime"
	"scrumlr.io/server/role"
	"scrumlr.io/server/sessions"
	"scrumlr.io/server/technical_helper"
	"scrumlr.io/server/votings"
)

func TestFilterNoFilter(t *testing.T) {
	ctx := t.Context()
	boardId := uuid.New()
	userId := uuid.New()

	event := &realtime.BoardEvent{
		Type: realtime.BoardEventColumnsUpdated,
		Data: boardId,
	}

	filterRules := []FilterRule{}

	filter := NewEventFilter(filterRules...)

	filteredEvent := filter.Filter(ctx, event, boardId, userId)

	assert.Equal(t, event, filteredEvent)
}

func TestFilterColumnUpdatedEventOwnerSession(t *testing.T) {
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

	mockBoardService := boards.NewMockBoardService(t)

	mockSessionService := sessions.NewMockSessionService(t)
	mockSessionService.EXPECT().Get(mock.Anything, boardId, userId).
		Return(&sessions.BoardSession{UserID: userId, Board: boardId, Role: role.OwnerRole}, nil)

	mockColumnService := columns.NewMockColumnService(t)

	columnFilter := NewColumnRuleFilter(mockSessionService)
	noteFilter := NewNoteRuleFilter(mockBoardService, mockColumnService, mockSessionService)
	votingFilter := NewVotingRuleFilter(mockBoardService, mockColumnService, mockSessionService)
	voteFilter := NewVoteRuleFilter()

	filter := NewEventFilter(columnFilter, noteFilter, votingFilter, voteFilter)

	filteredEvent := filter.Filter(ctx, event, boardId, userId)

	assert.NotNil(t, filteredEvent)

	filteredColumns, err := columns.UnmarshallColumnData(filteredEvent.Data)
	assert.NoError(t, err)
	assert.Len(t, filteredColumns, 2)
}

func TestFilterNotesUpdatedEventOwnerSession(t *testing.T) {
	ctx := t.Context()
	boardId := uuid.New()
	userId := uuid.New()

	event := &realtime.BoardEvent{
		Type: realtime.BoardEventNotesUpdated,
		Data: []notes.Note{
			{ID: uuid.New(), Author: userId, Text: "Test Note 1", Edited: false, Position: notes.NotePosition{Column: uuid.New()}},
			{ID: uuid.New(), Author: uuid.New(), Text: "Test Note 2", Edited: false, Position: notes.NotePosition{Column: uuid.New()}},
			{ID: uuid.New(), Author: uuid.New(), Text: "Test Note 3", Edited: false, Position: notes.NotePosition{Column: uuid.New()}},
		},
	}

	mockBoardService := boards.NewMockBoardService(t)

	mockSessionService := sessions.NewMockSessionService(t)
	mockSessionService.EXPECT().Get(mock.Anything, boardId, userId).
		Return(&sessions.BoardSession{UserID: userId, Board: boardId, Role: role.OwnerRole}, nil)

	mockColumnService := columns.NewMockColumnService(t)

	columnFilter := NewColumnRuleFilter(mockSessionService)
	noteFilter := NewNoteRuleFilter(mockBoardService, mockColumnService, mockSessionService)
	votingFilter := NewVotingRuleFilter(mockBoardService, mockColumnService, mockSessionService)
	voteFilter := NewVoteRuleFilter()

	filter := NewEventFilter(columnFilter, noteFilter, votingFilter, voteFilter)

	filteredEvent := filter.Filter(ctx, event, boardId, userId)

	assert.NotNil(t, filteredEvent)

	filteredNotes, err := technical_helper.UnmarshalSlice[notes.Note](filteredEvent.Data)
	assert.NoError(t, err)
	assert.Len(t, filteredNotes, 3)
}

func TestFilterVotingUpdatedEventOwnerSession(t *testing.T) {
	ctx := t.Context()
	boardId := uuid.New()
	userId := uuid.New()

	visibleColumnId := uuid.New()
	columnId := uuid.New()

	event := &realtime.BoardEvent{
		Type: realtime.BoardEventVotingUpdated,
		Data: votings.VotingUpdated{
			Voting: &votings.Voting{
				ID:                 uuid.New(),
				VoteLimit:          3,
				AllowMultipleVotes: true,
				ShowVotesOfOthers:  false,
				Status:             votings.Closed,
				IsAnonymous:        false,
			},
			Notes: []votings.Note{
				{ID: uuid.New(), Author: uuid.New(), Text: "Test note 1", Edited: false, Position: votings.NotePosition{Column: visibleColumnId}},
				{ID: uuid.New(), Author: userId, Text: "Test note 2", Edited: false, Position: votings.NotePosition{Column: visibleColumnId}},
				{ID: uuid.New(), Author: uuid.New(), Text: "Test note 3", Edited: false, Position: votings.NotePosition{Column: columnId}},
			},
		},
	}

	mockBoardService := boards.NewMockBoardService(t)

	mockSessionService := sessions.NewMockSessionService(t)
	mockSessionService.EXPECT().Get(mock.Anything, boardId, userId).
		Return(&sessions.BoardSession{UserID: userId, Board: boardId, Role: role.OwnerRole}, nil)

	mockColumnService := columns.NewMockColumnService(t)

	columnFilter := NewColumnRuleFilter(mockSessionService)
	noteFilter := NewNoteRuleFilter(mockBoardService, mockColumnService, mockSessionService)
	votingFilter := NewVotingRuleFilter(mockBoardService, mockColumnService, mockSessionService)
	voteFilter := NewVoteRuleFilter()

	filter := NewEventFilter(columnFilter, noteFilter, votingFilter, voteFilter)

	filteredEvent := filter.Filter(ctx, event, boardId, userId)

	assert.NotNil(t, filteredEvent)

	filteredVoting, err := votings.UnmarshallVoteData(filteredEvent.Data)
	assert.NoError(t, err)
	assert.Len(t, filteredVoting.Notes, 3)
}

func TestFilterVotesDeletedEvent(t *testing.T) {
	ctx := t.Context()
	boardId := uuid.New()
	userId := uuid.New()
	votingId := uuid.New()

	event := &realtime.BoardEvent{
		Type: realtime.BoardEventVotesDeleted,
		Data: []votings.Vote{
			{Voting: votingId, Note: uuid.New(), User: userId},
			{Voting: votingId, Note: uuid.New(), User: uuid.New()},
			{Voting: votingId, Note: uuid.New(), User: userId},
			{Voting: votingId, Note: uuid.New(), User: uuid.New()},
			{Voting: votingId, Note: uuid.New(), User: userId},
			{Voting: votingId, Note: uuid.New(), User: uuid.New()},
		},
	}

	mockBoardService := boards.NewMockBoardService(t)
	mockSessionService := sessions.NewMockSessionService(t)
	mockColumnService := columns.NewMockColumnService(t)

	columnFilter := NewColumnRuleFilter(mockSessionService)
	noteFilter := NewNoteRuleFilter(mockBoardService, mockColumnService, mockSessionService)
	votingFilter := NewVotingRuleFilter(mockBoardService, mockColumnService, mockSessionService)
	voteFilter := NewVoteRuleFilter()

	filter := NewEventFilter(columnFilter, noteFilter, votingFilter, voteFilter)

	filteredEvent := filter.Filter(ctx, event, boardId, userId)

	assert.NotNil(t, filteredEvent)

	filteredVotes, err := technical_helper.UnmarshalSlice[votings.Vote](filteredEvent.Data)
	assert.NoError(t, err)
	assert.Len(t, filteredVotes, 3)
}

func TestFilterRuleError(t *testing.T) {
	ctx := t.Context()
	boardId := uuid.New()
	userId := uuid.New()

	event := &realtime.BoardEvent{
		Type: realtime.BoardEventBoardDeleted,
		Data: uuid.New(),
	}

	mockFilterRule := NewMockFilterRule(t)
	mockFilterRule.EXPECT().Supports(mock.Anything, realtime.BoardEventBoardDeleted).
		Return(true)
	mockFilterRule.EXPECT().Handle(mock.Anything, event, boardId, userId).
		Return(nil, errors.New("service error"))

	filter := NewEventFilter(mockFilterRule)

	filteredEvent := filter.Filter(ctx, event, boardId, userId)

	assert.Nil(t, filteredEvent)
}
