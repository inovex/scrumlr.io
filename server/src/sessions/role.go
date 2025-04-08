package sessions

import (
	"encoding/json"
	"errors"
	"slices"

	"github.com/google/uuid"
)

// SessionRole is the role of a user on a board and within a board session.
type SessionRole string

const (
	// ParticipantRole is the role for a regular participant of a board with limited permissions to manipulate data
	ParticipantRole SessionRole = "PARTICIPANT"

	// SessionRoleModerator is the role for a moderating user with all permissions to manipulate data
	ModeratorRole SessionRole = "MODERATOR"

	// SessionRoleOwner is the role for the creator of the board. This role should not be updated into something else
	OwnerRole SessionRole = "OWNER"
)

func (sessionRole *SessionRole) UnmarshalJSON(b []byte) error {
	var s string
	if err := json.Unmarshal(b, &s); err != nil {
		return err
	}

	unmarshalledSessionRole := SessionRole(s)
	switch unmarshalledSessionRole {
	case ParticipantRole, ModeratorRole, OwnerRole:
		*sessionRole = unmarshalledSessionRole
		return nil
	}

	return errors.New("invalid session role")
}

func CheckSessionRole(clientID uuid.UUID, sessions []*BoardSession, sessionsRoles []SessionRole) bool {
	for _, session := range sessions {
		if clientID == session.User.ID {
			if slices.Contains(sessionsRoles, session.Role) {
				return true
			}
		}
	}
	return false
}
