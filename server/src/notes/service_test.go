package notes

import (
	"context"

	"scrumlr.io/server/realtime"

	"database/sql"
	"errors"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"scrumlr.io/server/common"
)

func Test_Create(t *testing.T) {
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

	service := NewNotesService(mockDB, broker)

	note, err := service.Create(context.Background(), NoteCreateRequest{User: authorId, Board: boardId, Column: columnId, Text: text})

	assert.Nil(t, err)
	assert.Equal(t, noteId, note.ID)
	assert.Equal(t, authorId, note.Author)
	assert.Equal(t, text, note.Text)
	assert.Equal(t, edited, note.Edited)
	assert.Equal(t, columnId, note.Position.Column)
	assert.Equal(t, rank, note.Position.Rank)
}

func Test_Create_EmptyText(t *testing.T) {
	authorId := uuid.New()
	boardId := uuid.New()
	columnId := uuid.New()
	text := ""

	mockDB := NewMockNotesDatabase(t)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	service := NewNotesService(mockDB, broker)

	note, err := service.Create(context.Background(), NoteCreateRequest{User: authorId, Board: boardId, Column: columnId, Text: text})

	assert.Nil(t, note)
	assert.NotNil(t, err)
	assert.Equal(t, common.BadRequestError(errors.New("cannot create note with empty text")), err)
}

func Test_Create_DatabaseError(t *testing.T) {
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

	service := NewNotesService(mockDB, broker)

	note, err := service.Create(context.Background(), NoteCreateRequest{User: authorId, Board: boardId, Column: columnId, Text: text})

	assert.Nil(t, note)
	assert.NotNil(t, err)
	assert.Equal(t, common.InternalServerError, err)
}

func Test_Import(t *testing.T) {
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

	service := NewNotesService(mockDB, broker)

	note, err := service.Import(context.Background(), NoteImportRequest{User: authorId, Board: boardId, Text: text, Position: NotePosition{Column: columnId}})

	assert.Nil(t, err)
	assert.Equal(t, noteId, note.ID)
	assert.Equal(t, authorId, note.Author)
	assert.Equal(t, text, note.Text)
	assert.Equal(t, edited, note.Edited)
	assert.Equal(t, columnId, note.Position.Column)
	assert.Equal(t, rank, note.Position.Rank)
}

func Test_Import_EmptyText(t *testing.T) {
	authorId := uuid.New()
	boardId := uuid.New()
	columnId := uuid.New()
	text := ""

	mockDB := NewMockNotesDatabase(t)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	service := NewNotesService(mockDB, broker)

	note, err := service.Import(context.Background(), NoteImportRequest{User: authorId, Board: boardId, Text: text, Position: NotePosition{Column: columnId}})

	assert.Nil(t, note)
	assert.NotNil(t, err)
	assert.Equal(t, common.BadRequestError(errors.New("cannot import note with empty text")), err)
}

func Test_Import_DatabaseError(t *testing.T) {
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

	service := NewNotesService(mockDB, broker)

	note, err := service.Import(context.Background(), NoteImportRequest{User: authorId, Board: boardId, Text: text, Position: NotePosition{Column: columnId}})

	assert.Nil(t, note)
	assert.NotNil(t, err)
	assert.Equal(t, common.InternalServerError, err)
}

