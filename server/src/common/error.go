package common

import (
	"errors"
	"net/http"

	"github.com/go-chi/render"
)

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

var NotFoundError = &APIError{StatusCode: http.StatusNotFound, StatusText: "Resource not found."}
var InternalServerError = &APIError{StatusCode: http.StatusInternalServerError, StatusText: "Internal server error."}

func Throw(w http.ResponseWriter, r *http.Request, err error) {
	var apiErr *APIError
	if errors.As(err, &apiErr) {
		_ = render.Render(w, r, apiErr)
		return
	}
	_ = render.Render(w, r, InternalServerError)
}
