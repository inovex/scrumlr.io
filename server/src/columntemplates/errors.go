package columntemplates

import "fmt"

type ColumnTemplateErrorCategory string

const (
	Internal ColumnTemplateErrorCategory = "INTERNAL"
)

type ColumnTemplateError struct {
	Category ColumnTemplateErrorCategory
	Message  string
	Err      error
}

func (e ColumnTemplateError) Error() string {
	return fmt.Sprintf("column template error [%s]: %s", e.Category, e.Message)
}

func (e ColumnTemplateError) Status() string {
	return string(e.Category)
}

func (e ColumnTemplateError) Unwrap() error {
	return e.Err
}

func CreateColumnTemplateError(category ColumnTemplateErrorCategory, message string, err error) error {
	return ColumnTemplateError{
		Category: category,
		Message:  message,
		Err:      err,
	}
}
