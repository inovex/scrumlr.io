package notes

import (
	"context"
	"errors"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/uptrace/bun"
	columnService "scrumlr.io/server/columns"
	"scrumlr.io/server/common/dto"
	"testing"
	"time"
)

func TestShouldShowAllNotesBecauseBoardSettingIsSet(t *testing.T) {
	userId := uuid.New()
	columns := columnService.ColumnSlice{buildColumn(true)}
	notes := NoteSlice{buildNote(uuid.New(), columns[0].ID)}

	filteredNotes := notes.FilterNotesByBoardSettingsOrAuthorInformation(userId, true, true, columns)

	assert.Equal(t, len(notes), len(filteredNotes))
}

func TestShouldShowNoNotesBecauseBoardSettingIsNotSetAndAuthorIdIsNotEqual(t *testing.T) {
	userId := uuid.New()
	columns := columnService.ColumnSlice{buildColumn(true)}
	notes := NoteSlice{buildNote(uuid.New(), columns[0].ID)}

	filteredNotes := notes.FilterNotesByBoardSettingsOrAuthorInformation(userId, false, true, columns)

	assert.Equal(t, len(filteredNotes), 0)
}

func TestShouldShowNotesBecauseAuthorIdIsEqual(t *testing.T) {
	userId := uuid.New()
	columns := columnService.ColumnSlice{buildColumn(true)}
	notes := NoteSlice{buildNote(userId, columns[0].ID)}

	filteredNotes := notes.FilterNotesByBoardSettingsOrAuthorInformation(userId, false, true, columns)

	assert.Equal(t, len(filteredNotes), len(notes))
}

func TestMapping(t *testing.T) {
	databaseNote := buildDatabaseNote()

	note := Notes([]NoteDB{databaseNote})[0]

	assert.Equal(t, databaseNote.ID, note.ID)
	assert.Equal(t, databaseNote.Author, note.Author)
	assert.Equal(t, databaseNote.Text, note.Text)
	assert.Equal(t, databaseNote.Edited, note.Edited)
	assert.Equal(t, databaseNote.Column, note.Position.Column)
	assert.Equal(t, databaseNote.Stack, note.Position.Stack)
	assert.Equal(t, databaseNote.Rank, note.Position.Rank)
}

func TestNilMapping(t *testing.T) {
	note := Notes(nil)

	assert.Nil(t, note)
}

func TestUnmarshallNoteData(t *testing.T) {

	notes := NoteSlice{buildNote(uuid.New(), uuid.New())}

	notesSlice, err := UnmarshallNotaData(notes)

	assert.NoError(t, err)
	assert.NotEmpty(t, notesSlice)
}

func TestShouldReturnWithErrorUnmarshallColumnData(t *testing.T) {

	note := buildNote(uuid.New(), uuid.New())

	notesSlice, err := UnmarshallNotaData(note)

	assert.Error(t, err)
	assert.Empty(t, notesSlice)
}

func buildColumn(visible bool) *columnService.Column {
	return &columnService.Column{
		ID:          uuid.UUID{},
		Name:        "",
		Description: "",
		Color:       "",
		Visible:     visible,
		Index:       0,
	}
}

func buildDatabaseNote() NoteDB {
	return NoteDB{
		BaseModel: bun.BaseModel{},
		ID:        uuid.UUID{},
		CreatedAt: time.Time{},
		Author:    uuid.UUID{},
		Board:     uuid.UUID{},
		Column:    uuid.UUID{},
		Text:      "",
		Stack:     uuid.NullUUID{},
		Rank:      0,
		Edited:    false,
	}
}

func buildNote(authorId uuid.UUID, columnId uuid.UUID) *Note {
	return &Note{
		ID:     uuid.New(),
		Author: authorId,
		Text:   "lorem in ipsum",
		Edited: false,
		Position: NotePosition{
			Column: columnId,
			Stack: uuid.NullUUID{
				UUID:  uuid.New(),
				Valid: true,
			},
			Rank: 0,
		},
	}
}

var ctx = context.Background()

func makeTestNoteDB(id uuid.UUID) NoteDB {
	return NoteDB{
		BaseModel: bun.BaseModel{},
		ID:        id,
		CreatedAt: time.Time{},
		Author:    uuid.UUID{},
		Board:     uuid.UUID{},
		Column:    uuid.UUID{},
		Text:      "Test content",
		Stack:     uuid.NullUUID{},
		Rank:      0,
		Edited:    false,
	}

}

func makeTestNote(id uuid.UUID) *Note {
	return &Note{
		ID:       id,
		Author:   uuid.UUID{},
		Text:     "Test content",
		Edited:   false,
		Position: NotePosition{},
	}
}

func TestCreateNote_Success(t *testing.T) {
	mockDB := new(MockNotesDatabase)
	service := NewNoteService(mockDB)

	req := NoteCreateRequest{
		Column: uuid.UUID{},
		Text:   "Test content",
		Board:  uuid.UUID{},
		User:   uuid.UUID{},
	}
	noteDB := makeTestNoteDB(uuid.New())

	mockDB.On("CreateNote", mock.Anything).Return(noteDB, nil)

	note, err := service.Create(ctx, req)

	assert.NoError(t, err)
	assert.Equal(t, noteDB.ID, note.ID)
	mockDB.AssertExpectations(t)
}

