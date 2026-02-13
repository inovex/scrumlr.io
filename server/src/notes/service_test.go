package notes

import (
	"context"
	"encoding/json"
	"time"

	"scrumlr.io/server/cache"
	"scrumlr.io/server/realtime"

	"database/sql"
	"errors"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"scrumlr.io/server/common"
)

func TestCreate(t *testing.T) {
	authorId := uuid.New()
	boardId := uuid.New()
	columnId := uuid.New()
	rank := 0
	noteId := uuid.New()
	edited := false
	text := "This is a text on a note"

	mockDB := NewMockNotesDatabase(t)
	mockDB.EXPECT().CreateNote(mock.Anything, DatabaseNoteInsert{Author: authorId, Board: boardId, Column: columnId, Text: text}).
		Return(DatabaseNote{ID: noteId, Author: authorId, Board: boardId, Column: columnId, Text: text, Stack: uuid.NullUUID{}, Rank: rank, Edited: edited}, nil)
	mockDB.EXPECT().GetAll(mock.Anything, boardId).
		Return([]DatabaseNote{}, nil)

	mockBroker := realtime.NewMockClient(t)
	mockBroker.EXPECT().Publish(mock.Anything, mock.AnythingOfType("string"), mock.Anything).Return(nil)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockCache := cache.NewMockClient(t)
	c := new(cache.Cache)
	c.Con = mockCache

	service := NewNotesService(mockDB, broker, c)

	note, err := service.Create(context.Background(), NoteCreateRequest{User: authorId, Board: boardId, Column: columnId, Text: text})

	assert.Nil(t, err)
	assert.Equal(t, noteId, note.ID)
	assert.Equal(t, authorId, note.Author)
	assert.Equal(t, text, note.Text)
	assert.Equal(t, edited, note.Edited)
	assert.Equal(t, columnId, note.Position.Column)
	assert.Equal(t, rank, note.Position.Rank)
}

func TestCreate_EmptyText(t *testing.T) {
	authorId := uuid.New()
	boardId := uuid.New()
	columnId := uuid.New()
	text := ""

	mockDB := NewMockNotesDatabase(t)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockCache := cache.NewMockClient(t)
	c := new(cache.Cache)
	c.Con = mockCache

	service := NewNotesService(mockDB, broker, c)

	note, err := service.Create(context.Background(), NoteCreateRequest{User: authorId, Board: boardId, Column: columnId, Text: text})

	assert.Nil(t, note)
	assert.NotNil(t, err)
	assert.Equal(t, common.BadRequestError(errors.New("cannot create note with empty text")), err)
}

func TestCreate_DatabaseError(t *testing.T) {
	authorId := uuid.New()
	boardId := uuid.New()
	columnId := uuid.New()
	text := "This is a text on a note"
	dbError := errors.New("database error")

	mockDB := NewMockNotesDatabase(t)
	mockDB.EXPECT().CreateNote(mock.Anything, DatabaseNoteInsert{Author: authorId, Board: boardId, Column: columnId, Text: text}).
		Return(DatabaseNote{}, dbError)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockCache := cache.NewMockClient(t)
	c := new(cache.Cache)
	c.Con = mockCache

	service := NewNotesService(mockDB, broker, c)

	note, err := service.Create(context.Background(), NoteCreateRequest{User: authorId, Board: boardId, Column: columnId, Text: text})

	assert.Nil(t, note)
	assert.NotNil(t, err)
	assert.Equal(t, common.InternalServerError, err)
}

func TestImport(t *testing.T) {
	authorId := uuid.New()
	boardId := uuid.New()
	columnId := uuid.New()
	rank := 0
	noteId := uuid.New()
	edited := false
	text := "This is a text on a note"

	mockDB := NewMockNotesDatabase(t)
	mockDB.EXPECT().ImportNote(mock.Anything, DatabaseNoteImport{Author: authorId, Board: boardId, Text: text, Position: &NoteUpdatePosition{Column: columnId}}).
		Return(DatabaseNote{ID: noteId, Author: authorId, Board: boardId, Column: columnId, Text: text, Stack: uuid.NullUUID{}, Rank: rank, Edited: edited}, nil)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockCache := cache.NewMockClient(t)
	c := new(cache.Cache)
	c.Con = mockCache

	service := NewNotesService(mockDB, broker, c)

	note, err := service.Import(context.Background(), NoteImportRequest{User: authorId, Board: boardId, Text: text, Position: NotePosition{Column: columnId}})

	assert.Nil(t, err)
	assert.Equal(t, noteId, note.ID)
	assert.Equal(t, authorId, note.Author)
	assert.Equal(t, text, note.Text)
	assert.Equal(t, edited, note.Edited)
	assert.Equal(t, columnId, note.Position.Column)
	assert.Equal(t, rank, note.Position.Rank)
}

func TestImport_EmptyText(t *testing.T) {
	authorId := uuid.New()
	boardId := uuid.New()
	columnId := uuid.New()
	text := ""

	mockDB := NewMockNotesDatabase(t)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockCache := cache.NewMockClient(t)
	c := new(cache.Cache)
	c.Con = mockCache

	service := NewNotesService(mockDB, broker, c)

	note, err := service.Import(context.Background(), NoteImportRequest{User: authorId, Board: boardId, Text: text, Position: NotePosition{Column: columnId}})

	assert.Nil(t, note)
	assert.NotNil(t, err)
	assert.Equal(t, common.BadRequestError(errors.New("cannot import note with empty text")), err)
}

func TestImport_DatabaseError(t *testing.T) {
	authorId := uuid.New()
	boardId := uuid.New()
	columnId := uuid.New()
	text := "This is a text on a note"
	dbError := errors.New("database error")

	mockDB := NewMockNotesDatabase(t)
	mockDB.EXPECT().ImportNote(mock.Anything, DatabaseNoteImport{Author: authorId, Board: boardId, Text: text, Position: &NoteUpdatePosition{Column: columnId}}).
		Return(DatabaseNote{}, dbError)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockCache := cache.NewMockClient(t)
	c := new(cache.Cache)
	c.Con = mockCache

	service := NewNotesService(mockDB, broker, c)

	note, err := service.Import(context.Background(), NoteImportRequest{User: authorId, Board: boardId, Text: text, Position: NotePosition{Column: columnId}})

	assert.Nil(t, note)
	assert.NotNil(t, err)
	assert.Equal(t, common.InternalServerError, err)
}

func TestUpdate_Text_Owner(t *testing.T) {
	callerId := uuid.New()
	callerRole := common.OwnerRole
	authorId := uuid.New()
	noteId := uuid.New()
	boardId := uuid.New()
	columnId := uuid.New()
	stackAllowed := true
	text := "Updated text"
	rank := 0

	mockDB := NewMockNotesDatabase(t)
	mockDB.EXPECT().GetPrecondition(mock.Anything, noteId, boardId, callerId).
		Return(Precondition{StackingAllowed: stackAllowed, CallerRole: callerRole, Author: authorId}, nil)
	mockDB.EXPECT().UpdateNote(mock.Anything, callerId, DatabaseNoteUpdate{
		ID:       noteId,
		Board:    boardId,
		Text:     &text,
		Position: nil,
		Edited:   true,
	}).Return(DatabaseNote{ID: noteId, Author: authorId, Board: boardId, Column: columnId, Text: text, Edited: true}, nil)
	mockDB.EXPECT().GetAll(mock.Anything, boardId).
		Return([]DatabaseNote{}, nil)

	mockBroker := realtime.NewMockClient(t)
	mockBroker.EXPECT().Publish(mock.Anything, mock.AnythingOfType("string"), mock.Anything).Return(nil)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockCache := cache.NewMockClient(t)
	mockCache.EXPECT().Get(mock.Anything, noteId.String()).Return(nil, &cache.KeyNotFound{})
	c := new(cache.Cache)
	c.Con = mockCache

	service := NewNotesService(mockDB, broker, c)

	note, err := service.Update(context.Background(), callerId, NoteUpdateRequest{
		Text:     &text,
		ID:       noteId,
		Board:    boardId,
		Position: nil,
		Edited:   true,
	})

	assert.Nil(t, err)
	assert.Equal(t, noteId, note.ID)
	assert.Equal(t, authorId, note.Author)
	assert.Equal(t, text, note.Text)
	assert.True(t, note.Edited)
	assert.Equal(t, columnId, note.Position.Column)
	assert.Equal(t, rank, note.Position.Rank)
}

