package columns

import "fmt"

type ColumnErrorCategory string

const (
	NotFound ColumnErrorCategory = "NOT_FOUND"
	Internal ColumnErrorCategory = "INTERNAL"
)

type ColumnError struct {
	Category ColumnErrorCategory
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

var (
	// Not found Errors
	ErrColumnNotFound = ColumnError{Category: NotFound, Message: "column not found"}
)
