package notes

import (
	"context"

	"scrumlr.io/server/realtime"

	"database/sql"
	"errors"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/suite"
	"scrumlr.io/server/common"
)

type NotesServiceTestSuite struct {
	suite.Suite
	service NotesService
	mockDB  *MockNotesDatabase

	// Additional test-specific data
	//users    map[string]testDbTemplates.TestUser
	//boards   map[string]Board
	//sessions map[string]testSession
}

func TestBoardServiceIntegrationTestSuite(t *testing.T) {
	suite.Run(t, new(NotesServiceTestSuite))
}

// func (suite *NotesServiceTestSuite) SetupSuite() {
// 	panic("unimplemented")
// }

// func (suite *NotesServiceTestSuite) TearDownSuite() {
// 	panic("unimplemented")
// }

func (suite *NotesServiceTestSuite) SetupTest() {
	suite.mockDB = NewMockNotesDatabase(suite.T())
}

func (suite *NotesServiceTestSuite) Test_Create() {
	authorId := uuid.New()
	boardId := uuid.New()
	columnId := uuid.New()
	rank := 0
	noteId := uuid.New()
	edited := false
	text := "This is a text on a note"

	suite.mockDB.EXPECT().CreateNote(mock.Anything, DatabaseNoteInsert{Author: authorId, Board: boardId, Column: columnId, Text: text}).
		Return(DatabaseNote{ID: noteId, Author: authorId, Board: boardId, Column: columnId, Text: text, Stack: uuid.NullUUID{}, Rank: rank, Edited: edited}, nil)
	suite.mockDB.EXPECT().GetAll(mock.Anything, boardId).
		Return([]DatabaseNote{}, nil)

	mockBroker := realtime.NewMockClient(suite.T())
	mockBroker.EXPECT().Publish(mock.Anything, mock.AnythingOfType("string"), mock.Anything).Return(nil)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	service := NewNotesService(suite.mockDB, broker)

	note, err := service.Create(context.Background(), NoteCreateRequest{User: authorId, Board: boardId, Column: columnId, Text: text})

	suite.Nil(err)
	suite.Equal(noteId, note.ID)
	suite.Equal(authorId, note.Author)
	suite.Equal(text, note.Text)
	suite.Equal(edited, note.Edited)
	suite.Equal(columnId, note.Position.Column)
	suite.Equal(rank, note.Position.Rank)
}

func (suite *NotesServiceTestSuite) Test_Create_EmptyText() {
	authorId := uuid.New()
	boardId := uuid.New()
	columnId := uuid.New()
	text := ""

	mockDB := NewMockNotesDatabase(suite.T())

	mockBroker := realtime.NewMockClient(suite.T())
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	service := NewNotesService(mockDB, broker)

	note, err := service.Create(context.Background(), NoteCreateRequest{User: authorId, Board: boardId, Column: columnId, Text: text})

	suite.Nil(note)
	suite.NotNil(err)
	suite.Equal(common.BadRequestError(errors.New("cannot create note with empty text")), err)
}

func (suite *NotesServiceTestSuite) Test_Create_DatabaseError() {
	authorId := uuid.New()
	boardId := uuid.New()
	columnId := uuid.New()
	text := "This is a text on a note"
	dbError := errors.New("database error")

	mockDB := NewMockNotesDatabase(suite.T())
	mockDB.EXPECT().CreateNote(mock.Anything, DatabaseNoteInsert{Author: authorId, Board: boardId, Column: columnId, Text: text}).
		Return(DatabaseNote{}, dbError)

	mockBroker := realtime.NewMockClient(suite.T())
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	service := NewNotesService(mockDB, broker)

	note, err := service.Create(context.Background(), NoteCreateRequest{User: authorId, Board: boardId, Column: columnId, Text: text})

	suite.Nil(note)
	suite.NotNil(err)
	suite.Equal(common.InternalServerError, err)
}

