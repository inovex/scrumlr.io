package boardtemplates

import "fmt"

type BoardTemplateErrorCategory string

const (
	Internal BoardTemplateErrorCategory = "INTERNAL"
)

type BoardTemplateError struct {
	Category BoardTemplateErrorCategory
	Message  string
	Err      error
}

func (e BoardTemplateError) Error() string {
	return fmt.Sprintf("board template error [%s]: %s", e.Category, e.Message)
}

func (e BoardTemplateError) Status() string {
	return string(e.Category)
}

func (e BoardTemplateError) Unwrap() error {
	return e.Err
}

func CreateBoardTemplateError(category BoardTemplateErrorCategory, message string, err error) error {
	return BoardTemplateError{
		Category: category,
		Message:  message,
		Err:      err,
	}
}
