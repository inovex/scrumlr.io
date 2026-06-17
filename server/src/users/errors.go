package users

import "fmt"

type UserErrorType string

const (
	TypeNone        UserErrorType = ""
	EmptyUserName   UserErrorType = "EMPTY_USER_NAME"
	NewLineUserName UserErrorType = "NEW_LINE_USER_NAME"
	InvalidUserName UserErrorType = "INVALID_USER_NAME"
	UserNotFound    UserErrorType = "USER_NOT_FOUND"
)

type UserErrorCategory string

const (
	NotFound   UserErrorCategory = "NOT_FOUND"
	BadRequest UserErrorCategory = "BAD_REQUEST"
	Internal   UserErrorCategory = "INTERNAL"
)

type UserError struct {
	Category UserErrorCategory
	ErrType  UserErrorType
	Message  string
	Err      error
}

func (e UserError) Error() string {
	return fmt.Sprintf("user error [%s]: %s", e.Category, e.Message)
}

func (e UserError) Status() string {
	return string(e.Category)
}

func (e UserError) Unwrap() error {
	return e.Err
}

func CreateUserError(category UserErrorCategory, errorType UserErrorType, message string, err error) error {
	return UserError{
		Category: category,
		ErrType:  errorType,
		Message:  message,
		Err:      err,
	}
}

var (
	// Bad Request Errors
	ErrEmptyUserName   = UserError{Category: BadRequest, Message: "name may not be empty"}
	ErrNewLineUserName = UserError{Category: BadRequest, Message: "name may not contain newline characters"}
	ErrInvalidUserName = UserError{Category: BadRequest, Message: "failed to validate username"}
	// Not Found Errors
	ErrUserNotFound = UserError{Category: NotFound, Message: "user not found"}
)
