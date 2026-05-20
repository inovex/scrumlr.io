package users

import "errors"

var (
	// Bad Request Errors
	ErrEmptyUserName   = errors.New("name may not be empty")
	ErrNewLineUserName = errors.New("name may not contain newline characters")
	ErrInvalidUserName = errors.New("failed to validate username")
	// Not Found Errors
	ErrUserNotFound = errors.New("user not found")
)
