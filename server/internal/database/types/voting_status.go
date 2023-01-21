package types

import (
	"encoding/json"
	"errors"
)

// VotingStatus is the state of a voting session and can be one of open, aborted or closed.
type VotingStatus string

const (
	// VotingStatusOpen is the state for an open voting session, meaning that votes are allowed.
	VotingStatusOpen VotingStatus = "OPEN"

	// VotingStatusAborted is the state for an aborted voting session.
	//
	// All votes will be deleted if a voting session is aborted.
	VotingStatusAborted VotingStatus = "ABORTED"

	// VotingStatusClosed is the state for a closed voting session.
	//
	// The results of the voting session are available to all participants of a board.
	VotingStatusClosed VotingStatus = "CLOSED"
)

func (votingStatus *VotingStatus) UnmarshalJSON(b []byte) error {
	var s string
	json.Unmarshal(b, &s)
	unmarshalledVotingStatus := VotingStatus(s)
	switch unmarshalledVotingStatus {
	case VotingStatusOpen, VotingStatusAborted, VotingStatusClosed:
		*votingStatus = unmarshalledVotingStatus
		return nil
	}
	return errors.New("invalid session role")
}
