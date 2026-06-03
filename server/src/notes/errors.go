package notes

import "fmt"

// NoteErrorCategory allows us to classify errors for easier handling at the API layer
type NoteErrorCategory string

const (
	CategoryBadRequest NoteErrorCategory = "BAD_REQUEST"
	CategoryConflict   NoteErrorCategory = "CONFLICT"
	CategoryForbidden  NoteErrorCategory = "FORBIDDEN"
	CategoryNotFound   NoteErrorCategory = "NOT_FOUND"
)

// NoteError is our custom domain error that implements the built-in error interface
type NoteError struct {
	Category NoteErrorCategory
	Message  string
}

// Error makes NoteError satisfy the built-in Go 'error' interface
func (e NoteError) Error() string {
	return fmt.Sprintf("notes error [%s]: %s", e.Category, e.Message)
}

func (e NoteError) Status() string {
	return string(e.Category)
}

// Sentinel Error Instances
var (
	// Bad Request Errors
	ErrEmptyTextCreate = NoteError{Category: CategoryBadRequest, Message: "cannot create note with empty text"}
	ErrEmptyTextImport = NoteError{Category: CategoryBadRequest, Message: "cannot import note with empty text"}

	// Conflict Errors
	ErrNoteLocked = NoteError{Category: CategoryConflict, Message: "note is currently locked"}

	// Forbidden Errors
	ErrNotAllowedTextChange         = NoteError{Category: CategoryForbidden, Message: "not allowed to change note text"}
	ErrForbiddenStackNotes          = NoteError{Category: CategoryForbidden, Message: "not allowed to stack notes"}
	ErrForbiddenStackOnSelf         = NoteError{Category: CategoryForbidden, Message: "not allowed to stack a note on self"}
	ErrForbiddenDeleteOtherUserNote = NoteError{Category: CategoryForbidden, Message: "not allowed to delete other user's note"}

	// Not Found Errors
	ErrNoteNotFound = NoteError{Category: CategoryNotFound, Message: "note not found"}
)
