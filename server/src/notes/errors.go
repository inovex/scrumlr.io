package notes

import (
	"fmt"
)

// NoteErrorCategory allows us to classify errors for easier handling at the API layer
type NoteErrorCategory string

const (
	BadRequest NoteErrorCategory = "BAD_REQUEST"
	Conflict   NoteErrorCategory = "CONFLICT"
	Forbidden  NoteErrorCategory = "FORBIDDEN"
	NotFound   NoteErrorCategory = "NOT_FOUND"
	Internal   NoteErrorCategory = "INTERNAL"
)

// NoteError is our custom domain error that implements the built-in error interface
type NoteError struct {
	Category NoteErrorCategory
	Message  string
	Err      error // the original error (for internal errors)
}

// Error makes NoteError satisfy the built-in Go 'error' interface
func (e NoteError) Error() string {
	return fmt.Sprintf("notes error [%s]: %s", e.Category, e.Message)
}

func (e NoteError) Status() string {
	return string(e.Category)
}

func (e NoteError) Unwrap() error {
	return e.Err
}

// Sentinel Error Instances
var (
	// Bad Request Errors
	ErrEmptyTextCreate = NoteError{Category: BadRequest, Message: "cannot create note with empty text"}
	ErrEmptyTextImport = NoteError{Category: BadRequest, Message: "cannot import note with empty text"}

	// Conflict Errors
	ErrNoteLocked = NoteError{Category: Conflict, Message: "note is currently locked"}

	// Forbidden Errors
	ErrNotAllowedTextChange         = NoteError{Category: Forbidden, Message: "not allowed to change note text"}
	ErrForbiddenStackNotes          = NoteError{Category: Forbidden, Message: "not allowed to stack notes"}
	ErrForbiddenStackOnSelf         = NoteError{Category: Forbidden, Message: "not allowed to stack a note on self"}
	ErrForbiddenDeleteOtherUserNote = NoteError{Category: Forbidden, Message: "not allowed to delete other user's note"}

	// Not Found Errors
	ErrNoteNotFound = NoteError{Category: NotFound, Message: "note not found"}
)