func (suite *NotesServiceTestSuite) Test_Import() {
	authorId := uuid.New()
	boardId := uuid.New()
	columnId := uuid.New()
	rank := 0
	noteId := uuid.New()
	edited := false
	text := "This is a text on a note"

	mockDB := NewMockNotesDatabase(suite.T())
	mockDB.EXPECT().ImportNote(mock.Anything, DatabaseNoteImport{Author: authorId, Board: boardId, Text: text, Position: &NoteUpdatePosition{Column: columnId}}).
		Return(DatabaseNote{ID: noteId, Author: authorId, Board: boardId, Column: columnId, Text: text, Stack: uuid.NullUUID{}, Rank: rank, Edited: edited}, nil)

	mockBroker := realtime.NewMockClient(suite.T())
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	service := NewNotesService(mockDB, broker)

	note, err := service.Import(context.Background(), NoteImportRequest{User: authorId, Board: boardId, Text: text, Position: NotePosition{Column: columnId}})

	suite.Nil(err)
	suite.Equal(noteId, note.ID)
	suite.Equal(authorId, note.Author)
	suite.Equal(text, note.Text)
	suite.Equal(edited, note.Edited)
	suite.Equal(columnId, note.Position.Column)
	suite.Equal(rank, note.Position.Rank)
}

func (suite *NotesServiceTestSuite) Test_Import_EmptyText() {
	authorId := uuid.New()
	boardId := uuid.New()
	columnId := uuid.New()
	text := ""

	mockDB := NewMockNotesDatabase(suite.T())

	mockBroker := realtime.NewMockClient(suite.T())
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	service := NewNotesService(mockDB, broker)

	note, err := service.Import(context.Background(), NoteImportRequest{User: authorId, Board: boardId, Text: text, Position: NotePosition{Column: columnId}})

	suite.Nil(note)
	suite.NotNil(err)
	suite.Equal(common.BadRequestError(errors.New("cannot import note with empty text")), err)
}

func (suite *NotesServiceTestSuite) Test_Import_DatabaseError() {
	authorId := uuid.New()
	boardId := uuid.New()
	columnId := uuid.New()
	text := "This is a text on a note"
	dbError := errors.New("database error")

	mockDB := NewMockNotesDatabase(suite.T())
	mockDB.EXPECT().ImportNote(mock.Anything, DatabaseNoteImport{Author: authorId, Board: boardId, Text: text, Position: &NoteUpdatePosition{Column: columnId}}).
		Return(DatabaseNote{}, dbError)

	mockBroker := realtime.NewMockClient(suite.T())
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	service := NewNotesService(mockDB, broker)

	note, err := service.Import(context.Background(), NoteImportRequest{User: authorId, Board: boardId, Text: text, Position: NotePosition{Column: columnId}})

	suite.Nil(note)
	suite.NotNil(err)
	suite.Equal(common.InternalServerError, err)
}

func (suite *NotesServiceTestSuite) Test_Update_Text_Owner() {
	callerId := uuid.New()
	callerRole := common.OwnerRole
	authorId := uuid.New()
	noteId := uuid.New()
	boardId := uuid.New()
	columnId := uuid.New()
	stackAllowed := true
	text := "Updated text"
	rank := 0

	mockDB := NewMockNotesDatabase(suite.T())
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

	mockBroker := realtime.NewMockClient(suite.T())
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

	suite.Nil(err)
	suite.Equal(noteId, note.ID)
	suite.Equal(authorId, note.Author)
	suite.Equal(text, note.Text)
	suite.True(note.Edited)
	suite.Equal(columnId, note.Position.Column)
	suite.Equal(rank, note.Position.Rank)
}

func (suite *NotesServiceTestSuite) Test_Update_Position_Owner() {
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

	mockDB := NewMockNotesDatabase(suite.T())
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

	mockBroker := realtime.NewMockClient(suite.T())
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

	suite.Nil(err)
	suite.Equal(noteId, note.ID)
	suite.Equal(authorId, note.Author)
	suite.Equal(text, note.Text)
	suite.False(note.Edited)
	suite.Equal(columnId, note.Position.Column)
	suite.Equal(rank, note.Position.Rank)
}

