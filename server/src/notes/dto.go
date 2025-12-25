package notes

import (
	"github.com/google/uuid"
)

// NoteCreateRequest represents the request to create a new note.
type NoteCreateRequest struct {
	// The column of the note.
	Column uuid.UUID `json:"column"`

	// The text of the note.
	Text string `json:"text"`

	Board uuid.UUID `json:"-"`
	User  uuid.UUID `json:"-"`
}

type NoteImportRequest struct {
	// The text of the note.
	Text     string       `json:"text"`
	Position NotePosition `json:"position"`

	Board uuid.UUID `json:"-"`
	User  uuid.UUID `json:"-"`
}

// NoteUpdateRequest represents the request to update a note.
type NoteUpdateRequest struct {

	// The text of the note.
	Text *string `json:"text"`

	// The position of the note
	Position *NotePosition `json:"position"`

	Edited bool      `json:"-"`
	ID     uuid.UUID `json:"-"`
	Board  uuid.UUID `json:"-"`
}

// NoteDeleteRequest represents the request to delete a note.
type NoteDeleteRequest struct {
	// The id of the note to delete
	ID uuid.UUID `json:"-"`

	// The board where the note is located
	Board uuid.UUID `json:"-"`

	// Delete note or the complete stack.
	DeleteStack bool `json:"deleteStack"`
}

type NoteUpdatePosition struct {
	Column uuid.UUID
	Rank   int
	Stack  uuid.NullUUID
}

type NoteSlice []*Note

// Note is the response for all note requests.
type Note struct {
	// The id of the note
	ID uuid.UUID `json:"id"`

	// The author of the note.
	Author uuid.UUID `json:"author"`

	// The text of the note.
	Text string `json:"text"`

	Edited bool `json:"edited"`

	// The position of the note.
	Position NotePosition `json:"position"`
}

type NotePosition struct {

	// The column of the note.
	Column uuid.UUID `json:"column"`

	// The parent note for this note in a stack.
	Stack uuid.NullUUID `json:"stack"`

	// The note rank.
	Rank int `json:"rank"`
}

type DragLock struct {
	NoteID  uuid.UUID
	UserID  uuid.UUID
	BoardID uuid.UUID
}

func (n *Note) From(note DatabaseNote) *Note {
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

func Notes(notes []DatabaseNote) []*Note {
	if notes == nil {
		return nil
	}

	list := make([]*Note, len(notes))
	for index, note := range notes {
		list[index] = new(Note).From(note)
	}
	return list
}
