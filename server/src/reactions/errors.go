package reactions

import "fmt"

type ReactionErrorCategory string

const (
	NotFound  ReactionErrorCategory = "NOT_FOUND"
	Conflict  ReactionErrorCategory = "CONFLICT"
	Forbidden ReactionErrorCategory = "FORBIDDEN"
)

type ReactionError struct {
	Category ReactionErrorCategory
	Message  string
}

func (e ReactionError) Error() string {
	return fmt.Sprintf("reaction error [%s]: %s", e.Category, e.Message)
}

func (e ReactionError) Status() string {
	return string(e.Category)
}

var (
	// Not Found Errors
	ErrReactionNotFound = ReactionError{Category: NotFound, Message: "reaction not found"}
	// Conflict Errors
	ErrReactionAlreadyExists = ReactionError{Category: Conflict, Message: "cannot make multiple reactions on the same note by the same user"}
	// Forbidden Errors
	ErrForbiddenReactionDelete = ReactionError{Category: Forbidden, Message: "forbidden to delete other user's reaction"}
	ErrForbiddenReactionUpdate = ReactionError{Category: Forbidden, Message: "forbidden to update other user's reaction"}
)
