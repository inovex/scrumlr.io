package users

import "errors"

var (
	// Bad Request Errors
	ErrInvalidUserName = errors.New("failed to validate username")
	// Not Found Errors
	ErrUserNotFound = errors.New("user not found")
)
