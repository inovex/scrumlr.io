package boardtemplates

import (
	"database/sql"
	"errors"
	"fmt"

	"scrumlr.io/server/common"
)

type BoardTemplateErrorCategory string

const (
	Internal BoardTemplateErrorCategory = "INTERNAL"
	NotFound BoardTemplateErrorCategory = "NOT_FOUND"
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

// MapBoardTemplateError translates domain and database errors to HTTP API Errors.
func MapBoardTemplateError(err error) error {
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