func TestUpdate_Position_Owner(t *testing.T) {
	callerId := uuid.New()
	callerRole := common.OwnerRole
	authorId := uuid.New()
	noteId := uuid.New()
	boardId := uuid.New()
	columnId := uuid.New()
	stackAllowed := true
	stackId := uuid.NullUUID{Valid: true, UUID: uuid.New()}
	text := "Updated text"
	rank := 0
	pos := NotePosition{
		Column: columnId,
		Rank:   rank,
		Stack:  stackId,
	}
	posUpdate := NoteUpdatePosition{
		Column: columnId,
		Rank:   rank,
		Stack:  stackId,
	}

	mockDB := NewMockNotesDatabase(t)
	mockDB.EXPECT().GetPrecondition(mock.Anything, noteId, boardId, callerId).
		Return(Precondition{StackingAllowed: stackAllowed, CallerRole: callerRole, Author: authorId}, nil)
	mockDB.EXPECT().UpdateNote(mock.Anything, callerId, DatabaseNoteUpdate{
		ID:       noteId,
		Board:    boardId,
		Text:     nil,
		Position: &posUpdate,
		Edited:   false,
	}).Return(DatabaseNote{ID: noteId, Author: authorId, Board: boardId, Column: columnId, Text: text, Edited: false}, nil)
	mockDB.EXPECT().GetAll(mock.Anything, boardId).
		Return([]DatabaseNote{}, nil)

	mockBroker := realtime.NewMockClient(t)
	mockBroker.EXPECT().Publish(mock.Anything, mock.AnythingOfType("string"), mock.Anything).Return(nil)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockCache := cache.NewMockClient(t)
	mockCache.EXPECT().Get(mock.Anything, noteId.String()).Return(nil, &cache.KeyNotFound{})
	c := new(cache.Cache)
	c.Con = mockCache

	service := NewNotesService(mockDB, broker, c)

	note, err := service.Update(context.Background(), callerId, NoteUpdateRequest{
		ID:       noteId,
		Text:     nil,
		Board:    boardId,
		Position: &pos,
		Edited:   false,
	})

	assert.Nil(t, err)
	assert.Equal(t, noteId, note.ID)
	assert.Equal(t, authorId, note.Author)
	assert.Equal(t, text, note.Text)
	assert.False(t, note.Edited)
	assert.Equal(t, columnId, note.Position.Column)
	assert.Equal(t, rank, note.Position.Rank)
}

func TestUpdate_Text_Moderator(t *testing.T) {
	callerId := uuid.New()
	callerRole := common.ModeratorRole
	authorId := uuid.New()
	noteId := uuid.New()
	boardId := uuid.New()
	columnId := uuid.New()
	stackAllowed := true
	text := "Updated text"
	rank := 0

	mockDB := NewMockNotesDatabase(t)
	mockDB.EXPECT().GetPrecondition(mock.Anything, noteId, boardId, callerId).
		Return(Precondition{StackingAllowed: stackAllowed, CallerRole: callerRole, Author: authorId}, nil)
	mockDB.EXPECT().UpdateNote(mock.Anything, callerId, DatabaseNoteUpdate{
		ID:       noteId,
		Board:    boardId,
		Text:     &text,
		Position: nil,
		Edited:   true,
	}).Return(DatabaseNote{ID: noteId, Author: authorId, Board: boardId, Column: columnId, Text: text, Edited: true}, nil)
	mockDB.EXPECT().GetAll(mock.Anything, boardId).
		Return([]DatabaseNote{}, nil)

	mockBroker := realtime.NewMockClient(t)
	mockBroker.EXPECT().Publish(mock.Anything, mock.AnythingOfType("string"), mock.Anything).Return(nil)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockCache := cache.NewMockClient(t)
	mockCache.EXPECT().Get(mock.Anything, noteId.String()).Return(nil, &cache.KeyNotFound{})
	c := new(cache.Cache)
	c.Con = mockCache

	service := NewNotesService(mockDB, broker, c)

	note, err := service.Update(context.Background(), callerId, NoteUpdateRequest{
		Text:     &text,
		ID:       noteId,
		Board:    boardId,
		Position: nil,
		Edited:   true,
	})

	assert.Nil(t, err)
	assert.Equal(t, noteId, note.ID)
	assert.Equal(t, authorId, note.Author)
	assert.Equal(t, text, note.Text)
	assert.True(t, note.Edited)
	assert.Equal(t, columnId, note.Position.Column)
	assert.Equal(t, rank, note.Position.Rank)
}

func TestUpdate_Position_Moderator(t *testing.T) {
	callerId := uuid.New()
	callerRole := common.ModeratorRole
	authorId := uuid.New()
	noteId := uuid.New()
	boardId := uuid.New()
	columnId := uuid.New()
	stackAllowed := true
	stackId := uuid.NullUUID{Valid: true, UUID: uuid.New()}
	text := "Updated text"
	rank := 0
	pos := NotePosition{
		Column: columnId,
		Rank:   rank,
		Stack:  stackId,
	}
	posUpdate := NoteUpdatePosition{
		Column: columnId,
		Rank:   rank,
		Stack:  stackId,
	}

	mockDB := NewMockNotesDatabase(t)
	mockDB.EXPECT().GetPrecondition(mock.Anything, noteId, boardId, callerId).
		Return(Precondition{StackingAllowed: stackAllowed, CallerRole: callerRole, Author: authorId}, nil)
	mockDB.EXPECT().UpdateNote(mock.Anything, callerId, DatabaseNoteUpdate{
		ID:       noteId,
		Board:    boardId,
		Text:     nil,
		Position: &posUpdate,
		Edited:   false,
	}).Return(DatabaseNote{ID: noteId, Author: authorId, Board: boardId, Column: columnId, Text: text, Edited: false}, nil)
	mockDB.EXPECT().GetAll(mock.Anything, boardId).
		Return([]DatabaseNote{}, nil)

	mockBroker := realtime.NewMockClient(t)
	mockBroker.EXPECT().Publish(mock.Anything, mock.AnythingOfType("string"), mock.Anything).Return(nil)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockCache := cache.NewMockClient(t)
	mockCache.EXPECT().Get(mock.Anything, noteId.String()).Return(nil, &cache.KeyNotFound{})
	c := new(cache.Cache)
	c.Con = mockCache

	service := NewNotesService(mockDB, broker, c)

	note, err := service.Update(context.Background(), callerId, NoteUpdateRequest{
		Text:     nil,
		ID:       noteId,
		Board:    boardId,
		Position: &pos,
		Edited:   false,
	})

	assert.Nil(t, err)
	assert.Equal(t, noteId, note.ID)
	assert.Equal(t, authorId, note.Author)
	assert.Equal(t, text, note.Text)
	assert.False(t, note.Edited)
	assert.Equal(t, columnId, note.Position.Column)
	assert.Equal(t, rank, note.Position.Rank)
}

