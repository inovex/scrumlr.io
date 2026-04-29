package boards

import "errors"

var (
	// Bad Request Errors
	ErrPassphraseForbidden  = errors.New("passphrase should not be set for policies except 'BY_PASSPHRASE'")
	ErrPassphraseRequired   = errors.New("passphrase must be set on access policy 'BY_PASSPHRASE'")
	ErrInvalidBoardSettings = errors.New("invalid board settings")
	ErrInvalidPassphrase    = errors.New("wrong passphrase")
	ErrNameEmpty            = errors.New("name cannot be empty")
	// Forbidden Errors
	ErrNotAuthorized = errors.New("not authorized to change board")
	// Not Found Errors
	ErrBoardNotFound = errors.New("board not found")
)
