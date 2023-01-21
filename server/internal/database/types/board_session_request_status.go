package types

import (
	"encoding/json"
	"errors"
)

// BoardSessionRequestStatus indicates the status of a board session request
type BoardSessionRequestStatus string

const (
	// BoardSessionRequestStatusPending indicates a pending state of a board session request. A moderator has to either accept or reject the user.
	BoardSessionRequestStatusPending BoardSessionRequestStatus = "PENDING"

	// BoardSessionRequestStatusAccepted indicates an accepted board session request
	BoardSessionRequestStatusAccepted BoardSessionRequestStatus = "ACCEPTED"

	// BoardSessionRequestStatusRejected indicates a rejected board session request
	BoardSessionRequestStatusRejected BoardSessionRequestStatus = "REJECTED"
)

func (boardSessionRequestStatus *BoardSessionRequestStatus) UnmarshalJSON(b []byte) error {
	var s string
	json.Unmarshal(b, &s)
	unmarshalledBoardSessionRequestStatus := BoardSessionRequestStatus(s)
	switch unmarshalledBoardSessionRequestStatus {
	case BoardSessionRequestStatusPending, BoardSessionRequestStatusAccepted, BoardSessionRequestStatusRejected:
		*boardSessionRequestStatus = unmarshalledBoardSessionRequestStatus
		return nil
	}
	return errors.New("invalid board session request status")
}
