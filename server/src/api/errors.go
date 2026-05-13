package api

import (
	"database/sql"
	"errors"

	"scrumlr.io/server/boards"
	"scrumlr.io/server/columns"
	"scrumlr.io/server/common"
	"scrumlr.io/server/notes"
	"scrumlr.io/server/reactions"
	"scrumlr.io/server/sessionrequests"
	"scrumlr.io/server/sessions"
	"scrumlr.io/server/users"
	"scrumlr.io/server/votings"
)

// mapError translates domain and database errors to HTTP API Errors.
func mapError(err error) error {
	if err == nil {
		return nil
	}

	// Group errors by HTTP semantics
	switch {
	// 400 Bad Request
	case errors.Is(err, boards.ErrPassphraseForbidden),
		errors.Is(err, boards.ErrPassphraseRequired),
		errors.Is(err, boards.ErrNameEmpty),
		errors.Is(err, boards.ErrInvalidPassphrase),
		errors.Is(err, boards.ErrInvalidBoardSettings),
		errors.Is(err, notes.ErrEmptyTextCreate),
		errors.Is(err, notes.ErrEmptyTextImport),
		errors.Is(err, sessionrequests.ErrInvalidBoardStatusFilter),
		errors.Is(err, votings.ErrVotingLimitNegative),
		errors.Is(err, votings.ErrVoteLimitTooHigh),
		errors.Is(err, users.ErrInvalidUserName):
		return common.BadRequestError(err)

	// 403 Forbidden
	case errors.Is(err, boards.ErrNotAuthorized),
		errors.Is(err, sessions.ErrForbiddenSessionChange),
		errors.Is(err, sessions.ErrForbiddenRolePromotion),
		errors.Is(err, sessions.ErrForbiddenOwnerChange),
		errors.Is(err, sessions.ErrForbiddenOwnerPromotion),
		errors.Is(err, notes.ErrNotAllowedTextChange),
		errors.Is(err, notes.ErrForbiddenStackNotes),
		errors.Is(err, notes.ErrForbiddenStackOnSelf),
		errors.Is(err, notes.ErrForbiddenDeleteOtherUserNote),
		errors.Is(err, reactions.ErrForbiddenReactionDelete),
		errors.Is(err, reactions.ErrForbiddenReactionUpdate):
		return common.ForbiddenError(err)

	// 404 Not Found
	case errors.Is(err, boards.ErrBoardNotFound),
		errors.Is(err, sql.ErrNoRows), // Catch database "not found"
		errors.Is(err, columns.ErrColumnNotFound),
		errors.Is(err, sessionrequests.ErrSessionRequestNotFound),
		errors.Is(err, sessions.ErrSessionNotFound),
		errors.Is(err, users.ErrUserNotFound),
		errors.Is(err, reactions.ErrReactionNotFound),
		errors.Is(err, votings.ErrVotingNotFound):
		return common.NotFoundError

	// 409 Conflict
	case errors.Is(err, notes.ErrNoteLocked),
		errors.Is(err, reactions.ErrReactionAlreadyExists):
		return common.ConflictError(err)

	default:
		// Unmapped errors -> 500
		return common.InternalServerError
	}
}
