package sessions

import "fmt"

type SessionErrorType string

const (
	TypeNone                SessionErrorType = ""
	SessionNotFound         SessionErrorType = "SESSION_NOT_FOUND"
	ForbiddenSessionChange  SessionErrorType = "FORBIDDEN_SESSION_CHANGE"
	ForbiddenRolePromotion  SessionErrorType = "FORBIDDEN_ROLE_PROMOTION"
	ForbiddenOwnerChange    SessionErrorType = "FORBIDDEN_OWNER_CHANGE"
	ForbiddenOwnerPromotion SessionErrorType = "FORBIDDEN_OWNER_PROMOTION"
)

type SessionErrorCategory string

type SessionError struct {
	Category SessionErrorCategory
	ErrType  SessionErrorType
	Message  string
	Err      error
}

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

func CreateSessionError(category SessionErrorCategory, errorType SessionErrorType, message string, err error) error {
	return SessionError{
		Category: category,
		ErrType:  errorType,
		Message:  message,
		Err:      err,
	}
}