func (suite *NotesServiceTestSuite) Test_Update_Text_Moderator() {
	callerId := uuid.New()
	callerRole := common.ModeratorRole
	authorId := uuid.New()
	noteId := uuid.New()
	boardId := uuid.New()
	columnId := uuid.New()
	stackAllowed := true
	text := "Updated text"
	rank := 0

	mockDB := NewMockNotesDatabase(suite.T())
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

	mockBroker := realtime.NewMockClient(suite.T())
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

	suite.Nil(err)
	suite.Equal(noteId, note.ID)
	suite.Equal(authorId, note.Author)
	suite.Equal(text, note.Text)
	suite.True(note.Edited)
	suite.Equal(columnId, note.Position.Column)
	suite.Equal(rank, note.Position.Rank)
}

func (suite *NotesServiceTestSuite) Test_Update_Position_Moderator() {
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

	mockDB := NewMockNotesDatabase(suite.T())
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

	mockBroker := realtime.NewMockClient(suite.T())
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

	suite.Nil(err)
	suite.Equal(noteId, note.ID)
	suite.Equal(authorId, note.Author)
	suite.Equal(text, note.Text)
	suite.False(note.Edited)
	suite.Equal(columnId, note.Position.Column)
	suite.Equal(rank, note.Position.Rank)
}

func (suite *NotesServiceTestSuite) Test_Update_Text_Participant() {
	callerId := uuid.New()
	callerRole := common.ParticipantRole
	authorId := callerId
	noteId := uuid.New()
	boardId := uuid.New()
	columnId := uuid.New()
	stackAllowed := true
	text := "Updated text"
	rank := 0

	mockDB := NewMockNotesDatabase(suite.T())
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

	mockBroker := realtime.NewMockClient(suite.T())
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

	suite.Nil(err)
	suite.Equal(noteId, note.ID)
	suite.Equal(authorId, note.Author)
	suite.Equal(text, note.Text)
	suite.True(note.Edited)
	suite.Equal(columnId, note.Position.Column)
	suite.Equal(rank, note.Position.Rank)
}

func (suite *NotesServiceTestSuite) Test_Update_Text_Participant_NotAllowed() {
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

	mockDB := NewMockNotesDatabase(suite.T())
	mockDB.EXPECT().GetPrecondition(mock.Anything, noteId, boardId, callerId).
		Return(Precondition{StackingAllowed: stackAllowed, CallerRole: callerRole, Author: authorId}, nil)

	mockBroker := realtime.NewMockClient(suite.T())
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

	suite.Nil(note)
	suite.NotNil(err)
	suite.Equal(common.ForbiddenError(errors.New("not allowed to change text of note")), err)
}

func (suite *NotesServiceTestSuite) Test_Update_Position_Participant() {
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

	mockDB := NewMockNotesDatabase(suite.T())
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

	mockBroker := realtime.NewMockClient(suite.T())
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

	suite.Nil(err)
	suite.Equal(noteId, note.ID)
	suite.Equal(authorId, note.Author)
	suite.Equal(text, note.Text)
	suite.False(note.Edited)
	suite.Equal(columnId, note.Position.Column)
	suite.Equal(rank, note.Position.Rank)
}

func (suite *NotesServiceTestSuite) Test_Update_StackingNotAllowed() {
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

	mockDB := NewMockNotesDatabase(suite.T())
	mockDB.EXPECT().GetPrecondition(mock.Anything, noteId, boardId, callerId).
		Return(Precondition{StackingAllowed: stackAllowed, CallerRole: callerRole, Author: authorId}, nil)

	mockBroker := realtime.NewMockClient(suite.T())
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

	suite.Nil(note)
	suite.NotNil(err)
	suite.Equal(common.ForbiddenError(errors.New("not allowed to stack notes")), err)
}

func (suite *NotesServiceTestSuite) Test_Update_StackOnSelf() {
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

	mockDB := NewMockNotesDatabase(suite.T())
	mockDB.EXPECT().GetPrecondition(mock.Anything, noteId, boardId, callerId).
		Return(Precondition{StackingAllowed: stackAllowed, CallerRole: callerRole, Author: authorId}, nil)

	mockBroker := realtime.NewMockClient(suite.T())
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

	suite.Nil(note)
	suite.NotNil(err)
	suite.Equal(common.ForbiddenError(errors.New("not allowed to stack a note on self")), err)
}

