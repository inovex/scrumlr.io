package common

import (
	"database/sql"
	"errors"
	"net/http"

	"github.com/go-chi/render"
)

const DecodeFailureMessage = "failed to decode body"

type APIError struct {
	Err        error  `json:"-"`
	StatusCode int    `json:"-"`
	StatusText string `json:"status"`
	ErrorText  string `json:"error,omitempty"`
}

func (e APIError) Error() string {
	return e.ErrorText
}

func (e *APIError) Render(_ http.ResponseWriter, r *http.Request) error {
	render.Status(r, e.StatusCode)
	return nil
}

func BadRequestError(err error) *APIError {
	return &APIError{
		Err:        err,
		StatusCode: http.StatusBadRequest,
		StatusText: "Bad request.",
		ErrorText:  err.Error(),
	}
}

func ForbiddenError(err error) *APIError {
	return &APIError{
		Err:        err,
		StatusCode: http.StatusForbidden,
		StatusText: "Forbidden.",
		ErrorText:  err.Error(),
	}
}

func ConflictError(err error) *APIError {
	return &APIError{
		Err:        err,
		StatusCode: http.StatusConflict,
		StatusText: "Conflict",
		ErrorText:  err.Error(),
	}
}

var NotFoundError = &APIError{StatusCode: http.StatusNotFound, StatusText: "Resource not found."}
var InternalServerError = &APIError{StatusCode: http.StatusInternalServerError, StatusText: "Internal server error."}

func Throw(w http.ResponseWriter, r *http.Request, err error) {
	if apiErr, ok := errors.AsType[*APIError](err); ok {
		_ = render.Render(w, r, apiErr)
		return
	}
	_ = render.Render(w, r, InternalServerError)
}

// mapError translates domain and database errors to HTTP API Errors.
func MapError(err error) error {
	if err == nil {
		return nil
	}

	// DB "no rows" error is a common case for "not found"
	if errors.Is(err, sql.ErrNoRows) {
		return NotFoundError
	}

	var s interface{ Status() string }
	if errors.As(err, &s) {
		switch s.Status() {
		case "BAD_REQUEST":
			return BadRequestError(err)
		case "FORBIDDEN":
			return ForbiddenError(err)
		case "NOT_FOUND":
			return NotFoundError
		case "CONFLICT":
			return ConflictError(err)
		}
	}

	return InternalServerError
}
