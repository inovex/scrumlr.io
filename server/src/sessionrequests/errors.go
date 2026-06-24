package sessionrequests

import "fmt"

type SessionRequestErrorType string

const (
	TypeNone                 SessionRequestErrorType = ""
	SessionRequestNotFound   SessionRequestErrorType = "SESSION_REQUEST_NOT_FOUND"
	InvalidBoardStatusFilter SessionRequestErrorType = "INVALID_BOARD_STATUS_FILTER"
)

type SessionRequestErrorCategory string

type SessionRequestError struct {
	Category SessionRequestErrorCategory
	ErrType  SessionRequestErrorType
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

func CreateSessionRequestError(category SessionRequestErrorCategory, errorType SessionRequestErrorType, message string, err error) error {
	return SessionRequestError{
		Category: category,
		ErrType:  errorType,
		Message:  message,
		Err:      err,
	}
}