func (suite *NotesServiceTestSuite) Test_Update_DatabaseError() {
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

	mockDB := NewMockNotesDatabase(suite.T())
	mockDB.EXPECT().GetPrecondition(mock.Anything, noteId, boardId, callerId).
		Return(Precondition{StackingAllowed: stackAllowed, CallerRole: common.ParticipantRole, Author: authorId}, nil)
	mockDB.EXPECT().UpdateNote(mock.Anything, callerId, DatabaseNoteUpdate{
		ID:       noteId,
		Board:    boardId,
		Text:     &text,
		Position: &posUpdate,
		Edited:   true,
	}).Return(DatabaseNote{}, dbError)

	mockBroker := realtime.NewMockClient(suite.T())
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

	suite.Nil(note)
	suite.NotNil(err)
	suite.Equal(common.InternalServerError, err)
}

func (suite *NotesServiceTestSuite) Test_DeleteNote() {
	callerId := uuid.New()
	callerRole := common.ParticipantRole
	authorId := callerId
	boardId := uuid.New()
	noteId := uuid.New()
	deleteStack := true

	ctx := context.Background()

	mockDB := NewMockNotesDatabase(suite.T())
	mockDB.EXPECT().GetPrecondition(mock.Anything, noteId, boardId, callerId).
		Return(Precondition{StackingAllowed: true, CallerRole: callerRole, Author: authorId}, nil)
	mockDB.EXPECT().GetStack(mock.Anything, noteId).
		Return([]DatabaseNote{{ID: noteId, Author: authorId}, {ID: uuid.New(), Author: authorId, Stack: uuid.NullUUID{UUID: noteId, Valid: true}}}, nil)
	mockDB.EXPECT().DeleteNote(mock.Anything, callerId, boardId, noteId, deleteStack).
		Return(nil)

	mockBroker := realtime.NewMockClient(suite.T())
	mockBroker.EXPECT().Publish(mock.Anything, mock.AnythingOfType("string"), mock.Anything).Return(nil)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	service := NewNotesService(mockDB, broker)

	err := service.Delete(ctx, callerId, NoteDeleteRequest{ID: noteId, Board: boardId, DeleteStack: deleteStack})

	suite.Nil(err)
}

func (suite *NotesServiceTestSuite) Test_DeleteNote_Owner() {
	callerId := uuid.New()
	callerRole := common.OwnerRole
	authorId := uuid.New()
	boardId := uuid.New()
	noteId := uuid.New()
	deleteStack := true

	ctx := context.Background()

	mockDB := NewMockNotesDatabase(suite.T())
	mockDB.EXPECT().GetPrecondition(mock.Anything, noteId, boardId, callerId).
		Return(Precondition{StackingAllowed: true, CallerRole: callerRole, Author: authorId}, nil)
	mockDB.EXPECT().GetStack(mock.Anything, noteId).
		Return([]DatabaseNote{{ID: noteId, Author: authorId}, {ID: uuid.New(), Author: authorId, Stack: uuid.NullUUID{UUID: noteId, Valid: true}}}, nil)
	mockDB.EXPECT().DeleteNote(mock.Anything, callerId, boardId, noteId, deleteStack).
		Return(nil)

	mockBroker := realtime.NewMockClient(suite.T())
	mockBroker.EXPECT().Publish(mock.Anything, mock.AnythingOfType("string"), mock.Anything).Return(nil)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	service := NewNotesService(mockDB, broker)

	err := service.Delete(ctx, callerId, NoteDeleteRequest{ID: noteId, Board: boardId, DeleteStack: deleteStack})

	suite.Nil(err)
}

