package sessionrequests

import "fmt"

type SessionRequestError struct {
	Category SessionRequestErrorCategory
	Message  string
	Err      error
}

type SessionRequestErrorCategory string

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

var (
	// Not Found Errors
	ErrSessionRequestNotFound = SessionRequestError{Category: NotFound, Message: "board session request not found"}
	// Bad Request Errors
	ErrInvalidBoardStatusFilter = SessionRequestError{Category: BadRequest, Message: "invalid status filter"}
)
