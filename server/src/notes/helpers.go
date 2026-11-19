package notes

import (
	"net/http"

	"github.com/google/uuid"
	"scrumlr.io/server/technical_helper"
)

func (n NoteSlice) FilterNotesByBoardSettingsOrAuthorInformation(userID uuid.UUID, showNotesOfOtherUsers bool, showAuthors bool, columnIds []uuid.UUID) NoteSlice {
	visibleNotes := technical_helper.Filter[*Note](n, func(note *Note) bool {
		for _, columnId := range columnIds {
			if note.Position.Column == columnId {
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

func UnmarshallNoteData(data any) (NoteSlice, error) {
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
