package api

import (
	"database/sql"
	"errors"

	"scrumlr.io/server/common"
)

// mapError translates domain and database errors to HTTP API Errors.
func mapError(err error) error {
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
		default:
			return common.InternalServerError
		}
	}

	return common.InternalServerError
}