func TestUpdate_Text_Participant(t *testing.T) {
	callerId := uuid.New()
	callerRole := common.ParticipantRole
	authorId := callerId
	noteId := uuid.New()
	boardId := uuid.New()
	columnId := uuid.New()
	stackAllowed := true
	text := "Updated text"
	rank := 0

	mockDB := NewMockNotesDatabase(t)
	mockDB.EXPECT().GetPrecondition(mock.Anything, noteId, boardId, callerId).
		Return(Precondition{StackingAllowed: stackAllowed, CallerRole: callerRole, Author: authorId}, nil)
	mockDB.EXPECT().UpdateNote(mock.Anything, callerId, DatabaseNoteUpdate{
		ID:       noteId,
		Board:    boardId,
		Text:     &text,
		Position: nil,
		Edited:   true,
	}).Return(DatabaseNote{ID: noteId, Author: authorId, Board: boardId, Column: columnId, Text: text, Edited: true}, nil)
	mockDB.EXPECT().GetAll(mock.Anything, boardId).
		Return([]DatabaseNote{}, nil)

	mockBroker := realtime.NewMockClient(t)
	mockBroker.EXPECT().Publish(mock.Anything, mock.AnythingOfType("string"), mock.Anything).Return(nil)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockCache := cache.NewMockClient(t)
	mockCache.EXPECT().Get(mock.Anything, noteId.String()).Return(nil, &cache.KeyNotFound{})
	c := new(cache.Cache)
	c.Con = mockCache

	service := NewNotesService(mockDB, broker, c)

	note, err := service.Update(context.Background(), callerId, NoteUpdateRequest{
		Text:     &text,
		ID:       noteId,
		Board:    boardId,
		Position: nil,
		Edited:   false,
	})

	assert.Nil(t, err)
	assert.Equal(t, noteId, note.ID)
	assert.Equal(t, authorId, note.Author)
	assert.Equal(t, text, note.Text)
	assert.True(t, note.Edited)
	assert.Equal(t, columnId, note.Position.Column)
	assert.Equal(t, rank, note.Position.Rank)
}

func TestUpdate_Text_Participant_NotAllowed(t *testing.T) {
	callerId := uuid.New()
	callerRole := common.ParticipantRole
	authorId := uuid.New()
	noteId := uuid.New()
	boardId := uuid.New()
	columnId := uuid.New()
	stackAllowed := true
	stackId := uuid.NullUUID{Valid: true, UUID: uuid.New()}
	txt := "Updated text"
	pos := NotePosition{
		Column: columnId,
		Rank:   0,
		Stack:  stackId,
	}

	mockDB := NewMockNotesDatabase(t)
	mockDB.EXPECT().GetPrecondition(mock.Anything, noteId, boardId, callerId).
		Return(Precondition{StackingAllowed: stackAllowed, CallerRole: callerRole, Author: authorId}, nil)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockCache := cache.NewMockClient(t)
	c := new(cache.Cache)
	c.Con = mockCache

	service := NewNotesService(mockDB, broker, c)

	note, err := service.Update(context.Background(), callerId, NoteUpdateRequest{
		Text:     &txt,
		ID:       noteId,
		Board:    boardId,
		Position: &pos,
		Edited:   true,
	})

	assert.Nil(t, note)
	assert.NotNil(t, err)
	assert.Equal(t, common.ForbiddenError(errors.New("not allowed to change text of note")), err)
}

func TestUpdate_Position_Participant(t *testing.T) {
	callerId := uuid.New()
	callerRole := common.ParticipantRole
	authorId := callerId
	noteId := uuid.New()
	boardId := uuid.New()
	columnId := uuid.New()
	stackAllowed := true
	text := "Updated text"
	stackId := uuid.NullUUID{Valid: true, UUID: uuid.New()}
	rank := 0
	pos := NotePosition{
		Column: columnId,
		Rank:   rank,
		Stack:  stackId,
	}
	posUpdate := NoteUpdatePosition{
		Column: columnId,
		Rank:   rank,
		Stack:  stackId,
	}

	mockDB := NewMockNotesDatabase(t)
	mockDB.EXPECT().GetPrecondition(mock.Anything, noteId, boardId, callerId).
		Return(Precondition{StackingAllowed: stackAllowed, CallerRole: callerRole, Author: authorId}, nil)
	mockDB.EXPECT().UpdateNote(mock.Anything, callerId, DatabaseNoteUpdate{
		ID:       noteId,
		Board:    boardId,
		Text:     nil,
		Position: &posUpdate,
		Edited:   false,
	}).Return(DatabaseNote{ID: noteId, Author: authorId, Board: boardId, Column: columnId, Text: text, Edited: false}, nil)
	mockDB.EXPECT().GetAll(mock.Anything, boardId).
		Return([]DatabaseNote{}, nil)

	mockBroker := realtime.NewMockClient(t)
	mockBroker.EXPECT().Publish(mock.Anything, mock.AnythingOfType("string"), mock.Anything).Return(nil)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockCache := cache.NewMockClient(t)
	mockCache.EXPECT().Get(mock.Anything, noteId.String()).Return(nil, &cache.KeyNotFound{})
	c := new(cache.Cache)
	c.Con = mockCache

	service := NewNotesService(mockDB, broker, c)

	note, err := service.Update(context.Background(), callerId, NoteUpdateRequest{
		Text:     nil,
		ID:       noteId,
		Board:    boardId,
		Position: &pos,
		Edited:   false,
	})

	assert.Nil(t, err)
	assert.Equal(t, noteId, note.ID)
	assert.Equal(t, authorId, note.Author)
	assert.Equal(t, text, note.Text)
	assert.False(t, note.Edited)
	assert.Equal(t, columnId, note.Position.Column)
	assert.Equal(t, rank, note.Position.Rank)
}

func TestUpdate_StackingNotAllowed(t *testing.T) {
	callerId := uuid.New()
	callerRole := common.ParticipantRole
	authorId := callerId
	noteId := uuid.New()
	boardId := uuid.New()
	columnId := uuid.New()
	stackAllowed := false
	stackId := uuid.NullUUID{Valid: true, UUID: uuid.New()}
	txt := "Updated text"
	pos := NotePosition{
		Column: columnId,
		Rank:   0,
		Stack:  stackId,
	}

	mockDB := NewMockNotesDatabase(t)
	mockDB.EXPECT().GetPrecondition(mock.Anything, noteId, boardId, callerId).
		Return(Precondition{StackingAllowed: stackAllowed, CallerRole: callerRole, Author: authorId}, nil)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockCache := cache.NewMockClient(t)
	mockCache.EXPECT().Get(mock.Anything, noteId.String()).Return(nil, &cache.KeyNotFound{})
	c := new(cache.Cache)
	c.Con = mockCache

	service := NewNotesService(mockDB, broker, c)

	note, err := service.Update(context.Background(), callerId, NoteUpdateRequest{
		Text:     &txt,
		ID:       noteId,
		Board:    boardId,
		Position: &pos,
		Edited:   true,
	})

	assert.Nil(t, note)
	assert.NotNil(t, err)
	assert.Equal(t, common.ForbiddenError(errors.New("not allowed to stack notes")), err)
}

func TestUpdate_StackOnSelf(t *testing.T) {
	callerId := uuid.New()
	callerRole := common.ParticipantRole
	authorId := callerId
	noteId := uuid.New()
	boardId := uuid.New()
	columnId := uuid.New()
	stackAllowed := true
	stackId := uuid.NullUUID{Valid: true, UUID: noteId}
	txt := "Updated text"
	pos := NotePosition{
		Column: columnId,
		Rank:   0,
		Stack:  stackId,
	}

	mockDB := NewMockNotesDatabase(t)
	mockDB.EXPECT().GetPrecondition(mock.Anything, noteId, boardId, callerId).
		Return(Precondition{StackingAllowed: stackAllowed, CallerRole: callerRole, Author: authorId}, nil)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockCache := cache.NewMockClient(t)
	mockCache.EXPECT().Get(mock.Anything, noteId.String()).Return(nil, &cache.KeyNotFound{})
	c := new(cache.Cache)
	c.Con = mockCache

	service := NewNotesService(mockDB, broker, c)

	note, err := service.Update(context.Background(), callerId, NoteUpdateRequest{
		Text:     &txt,
		ID:       noteId,
		Board:    boardId,
		Position: &pos,
		Edited:   true,
	})

	assert.Nil(t, note)
	assert.NotNil(t, err)
	assert.Equal(t, common.ForbiddenError(errors.New("not allowed to stack a note on self")), err)
}

