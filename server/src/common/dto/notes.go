package dto

import (
	"github.com/google/uuid"
	"net/http"
	"scrumlr.io/server/database"
)

type NotePosition struct {

	// The column of the note.
	Column uuid.UUID `json:"column"`

	// The parent note for this note in a stack.
	Stack uuid.NullUUID `json:"stack"`

	// The note rank.
	Rank int `json:"rank"`
}

// Note is the response for all note requests.
type Note struct {
	// The id of the note
	ID uuid.UUID `json:"id"`

	// The author of the note.
	Author uuid.UUID `json:"author"`

	// The text of the note.
	Text string `json:"text"`

	// The position of the note.
	Position NotePosition `json:"position"`
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

// NoteCreateRequest represents the request to create a new note.
type NoteCreateRequest struct {
	// The column of the note.
	Column uuid.UUID `json:"column"`

	// The text of the note.
	Text string `json:"text"`

	Board uuid.UUID `json:"-"`
	User  uuid.UUID `json:"-"`
}

// NoteUpdateRequest represents the request to update a note.
type NoteUpdateRequest struct {

	// The text of the note.
	Text *string `json:"text"`

	// The position of the note
	Position *NotePosition `json:"position"`

	ID    uuid.UUID `json:"-"`
	Board uuid.UUID `json:"-"`
}
