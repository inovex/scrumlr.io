package votings

import "errors"

var (
	// Not Found Errors
	ErrVotingNotFound = errors.New("no active voting session found")
	// Bad Request Errors
	ErrVotingLimitNegative = errors.New("vote limit cannot be smaller than 0")
	ErrVoteLimitTooHigh    = errors.New("vote limit cannot be greater than 100")
	ErrOnlyOneOpenVoting   = errors.New("only one open voting per session is allowed")
)
