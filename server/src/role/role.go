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

// check if a user with role is moderator or higher
func (role Role) IsModerator() bool {
	switch role {
	case OwnerRole, ModeratorRole:
		return true
	default:
		return false
	}
}

// check if user with role can promote a user to owner
func (role Role) CanPromoteToOwner() bool {
	switch role {
	case OwnerRole:
		return true
	default:
		return false
	}
}

// check if user with role can promote a user to moderator
func (role Role) CanPromoteToModerator() bool {
	switch role {
	case OwnerRole, ModeratorRole:
		return true
	default:
		return false
	}
}

// check if user with role can delete a board
func (role Role) CanDeleteBoard() bool {
	switch role {
	case OwnerRole:
		return true
	default:
		return false
	}
}

// check if user with role can change the text of a note that does not belong to the user
func (role Role) CanChangeNoteText() bool {
	switch role {
	case OwnerRole, ModeratorRole:
		return true
	default:
		return false
	}
}

// check if user with role can delete a note that does not belong to the user
func (role Role) CanDeleteNote() bool {
	switch role {
	case OwnerRole, ModeratorRole:
		return true
	default:
		return false
	}
}

// check if a user with role can see hidden columns
func (role Role) CanSeeHiddenColumns() bool {
	switch role {
	case OwnerRole, ModeratorRole:
		return true
	default:
		return false
	}
}
