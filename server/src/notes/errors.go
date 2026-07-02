package notes

import (
	"fmt"
)

type NoteErrorType string

const (
	TypeNone             NoteErrorType = ""
	EmptyTextCreate      NoteErrorType = "EMPTY_TEXT_CREATE"
	EmptyTextImport      NoteErrorType = "EMPTY_TEXT_IMPORT"
	NoteLocked           NoteErrorType = "NOTE_LOCKED"
	ForbiddenTextChange  NoteErrorType = "FORBIDDEN_TEXT_CHANGE"
	ForbiddenStackNotes  NoteErrorType = "FORBIDDEN_STACK_NOTES"
	ForbiddenStackOnSelf NoteErrorType = "FORBIDDEN_STACK_ON_SELF"
	ForbiddenDeleteNote  NoteErrorType = "FORBIDDEN_DELETE_NOTE"
	NoteNotFound         NoteErrorType = "NOTE_NOT_FOUND"
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
	ErrType  NoteErrorType
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

func CreateNoteError(category NoteErrorCategory, errorType NoteErrorType, message string, err error) error {
	return NoteError{
		Category: category,
		ErrType:  errorType,
		Message:  message,
		Err:      err,
	}
}
