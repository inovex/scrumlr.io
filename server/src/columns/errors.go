package columns

import "fmt"

type ColumnErrorType string

const (
	TypeNone       ColumnErrorType = ""
	ColumnNotFound ColumnErrorType = "COLUMN_NOT_FOUND"
)

type ColumnErrorCategory string

const (
	NotFound ColumnErrorCategory = "NOT_FOUND"
	Internal ColumnErrorCategory = "INTERNAL"
)

type ColumnError struct {
	Category ColumnErrorCategory
	ErrType  ColumnErrorType
	Message  string
	Err      error
}

func (e ColumnError) Error() string {
	return fmt.Sprintf("column error [%s]: %s", e.Category, e.Message)
}

func (e ColumnError) Status() string {
	return string(e.Category)
}

func (e ColumnError) Unwrap() error {
	return e.Err
}

func CreateColumnError(category ColumnErrorCategory, errorType ColumnErrorType, message string, err error) error {
	return ColumnError{
		Category: category,
		ErrType:  errorType,
		Message:  message,
		Err:      err,
	}
}
