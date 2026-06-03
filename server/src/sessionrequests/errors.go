package sessionrequests

import "fmt"

type SessionRequestError struct {
	Category SessionRequestErrorCategory
	Message  string
}

type SessionRequestErrorCategory string

const (
	NotFound   SessionRequestErrorCategory = "NOT_FOUND"
	BadRequest SessionRequestErrorCategory = "BAD_REQUEST"
)

func (e SessionRequestError) Error() string {
	return fmt.Sprintf("session request error [%s]: %s", e.Category, e.Message)
}

func (e SessionRequestError) Status() string {
	return string(e.Category)
}

var (
	// Not Found Errors
	ErrSessionRequestNotFound = SessionRequestError{Category: NotFound, Message: "board session request not found"}
	// Bad Request Errors
	ErrInvalidBoardStatusFilter = SessionRequestError{Category: BadRequest, Message: "invalid status filter"}
)
