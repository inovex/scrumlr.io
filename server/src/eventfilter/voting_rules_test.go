package eventfilter

import (
	"errors"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"scrumlr.io/server/boards"
	"scrumlr.io/server/columns"
	"scrumlr.io/server/realtime"
	"scrumlr.io/server/role"
	"scrumlr.io/server/sessions"
	"scrumlr.io/server/votings"
)

func TestVotingRuleSupportUpdatedEvent(t *testing.T) {
	ctx := t.Context()

	mockBoardService := boards.NewMockBoardService(t)
	mockSessionService := sessions.NewMockSessionService(t)
	mockColumnService := columns.NewMockColumnService(t)

	filterRule := NewVotingRuleFilter(mockBoardService, mockColumnService, mockSessionService)

	supports := filterRule.Supports(ctx, realtime.BoardEventVotingUpdated)

	assert.True(t, supports)
}

func TestVotingRuleSupportCreatedEvent(t *testing.T) {
	ctx := t.Context()

	mockBoardService := boards.NewMockBoardService(t)
	mockSessionService := sessions.NewMockSessionService(t)
	mockColumnService := columns.NewMockColumnService(t)

	filterRule := NewVotingRuleFilter(mockBoardService, mockColumnService, mockSessionService)

	supports := filterRule.Supports(ctx, realtime.BoardEventVotingCreated)

	assert.False(t, supports)
}

func TestVotingRuleHandleUpdatedEventAsOwner(t *testing.T) {
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

	filterRule := NewVotingRuleFilter(mockBoardService, mockColumnService, mockSessionService)

	filteredEvent, err := filterRule.Handle(ctx, event, boardId, userId)

	assert.NoError(t, err)
	assert.NotNil(t, filteredEvent)

	filteredVoting, err := votings.UnmarshallVoteData(filteredEvent.Data)
	assert.NoError(t, err)
	assert.Len(t, filteredVoting.Notes, 3)
}

func TestVotingRuleHandleUpdatedEventAsModerator(t *testing.T) {
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
		Return(&sessions.BoardSession{UserID: userId, Board: boardId, Role: role.ModeratorRole}, nil)

	mockColumnService := columns.NewMockColumnService(t)

	filterRule := NewVotingRuleFilter(mockBoardService, mockColumnService, mockSessionService)

	filteredEvent, err := filterRule.Handle(ctx, event, boardId, userId)

	assert.NoError(t, err)
	assert.NotNil(t, filteredEvent)

	filteredVoting, err := votings.UnmarshallVoteData(filteredEvent.Data)
	assert.NoError(t, err)
	assert.Len(t, filteredVoting.Notes, 3)
}

func TestVotingRuleHandleUpdatedEventAsParticipant(t *testing.T) {
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
	mockBoardService.EXPECT().Get(mock.Anything, boardId).
		Return(&boards.Board{ID: boardId, ShowAuthors: true, ShowNotesOfOtherUsers: true}, nil)

	mockSessionService := sessions.NewMockSessionService(t)
	mockSessionService.EXPECT().Get(mock.Anything, boardId, userId).
		Return(&sessions.BoardSession{UserID: userId, Board: boardId, Role: role.ParticipantRole}, nil)

	mockColumnService := columns.NewMockColumnService(t)
	mockColumnService.EXPECT().GetAll(mock.Anything, boardId).
		Return([]*columns.Column{
			{ID: visibleColumnId, Visible: true},
			{ID: columnId, Visible: false},
		}, nil)

	filterRule := NewVotingRuleFilter(mockBoardService, mockColumnService, mockSessionService)

	filteredEvent, err := filterRule.Handle(ctx, event, boardId, userId)

	assert.NoError(t, err)
	assert.NotNil(t, filteredEvent)

	filteredVoting, err := votings.UnmarshallVoteData(filteredEvent.Data)
	assert.NoError(t, err)
	assert.Len(t, filteredVoting.Notes, 2)
}

