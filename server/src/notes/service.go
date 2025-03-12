package notes

import (
	"github.com/google/uuid"
	"net/http"
	columnService "scrumlr.io/server/columns"
	"scrumlr.io/server/database"
	"scrumlr.io/server/technical_helper"
)

func (n NoteSlice) FilterNotesByBoardSettingsOrAuthorInformation(userID uuid.UUID, showNotesOfOtherUsers bool, showAuthors bool, columns columnService.ColumnSlice) NoteSlice {

	visibleNotes := technical_helper.Filter[*Note](n, func(note *Note) bool {
		for _, column := range columns {
			if (note.Position.Column == column.ID) && column.Visible {
				// BoardSettings -> Remove other participant cards
				if showNotesOfOtherUsers {
					return true
				} else if userID == note.Author {
					return true
				}
			}
		}
		return false
	})

	n.hideOtherAuthors(userID, showAuthors, visibleNotes)

	return visibleNotes
}

func UnmarshallNotaData(data interface{}) (NoteSlice, error) {
	notes, err := technical_helper.UnmarshalSlice[Note](data)

	if err != nil {
		return nil, err
	}

	return notes, nil
}

func (n *Note) From(note database.Note) *Note {
	n.ID = note.ID
	n.Author = note.Author
	n.Text = note.Text
	n.Position = NotePosition{
		Column: note.Column,
		Stack:  note.Stack,
		Rank:   note.Rank,
	}
	n.Edited = note.Edited
	return n
}

func (*Note) Render(_ http.ResponseWriter, _ *http.Request) error {
	return nil
}

func Notes(notes []database.Note) []*Note {
	if notes == nil {
		return nil
	}

	list := make([]*Note, len(notes))
	for index, note := range notes {
		list[index] = new(Note).From(note)
	}
	return list
}

func (n NoteSlice) hideOtherAuthors(userID uuid.UUID, showAuthors bool, visibleNotes []*Note) {
	for _, note := range visibleNotes {
		if !showAuthors && note.Author != userID {
			note.Author = uuid.Nil
		}
	}
}