func TestUpdate_NotLocked(t *testing.T) {
	callerId := uuid.New()
	callerRole := common.ModeratorRole
	authorId := uuid.New()
	noteId := uuid.New()
	boardId := uuid.New()
	columnId := uuid.New()
	stackAllowed := true
	stackId := uuid.NullUUID{Valid: true, UUID: uuid.New()}
	text := "Updated text"
	rank := 0
	pos := NotePosition{
		Column: columnId,
		Rank:   rank,
		Stack:  stackId,
	}
	posUpdate := NoteUpdatePosition{
		Column: columnId,
		Rank:   rank,
		Stack:  stackId,
	}
	lock, _ := json.Marshal(DragLock{noteId, callerId, boardId})

	mockDB := NewMockNotesDatabase(t)
	mockDB.EXPECT().GetPrecondition(mock.Anything, noteId, boardId, callerId).
		Return(Precondition{StackingAllowed: stackAllowed, CallerRole: callerRole, Author: authorId}, nil)
	mockDB.EXPECT().UpdateNote(mock.Anything, callerId, DatabaseNoteUpdate{
		ID:       noteId,
		Board:    boardId,
		Text:     &text,
		Position: &posUpdate,
		Edited:   true,
	}).Return(DatabaseNote{ID: noteId, Author: authorId, Board: boardId, Column: columnId, Text: text, Edited: true}, nil)
	mockDB.EXPECT().GetAll(mock.Anything, boardId).
		Return([]DatabaseNote{}, nil)

	mockBroker := realtime.NewMockClient(t)
	mockBroker.EXPECT().Publish(mock.Anything, mock.AnythingOfType("string"), mock.Anything).Return(nil)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockCache := cache.NewMockClient(t)
	mockCache.EXPECT().Get(mock.Anything, noteId.String()).Return(lock, nil)
	c := new(cache.Cache)
	c.Con = mockCache

	service := NewNotesService(mockDB, broker, c)

	note, err := service.Update(context.Background(), callerId, NoteUpdateRequest{
		ID:       noteId,
		Text:     &text,
		Board:    boardId,
		Position: &pos,
		Edited:   true,
	})

	assert.Nil(t, err)
	assert.Equal(t, noteId, note.ID)
	assert.Equal(t, authorId, note.Author)
	assert.Equal(t, text, note.Text)
	assert.True(t, note.Edited)
	assert.Equal(t, columnId, note.Position.Column)
	assert.Equal(t, rank, note.Position.Rank)
}

func TestUpdate_Locked(t *testing.T) {
	callerId := uuid.New()
	callerRole := common.ParticipantRole
	authorId := uuid.New()
	noteId := uuid.New()
	boardId := uuid.New()
	columnId := uuid.New()
	stackAllowed := true
	stackId := uuid.NullUUID{Valid: true, UUID: uuid.New()}
	rank := 0
	pos := NotePosition{
		Column: columnId,
		Rank:   rank,
		Stack:  stackId,
	}
	lock, _ := json.Marshal(DragLock{noteId, authorId, boardId})

	mockDB := NewMockNotesDatabase(t)
	mockDB.EXPECT().GetPrecondition(mock.Anything, noteId, boardId, callerId).
		Return(Precondition{StackingAllowed: stackAllowed, CallerRole: callerRole, Author: authorId}, nil)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockCache := cache.NewMockClient(t)
	mockCache.EXPECT().Get(mock.Anything, noteId.String()).Return(lock, nil)
	c := new(cache.Cache)
	c.Con = mockCache

	service := NewNotesService(mockDB, broker, c)

	note, err := service.Update(context.Background(), callerId, NoteUpdateRequest{
		ID:       noteId,
		Text:     nil,
		Board:    boardId,
		Position: &pos,
		Edited:   false,
	})

	assert.Nil(t, note)
	assert.NotNil(t, err)
	assert.Equal(t, common.ConflictError(errors.New("note is currently locked")), err)
}

func TestUpdate_DatabaseError(t *testing.T) {
	callerId := uuid.New()
	authorId := callerId
	noteId := uuid.New()
	boardId := uuid.New()
	columnId := uuid.New()
	stackAllowed := true
	stackId := uuid.NullUUID{Valid: true, UUID: uuid.New()}
	text := "Updated text"
	rank := 0
	pos := NotePosition{
		Column: columnId,
		Rank:   rank,
		Stack:  stackId,
	}
	posUpdate := NoteUpdatePosition{
		Column: columnId,
		Rank:   rank,
		Stack:  stackId,
	}
	dbError := errors.New("database error")

	mockDB := NewMockNotesDatabase(t)
	mockDB.EXPECT().GetPrecondition(mock.Anything, noteId, boardId, callerId).
		Return(Precondition{StackingAllowed: stackAllowed, CallerRole: common.ParticipantRole, Author: authorId}, nil)
	mockDB.EXPECT().UpdateNote(mock.Anything, callerId, DatabaseNoteUpdate{
		ID:       noteId,
		Board:    boardId,
		Text:     &text,
		Position: &posUpdate,
		Edited:   true,
	}).Return(DatabaseNote{}, dbError)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockCache := cache.NewMockClient(t)
	mockCache.EXPECT().Get(mock.Anything, noteId.String()).Return(nil, &cache.KeyNotFound{})
	c := new(cache.Cache)
	c.Con = mockCache

	service := NewNotesService(mockDB, broker, c)

	note, err := service.Update(context.Background(), callerId, NoteUpdateRequest{
		Text:     &text,
		ID:       noteId,
		Board:    boardId,
		Position: &pos,
		Edited:   true,
	})

	assert.Nil(t, note)
	assert.NotNil(t, err)
	assert.Equal(t, common.InternalServerError, err)
}

func TestDeleteNote(t *testing.T) {
	callerId := uuid.New()
	callerRole := common.ParticipantRole
	authorId := callerId
	boardId := uuid.New()
	noteId := uuid.New()
	deleteStack := true

	ctx := context.Background()

	mockDB := NewMockNotesDatabase(t)
	mockDB.EXPECT().GetPrecondition(mock.Anything, noteId, boardId, callerId).
		Return(Precondition{StackingAllowed: true, CallerRole: callerRole, Author: authorId}, nil)
	mockDB.EXPECT().GetStack(mock.Anything, noteId).
		Return([]DatabaseNote{{ID: noteId, Author: authorId}, {ID: uuid.New(), Author: authorId, Stack: uuid.NullUUID{UUID: noteId, Valid: true}}}, nil)
	mockDB.EXPECT().DeleteNote(mock.Anything, callerId, boardId, noteId, deleteStack).
		Return(nil)

	mockBroker := realtime.NewMockClient(t)
	mockBroker.EXPECT().Publish(mock.Anything, mock.AnythingOfType("string"), mock.Anything).Return(nil)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockCache := cache.NewMockClient(t)
	mockCache.EXPECT().Get(mock.Anything, noteId.String()).Return(nil, &cache.KeyNotFound{})
	c := new(cache.Cache)
	c.Con = mockCache

	service := NewNotesService(mockDB, broker, c)

	err := service.Delete(ctx, callerId, NoteDeleteRequest{ID: noteId, Board: boardId, DeleteStack: deleteStack})

	assert.Nil(t, err)
}

func TestDeleteNote_Owner(t *testing.T) {
	callerId := uuid.New()
	callerRole := common.OwnerRole
	authorId := uuid.New()
	boardId := uuid.New()
	noteId := uuid.New()
	deleteStack := true

	ctx := context.Background()

	mockDB := NewMockNotesDatabase(t)
	mockDB.EXPECT().GetPrecondition(mock.Anything, noteId, boardId, callerId).
		Return(Precondition{StackingAllowed: true, CallerRole: callerRole, Author: authorId}, nil)
	mockDB.EXPECT().GetStack(mock.Anything, noteId).
		Return([]DatabaseNote{{ID: noteId, Author: authorId}, {ID: uuid.New(), Author: authorId, Stack: uuid.NullUUID{UUID: noteId, Valid: true}}}, nil)
	mockDB.EXPECT().DeleteNote(mock.Anything, callerId, boardId, noteId, deleteStack).
		Return(nil)

	mockBroker := realtime.NewMockClient(t)
	mockBroker.EXPECT().Publish(mock.Anything, mock.AnythingOfType("string"), mock.Anything).Return(nil)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockCache := cache.NewMockClient(t)
	mockCache.EXPECT().Get(mock.Anything, noteId.String()).Return(nil, &cache.KeyNotFound{})
	c := new(cache.Cache)
	c.Con = mockCache

	service := NewNotesService(mockDB, broker, c)

	err := service.Delete(ctx, callerId, NoteDeleteRequest{ID: noteId, Board: boardId, DeleteStack: deleteStack})

	assert.Nil(t, err)
}

