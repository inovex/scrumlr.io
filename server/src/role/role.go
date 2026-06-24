package role

import (
	"encoding/json"
	"errors"
)

// Role is the role of a user on a board and within a board session.
type Role string

const (
	// ParticipantRole is the role for a regular participant of a board with limited permissions to manipulate data
	ParticipantRole Role = "PARTICIPANT"

	// SessionRoleModerator is the role for a moderating user with all permissions to manipulate data
	ModeratorRole Role = "MODERATOR"

	// SessionRoleOwner is the role for the creator of the board. This role should not be updated into something else
	OwnerRole Role = "OWNER"
)

func (role *Role) UnmarshalJSON(b []byte) error {
	var s string
	if err := json.Unmarshal(b, &s); err != nil {
		return err
	}

	unmarshalledRole := Role(s)
	switch unmarshalledRole {
	case ParticipantRole, ModeratorRole, OwnerRole:
		*role = unmarshalledRole
		return nil
	}

	return errors.New("invalid role")
}

// check if role is moderator or higher
func IsModerator(role Role) bool {
	switch role {
	case OwnerRole, ModeratorRole:
		return true
	default:
		return false
	}
}

// check if role can promote to owner
func CanPromoteToOwner(role Role) bool {
	switch role {
	case OwnerRole:
		return true
	default:
		return false
	}
}

// check if role can promote to moderator
func CanPromoteToModerator(role Role) bool {
	switch role {
	case OwnerRole, ModeratorRole:
		return true
	default:
		return false
	}
}

// check if role can delete a board
func CanDeleteBoard(role Role) bool {
	switch role {
	case OwnerRole:
		return true
	default:
		return false
	}
}

// check if a role can change the text of a note
func CanChangeNoteText(role Role) bool {
	switch role {
	case OwnerRole, ModeratorRole:
		return true
	default:
		return false
	}
}

// check if a role can delete a note
func CanDeleteNote(role Role) bool {
	switch role {
	case OwnerRole, ModeratorRole:
		return true
	default:
		return false
	}
}
