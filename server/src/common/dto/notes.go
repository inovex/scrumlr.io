package dto

import (
	"github.com/google/uuid"
	"scrumlr.io/server/notes"
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
	Text     string             `json:"text"`
	Position notes.NotePosition `json:"position"`

	Board uuid.UUID `json:"-"`
	User  uuid.UUID `json:"-"`
}

// NoteUpdateRequest represents the request to update a note.
type NoteUpdateRequest struct {

	// The text of the note.
	Text *string `json:"text"`

	// The position of the note
	Position *notes.NotePosition `json:"position"`

	Edited bool      `json:"-"`
	ID     uuid.UUID `json:"-"`
	Board  uuid.UUID `json:"-"`
}

// NoteDeleteRequest represents the request to delete a note.
type NoteDeleteRequest struct {

	// Delete note or the complete stack.
	DeleteStack bool `json:"deleteStack"`
}
