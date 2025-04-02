package sessionrequests

import (
	"encoding/json"
	"errors"
)

// RequestStatus indicates the status of a board session request
type RequestStatus string

const (
	// RequestStatusPending indicates a pending state of a board session request. A moderator has to either accept or reject the user.
	RequestPending RequestStatus = "PENDING"

	// RequestStatusAccepted indicates an accepted board session request
	RequestAccepted RequestStatus = "ACCEPTED"

	// RequestStatusRejected indicates a rejected board session request
	RequestRejected RequestStatus = "REJECTED"
)

func (boardSessionRequestStatus *RequestStatus) UnmarshalJSON(b []byte) error {
	var s string
	if err := json.Unmarshal(b, &s); err != nil {
		return err
	}

	unmarshalledBoardSessionRequestStatus := RequestStatus(s)
	switch unmarshalledBoardSessionRequestStatus {
	case RequestPending, RequestAccepted, RequestRejected:
		*boardSessionRequestStatus = unmarshalledBoardSessionRequestStatus
		return nil
	}

	return errors.New("invalid board session request status")
}