func TestDeleteNote_Moderator(t *testing.T) {
	callerId := uuid.New()
	callerRole := common.ModeratorRole
	authorId := uuid.New()
	boardId := uuid.New()
	noteId := uuid.New()
	deleteStack := true

	ctx := context.Background()

	mockDB := NewMockNotesDatabase(t)
	mockDB.EXPECT().GetPrecondition(mock.Anything, noteId, boardId, callerId).
		Return(Precondition{StackingAllowed: true, CallerRole: callerRole, Author: authorId}, nil)
	mockDB.EXPECT().GetStack(mock.Anything, noteId).
		Return([]DatabaseNote{{ID: noteId, Author: authorId}, {ID: uuid.New(), Author: authorId, Stack: uuid.NullUUID{UUID: noteId, Valid: true}}}, nil)
	mockDB.EXPECT().DeleteNote(mock.Anything, callerId, boardId, noteId, deleteStack).
		Return(nil)

	mockBroker := realtime.NewMockClient(t)
	mockBroker.EXPECT().Publish(mock.Anything, mock.AnythingOfType("string"), mock.Anything).Return(nil)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockCache := cache.NewMockClient(t)
	mockCache.EXPECT().Get(mock.Anything, noteId.String()).Return(nil, &cache.KeyNotFound{})
	c := new(cache.Cache)
	c.Con = mockCache

	service := NewNotesService(mockDB, broker, c)

	err := service.Delete(ctx, callerId, NoteDeleteRequest{ID: noteId, Board: boardId, DeleteStack: deleteStack})

	assert.Nil(t, err)
}

func TestDeleteNote_NotLocked(t *testing.T) {
	callerId := uuid.New()
	callerRole := common.ModeratorRole
	authorId := uuid.New()
	boardId := uuid.New()
	noteId := uuid.New()
	deleteStack := true
	lock, _ := json.Marshal(DragLock{noteId, callerId, boardId})

	ctx := context.Background()

	mockDB := NewMockNotesDatabase(t)
	mockDB.EXPECT().GetPrecondition(mock.Anything, noteId, boardId, callerId).
		Return(Precondition{StackingAllowed: true, CallerRole: callerRole, Author: authorId}, nil)
	mockDB.EXPECT().GetStack(mock.Anything, noteId).
		Return([]DatabaseNote{{ID: noteId, Author: authorId}, {ID: uuid.New(), Author: authorId, Stack: uuid.NullUUID{UUID: noteId, Valid: true}}}, nil)
	mockDB.EXPECT().DeleteNote(mock.Anything, callerId, boardId, noteId, deleteStack).
		Return(nil)

	mockBroker := realtime.NewMockClient(t)
	mockBroker.EXPECT().Publish(mock.Anything, mock.AnythingOfType("string"), mock.Anything).Return(nil)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockCache := cache.NewMockClient(t)
	mockCache.EXPECT().Get(mock.Anything, noteId.String()).Return(lock, nil)
	c := new(cache.Cache)
	c.Con = mockCache

	service := NewNotesService(mockDB, broker, c)

	err := service.Delete(ctx, callerId, NoteDeleteRequest{ID: noteId, Board: boardId, DeleteStack: deleteStack})

	assert.Nil(t, err)
}

func TestDeleteNote_Locked(t *testing.T) {
	callerId := uuid.New()
	callerRole := common.ModeratorRole
	authorId := uuid.New()
	boardId := uuid.New()
	noteId := uuid.New()
	deleteStack := true
	lock, _ := json.Marshal(DragLock{noteId, authorId, boardId})

	ctx := context.Background()

	mockDB := NewMockNotesDatabase(t)
	mockDB.EXPECT().GetPrecondition(mock.Anything, noteId, boardId, callerId).
		Return(Precondition{StackingAllowed: true, CallerRole: callerRole, Author: authorId}, nil)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockCache := cache.NewMockClient(t)
	mockCache.EXPECT().Get(mock.Anything, noteId.String()).Return(lock, nil)
	c := new(cache.Cache)
	c.Con = mockCache

	service := NewNotesService(mockDB, broker, c)

	err := service.Delete(ctx, callerId, NoteDeleteRequest{ID: noteId, Board: boardId, DeleteStack: deleteStack})

	assert.NotNil(t, err)
	assert.Equal(t, common.ConflictError(errors.New("note is currently locked")), err)
}

func TestDeleteNote_NotAllowed(t *testing.T) {
	callerId := uuid.New()
	callerRole := common.ParticipantRole
	authorId := uuid.New()
	boardId := uuid.New()
	noteId := uuid.New()
	deleteStack := true

	ctx := context.Background()

	mockDB := NewMockNotesDatabase(t)
	mockDB.EXPECT().GetPrecondition(mock.Anything, noteId, boardId, callerId).
		Return(Precondition{StackingAllowed: true, CallerRole: callerRole, Author: authorId}, nil)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockCache := cache.NewMockClient(t)
	c := new(cache.Cache)
	c.Con = mockCache

	service := NewNotesService(mockDB, broker, c)

	err := service.Delete(ctx, callerId, NoteDeleteRequest{ID: noteId, Board: boardId, DeleteStack: deleteStack})

	assert.NotNil(t, err)
	assert.Equal(t, common.ForbiddenError(errors.New("not allowed to delete note from other user")), err)
}

func TestGet(t *testing.T) {
	noteId := uuid.New()
	authorId := uuid.New()
	text := "This is a note"
	edited := true
	columnId := uuid.New()
	rank := 0

	mockDB := NewMockNotesDatabase(t)
	mockDB.EXPECT().Get(mock.Anything, noteId).
		Return(DatabaseNote{ID: noteId, Author: authorId, Text: text, Column: columnId, Edited: edited, Rank: rank}, nil)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockCache := cache.NewMockClient(t)
	c := new(cache.Cache)
	c.Con = mockCache

	service := NewNotesService(mockDB, broker, c)

	note, err := service.Get(context.Background(), noteId)

	assert.Nil(t, err)
	assert.Equal(t, noteId, note.ID)
	assert.Equal(t, authorId, note.Author)
	assert.Equal(t, text, note.Text)
	assert.Equal(t, edited, note.Edited)
	assert.Equal(t, columnId, note.Position.Column)
	assert.Equal(t, rank, note.Position.Rank)
}

func TestGet_NotFound(t *testing.T) {
	noteId := uuid.New()

	mockDB := NewMockNotesDatabase(t)
	mockDB.EXPECT().Get(mock.Anything, noteId).
		Return(DatabaseNote{}, sql.ErrNoRows)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockCache := cache.NewMockClient(t)
	c := new(cache.Cache)
	c.Con = mockCache

	service := NewNotesService(mockDB, broker, c)

	note, err := service.Get(context.Background(), noteId)

	assert.Nil(t, note)
	assert.NotNil(t, err)
	assert.Equal(t, common.NotFoundError, err)
}

func TestGet_DatabaseError(t *testing.T) {
	noteId := uuid.New()
	dbError := errors.New("database error")

	mockDB := NewMockNotesDatabase(t)
	mockDB.EXPECT().Get(mock.Anything, noteId).
		Return(DatabaseNote{}, dbError)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockCache := cache.NewMockClient(t)
	c := new(cache.Cache)
	c.Con = mockCache

	service := NewNotesService(mockDB, broker, c)

	note, err := service.Get(context.Background(), noteId)

	assert.Nil(t, note)
	assert.NotNil(t, err)
	assert.Equal(t, common.InternalServerError, err)
}

