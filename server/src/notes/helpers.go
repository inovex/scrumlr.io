package notes

import (
	"github.com/google/uuid"
	"net/http"
	"scrumlr.io/server/technical_helper"
)

//todo: rename an move somewhere else

type NoteVisibilityConfig struct {
	UserID                uuid.UUID
	ShowNotesOfOtherUsers bool
	ShowAuthors           bool

	Columns []ColumnVisibility
}
type ColumnVisibility struct {
	ID      uuid.UUID
	Visible bool
}

func (n NoteSlice) FilterNotesByBoardSettingsOrAuthorInformation(renameLater NoteVisibilityConfig) NoteSlice {
	visibleNotes := technical_helper.Filter[*Note](n, func(note *Note) bool {
		for _, column := range renameLater.Columns {
			if (note.Position.Column == column.ID) && column.Visible {
				// BoardSettings -> Remove other participant cards
				if renameLater.ShowNotesOfOtherUsers {
					return true
				} else if renameLater.UserID == note.Author {
					return true
				}
			}
		}
		return false
	})

	n.hideOtherAuthors(renameLater.UserID, renameLater.ShowAuthors, visibleNotes)

	return visibleNotes
}

func UnmarshallNotaData(data interface{}) (NoteSlice, error) {
	notes, err := technical_helper.UnmarshalSlice[Note](data)

	if err != nil {
		return nil, err
	}

	return notes, nil
}

func (*Note) Render(_ http.ResponseWriter, _ *http.Request) error {
	return nil
}

func (n NoteSlice) hideOtherAuthors(userID uuid.UUID, showAuthors bool, visibleNotes []*Note) {
	for _, note := range visibleNotes {
		if !showAuthors && note.Author != userID {
			note.Author = uuid.Nil
		}
	}
}