func (suite *NotesServiceTestSuite) Test_DeleteNote_Moderator() {
	callerId := uuid.New()
	callerRole := common.ModeratorRole
	authorId := uuid.New()
	boardId := uuid.New()
	noteId := uuid.New()
	deleteStack := true

	ctx := context.Background()

	mockDB := NewMockNotesDatabase(suite.T())
	mockDB.EXPECT().GetPrecondition(mock.Anything, noteId, boardId, callerId).
		Return(Precondition{StackingAllowed: true, CallerRole: callerRole, Author: authorId}, nil)
	mockDB.EXPECT().GetStack(mock.Anything, noteId).
		Return([]DatabaseNote{{ID: noteId, Author: authorId}, {ID: uuid.New(), Author: authorId, Stack: uuid.NullUUID{UUID: noteId, Valid: true}}}, nil)
	mockDB.EXPECT().DeleteNote(mock.Anything, callerId, boardId, noteId, deleteStack).
		Return(nil)

	mockBroker := realtime.NewMockClient(suite.T())
	mockBroker.EXPECT().Publish(mock.Anything, mock.AnythingOfType("string"), mock.Anything).Return(nil)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	service := NewNotesService(mockDB, broker)

	err := service.Delete(ctx, callerId, NoteDeleteRequest{ID: noteId, Board: boardId, DeleteStack: deleteStack})

	suite.Nil(err)
}

func (suite *NotesServiceTestSuite) Test_DeleteNote_NotAllowed() {
	callerId := uuid.New()
	callerRole := common.ParticipantRole
	authorId := uuid.New()
	boardId := uuid.New()
	noteId := uuid.New()
	deleteStack := true

	ctx := context.Background()

	mockDB := NewMockNotesDatabase(suite.T())
	mockDB.EXPECT().GetPrecondition(mock.Anything, noteId, boardId, callerId).
		Return(Precondition{StackingAllowed: true, CallerRole: callerRole, Author: authorId}, nil)

	mockBroker := realtime.NewMockClient(suite.T())
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	service := NewNotesService(mockDB, broker)

	err := service.Delete(ctx, callerId, NoteDeleteRequest{ID: noteId, Board: boardId, DeleteStack: deleteStack})

	suite.NotNil(err)
	suite.Equal(common.ForbiddenError(errors.New("not allowed to delete note from other user")), err)
}

func (suite *NotesServiceTestSuite) Test_Get() {
	noteId := uuid.New()
	authorId := uuid.New()
	text := "This is a note"
	edited := true
	columnId := uuid.New()
	rank := 0

	mockDB := NewMockNotesDatabase(suite.T())
	mockDB.EXPECT().Get(mock.Anything, noteId).
		Return(DatabaseNote{ID: noteId, Author: authorId, Text: text, Column: columnId, Edited: edited, Rank: rank}, nil)

	mockBroker := realtime.NewMockClient(suite.T())
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	service := NewNotesService(mockDB, broker)

	note, err := service.Get(context.Background(), noteId)

	suite.Nil(err)
	suite.Equal(noteId, note.ID)
	suite.Equal(authorId, note.Author)
	suite.Equal(text, note.Text)
	suite.Equal(edited, note.Edited)
	suite.Equal(columnId, note.Position.Column)
	suite.Equal(rank, note.Position.Rank)
}

func (suite *NotesServiceTestSuite) Test_Get_NotFound() {
	noteId := uuid.New()

	mockDB := NewMockNotesDatabase(suite.T())
	mockDB.EXPECT().Get(mock.Anything, noteId).
		Return(DatabaseNote{}, sql.ErrNoRows)

	mockBroker := realtime.NewMockClient(suite.T())
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	service := NewNotesService(mockDB, broker)

	note, err := service.Get(context.Background(), noteId)

	suite.Nil(note)
	suite.NotNil(err)
	suite.Equal(common.NotFoundError, err)
}

func (suite *NotesServiceTestSuite) Test_Get_DatabaseError() {
	noteId := uuid.New()
	dbError := errors.New("database error")

	mockDB := NewMockNotesDatabase(suite.T())
	mockDB.EXPECT().Get(mock.Anything, noteId).
		Return(DatabaseNote{}, dbError)

	mockBroker := realtime.NewMockClient(suite.T())
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	service := NewNotesService(mockDB, broker)

	note, err := service.Get(context.Background(), noteId)

	suite.Nil(note)
	suite.NotNil(err)
	suite.Equal(common.InternalServerError, err)
}

