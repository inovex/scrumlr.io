package types

import (
	"encoding/json"
	"errors"
)

// SessionRole is the role of a user on a board and within a board session.
type SessionRole string

const (
	// SessionRoleParticipant is the role for a regular participant of a board with limited permissions to manipulate data
	SessionRoleParticipant SessionRole = "PARTICIPANT"

	// SessionRoleModerator is the role for a moderating user with all permissions to manipulate data
	SessionRoleModerator SessionRole = "MODERATOR"

	// SessionRoleOwner is the role for the creator of the board. This role should not be updated into something else
	SessionRoleOwner SessionRole = "OWNER"
)

func (sessionRole *SessionRole) UnmarshalJSON(b []byte) error {
	var s string
	if err := json.Unmarshal(b, &s); err != nil {
		return err
	}
	unmarshalledSessionRole := SessionRole(s)
	switch unmarshalledSessionRole {
	case SessionRoleParticipant, SessionRoleModerator, SessionRoleOwner:
		*sessionRole = unmarshalledSessionRole
		return nil
	}
	return errors.New("invalid session role")
}
