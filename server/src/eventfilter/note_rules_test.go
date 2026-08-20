package eventfilter

import (
	"errors"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"scrumlr.io/server/boards"
	"scrumlr.io/server/columns"
	"scrumlr.io/server/notes"
	"scrumlr.io/server/realtime"
	"scrumlr.io/server/role"
	"scrumlr.io/server/sessions"
	"scrumlr.io/server/technical_helper"
)

func TestNoteRuleSupportUpdatedEvent(t *testing.T) {
	ctx := t.Context()

	mockBoardService := boards.NewMockBoardService(t)
	mockSessionService := sessions.NewMockSessionService(t)
	mockColumnService := columns.NewMockColumnService(t)

	filterRule := NewNoteRuleFilter(mockBoardService, mockColumnService, mockSessionService)

	supports := filterRule.Supports(ctx, realtime.BoardEventNotesUpdated)

	assert.True(t, supports)
}

func TestNoteRuleSupportDeletedEvent(t *testing.T) {
	ctx := t.Context()

	mockBoardService := boards.NewMockBoardService(t)
	mockSessionService := sessions.NewMockSessionService(t)
	mockColumnService := columns.NewMockColumnService(t)

	filterRule := NewNoteRuleFilter(mockBoardService, mockColumnService, mockSessionService)

	supports := filterRule.Supports(ctx, realtime.BoardEventNoteDeleted)

	assert.False(t, supports)
}

func TestNoteRuleHandleUpdatedEventAsOwner(t *testing.T) {
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

	filterRule := NewNoteRuleFilter(mockBoardService, mockColumnService, mockSessionService)

	filteredEvent, err := filterRule.Handle(ctx, event, boardId, userId)

	assert.NoError(t, err)
	assert.NotNil(t, filteredEvent)

	filteredNotes, err := technical_helper.UnmarshalSlice[notes.Note](filteredEvent.Data)
	assert.NoError(t, err)
	assert.Len(t, filteredNotes, 3)
}

func TestNoteruleHandleUpdatedEventAsModerator(t *testing.T) {
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
		Return(&sessions.BoardSession{UserID: userId, Board: boardId, Role: role.ModeratorRole}, nil)

	mockColumnService := columns.NewMockColumnService(t)

	filterRule := NewNoteRuleFilter(mockBoardService, mockColumnService, mockSessionService)

	filteredEvent, err := filterRule.Handle(ctx, event, boardId, userId)

	assert.NoError(t, err)
	assert.NotNil(t, filteredEvent)

	filteredNotes, err := technical_helper.UnmarshalSlice[notes.Note](filteredEvent.Data)
	assert.NoError(t, err)
	assert.Len(t, filteredNotes, 3)
}

func TestNoteRuleHandleUpdatedEventAsParticipant(t *testing.T) {
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

	filterRule := NewNoteRuleFilter(mockBoardService, mockColumnService, mockSessionService)

	filteredEvent, err := filterRule.Handle(ctx, event, boardId, userId)

	assert.NoError(t, err)
	assert.NotNil(t, filteredEvent)

	filteredNotes, err := technical_helper.UnmarshalSlice[notes.Note](filteredEvent.Data)
	assert.NoError(t, err)
	assert.Len(t, filteredNotes, 2)
}

