package users

import "fmt"

type UserError struct {
	Category UserErrorCategory
	Message  string
	Err      error
}

type UserErrorCategory string

const (
	NotFound   UserErrorCategory = "NOT_FOUND"
	BadRequest UserErrorCategory = "BAD_REQUEST"
	Internal   UserErrorCategory = "INTERNAL"
)

func (e UserError) Error() string {
	return fmt.Sprintf("user error [%s]: %s", e.Category, e.Message)
}

func (e UserError) Status() string {
	return string(e.Category)
}

func (e UserError) Unwrap() error {
	return e.Err
}

var (
	// Bad Request Errors
	ErrEmptyUserName   = UserError{Category: BadRequest, Message: "name may not be empty"}
	ErrNewLineUserName = UserError{Category: BadRequest, Message: "name may not contain newline characters"}
	ErrInvalidUserName = UserError{Category: BadRequest, Message: "failed to validate username"}
	// Not Found Errors
	ErrUserNotFound = UserError{Category: NotFound, Message: "user not found"}
)