func Test_Update_Text_Owner(t *testing.T) {
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

	service := NewNotesService(mockDB, broker)

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

func Test_Update_Position_Owner(t *testing.T) {
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

	service := NewNotesService(mockDB, broker)

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

func Test_Update_Text_Moderator(t *testing.T) {
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

	service := NewNotesService(mockDB, broker)

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

func Test_Update_Position_Moderator(t *testing.T) {
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

	service := NewNotesService(mockDB, broker)

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

func Test_Update_Text_Participant(t *testing.T) {
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

	service := NewNotesService(mockDB, broker)

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

func Test_Update_Text_Participant_NotAllowed(t *testing.T) {
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

	service := NewNotesService(mockDB, broker)

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

func Test_Update_Position_Participant(t *testing.T) {
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

	service := NewNotesService(mockDB, broker)

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

func Test_Update_StackingNotAllowed(t *testing.T) {
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

	service := NewNotesService(mockDB, broker)

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

func Test_Update_StackOnSelf(t *testing.T) {
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

	service := NewNotesService(mockDB, broker)

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

func Test_Update_DatabaseError(t *testing.T) {
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

	service := NewNotesService(mockDB, broker)

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

func Test_DeleteNote(t *testing.T) {
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

	service := NewNotesService(mockDB, broker)

	err := service.Delete(ctx, callerId, NoteDeleteRequest{ID: noteId, Board: boardId, DeleteStack: deleteStack})

	assert.Nil(t, err)
}

func Test_DeleteNote_Owner(t *testing.T) {
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

	service := NewNotesService(mockDB, broker)

	err := service.Delete(ctx, callerId, NoteDeleteRequest{ID: noteId, Board: boardId, DeleteStack: deleteStack})

	assert.Nil(t, err)
}

func Test_DeleteNote_Moderator(t *testing.T) {
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

	service := NewNotesService(mockDB, broker)

	err := service.Delete(ctx, callerId, NoteDeleteRequest{ID: noteId, Board: boardId, DeleteStack: deleteStack})

	assert.Nil(t, err)
}

func Test_DeleteNote_NotAllowed(t *testing.T) {
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

	service := NewNotesService(mockDB, broker)

	err := service.Delete(ctx, callerId, NoteDeleteRequest{ID: noteId, Board: boardId, DeleteStack: deleteStack})

	assert.NotNil(t, err)
	assert.Equal(t, common.ForbiddenError(errors.New("not allowed to delete note from other user")), err)
}

func Test_Get(t *testing.T) {
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

	service := NewNotesService(mockDB, broker)

	note, err := service.Get(context.Background(), noteId)

	assert.Nil(t, err)
	assert.Equal(t, noteId, note.ID)
	assert.Equal(t, authorId, note.Author)
	assert.Equal(t, text, note.Text)
	assert.Equal(t, edited, note.Edited)
	assert.Equal(t, columnId, note.Position.Column)
	assert.Equal(t, rank, note.Position.Rank)
}

func Test_Get_NotFound(t *testing.T) {
	noteId := uuid.New()

	mockDB := NewMockNotesDatabase(t)
	mockDB.EXPECT().Get(mock.Anything, noteId).
		Return(DatabaseNote{}, sql.ErrNoRows)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	service := NewNotesService(mockDB, broker)

	note, err := service.Get(context.Background(), noteId)

	assert.Nil(t, note)
	assert.NotNil(t, err)
	assert.Equal(t, common.NotFoundError, err)
}

func Test_Get_DatabaseError(t *testing.T) {
	noteId := uuid.New()
	dbError := errors.New("database error")

	mockDB := NewMockNotesDatabase(t)
	mockDB.EXPECT().Get(mock.Anything, noteId).
		Return(DatabaseNote{}, dbError)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	service := NewNotesService(mockDB, broker)

	note, err := service.Get(context.Background(), noteId)

	assert.Nil(t, note)
	assert.NotNil(t, err)
	assert.Equal(t, common.InternalServerError, err)
}

func Test_GetAll(t *testing.T) {
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

	service := NewNotesService(mockDB, broker)

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

func Test_GetAll_ColumnFilter(t *testing.T) {

}

func Test_GetAll_NotFound(t *testing.T) {
	boardId := uuid.New()

	mockDB := NewMockNotesDatabase(t)
	mockDB.EXPECT().GetAll(mock.Anything, boardId).
		Return([]DatabaseNote{}, sql.ErrNoRows)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	service := NewNotesService(mockDB, broker)

	notes, err := service.GetAll(context.Background(), boardId)

	assert.Nil(t, notes)
	assert.NotNil(t, err)
	assert.Equal(t, common.NotFoundError, err)
}

func Test_GetAll_DatabaseError(t *testing.T) {
	boardId := uuid.New()
	dbError := errors.New("database error")

	mockDB := NewMockNotesDatabase(t)
	mockDB.EXPECT().GetAll(mock.Anything, boardId).
		Return([]DatabaseNote{}, dbError)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	service := NewNotesService(mockDB, broker)

	notes, err := service.GetAll(context.Background(), boardId)

	assert.Nil(t, notes)
	assert.NotNil(t, err)
	assert.Equal(t, common.InternalServerError, err)
}

func Test_GetStack(t *testing.T) {
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

	service := NewNotesService(mockDB, broker)

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

func Test_GetStack_DatabaseError(t *testing.T) {
	noteID := uuid.New()
	dbError := errors.New("database error")

	mockDB := NewMockNotesDatabase(t)
	mockDB.EXPECT().GetStack(mock.Anything, noteID).
		Return([]DatabaseNote{}, dbError)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	service := NewNotesService(mockDB, broker)

	result, err := service.GetStack(context.Background(), noteID)

	assert.Error(t, err)
	assert.Nil(t, result)
	assert.Equal(t, dbError, err)
}

func Test_GetByUserAndBoard(t *testing.T) {
	boardId := uuid.New()
	oteId := uuid.New()
	authorId := uuid.New()
	columnId := uuid.New()
	noteText := "This is the first note"

	mockDB := NewMockNotesDatabase(t)
	mockDB.EXPECT().GetByUserAndBoard(mock.Anything, authorId, boardId).
		Return([]DatabaseNote{
			{ID: oteId, Author: authorId, Board: boardId, Text: noteText, Column: columnId, Stack: uuid.NullUUID{}, Rank: 0, Edited: false},
		}, nil)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	service := NewNotesService(mockDB, broker)

	notes, err := service.GetByUserAndBoard(context.Background(), authorId, boardId)

	assert.Nil(t, err)
	assert.Len(t, notes, 1)

	assert.Equal(t, oteId, notes[0].ID)
	assert.Equal(t, authorId, notes[0].Author)
	assert.Equal(t, noteText, notes[0].Text)
	assert.False(t, notes[0].Edited)
	assert.Equal(t, columnId, notes[0].Position.Column)
	assert.Equal(t, 0, notes[0].Position.Rank)
}