func TestGetAll(t *testing.T) {
	boardId := uuid.New()
	firstNoteId := uuid.New()
	secondNoteId := uuid.New()
	firstAuthorId := uuid.New()
	secondAuthorId := uuid.New()
	firstColumnId := uuid.New()
	secondColumnId := uuid.New()
	firstNoteText := "This is the first note"
	secondNoteText := "This is the second note"

	mockDB := NewMockNotesDatabase(t)
	mockDB.EXPECT().GetAll(mock.Anything, boardId).
		Return([]DatabaseNote{
			{ID: firstNoteId, Author: firstAuthorId, Board: boardId, Text: firstNoteText, Column: firstColumnId, Stack: uuid.NullUUID{}, Rank: 0, Edited: false},
			{ID: secondNoteId, Author: secondAuthorId, Board: boardId, Text: secondNoteText, Column: secondColumnId, Stack: uuid.NullUUID{}, Rank: 0, Edited: true},
		}, nil)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockCache := cache.NewMockClient(t)
	c := new(cache.Cache)
	c.Con = mockCache

	service := NewNotesService(mockDB, broker, c)

	notes, err := service.GetAll(context.Background(), boardId)

	assert.Nil(t, err)
	assert.Len(t, notes, 2)

	assert.Equal(t, firstNoteId, notes[0].ID)
	assert.Equal(t, firstAuthorId, notes[0].Author)
	assert.Equal(t, firstNoteText, notes[0].Text)
	assert.False(t, notes[0].Edited)
	assert.Equal(t, firstColumnId, notes[0].Position.Column)
	assert.Equal(t, 0, notes[0].Position.Rank)

	assert.Equal(t, secondNoteId, notes[1].ID)
	assert.Equal(t, secondAuthorId, notes[1].Author)
	assert.Equal(t, secondNoteText, notes[1].Text)
	assert.True(t, notes[1].Edited)
	assert.Equal(t, secondColumnId, notes[1].Position.Column)
	assert.Equal(t, 0, notes[1].Position.Rank)
}

func TestGetAll_ColumnFilter(t *testing.T) {

}

func TestGetAll_NotFound(t *testing.T) {
	boardId := uuid.New()

	mockDB := NewMockNotesDatabase(t)
	mockDB.EXPECT().GetAll(mock.Anything, boardId).
		Return([]DatabaseNote{}, sql.ErrNoRows)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockCache := cache.NewMockClient(t)
	c := new(cache.Cache)
	c.Con = mockCache

	service := NewNotesService(mockDB, broker, c)

	notes, err := service.GetAll(context.Background(), boardId)

	assert.Nil(t, notes)
	assert.NotNil(t, err)
	assert.Equal(t, common.NotFoundError, err)
}

func TestGetAll_DatabaseError(t *testing.T) {
	boardId := uuid.New()
	dbError := errors.New("database error")

	mockDB := NewMockNotesDatabase(t)
	mockDB.EXPECT().GetAll(mock.Anything, boardId).
		Return([]DatabaseNote{}, dbError)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockCache := cache.NewMockClient(t)
	c := new(cache.Cache)
	c.Con = mockCache

	service := NewNotesService(mockDB, broker, c)

	notes, err := service.GetAll(context.Background(), boardId)

	assert.Nil(t, notes)
	assert.NotNil(t, err)
	assert.Equal(t, common.InternalServerError, err)
}

func TestGetStack(t *testing.T) {
	noteID := uuid.New()

	mockDB := NewMockNotesDatabase(t)
	mockDB.EXPECT().GetStack(mock.Anything, noteID).
		Return([]DatabaseNote{
			{ID: uuid.New(), Text: "Note 1"},
			{ID: uuid.New(), Text: "Note 2"},
		}, nil)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockCache := cache.NewMockClient(t)
	c := new(cache.Cache)
	c.Con = mockCache

	service := NewNotesService(mockDB, broker, c)

	result, err := service.GetStack(context.Background(), noteID)

	assert.Nil(t, err)
	assert.NotNil(t, result)
	assert.Len(t, result, 2)

	/*
		  assert.Equal(t, firstNoteId, notes[0].ID)
			assert.Equal(t, firstAuthorId, notes[0].Author)
			assert.Equal(t, firstNoteText, notes[0].Text)
			assert.False(t, notes[0].Edited)
			assert.Equal(t, firstColumnId, notes[0].Position.Column)
			assert.Equal(t, 0, notes[0].Position.Rank)

			assert.Equal(t, secondNoteId, notes[1].ID)
			assert.Equal(t, secondAuthorId, notes[1].Author)
			assert.Equal(t, secondNoteText, notes[1].Text)
			assert.True(t, notes[1].Edited)
			assert.Equal(t, secondColumnId, notes[1].Position.Column)
			assert.Equal(t, 0, notes[1].Position.Rank)
	*/
}

func TestGetStack_DatabaseError(t *testing.T) {
	noteID := uuid.New()
	dbError := errors.New("database error")

	mockDB := NewMockNotesDatabase(t)
	mockDB.EXPECT().GetStack(mock.Anything, noteID).
		Return([]DatabaseNote{}, dbError)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockCache := cache.NewMockClient(t)
	c := new(cache.Cache)
	c.Con = mockCache

	service := NewNotesService(mockDB, broker, c)

	result, err := service.GetStack(context.Background(), noteID)

	assert.Error(t, err)
	assert.Nil(t, result)
	assert.Equal(t, dbError, err)
}

func TestAcquireLock(t *testing.T) {
	noteId := uuid.New()
	userId := uuid.New()
	boardId := uuid.New()

	mockDB := NewMockNotesDatabase(t)
	mockDB.EXPECT().GetStack(mock.Anything, noteId).
		Return([]DatabaseNote{{ID: noteId}}, nil)

	mockBroker := realtime.NewMockClient(t)
	mockBroker.EXPECT().Publish(mock.Anything, mock.AnythingOfType("string"), mock.Anything).Return(nil)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockCache := cache.NewMockClient(t)
	mockCache.EXPECT().Create(mock.Anything, noteId.String(), userId.String(), 10*time.Second).Return(nil)
	c := new(cache.Cache)
	c.Con = mockCache

	service := NewNotesService(mockDB, broker, c)

	acuired := service.AcquireLock(context.Background(), noteId, userId, boardId)

	assert.True(t, acuired)
}

func TestAcquireLockForStack(t *testing.T) {
	firstNoteId := uuid.New()
	secondNoteId := uuid.New()
	userId := uuid.New()
	boardId := uuid.New()

	mockDB := NewMockNotesDatabase(t)
	mockDB.EXPECT().GetStack(mock.Anything, firstNoteId).
		Return([]DatabaseNote{{ID: firstNoteId}, {ID: secondNoteId}}, nil)

	mockBroker := realtime.NewMockClient(t)
	mockBroker.EXPECT().Publish(mock.Anything, mock.AnythingOfType("string"), mock.Anything).Return(nil)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockCache := cache.NewMockClient(t)
	mockCache.EXPECT().Create(mock.Anything, firstNoteId.String(), userId.String(), 10*time.Second).Return(nil)
	mockCache.EXPECT().Create(mock.Anything, secondNoteId.String(), userId.String(), 10*time.Second).Return(nil)
	c := new(cache.Cache)
	c.Con = mockCache

	service := NewNotesService(mockDB, broker, c)

	acuired := service.AcquireLock(context.Background(), firstNoteId, userId, boardId)

	assert.True(t, acuired)
}

func TestAcquireLockFailed(t *testing.T) {
	firstNoteId := uuid.New()
	secondNoteId := uuid.New()
	userId := uuid.New()
	boardId := uuid.New()

	mockDB := NewMockNotesDatabase(t)
	mockDB.EXPECT().GetStack(mock.Anything, firstNoteId).
		Return([]DatabaseNote{{ID: firstNoteId}, {ID: secondNoteId}}, nil)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockCache := cache.NewMockClient(t)
	mockCache.EXPECT().Create(mock.Anything, firstNoteId.String(), userId.String(), 10*time.Second).Return(nil)
	mockCache.EXPECT().Create(mock.Anything, secondNoteId.String(), userId.String(), 10*time.Second).Return(errors.New("Key already exists"))
	c := new(cache.Cache)
	c.Con = mockCache

	service := NewNotesService(mockDB, broker, c)

	acuired := service.AcquireLock(context.Background(), firstNoteId, userId, boardId)

	assert.False(t, acuired)
}

func TestAcquireLockLockNoteServicefailure(t *testing.T) {
	noteId := uuid.New()
	userId := uuid.New()
	boardId := uuid.New()

	mockDB := NewMockNotesDatabase(t)
	mockDB.EXPECT().GetStack(mock.Anything, noteId).
		Return([]DatabaseNote{}, errors.New("db error"))

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockCache := cache.NewMockClient(t)
	c := new(cache.Cache)
	c.Con = mockCache

	service := NewNotesService(mockDB, broker, c)

	acuired := service.AcquireLock(context.Background(), noteId, userId, boardId)

	assert.False(t, acuired)
}

