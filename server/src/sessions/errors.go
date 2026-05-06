package sessions

import "errors"

var (
	// Forbidden Errors
	ErrForbiddenSessionChange  = errors.New("not allowed to change other users session")
	ErrForbiddenRolePromotion  = errors.New("cannot promote role")
	ErrForbiddenOwnerChange    = errors.New("not allowed to change owner role")
	ErrForbiddenOwnerPromotion = errors.New("not allowed to promote to owner role")
	// Not Found Errors
	ErrSessionNotFound = errors.New("session not found")
)
