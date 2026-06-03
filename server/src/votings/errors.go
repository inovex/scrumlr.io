package votings

import "fmt"

type VotingError struct {
	Category VotingErrorCategory
	Message  string
}

type VotingErrorCategory string

const (
	NotFound   VotingErrorCategory = "NOT_FOUND"
	BadRequest VotingErrorCategory = "BAD_REQUEST"
)

func (e VotingError) Error() string {
	return fmt.Sprintf("voting error [%s]: %s", e.Category, e.Message)
}

func (e VotingError) Status() string {
	return string(e.Category)
}

var (
	// Not Found Errors
	ErrVotingNotFound = VotingError{Category: NotFound, Message: "no active voting session found"}
	// Bad Request Errors
	ErrVotingLimitNegative = VotingError{Category: BadRequest, Message: "vote limit cannot be smaller than 0"}
	ErrVoteLimitTooHigh    = VotingError{Category: BadRequest, Message: "vote limit cannot be greater than 100"}
	ErrOnlyOneOpenVoting   = VotingError{Category: BadRequest, Message: "only one open voting per session is allowed"}
)
