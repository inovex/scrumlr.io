package voting

import (
	"encoding/json"
	"errors"
)

// VotingStatus is the state of a voting session and can be one of open, aborted or closed.
type VotingStatus string

const (
	// Open is the state for an open voting session, meaning that votes are allowed.
	Open VotingStatus = "OPEN"

	// Closed is the state for a closed voting session.
	//
	// The results of the voting session are available to all participants of a board.
	Closed VotingStatus = "CLOSED"
)

func (votingStatus *VotingStatus) UnmarshalJSON(b []byte) error {
	var s string
	if err := json.Unmarshal(b, &s); err != nil {
		return err
	}
	unmarshalledVotingStatus := VotingStatus(s)
	switch unmarshalledVotingStatus {
	case Open, Closed:
		*votingStatus = unmarshalledVotingStatus
		return nil
	}
	return errors.New("invalid session role")
}