func (suite *NotesServiceTestSuite) Test_GetAll() {
	boardId := uuid.New()
	firstNoteId := uuid.New()
	secondNoteId := uuid.New()
	firstAuthorId := uuid.New()
	secondAuthorId := uuid.New()
	firstColumnId := uuid.New()
	secondColumnId := uuid.New()
	firstNoteText := "This is the first note"
	secondNoteText := "This is the second note"

	mockDB := NewMockNotesDatabase(suite.T())
	mockDB.EXPECT().GetAll(mock.Anything, boardId).
		Return([]DatabaseNote{
			{ID: firstNoteId, Author: firstAuthorId, Board: boardId, Text: firstNoteText, Column: firstColumnId, Stack: uuid.NullUUID{}, Rank: 0, Edited: false},
			{ID: secondNoteId, Author: secondAuthorId, Board: boardId, Text: secondNoteText, Column: secondColumnId, Stack: uuid.NullUUID{}, Rank: 0, Edited: true},
		}, nil)

	mockBroker := realtime.NewMockClient(suite.T())
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	service := NewNotesService(mockDB, broker)

	notes, err := service.GetAll(context.Background(), boardId)

	suite.Nil(err)
	suite.Len(notes, 2)

	suite.Equal(firstNoteId, notes[0].ID)
	suite.Equal(firstAuthorId, notes[0].Author)
	suite.Equal(firstNoteText, notes[0].Text)
	suite.False(notes[0].Edited)
	suite.Equal(firstColumnId, notes[0].Position.Column)
	suite.Equal(0, notes[0].Position.Rank)

	suite.Equal(secondNoteId, notes[1].ID)
	suite.Equal(secondAuthorId, notes[1].Author)
	suite.Equal(secondNoteText, notes[1].Text)
	suite.True(notes[1].Edited)
	suite.Equal(secondColumnId, notes[1].Position.Column)
	suite.Equal(0, notes[1].Position.Rank)
}

func (suite *NotesServiceTestSuite) Test_GetAll_ColumnFilter() {

}

func (suite *NotesServiceTestSuite) Test_GetAll_NotFound() {
	boardId := uuid.New()

	mockDB := NewMockNotesDatabase(suite.T())
	mockDB.EXPECT().GetAll(mock.Anything, boardId).
		Return([]DatabaseNote{}, sql.ErrNoRows)

	mockBroker := realtime.NewMockClient(suite.T())
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	service := NewNotesService(mockDB, broker)

	notes, err := service.GetAll(context.Background(), boardId)

	suite.Nil(notes)
	suite.NotNil(err)
	suite.Equal(common.NotFoundError, err)
}

func (suite *NotesServiceTestSuite) Test_GetAll_DatabaseError() {
	boardId := uuid.New()
	dbError := errors.New("database error")

	mockDB := NewMockNotesDatabase(suite.T())
	mockDB.EXPECT().GetAll(mock.Anything, boardId).
		Return([]DatabaseNote{}, dbError)

	mockBroker := realtime.NewMockClient(suite.T())
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	service := NewNotesService(mockDB, broker)

	notes, err := service.GetAll(context.Background(), boardId)

	suite.Nil(notes)
	suite.NotNil(err)
	suite.Equal(common.InternalServerError, err)
}

