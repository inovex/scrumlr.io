package sessions

import "fmt"

type SessionError struct {
	Category SessionErrorCategory
	Message  string
	Err      error
}

type SessionErrorCategory string

const (
	NotFound  SessionErrorCategory = "NOT_FOUND"
	Forbidden SessionErrorCategory = "FORBIDDEN"
	Internal  SessionErrorCategory = "INTERNAL"
)

func (e SessionError) Error() string {
	return fmt.Sprintf("session error [%s]: %s", e.Category, e.Message)
}

func (e SessionError) Status() string {
	return string(e.Category)
}

func (e SessionError) Unwrap() error {
	return e.Err
}

var (
	// Forbidden Errors
	ErrForbiddenSessionChange  = SessionError{Category: Forbidden, Message: "not allowed to change other users session"}
	ErrForbiddenRolePromotion  = SessionError{Category: Forbidden, Message: "cannot promote role"}
	ErrForbiddenOwnerChange    = SessionError{Category: Forbidden, Message: "not allowed to change owner role"}
	ErrForbiddenOwnerPromotion = SessionError{Category: Forbidden, Message: "not allowed to promote to owner role"}
	// Not Found Errors
	ErrSessionNotFound = SessionError{Category: NotFound, Message: "session not found"}
)
