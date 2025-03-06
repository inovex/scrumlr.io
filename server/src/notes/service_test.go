package notes

import (
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/uptrace/bun"
	columnService "scrumlr.io/server/columns"
	"scrumlr.io/server/database"
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

	note := Notes([]database.Note{databaseNote})[0]

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

func buildDatabaseNote() database.Note {
	return database.Note{
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
