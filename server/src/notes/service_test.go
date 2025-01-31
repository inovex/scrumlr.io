package notes

import (
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	columnService "scrumlr.io/server/columns"
	"testing"
)

func TestShouldShowAllNotesBecauseBoardSettingIsSet(t *testing.T) {
	userId := uuid.New()
	columns := columnService.ColumnSlice{getTestColumn(true)}
	notes := NoteSlice{getTestNote(uuid.New(), columns[0].ID)}

	filteredNotes := notes.FilterNotesByBoardSettingsOrAuthorInformation(userId, true, true, columns)

	assert.Equal(t, len(notes), len(filteredNotes))
}

func TestShouldShowNoNotesBecauseBoardSettingIsNotSetAndAuthorIdIsNotEqual(t *testing.T) {
	userId := uuid.New()
	columns := columnService.ColumnSlice{getTestColumn(true)}
	notes := NoteSlice{getTestNote(uuid.New(), columns[0].ID)}

	filteredNotes := notes.FilterNotesByBoardSettingsOrAuthorInformation(userId, false, true, columns)

	assert.Equal(t, len(filteredNotes), 0)
}

func TestShouldShowNotesBecauseAuthorIdIsEqual(t *testing.T) {
	userId := uuid.New()
	columns := columnService.ColumnSlice{getTestColumn(true)}
	notes := NoteSlice{getTestNote(userId, columns[0].ID)}

	filteredNotes := notes.FilterNotesByBoardSettingsOrAuthorInformation(userId, false, true, columns)

	assert.Equal(t, len(filteredNotes), len(notes))
}

func getTestColumn(visible bool) *columnService.Column {
	return &columnService.Column{
		ID:          uuid.UUID{},
		Name:        "",
		Description: "",
		Color:       "",
		Visible:     visible,
		Index:       0,
	}
}

func getTestNote(authorId uuid.UUID, columnId uuid.UUID) *Note {
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
