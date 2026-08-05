package votings

import "fmt"

type VotingErrorCategory string

type VotingError struct {
	Category VotingErrorCategory
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

func CreateVotingError(category VotingErrorCategory, message string, err error) error {
	return VotingError{
		Category: category,
		Message:  message,
		Err:      err,
	}
}
