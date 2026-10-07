package columntemplates

import (
	"database/sql"
	"errors"
	"fmt"

	"scrumlr.io/server/common"
)

type ColumnTemplateErrorCategory string

const (
	Internal ColumnTemplateErrorCategory = "INTERNAL"
	NotFound ColumnTemplateErrorCategory = "NOT_FOUND"
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

// MapColumnTemplateError translates domain and database errors to HTTP API Errors.
func MapColumnTemplateError(err error) error {
	if err == nil {
		return nil
	}

	// DB "no rows" error is a common case for "not found"
	if errors.Is(err, sql.ErrNoRows) {
		return common.NotFoundError
	}

	var s interface{ Status() string }
	if errors.As(err, &s) {
		switch s.Status() {
		case "BAD_REQUEST":
			return common.BadRequestError(err)
		case "FORBIDDEN":
			return common.ForbiddenError(err)
		case "NOT_FOUND":
			return common.NotFoundError
		case "CONFLICT":
			return common.ConflictError(err)
		}
	}

	return common.InternalServerError
}
