package votings

import "fmt"

type VotingErrorType string

const (
	TypeNone            VotingErrorType = ""
	VotingNotFound      VotingErrorType = "VOTING_NOT_FOUND"
	VotingLimitNegative VotingErrorType = "VOTING_LIMIT_NEGATIVE"
	VoteLimitTooHigh    VotingErrorType = "VOTE_LIMIT_TOO_HIGH"
	OnlyOneOpenVoting   VotingErrorType = "ONLY_ONE_OPEN_VOTING"
)

type VotingErrorCategory string

type VotingError struct {
	Category VotingErrorCategory
	ErrType  VotingErrorType
	Message  string
	Err      error
}

const (
	NotFound   VotingErrorCategory = "NOT_FOUND"
	BadRequest VotingErrorCategory = "BAD_REQUEST"
	Internal   VotingErrorCategory = "INTERNAL"
)

func (e VotingError) Error() string {
	return fmt.Sprintf("voting error [%s]: %s", e.Category, e.Message)
}

func (e VotingError) Status() string {
	return string(e.Category)
}

func (e VotingError) Unwrap() error {
	return e.Err
}

func CreateVotingError(category VotingErrorCategory, errorType VotingErrorType, message string, err error) error {
	return VotingError{
		Category: category,
		ErrType:  errorType,
		Message:  message,
		Err:      err,
	}
}
