package sessionrequests

import "errors"

var (
	// Not Found Errors
	ErrSessionRequestNotFound = errors.New("board session request not found")
	// Bad Request Errors
	ErrInvalidBoardStatusFilter = errors.New("invalid status filter")
)
