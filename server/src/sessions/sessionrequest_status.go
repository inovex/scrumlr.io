package sessions

import (
	"encoding/json"
	"errors"
)

// BoardSessionRequestStatus indicates the status of a board session request
type BoardSessionRequestStatus string

const (
	// RequestStatusPending indicates a pending state of a board session request. A moderator has to either accept or reject the user.
	RequestStatusPending BoardSessionRequestStatus = "PENDING"

	// RequestStatusAccepted indicates an accepted board session request
	RequestStatusAccepted BoardSessionRequestStatus = "ACCEPTED"

	// RequestStatusRejected indicates a rejected board session request
	RequestStatusRejected BoardSessionRequestStatus = "REJECTED"
)

func (boardSessionRequestStatus *BoardSessionRequestStatus) UnmarshalJSON(b []byte) error {
	var s string
	if err := json.Unmarshal(b, &s); err != nil {
		return err
	}

	unmarshalledBoardSessionRequestStatus := BoardSessionRequestStatus(s)
	switch unmarshalledBoardSessionRequestStatus {
	case RequestStatusPending, RequestStatusAccepted, RequestStatusRejected:
		*boardSessionRequestStatus = unmarshalledBoardSessionRequestStatus
		return nil
	}

	return errors.New("invalid board session request status")
}