func TestVotingRuleHandleUpdatedEventAsParticipantWithDontShowAuthors(t *testing.T) {
	ctx := t.Context()
	boardId := uuid.New()
	userId := uuid.New()
	visibleColumnId := uuid.New()
	columnId := uuid.New()

	userNoteId := uuid.New()
	visibleNoteId := uuid.New()

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
				{ID: visibleNoteId, Author: uuid.New(), Text: "Test note 1", Edited: false, Position: votings.NotePosition{Column: visibleColumnId}},
				{ID: userNoteId, Author: userId, Text: "Test note 2", Edited: false, Position: votings.NotePosition{Column: visibleColumnId}},
				{ID: uuid.New(), Author: uuid.New(), Text: "Test note 3", Edited: false, Position: votings.NotePosition{Column: columnId}},
			},
		},
	}

	mockBoardService := boards.NewMockBoardService(t)
	mockBoardService.EXPECT().Get(mock.Anything, boardId).
		Return(&boards.Board{ID: boardId, ShowAuthors: false, ShowNotesOfOtherUsers: true}, nil)

	mockSessionService := sessions.NewMockSessionService(t)
	mockSessionService.EXPECT().Get(mock.Anything, boardId, userId).
		Return(&sessions.BoardSession{UserID: userId, Board: boardId, Role: role.ParticipantRole}, nil)

	mockColumnService := columns.NewMockColumnService(t)
	mockColumnService.EXPECT().GetAll(mock.Anything, boardId).
		Return([]*columns.Column{
			{ID: visibleColumnId, Visible: true},
			{ID: columnId, Visible: false},
		}, nil)

	filterRule := NewVotingRuleFilter(mockBoardService, mockColumnService, mockSessionService)

	filteredEvent, err := filterRule.Handle(ctx, event, boardId, userId)

	assert.NoError(t, err)
	assert.NotNil(t, filteredEvent)

	filteredVoting, err := votings.UnmarshallVoteData(filteredEvent.Data)
	assert.NoError(t, err)
	assert.Len(t, filteredVoting.Notes, 2)

	for _, note := range filteredVoting.Notes {
		switch note.ID {
		case userNoteId:
			assert.Equal(t, userId, note.Author)
		case visibleNoteId:
			assert.Equal(t, uuid.Nil, note.Author)
		default:
			assert.Fail(t, "note id should not be present")
		}
	}
}

func TestVotingRuleHandleUpdatedEventAsParticipantWithDontShowNotesOfOtherUsers(t *testing.T) {
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
	mockBoardService.EXPECT().Get(mock.Anything, boardId).
		Return(&boards.Board{ID: boardId, ShowAuthors: true, ShowNotesOfOtherUsers: false}, nil)

	mockSessionService := sessions.NewMockSessionService(t)
	mockSessionService.EXPECT().Get(mock.Anything, boardId, userId).
		Return(&sessions.BoardSession{UserID: userId, Board: boardId, Role: role.ParticipantRole}, nil)

	mockColumnService := columns.NewMockColumnService(t)
	mockColumnService.EXPECT().GetAll(mock.Anything, boardId).
		Return([]*columns.Column{
			{ID: visibleColumnId, Visible: true},
			{ID: columnId, Visible: false},
		}, nil)

	filterRule := NewVotingRuleFilter(mockBoardService, mockColumnService, mockSessionService)

	filteredEvent, err := filterRule.Handle(ctx, event, boardId, userId)

	assert.NoError(t, err)
	assert.NotNil(t, filteredEvent)

	filteredVoting, err := votings.UnmarshallVoteData(filteredEvent.Data)
	assert.NoError(t, err)
	assert.Len(t, filteredVoting.Notes, 1)

	assert.Equal(t, userId, filteredVoting.Notes[0].Author)
}

func TestVotingRuleHandleUpdatedEventAsParticipantWithStatusNotClosed(t *testing.T) {
	ctx := t.Context()
	boardId := uuid.New()
	userId := uuid.New()

	event := &realtime.BoardEvent{
		Type: realtime.BoardEventVotingUpdated,
		Data: votings.VotingUpdated{
			Voting: &votings.Voting{
				ID:     uuid.New(),
				Status: votings.Open,
			},
		},
	}

	mockBoardService := boards.NewMockBoardService(t)

	mockSessionService := sessions.NewMockSessionService(t)
	mockSessionService.EXPECT().Get(mock.Anything, boardId, userId).
		Return(&sessions.BoardSession{UserID: userId, Board: boardId, Role: role.ParticipantRole}, nil)

	mockColumnService := columns.NewMockColumnService(t)

	filterRule := NewVotingRuleFilter(mockBoardService, mockColumnService, mockSessionService)

	filteredEvent, err := filterRule.Handle(ctx, event, boardId, userId)

	assert.NoError(t, err)
	assert.Equal(t, event, filteredEvent)
}

func TestVotingRuleHandleCreatedEvent(t *testing.T) {
	ctx := t.Context()
	boardId := uuid.New()
	userId := uuid.New()

	event := &realtime.BoardEvent{
		Type: realtime.BoardEventVotingCreated,
		Data: uuid.New(),
	}

	mockBoardService := boards.NewMockBoardService(t)
	mockSessionService := sessions.NewMockSessionService(t)
	mockColumnService := columns.NewMockColumnService(t)

	filterRule := NewVotingRuleFilter(mockBoardService, mockColumnService, mockSessionService)

	filteredEvent, err := filterRule.Handle(ctx, event, boardId, userId)

	assert.Error(t, err)
	assert.Equal(t, errors.New("evnt not supported"), err)
	assert.Nil(t, filteredEvent)
}