func (suite *NotesServiceTestSuite) Test_GetStack() {
	noteID := uuid.New()

	mockDB := NewMockNotesDatabase(suite.T())
	mockDB.EXPECT().GetStack(mock.Anything, noteID).
		Return([]DatabaseNote{
			{ID: uuid.New(), Text: "Note 1"},
			{ID: uuid.New(), Text: "Note 2"},
		}, nil)

	mockBroker := realtime.NewMockClient(suite.T())
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	service := NewNotesService(mockDB, broker)

	result, err := service.GetStack(context.Background(), noteID)

	suite.Nil(err)
	suite.NotNil(result)
	suite.Len(result, 2)

	/*
		  suite.Equal(firstNoteId, notes[0].ID)
			suite.Equal(firstAuthorId, notes[0].Author)
			suite.Equal(firstNoteText, notes[0].Text)
			suite.False(notes[0].Edited)
			suite.Equal(firstColumnId, notes[0].Position.Column)
			suite.Equal(0, notes[0].Position.Rank)

			suite.Equal(secondNoteId, notes[1].ID)
			suite.Equal(secondAuthorId, notes[1].Author)
			suite.Equal(secondNoteText, notes[1].Text)
			suite.True(notes[1].Edited)
			suite.Equal(secondColumnId, notes[1].Position.Column)
			suite.Equal(0, notes[1].Position.Rank)
	*/
}

func (suite *NotesServiceTestSuite) Test_GetStack_DatabaseError() {
	noteID := uuid.New()
	dbError := errors.New("database error")

	mockDB := NewMockNotesDatabase(suite.T())
	mockDB.EXPECT().GetStack(mock.Anything, noteID).
		Return([]DatabaseNote{}, dbError)

	mockBroker := realtime.NewMockClient(suite.T())
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	service := NewNotesService(mockDB, broker)

	result, err := service.GetStack(context.Background(), noteID)

	suite.Error(err)
	suite.Nil(result)
	suite.Equal(dbError, err)
}

func (suite *NotesServiceTestSuite) Test_GetByUserAndBoard() {
	boardId := uuid.New()
	oteId := uuid.New()
	authorId := uuid.New()
	columnId := uuid.New()
	noteText := "This is the first note"

	mockDB := NewMockNotesDatabase(suite.T())
	mockDB.EXPECT().GetByUserAndBoard(mock.Anything, authorId, boardId).
		Return([]DatabaseNote{
			{ID: oteId, Author: authorId, Board: boardId, Text: noteText, Column: columnId, Stack: uuid.NullUUID{}, Rank: 0, Edited: false},
		}, nil)

	mockBroker := realtime.NewMockClient(suite.T())
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	service := NewNotesService(mockDB, broker)

	notes, err := service.GetByUserAndBoard(context.Background(), authorId, boardId)

	suite.Nil(err)
	suite.Len(notes, 1)

	suite.Equal(oteId, notes[0].ID)
	suite.Equal(authorId, notes[0].Author)
	suite.Equal(noteText, notes[0].Text)
	suite.False(notes[0].Edited)
	suite.Equal(columnId, notes[0].Position.Column)
	suite.Equal(0, notes[0].Position.Rank)
}

// to test delete
// delete multiple notes
// delete not correct user correct board
// delete correct user not correct board

//todo!!!! do the tests correct

func (suite *NotesServiceTestSuite) Test_DeleteUserNotesFromBoard() {
	callerId := uuid.New()
	callerRole := common.ParticipantRole
	authorId := callerId
	boardId := uuid.New()
	noteId := uuid.New()
	deleteStack := true

	ctx := context.Background()

	mockDB := NewMockNotesDatabase(suite.T())
	mockDB.EXPECT().GetPrecondition(mock.Anything, noteId, boardId, callerId).
		Return(Precondition{StackingAllowed: true, CallerRole: callerRole, Author: authorId}, nil)
	mockDB.EXPECT().GetStack(mock.Anything, noteId).
		Return([]DatabaseNote{{ID: noteId, Author: authorId}, {ID: uuid.New(), Author: authorId, Stack: uuid.NullUUID{UUID: noteId, Valid: true}}}, nil)
	mockDB.EXPECT().DeleteNote(mock.Anything, callerId, boardId, noteId, deleteStack).
		Return(nil)

	mockBroker := realtime.NewMockClient(suite.T())
	mockBroker.EXPECT().Publish(mock.Anything, mock.AnythingOfType("string"), mock.Anything).Return(nil)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	service := NewNotesService(mockDB, broker)

	err := service.Delete(ctx, callerId, NoteDeleteRequest{ID: noteId, Board: boardId, DeleteStack: deleteStack})

	suite.Nil(err)
}
