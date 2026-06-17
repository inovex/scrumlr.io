package boards

import "fmt"

type BoardErrorCategory string

const (
	BadRequest BoardErrorCategory = "BAD_REQUEST"
	Forbidden  BoardErrorCategory = "FORBIDDEN"
	NotFound   BoardErrorCategory = "NOT_FOUND"
	Internal   BoardErrorCategory = "INTERNAL"
)

type BoardError struct {
	Category BoardErrorCategory
	Message  string
	Err      error
}

func (e BoardError) Error() string {
	return fmt.Sprintf("board error [%s]: %s", e.Category, e.Message)
}

func (e BoardError) Status() string {
	return string(e.Category)
}

func (e BoardError) Unwrap() error {
	return e.Err
}

var (
	// Bad Request Errors
	ErrPassphraseForbidden  = BoardError{Category: BadRequest, Message: "passphrase should not be set for policies except 'BY_PASSPHRASE'"}
	ErrPassphraseRequired   = BoardError{Category: BadRequest, Message: "passphrase must be set on access policy 'BY_PASSPHRASE'"}
	ErrInvalidBoardSettings = BoardError{Category: BadRequest, Message: "invalid board settings"}
	ErrInvalidPassphrase    = BoardError{Category: BadRequest, Message: "wrong passphrase"}
	ErrNameEmpty            = BoardError{Category: BadRequest, Message: "name cannot be empty"}
	// Forbidden Errors
	ErrNotAuthorized = BoardError{Category: Forbidden, Message: "not authorized to change board"}
	// Not Found Errors
	ErrBoardNotFound = BoardError{Category: NotFound, Message: "board not found"}
)