func TestReleaseLock(t *testing.T) {
	noteId := uuid.New()
	userId := uuid.New()
	boardId := uuid.New()

	mockDB := NewMockNotesDatabase(t)
	mockDB.EXPECT().GetStack(mock.Anything, noteId).
		Return([]DatabaseNote{{ID: noteId}}, nil)

	mockBroker := realtime.NewMockClient(t)
	mockBroker.EXPECT().Publish(mock.Anything, mock.AnythingOfType("string"), mock.Anything).Return(nil)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockCache := cache.NewMockClient(t)
	mockCache.EXPECT().Delete(mock.Anything, noteId.String()).Return(nil)
	c := new(cache.Cache)
	c.Con = mockCache

	service := NewNotesService(mockDB, broker, c)

	released := service.ReleaseLock(context.Background(), noteId, userId, boardId)

	assert.True(t, released)
}

func TestReleaseLockForStack(t *testing.T) {
	firstNoteId := uuid.New()
	secondNoteId := uuid.New()
	userId := uuid.New()
	boardId := uuid.New()

	mockDB := NewMockNotesDatabase(t)
	mockDB.EXPECT().GetStack(mock.Anything, firstNoteId).
		Return([]DatabaseNote{{ID: firstNoteId}, {ID: secondNoteId}}, nil)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockCache := cache.NewMockClient(t)
	mockCache.EXPECT().Delete(mock.Anything, firstNoteId.String()).Return(nil)
	mockCache.EXPECT().Delete(mock.Anything, secondNoteId.String()).Return(errors.New("cache error"))
	c := new(cache.Cache)
	c.Con = mockCache

	service := NewNotesService(mockDB, broker, c)

	released := service.ReleaseLock(context.Background(), firstNoteId, userId, boardId)

	assert.False(t, released)
}

func TestReleaseLockFailed(t *testing.T) {
	firstNoteId := uuid.New()
	secondNoteId := uuid.New()
	userId := uuid.New()
	boardId := uuid.New()

	mockDB := NewMockNotesDatabase(t)
	mockDB.EXPECT().GetStack(mock.Anything, firstNoteId).
		Return([]DatabaseNote{{ID: firstNoteId}, {ID: secondNoteId}}, nil)

	mockBroker := realtime.NewMockClient(t)
	mockBroker.EXPECT().Publish(mock.Anything, mock.AnythingOfType("string"), mock.Anything).Return(nil)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockCache := cache.NewMockClient(t)
	mockCache.EXPECT().Delete(mock.Anything, firstNoteId.String()).Return(nil)
	mockCache.EXPECT().Delete(mock.Anything, secondNoteId.String()).Return(nil)
	c := new(cache.Cache)
	c.Con = mockCache

	service := NewNotesService(mockDB, broker, c)

	released := service.ReleaseLock(context.Background(), firstNoteId, userId, boardId)

	assert.True(t, released)
}

func TestRealeaseLockNoteServiceFailed(t *testing.T) {
	noteId := uuid.New()
	userId := uuid.New()
	boardId := uuid.New()

	mockDB := NewMockNotesDatabase(t)
	mockDB.EXPECT().GetStack(mock.Anything, noteId).
		Return([]DatabaseNote{}, errors.New("db error"))

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockCache := cache.NewMockClient(t)
	c := new(cache.Cache)
	c.Con = mockCache

	service := NewNotesService(mockDB, broker, c)

	released := service.ReleaseLock(context.Background(), noteId, userId, boardId)

	assert.False(t, released)
}

func TestGetLock(t *testing.T) {
	noteId := uuid.New()
	userId := uuid.New()
	lockValue, _ := json.Marshal(DragLock{NoteID: noteId, UserID: userId})

	mockDB := NewMockNotesDatabase(t)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockCache := cache.NewMockClient(t)
	mockCache.EXPECT().Get(mock.Anything, noteId.String()).Return(lockValue, nil)
	c := new(cache.Cache)
	c.Con = mockCache

	service := NewNotesService(mockDB, broker, c)

	lock, err := service.GetLock(context.Background(), noteId)

	assert.Nil(t, err)
	assert.Equal(t, noteId, lock.NoteID)
	assert.Equal(t, userId, lock.UserID)
}

func TestIsLocked(t *testing.T) {
	noteId := uuid.New()
	userId := uuid.New()
	lockValue, _ := json.Marshal(DragLock{NoteID: noteId, UserID: userId})

	mockDB := NewMockNotesDatabase(t)
	mockDB.EXPECT().GetStack(mock.Anything, noteId).
		Return([]DatabaseNote{{ID: noteId}}, nil)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockCache := cache.NewMockClient(t)
	mockCache.EXPECT().Get(mock.Anything, noteId.String()).Return(lockValue, nil)
	c := new(cache.Cache)
	c.Con = mockCache

	service := NewNotesService(mockDB, broker, c)

	locked := service.IsLocked(context.Background(), noteId)

	assert.True(t, locked)
}

func TestIsLockedStack(t *testing.T) {
	firstNoteId := uuid.New()
	secondNoteId := uuid.New()
	userId := uuid.New()
	firstLockValue, _ := json.Marshal(DragLock{NoteID: firstNoteId, UserID: userId})

	mockDB := NewMockNotesDatabase(t)
	mockDB.EXPECT().GetStack(mock.Anything, firstNoteId).
		Return([]DatabaseNote{{ID: firstNoteId}, {ID: secondNoteId}}, nil)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockCache := cache.NewMockClient(t)
	mockCache.EXPECT().Get(mock.Anything, firstNoteId.String()).Return(firstLockValue, nil)
	c := new(cache.Cache)
	c.Con = mockCache

	service := NewNotesService(mockDB, broker, c)

	locked := service.IsLocked(context.Background(), firstNoteId)

	assert.True(t, locked)
}

func TestIsNotLocked(t *testing.T) {
	noteId := uuid.New()

	mockDB := NewMockNotesDatabase(t)
	mockDB.EXPECT().GetStack(mock.Anything, noteId).
		Return([]DatabaseNote{{ID: noteId}}, nil)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockCache := cache.NewMockClient(t)
	mockCache.EXPECT().Get(mock.Anything, noteId.String()).Return(nil, errors.New("Key not found"))
	c := new(cache.Cache)
	c.Con = mockCache

	service := NewNotesService(mockDB, broker, c)

	locked := service.IsLocked(context.Background(), noteId)

	assert.False(t, locked)
}

func TestIsPartialLockedStack(t *testing.T) {
	firstNoteId := uuid.New()
	secondNoteId := uuid.New()
	userId := uuid.New()
	secondLockValue, _ := json.Marshal(DragLock{NoteID: secondNoteId, UserID: userId})

	mockDB := NewMockNotesDatabase(t)
	mockDB.EXPECT().GetStack(mock.Anything, firstNoteId).
		Return([]DatabaseNote{{ID: firstNoteId}, {ID: secondNoteId}}, nil)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockCache := cache.NewMockClient(t)
	mockCache.EXPECT().Get(mock.Anything, firstNoteId.String()).Return(nil, errors.New("Key not found"))
	mockCache.EXPECT().Get(mock.Anything, secondNoteId.String()).Return(secondLockValue, nil)
	c := new(cache.Cache)
	c.Con = mockCache

	service := NewNotesService(mockDB, broker, c)

	locked := service.IsLocked(context.Background(), firstNoteId)

	assert.True(t, locked)
}

func TestIsLockedNoteServicefailure(t *testing.T) {
	noteId := uuid.New()

	mockDB := NewMockNotesDatabase(t)
	mockDB.EXPECT().GetStack(mock.Anything, noteId).
		Return([]DatabaseNote{}, errors.New("db error"))

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockCache := cache.NewMockClient(t)
	c := new(cache.Cache)
	c.Con = mockCache

	service := NewNotesService(mockDB, broker, c)

	locked := service.IsLocked(context.Background(), noteId)

	assert.False(t, locked)
}

