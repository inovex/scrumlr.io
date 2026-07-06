package boards

import "fmt"

type BoardErrorCategory string

const (
	BadRequest BoardErrorCategory = "BAD_REQUEST"
	Forbidden  BoardErrorCategory = "FORBIDDEN"
	NotFound   BoardErrorCategory = "NOT_FOUND"
	Internal   BoardErrorCategory = "INTERNAL"
)

type BoardError struct {
	Category BoardErrorCategory
	Message  string
	Err      error
}

func (e BoardError) Error() string {
	return fmt.Sprintf("board error [%s]: %s", e.Category, e.Message)
}

func (e BoardError) Status() string {
	return string(e.Category)
}

func (e BoardError) Unwrap() error {
	return e.Err
}

func CreateBoardError(category BoardErrorCategory, message string, err error) error {
	return BoardError{
		Category: category,
		Message:  message,
		Err:      err,
	}
}
