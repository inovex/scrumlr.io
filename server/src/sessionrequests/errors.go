package sessionrequests

import "fmt"

type SessionRequestErrorCategory string

type SessionRequestError struct {
	Category SessionRequestErrorCategory
	Message  string
	Err      error
}

const (
	NotFound   SessionRequestErrorCategory = "NOT_FOUND"
	BadRequest SessionRequestErrorCategory = "BAD_REQUEST"
	Internal   SessionRequestErrorCategory = "INTERNAL"
)

func (e SessionRequestError) Error() string {
	return fmt.Sprintf("session request error [%s]: %s", e.Category, e.Message)
}

func (e SessionRequestError) Status() string {
	return string(e.Category)
}

func (e SessionRequestError) Unwrap() error {
	return e.Err
}

func CreateSessionRequestError(category SessionRequestErrorCategory, message string, err error) error {
	return SessionRequestError{
		Category: category,
		Message:  message,
		Err:      err,
	}
}
