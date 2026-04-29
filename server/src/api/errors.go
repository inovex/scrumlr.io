package api

import (
	"database/sql"
	"errors"

	"scrumlr.io/server/boards"
	"scrumlr.io/server/common"
)

// mapError translates domain and database errors to HTTP API Errors.
func mapError(err error) error {
	if err == nil {
		return nil
	}

	// Check for specific domain errors
	switch {
	case errors.Is(err, boards.ErrPassphraseForbidden),
		errors.Is(err, boards.ErrPassphraseRequired),
		errors.Is(err, boards.ErrNameEmpty),
		errors.Is(err, boards.ErrInvalidPassphrase):
		return common.BadRequestError(err)

	case errors.Is(err, boards.ErrNotAuthorized):
		return common.ForbiddenError(err)

	case errors.Is(err, boards.ErrBoardNotFound),
		errors.Is(err, sql.ErrNoRows): // Catch database "not found"
		return common.NotFoundError

	default:
		// If it's an unmapped error (like a DB connection failure),
		// return a generic 500 without leaking DB internals to the client.
		return common.InternalServerError
	}
}
