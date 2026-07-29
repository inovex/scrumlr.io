package notes

import (
	"fmt"
)

type NoteErrorCategory string

const (
	BadRequest NoteErrorCategory = "BAD_REQUEST"
	Conflict   NoteErrorCategory = "CONFLICT"
	Forbidden  NoteErrorCategory = "FORBIDDEN"
	NotFound   NoteErrorCategory = "NOT_FOUND"
	Internal   NoteErrorCategory = "INTERNAL"
)

type NoteError struct {
	Category NoteErrorCategory
	Message  string
	Err      error
}

func (e NoteError) Error() string {
	return fmt.Sprintf("notes error [%s]: %s", e.Category, e.Message)
}

func (e NoteError) Status() string {
	return string(e.Category)
}

func (e NoteError) Unwrap() error {
	return e.Err
}

func CreateNoteError(category NoteErrorCategory, message string, err error) error {
	return NoteError{
		Category: category,
		Message:  message,
		Err:      err,
	}
}
