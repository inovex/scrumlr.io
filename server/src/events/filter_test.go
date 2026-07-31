package events

import (
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"scrumlr.io/server/columns"
	"scrumlr.io/server/common"
	"scrumlr.io/server/notes"
	"scrumlr.io/server/realtime"
	"scrumlr.io/server/role"
	"scrumlr.io/server/sessions"
	"scrumlr.io/server/technical_helper"
	"scrumlr.io/server/votings"
)

func TestFilterColumnUpdatedEventModeratorSession(t *testing.T) {
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

	listener := new(eventListener)
	listener.sessionService = mockSessionService

	filteredEvent := listener.filter(ctx, event, boardId, userId)

	assert.NotNil(t, filteredEvent)

	filteredColumns, err := columns.UnmarshallColumnData(filteredEvent.Data)
	assert.NoError(t, err)
	assert.Len(t, filteredColumns, 2)
}

func TestFilterColumnUpdatedEventParticipantSession(t *testing.T) {
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

	listener := new(eventListener)
	listener.sessionService = mockSessionService

	filteredEvent := listener.filter(ctx, event, boardId, userId)

	assert.NotNil(t, filteredEvent)

	filteredColumns, err := columns.UnmarshallColumnData(filteredEvent.Data)
	assert.NoError(t, err)
	assert.Len(t, filteredColumns, 1)
}

func TestFilterNotesUpdatedEventModeratorSession(t *testing.T) {
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

	mockSessionService := sessions.NewMockSessionService(t)
	mockSessionService.EXPECT().Get(mock.Anything, boardId, userId).
		Return(&sessions.BoardSession{UserID: userId, Board: boardId, Role: role.ModeratorRole}, nil)

	listener := new(eventListener)
	listener.sessionService = mockSessionService

	filteredEvent := listener.filter(ctx, event, boardId, userId)

	assert.NotNil(t, filteredEvent)

	filteredNotes, err := technical_helper.UnmarshalSlice[notes.Note](filteredEvent.Data)
	assert.NoError(t, err)
	assert.Len(t, filteredNotes, 3)
}

func TestFilterNotesUpdatedEventParticipantSession(t *testing.T) {
	ctx := t.Context()
	boardId := uuid.New()
	userId := uuid.New()
	visibleColumnId := uuid.New()
	columnId := uuid.New()

	event := &realtime.BoardEvent{
		Type: realtime.BoardEventNotesUpdated,
		Data: []notes.Note{
			{ID: uuid.New(), Author: userId, Text: "Test Note 1", Edited: false, Position: notes.NotePosition{Column: visibleColumnId}},
			{ID: uuid.New(), Author: uuid.New(), Text: "Test Note 2", Edited: false, Position: notes.NotePosition{Column: visibleColumnId}},
			{ID: uuid.New(), Author: uuid.New(), Text: "Test Note 3", Edited: false, Position: notes.NotePosition{Column: columnId}},
		},
	}

	mockSessionService := sessions.NewMockSessionService(t)
	mockSessionService.EXPECT().Get(mock.Anything, boardId, userId).
		Return(&sessions.BoardSession{UserID: userId, Board: boardId, Role: role.ParticipantRole}, nil)

	mockColumnService := columns.NewMockColumnService(t)
	mockColumnService.EXPECT().GetAll(mock.Anything, boardId).
		Return([]*columns.Column{
			{ID: visibleColumnId, Visible: true},
			{ID: columnId, Visible: false},
		}, nil)

	listener := new(eventListener)
	listener.sessionService = mockSessionService
	listener.columnService = mockColumnService

	filteredEvent := listener.filter(ctx, event, boardId, userId)

	assert.NotNil(t, filteredEvent)

	filteredNotes, err := technical_helper.UnmarshalSlice[notes.Note](filteredEvent.Data)
	assert.NoError(t, err)
	assert.Len(t, filteredNotes, 2)
}

func TestFilterVotingUpdatedEventModeratorSession(t *testing.T) {
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

	mockSessionService := sessions.NewMockSessionService(t)
	mockSessionService.EXPECT().Get(mock.Anything, boardId, userId).
		Return(&sessions.BoardSession{UserID: userId, Board: boardId, Role: role.ModeratorRole}, nil)

	listener := new(eventListener)
	listener.sessionService = mockSessionService

	filteredEvent := listener.filter(ctx, event, boardId, userId)

	assert.NotNil(t, filteredEvent)

	filteredVoting, err := votings.UnmarshallVoteData(filteredEvent.Data)
	assert.NoError(t, err)
	assert.Len(t, filteredVoting.Notes, 3)
}

func TestFilterVotingUpdatedEventParticipantSession(t *testing.T) {
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

	mockSessionService := sessions.NewMockSessionService(t)
	mockSessionService.EXPECT().Get(mock.Anything, boardId, userId).
		Return(&sessions.BoardSession{UserID: userId, Board: boardId, Role: role.ParticipantRole}, nil)

	mockColumnService := columns.NewMockColumnService(t)
	mockColumnService.EXPECT().GetAll(mock.Anything, boardId).
		Return([]*columns.Column{
			{ID: visibleColumnId, Visible: true},
			{ID: columnId, Visible: false},
		}, nil)

	listener := new(eventListener)
	listener.sessionService = mockSessionService
	listener.columnService = mockColumnService

	filteredEvent := listener.filter(ctx, event, boardId, userId)

	assert.NotNil(t, filteredEvent)

	filteredVoting, err := votings.UnmarshallVoteData(filteredEvent.Data)
	assert.NoError(t, err)
	assert.Len(t, filteredVoting.Notes, 2)
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

	mockSessionService := sessions.NewMockSessionService(t)
	mockSessionService.EXPECT().Get(mock.Anything, boardId, userId).
		Return(&sessions.BoardSession{UserID: userId, Board: boardId, Role: role.ModeratorRole}, nil)

	listener := new(eventListener)
	listener.sessionService = mockSessionService

	filteredEvent := listener.filter(ctx, event, boardId, userId)

	assert.NotNil(t, filteredEvent)

	filteredVotes, err := technical_helper.UnmarshalSlice[votings.Vote](filteredEvent.Data)
	assert.NoError(t, err)
	assert.Len(t, filteredVotes, 3)
}
