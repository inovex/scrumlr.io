package reactions

import "fmt"

type ReactionErrorType string

const (
	TypeNone                ReactionErrorType = ""
	ReactionNotFound        ReactionErrorType = "REACTION_NOT_FOUND"
	ReactionAlreadyExists   ReactionErrorType = "REACTION_ALREADY_EXISTS"
	ForbiddenReactionDelete ReactionErrorType = "FORBIDDEN_REACTION_DELETE"
	ForbiddenReactionUpdate ReactionErrorType = "FORBIDDEN_REACTION_UPDATE"
)

type ReactionErrorCategory string

const (
	NotFound  ReactionErrorCategory = "NOT_FOUND"
	Conflict  ReactionErrorCategory = "CONFLICT"
	Forbidden ReactionErrorCategory = "FORBIDDEN"
	Internal  ReactionErrorCategory = "INTERNAL"
)

type ReactionError struct {
	Category ReactionErrorCategory
	ErrType  ReactionErrorType
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

func CreateReactionError(category ReactionErrorCategory, errorType ReactionErrorType, message string, err error) error {
	return ReactionError{
		Category: category,
		ErrType:  errorType,
		Message:  message,
		Err:      err,
	}
}
