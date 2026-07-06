package users

import "fmt"

type UserErrorCategory string

const (
	NotFound   UserErrorCategory = "NOT_FOUND"
	BadRequest UserErrorCategory = "BAD_REQUEST"
	Internal   UserErrorCategory = "INTERNAL"
)

type UserError struct {
	Category UserErrorCategory
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

func CreateUserError(category UserErrorCategory, message string, err error) error {
	return UserError{
		Category: category,
		Message:  message,
		Err:      err,
	}
}