type MockWebSocketConn struct {
	messages []interface{}
}

func (m *MockWebSocketConn) WriteJSON(ctx context.Context, v interface{}) error {
	m.messages = append(m.messages, v)
	return nil
}

func (m *MockWebSocketConn) GetMessages() []interface{} {
	return m.messages
}

func TestHandleAcquireMessage(t *testing.T) {
	boardID := uuid.New()
	userID := uuid.New()
	noteID := uuid.New()
	mockConn := &MockWebSocketConn{}

	mockDB := NewMockNotesDatabase(t)
	mockDB.EXPECT().GetStack(mock.Anything, noteID).
		Return([]DatabaseNote{{ID: noteID}}, nil)

	mockBroker := realtime.NewMockClient(t)
	mockBroker.EXPECT().Publish(mock.Anything, mock.AnythingOfType("string"), mock.Anything).Return(nil)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockCache := cache.NewMockClient(t)
	mockCache.EXPECT().Create(mock.Anything, noteID.String(), userID.String(), time.Second*10).
		Return(nil)
	c := new(cache.Cache)
	c.Con = mockCache

	service := NewNotesService(mockDB, broker, c)

	message := DragLockMessage{
		Action: DragLockActionAcquire,
		NoteID: noteID,
	}
	data, err := json.Marshal(message)
	assert.Nil(t, err)

	service.HandleWebSocketMessage(context.Background(), boardID, userID, mockConn, data)

	assert.Len(t, mockConn.messages, 1)
	response := mockConn.messages[0].(DragLockResponse)
	assert.Equal(t, WebSocketMessageTypeDragLock, response.Type)
	assert.Equal(t, DragLockActionAcquire, response.Action)
	assert.Equal(t, noteID, response.NoteID)
	assert.True(t, response.Success)
	assert.Empty(t, response.Error)
}

func TestHandleFailedAcquireMessage(t *testing.T) {
	boardID := uuid.New()
	userID := uuid.New()
	noteID := uuid.New()
	mockConn := &MockWebSocketConn{}

	mockDB := NewMockNotesDatabase(t)
	mockDB.EXPECT().GetStack(mock.Anything, noteID).
		Return([]DatabaseNote{{ID: noteID}}, nil)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockCache := cache.NewMockClient(t)
	mockCache.EXPECT().Create(mock.Anything, noteID.String(), userID.String(), time.Second*10).
		Return(errors.New("Lock exists"))
	c := new(cache.Cache)
	c.Con = mockCache

	service := NewNotesService(mockDB, broker, c)

	message := DragLockMessage{
		Action: DragLockActionAcquire,
		NoteID: noteID,
	}
	data, err := json.Marshal(message)
	assert.Nil(t, err)

	service.HandleWebSocketMessage(context.Background(), boardID, userID, mockConn, data)

	// Verify response was sent with error
	assert.Len(t, mockConn.messages, 1)
	response := mockConn.messages[0].(DragLockResponse)
	assert.Equal(t, WebSocketMessageTypeDragLock, response.Type)
	assert.Equal(t, DragLockActionAcquire, response.Action)
	assert.Equal(t, noteID, response.NoteID)
	assert.False(t, response.Success)
	assert.Equal(t, "Note is currently being dragged by another user", response.Error)
}

func TestHandleReleaseMessage(t *testing.T) {
	boardID := uuid.New()
	userID := uuid.New()
	noteID := uuid.New()
	mockConn := &MockWebSocketConn{}

	mockDB := NewMockNotesDatabase(t)
	mockDB.EXPECT().GetStack(mock.Anything, noteID).
		Return([]DatabaseNote{{ID: noteID}}, nil)

	mockBroker := realtime.NewMockClient(t)
	mockBroker.EXPECT().Publish(mock.Anything, mock.AnythingOfType("string"), mock.Anything).Return(nil)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockCache := cache.NewMockClient(t)
	mockCache.EXPECT().Delete(mock.Anything, noteID.String()).
		Return(nil)
	c := new(cache.Cache)
	c.Con = mockCache

	service := NewNotesService(mockDB, broker, c)

	message := DragLockMessage{
		Action: DragLockActionRelease,
		NoteID: noteID,
	}
	data, err := json.Marshal(message)
	assert.Nil(t, err)

	service.HandleWebSocketMessage(context.Background(), boardID, userID, mockConn, data)

	// Verify response was sent
	assert.Len(t, mockConn.messages, 1)
	response := mockConn.messages[0].(DragLockResponse)
	assert.Equal(t, WebSocketMessageTypeDragLock, response.Type)
	assert.Equal(t, DragLockActionRelease, response.Action)
	assert.Equal(t, noteID, response.NoteID)
	assert.True(t, response.Success)
	assert.Empty(t, response.Error)
}

func TestHandleFailedReleaseMessage(t *testing.T) {
	boardID := uuid.New()
	userID := uuid.New()
	noteID := uuid.New()
	mockConn := &MockWebSocketConn{}

	mockDB := NewMockNotesDatabase(t)
	mockDB.EXPECT().GetStack(mock.Anything, noteID).
		Return([]DatabaseNote{{ID: noteID}}, nil)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockCache := cache.NewMockClient(t)
	mockCache.EXPECT().Delete(mock.Anything, noteID.String()).
		Return(errors.New("Failed to release lock"))
	c := new(cache.Cache)
	c.Con = mockCache

	service := NewNotesService(mockDB, broker, c)

	message := DragLockMessage{
		Action: DragLockActionRelease,
		NoteID: noteID,
	}
	data, err := json.Marshal(message)
	assert.Nil(t, err)

	service.HandleWebSocketMessage(context.Background(), boardID, userID, mockConn, data)

	// Verify response was sent with error
	assert.Len(t, mockConn.messages, 1)
	response := mockConn.messages[0].(DragLockResponse)
	assert.Equal(t, WebSocketMessageTypeDragLock, response.Type)
	assert.Equal(t, DragLockActionRelease, response.Action)
	assert.Equal(t, noteID, response.NoteID)
	assert.False(t, response.Success)
	assert.Equal(t, "Lock not owned by user or already released", response.Error)
}

func TestHandleInvalidJSON(t *testing.T) {
	boardID := uuid.New()
	userID := uuid.New()
	mockConn := &MockWebSocketConn{}

	invalidJSON := []byte(`{"action": "ACQUIRE", "noteId": "invalid-uuid"}`)

	mockDB := NewMockNotesDatabase(t)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockCache := cache.NewMockClient(t)
	c := new(cache.Cache)
	c.Con = mockCache

	service := NewNotesService(mockDB, broker, c)

	service.HandleWebSocketMessage(context.Background(), boardID, userID, mockConn, invalidJSON)

	// Verify error response was sent
	assert.Len(t, mockConn.messages, 1)
	response := mockConn.messages[0].(DragLockResponse)
	assert.Equal(t, WebSocketMessageTypeDragLock, response.Type)
	assert.Equal(t, "ERROR", response.Action)
	assert.False(t, response.Success)
	assert.Equal(t, "Invalid message format", response.Error)
}

func TestHandleUnknownAction(t *testing.T) {
	boardID := uuid.New()
	userID := uuid.New()
	noteID := uuid.New()
	mockConn := &MockWebSocketConn{}

	mockDB := NewMockNotesDatabase(t)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockCache := cache.NewMockClient(t)
	c := new(cache.Cache)
	c.Con = mockCache

	service := NewNotesService(mockDB, broker, c)

	message := DragLockMessage{
		Action: "UNKNOWN_ACTION",
		NoteID: noteID,
	}
	data, err := json.Marshal(message)
	assert.Nil(t, err)

	service.HandleWebSocketMessage(context.Background(), boardID, userID, mockConn, data)

	// Verify error response was sent
	assert.Len(t, mockConn.messages, 1)
	response := mockConn.messages[0].(DragLockResponse)
	assert.Equal(t, WebSocketMessageTypeDragLock, response.Type)
	assert.Equal(t, "UNKNOWN_ACTION", response.Action)
	assert.Equal(t, noteID, response.NoteID)
	assert.False(t, response.Success)
	assert.Equal(t, "Unknown action", response.Error)
}