func TestNoteRulehandleUpdatedEventAsParticipantWithDontShowAuthors(t *testing.T) {
	ctx := t.Context()
	boardId := uuid.New()
	userId := uuid.New()
	visibleColumnId := uuid.New()
	columnId := uuid.New()

	userNoteId := uuid.New()
	visibleNoteId := uuid.New()

	event := &realtime.BoardEvent{
		Type: realtime.BoardEventNotesUpdated,
		Data: []notes.Note{
			{ID: userNoteId, Author: userId, Text: "Test Note 1", Edited: false, Position: notes.NotePosition{Column: visibleColumnId}},
			{ID: visibleNoteId, Author: uuid.New(), Text: "Test Note 2", Edited: false, Position: notes.NotePosition{Column: visibleColumnId}},
			{ID: uuid.New(), Author: uuid.New(), Text: "Test Note 3", Edited: false, Position: notes.NotePosition{Column: columnId}},
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

	filterRule := NewNoteRuleFilter(mockBoardService, mockColumnService, mockSessionService)

	filteredEvent, err := filterRule.Handle(ctx, event, boardId, userId)

	assert.NoError(t, err)
	assert.NotNil(t, filteredEvent)

	filteredNotes, err := technical_helper.UnmarshalSlice[notes.Note](filteredEvent.Data)
	assert.NoError(t, err)
	assert.Len(t, filteredNotes, 2)

	for _, note := range filteredNotes {
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

func TestNoteRuleHandleUpdatedEventAsParticipantwithDontShowNotesOfOtherUsers(t *testing.T) {
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

	filterRule := NewNoteRuleFilter(mockBoardService, mockColumnService, mockSessionService)

	filteredEvent, err := filterRule.Handle(ctx, event, boardId, userId)

	assert.NoError(t, err)
	assert.NotNil(t, filteredEvent)

	filteredNotes, err := technical_helper.UnmarshalSlice[notes.Note](filteredEvent.Data)
	assert.NoError(t, err)
	assert.Len(t, filteredNotes, 1)

	assert.Equal(t, userId, filteredNotes[0].Author)
}

func TestNoteRuleHandleDeletedEvent(t *testing.T) {
	ctx := t.Context()
	boardId := uuid.New()
	userId := uuid.New()

	event := &realtime.BoardEvent{
		Type: realtime.BoardEventNoteDeleted,
		Data: uuid.New(),
	}

	mockBoardService := boards.NewMockBoardService(t)

	mockSessionService := sessions.NewMockSessionService(t)

	mockColumnService := columns.NewMockColumnService(t)

	filterRule := NewNoteRuleFilter(mockBoardService, mockColumnService, mockSessionService)

	filteredEvent, err := filterRule.Handle(ctx, event, boardId, userId)

	assert.Error(t, err)
	assert.Equal(t, errors.New("event not supported"), err)
	assert.Nil(t, filteredEvent)
}

func TestNoteRuleHandleUpdatedEventSessionServiceError(t *testing.T) {
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

	mockBoardService := boards.NewMockBoardService(t)

	mockSessionService := sessions.NewMockSessionService(t)
	mockSessionService.EXPECT().Get(mock.Anything, boardId, userId).
		Return(&sessions.BoardSession{}, errors.New("failed to retrieve session"))

	mockColumnService := columns.NewMockColumnService(t)

	filterRule := NewNoteRuleFilter(mockBoardService, mockColumnService, mockSessionService)

	filteredEvent, err := filterRule.Handle(ctx, event, boardId, userId)

	assert.Error(t, err)
	assert.Equal(t, errors.New("failed to retrieve session"), err)
	assert.Nil(t, filteredEvent)
}

func TestNoteRuleHandleUpdatedEventColumnServiceError(t *testing.T) {
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

	mockBoardService := boards.NewMockBoardService(t)

	mockSessionService := sessions.NewMockSessionService(t)
	mockSessionService.EXPECT().Get(mock.Anything, boardId, userId).
		Return(&sessions.BoardSession{UserID: userId, Board: boardId, Role: role.ParticipantRole}, nil)

	mockColumnService := columns.NewMockColumnService(t)
	mockColumnService.EXPECT().GetAll(mock.Anything, boardId).
		Return([]*columns.Column{}, errors.New("failed to retrieve columns"))

	filterRule := NewNoteRuleFilter(mockBoardService, mockColumnService, mockSessionService)

	filteredEvent, err := filterRule.Handle(ctx, event, boardId, userId)

	assert.Error(t, err)
	assert.Equal(t, errors.New("failed to retrieve columns"), err)
	assert.Nil(t, filteredEvent)
}

func TestNoteRuleHandleUpdatedEventBoardServiceError(t *testing.T) {
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
			{ID: columnId, Visible: false},
		}, nil)

	filterRule := NewNoteRuleFilter(mockBoardService, mockColumnService, mockSessionService)

	filteredEvent, err := filterRule.Handle(ctx, event, boardId, userId)

	assert.Error(t, err)
	assert.Equal(t, errors.New("failed to retrieve board"), err)
	assert.Nil(t, filteredEvent)
}

func TestNoteRuleHandleUpdatedEventUnmarshalError(t *testing.T) {
	ctx := t.Context()
	boardId := uuid.New()
	userId := uuid.New()

	event := &realtime.BoardEvent{
		Type: realtime.BoardEventNotesUpdated,
		Data: uuid.New(),
	}

	mockBoardService := boards.NewMockBoardService(t)

	mockSessionService := sessions.NewMockSessionService(t)
	mockSessionService.EXPECT().Get(mock.Anything, boardId, userId).
		Return(&sessions.BoardSession{UserID: userId, Board: boardId, Role: role.ParticipantRole}, nil)

	mockColumnService := columns.NewMockColumnService(t)

	filterRule := NewNoteRuleFilter(mockBoardService, mockColumnService, mockSessionService)

	filteredEvent, err := filterRule.Handle(ctx, event, boardId, userId)

	assert.Error(t, err)
	assert.Nil(t, filteredEvent)
}
