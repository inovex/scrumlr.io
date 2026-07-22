package reactions

import "fmt"

type ReactionErrorCategory string

const (
	NotFound  ReactionErrorCategory = "NOT_FOUND"
	Conflict  ReactionErrorCategory = "CONFLICT"
	Forbidden ReactionErrorCategory = "FORBIDDEN"
	Internal  ReactionErrorCategory = "INTERNAL"
)

type ReactionError struct {
	Category ReactionErrorCategory
	Message  string
	Err      error
}

func (e ReactionError) Error() string {
	return fmt.Sprintf("reaction error [%s]: %s", e.Category, e.Message)
}

func (e ReactionError) Status() string {
	return string(e.Category)
}

func (e ReactionError) Unwrap() error {
	return e.Err
}

func CreateReactionError(category ReactionErrorCategory, message string, err error) error {
	return ReactionError{
		Category: category,
		Message:  message,
		Err:      err,
	}
}
