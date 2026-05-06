package reactions

import "errors"

var (
	// Not Found Errors
	ErrReactionNotFound = errors.New("reaction not found")
	// Conflict Errors
	ErrReactionAlreadyExists = errors.New("cannot make multiple reactions on the same note by the same user")
	// Forbidden Errors
	ErrForbiddenReactionDelete = errors.New("forbidden to delete other user's reaction")
	ErrForbiddenReactionUpdate = errors.New("forbidden to update other user's reaction")
)