func TestCreateNote_Failure(t *testing.T) {
	mockDB := new(MockNotesDatabase)
	service := NewNoteService(mockDB)

	req := NoteCreateRequest{
		Column: uuid.UUID{},
		Text:   "Test content",
		Board:  uuid.UUID{},
		User:   uuid.UUID{},
	}
	mockDB.On("CreateNote", mock.Anything).Return(NoteDB{}, errors.New("db error"))

	note, err := service.Create(ctx, req)

	assert.Error(t, err)
	assert.Nil(t, note)
}

func TestImportNote_Success(t *testing.T) {
	mockDB := new(MockNotesDatabase)
	service := NewNoteService(mockDB)

	req := NoteImportRequest{
		Text:     "Test content",
		Position: NotePosition{},
		Board:    uuid.UUID{},
		User:     uuid.UUID{},
	}
	noteDB := makeTestNoteDB(uuid.New())

	mockDB.On("ImportNote", mock.Anything).Return(noteDB, nil)

	note, err := service.Import(ctx, req)

	assert.NoError(t, err)
	assert.Equal(t, noteDB.ID, note.ID)
	mockDB.AssertExpectations(t)
}

func TestGetNote_Success(t *testing.T) {
	mockDB := new(MockNotesDatabase)
	service := NewNoteService(mockDB)

	id := uuid.New()
	noteDB := makeTestNoteDB(id)

	mockDB.On("GetNote", id).Return(noteDB, nil)

	note, err := service.Get(ctx, id)

	assert.NoError(t, err)
	assert.Equal(t, id, note.ID)
	assert.Equal(t, noteDB.Text, note.Text)
}

func TestGetChildNotes_Success(t *testing.T) {
	mockDB := new(MockNotesDatabase)
	service := NewNoteService(mockDB)

	parentID := uuid.New()
	childNotes := []NoteDB{
		makeTestNoteDB(uuid.New()),
		makeTestNoteDB(uuid.New()),
	}
	mockDB.On("GetChildNotes", parentID).Return(childNotes, nil)

	stack, err := service.GetStack(ctx, parentID)

	assert.NoError(t, err)
	assert.Len(t, stack, 2)
	assert.Equal(t, childNotes[0].ID, stack[0].ID)
	assert.Equal(t, childNotes[1].ID, stack[1].ID)
}

func TestUpdateNote_Success(t *testing.T) {
	mockDB := new(MockNotesDatabase)
	service := NewNoteService(mockDB)
	content := "Updated content"

	updateReq := NoteUpdateRequest{
		Text: &content,
		Position: &NotePosition{
			Column: uuid.UUID{},
			Stack:  uuid.NullUUID{},
			Rank:   0,
		},
		Edited: false,
		ID:     uuid.UUID{},
		Board:  uuid.UUID{},
	}

	noteDB := makeTestNoteDB(updateReq.ID)
	mockDB.On("UpdateNote", mock.Anything, mock.Anything).Return(noteDB, nil)

	note, err := service.Update(ctx, updateReq)

	assert.NoError(t, err)
	assert.Equal(t, updateReq.ID, note.ID)
	assert.Equal(t, content, note.Text)
}

func TestListNotes_Success(t *testing.T) {
	mockDB := new(MockNotesDatabase)
	service := NewNoteService(mockDB)

	boardID := uuid.New()
	notesDB := []NoteDB{
		makeTestNoteDB(uuid.New()),
		makeTestNoteDB(uuid.New()),
	}
	mockDB.On("GetNotes", boardID).Return(notesDB, nil)

	notesList, err := service.List(ctx, boardID)

	assert.NoError(t, err)
	assert.Len(t, notesList, 2)
}

func TestDeleteNote_Success(t *testing.T) {
	mockDB := new(MockNotesDatabase)
	service := NewNoteService(mockDB)

	boardID := uuid.New()
	noteID := uuid.New()
	votes := []*dto.Vote{}
	mockDB.On("DeleteNote", mock.Anything, boardID, noteID).Return(nil)

	req := NoteDeleteRequest{DeleteStack: false}

	err := service.Delete(ctx, req, noteID, votes)

	assert.NoError(t, err)
	mockDB.AssertExpectations(t)
}

func TestDeleteNote_WithStack(t *testing.T) {
	mockDB := new(MockNotesDatabase)
	service := NewNoteService(mockDB)

	boardID := uuid.New()
	noteID := uuid.New()
	userID := uuid.New()

	noteStack := []NoteDB{
		makeTestNoteDB(noteID),
		makeTestNoteDB(uuid.New()),
		makeTestNoteDB(uuid.New()),
	}

	req := NoteDeleteRequest{
		DeleteStack: true,
	}

	// Expectations
	mockDB.On("GetStack", noteID).Return(noteStack, nil)
	mockDB.On("DeleteNote", userID, boardID, noteID, req.DeleteStack).Return(nil)

	err := service.Delete(ctx, req, noteID, nil)

	assert.NoError(t, err)
	mockDB.AssertExpectations(t)
}
