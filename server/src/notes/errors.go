package notes

import "errors"

var (
	// Bad Request Errors
	ErrEmptyTextCreate = errors.New("cannot create note with empty text")
	ErrEmptyTextImport = errors.New("cannot import note with empty text")
	// Conflict Errors
	ErrNoteLocked = errors.New("note is locked by another user")
	// Forbidden Errors
	ErrNotAllowedTextChange         = errors.New("not allowed to change note text")
	ErrForbiddenStackNotes          = errors.New("not allowed to stack notes")
	ErrForbiddenStackOnSelf         = errors.New("not allowed to stack a note on self")
	ErrForbiddenDeleteOtherUserNote = errors.New("not allowed to delete other user's note")
	// Not Found Errors
)