func TestVotingRuleHandleUpdatedEventSessionServiceError(t *testing.T) {
	ctx := t.Context()
	boardId := uuid.New()
	userId := uuid.New()

	event := &realtime.BoardEvent{
		Type: realtime.BoardEventVotingUpdated,
		Data: votings.VotingUpdated{},
	}

	mockBoardService := boards.NewMockBoardService(t)

	mockSessionService := sessions.NewMockSessionService(t)
	mockSessionService.EXPECT().Get(mock.Anything, boardId, userId).
		Return(&sessions.BoardSession{}, errors.New("failed to retrieve session"))

	mockColumnService := columns.NewMockColumnService(t)

	filterRule := NewVotingRuleFilter(mockBoardService, mockColumnService, mockSessionService)

	filteredEvent, err := filterRule.Handle(ctx, event, boardId, userId)

	assert.Error(t, err)
	assert.Equal(t, errors.New("failed to retrieve session"), err)
	assert.Nil(t, filteredEvent)
}

func TestVotingRuleHandleUpdatedEventColumnServiceError(t *testing.T) {
	ctx := t.Context()
	boardId := uuid.New()
	userId := uuid.New()

	event := &realtime.BoardEvent{
		Type: realtime.BoardEventVotingUpdated,
		Data: votings.VotingUpdated{
			Voting: &votings.Voting{
				ID:     uuid.New(),
				Status: votings.Closed,
			},
		},
	}

	mockBoardService := boards.NewMockBoardService(t)

	mockSessionService := sessions.NewMockSessionService(t)
	mockSessionService.EXPECT().Get(mock.Anything, boardId, userId).
		Return(&sessions.BoardSession{UserID: userId, Board: boardId, Role: role.ParticipantRole}, nil)

	mockColumnService := columns.NewMockColumnService(t)
	mockColumnService.EXPECT().GetAll(mock.Anything, boardId).
		Return([]*columns.Column{}, errors.New("failed to retrieve columns"))

	filterRule := NewVotingRuleFilter(mockBoardService, mockColumnService, mockSessionService)

	filteredEvent, err := filterRule.Handle(ctx, event, boardId, userId)

	assert.Error(t, err)
	assert.Equal(t, errors.New("failed to retrieve columns"), err)
	assert.Nil(t, filteredEvent)
}

func TestVotingRuleHandleUpdatedEventBoardServiceError(t *testing.T) {
	ctx := t.Context()
	boardId := uuid.New()
	userId := uuid.New()
	visibleColumnId := uuid.New()

	event := &realtime.BoardEvent{
		Type: realtime.BoardEventVotingUpdated,
		Data: votings.VotingUpdated{
			Voting: &votings.Voting{
				ID:     uuid.New(),
				Status: votings.Closed,
			},
		},
	}

	mockBoardService := boards.NewMockBoardService(t)
	mockBoardService.EXPECT().Get(mock.Anything, boardId).
		Return(&boards.Board{}, errors.New("failed to retrieve board"))

	mockSessionService := sessions.NewMockSessionService(t)
	mockSessionService.EXPECT().Get(mock.Anything, boardId, userId).
		Return(&sessions.BoardSession{UserID: userId, Board: boardId, Role: role.ParticipantRole}, nil)

	mockColumnService := columns.NewMockColumnService(t)
	mockColumnService.EXPECT().GetAll(mock.Anything, boardId).
		Return([]*columns.Column{
			{ID: visibleColumnId, Visible: true},
		}, nil)

	filterRule := NewVotingRuleFilter(mockBoardService, mockColumnService, mockSessionService)

	filteredEvent, err := filterRule.Handle(ctx, event, boardId, userId)

	assert.Error(t, err)
	assert.Equal(t, errors.New("failed to retrieve board"), err)
	assert.Nil(t, filteredEvent)
}

func TestVotingRuleHandleUpdatedEventUnmarshalError(t *testing.T) {
	ctx := t.Context()
	boardId := uuid.New()
	userId := uuid.New()

	event := &realtime.BoardEvent{
		Type: realtime.BoardEventVotingUpdated,
		Data: uuid.New(),
	}

	mockBoardService := boards.NewMockBoardService(t)

	mockSessionService := sessions.NewMockSessionService(t)
	mockSessionService.EXPECT().Get(mock.Anything, boardId, userId).
		Return(&sessions.BoardSession{UserID: userId, Board: boardId, Role: role.ParticipantRole}, nil)

	mockColumnService := columns.NewMockColumnService(t)

	filterRule := NewVotingRuleFilter(mockBoardService, mockColumnService, mockSessionService)

	filteredEvent, err := filterRule.Handle(ctx, event, boardId, userId)

	assert.Error(t, err)
	assert.Nil(t, filteredEvent)
}
