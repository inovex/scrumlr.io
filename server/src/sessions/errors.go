package sessions

import "fmt"

type SessionErrorCategory string

type SessionError struct {
	Category SessionErrorCategory
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

func CreateSessionError(category SessionErrorCategory, message string, err error) error {
	return SessionError{
		Category: category,
		Message:  message,
		Err:      err,
	}
}
