package role

import (
	"fmt"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestSessionRoleEnum(t *testing.T) {
	values := []Role{ParticipantRole, ModeratorRole, OwnerRole}
	for _, value := range values {
		var role Role
		err := role.UnmarshalJSON(fmt.Appendf(nil, "\"%s\"", value))
		assert.Nil(t, err)
		assert.Equal(t, value, role)
	}
}

func TestUnmarshalSessionRoleNil(t *testing.T) {
	var role Role
	err := role.UnmarshalJSON(nil)
	assert.NotNil(t, err)
}

func TestUnmarshalSessionRoleEmptyString(t *testing.T) {
	var role Role
	err := role.UnmarshalJSON([]byte(""))
	assert.NotNil(t, err)
}

func TestUnmarshalSessionRoleEmptyStringWithQuotation(t *testing.T) {
	var role Role
	err := role.UnmarshalJSON([]byte("\"\""))
	assert.NotNil(t, err)
}

func TestUnmarshalSessionRoleRandomValue(t *testing.T) {
	var role Role
	err := role.UnmarshalJSON([]byte("\"SOME_RANDOM_VALUE\""))
	assert.NotNil(t, err)
}

func TestOwnerIsModerator(t *testing.T) {
	role := OwnerRole

	isModerator := role.IsModerator()

	assert.True(t, isModerator)
}

func TestModeratorIsModerator(t *testing.T) {
	role := ModeratorRole

	isModerator := role.IsModerator()

	assert.True(t, isModerator)
}

func TestParticipantIsNotModerator(t *testing.T) {
	role := ParticipantRole

	isModerator := role.IsModerator()

	assert.False(t, isModerator)
}

func TestOwnerCanPromoteToOwner(t *testing.T) {
	role := OwnerRole

	canPromote := role.CanPromoteToOwner()

	assert.True(t, canPromote)
}

func TestModeratorCanNotPromoteToOwner(t *testing.T) {
	role := ModeratorRole

	canPromote := role.CanPromoteToOwner()

	assert.False(t, canPromote)
}

func TestParticipantCanNotPromoteToOwner(t *testing.T) {
	role := ParticipantRole

	canPromote := role.CanPromoteToOwner()

	assert.False(t, canPromote)
}

func TestOwnerCanPromoteToModerator(t *testing.T) {
	role := OwnerRole

	canPromote := role.CanPromoteToModerator()

	assert.True(t, canPromote)
}

func TestModeratorCanNotPromoteToModerator(t *testing.T) {
	role := ModeratorRole

	canPromote := role.CanPromoteToModerator()

	assert.True(t, canPromote)
}

func TestParticipantCanNotPromoteToModerator(t *testing.T) {
	role := ParticipantRole

	canPromote := role.CanPromoteToModerator()

	assert.False(t, canPromote)
}

func TestOwnerCanDeleteBoard(t *testing.T) {
	role := OwnerRole

	canDelete := role.CanDeleteBoard()

	assert.True(t, canDelete)
}

func TestModeratorCanNotDeleteBoard(t *testing.T) {
	role := ModeratorRole

	canDelete := role.CanDeleteBoard()

	assert.False(t, canDelete)
}

func TestParticipantCanNotDeleteBoard(t *testing.T) {
	role := ParticipantRole

	canDelete := role.CanDeleteBoard()

	assert.False(t, canDelete)
}

func TestOwnerCanChangeNoteText(t *testing.T) {
	role := OwnerRole

	canChange := role.CanChangeNoteText()

	assert.True(t, canChange)
}

func TestModeratorCanChangeNoteText(t *testing.T) {
	role := ModeratorRole

	canChange := role.CanChangeNoteText()

	assert.True(t, canChange)
}

func TestParticipantCanChangeNoteText(t *testing.T) {
	role := ParticipantRole

	canChange := role.CanChangeNoteText()

	assert.False(t, canChange)
}

func TestOwnerCanDeleteNote(t *testing.T) {
	role := OwnerRole

	canDelete := role.CanDeleteNote()

	assert.True(t, canDelete)
}

func TestModeratorCanDeleteNote(t *testing.T) {
	role := ModeratorRole

	canDelete := role.CanDeleteNote()

	assert.True(t, canDelete)
}

func TestParticipantCanDeleteNote(t *testing.T) {
	role := ParticipantRole

	canDelete := role.CanDeleteNote()

	assert.False(t, canDelete)
}

func TestOwnerCanSeeHiddenColumns(t *testing.T) {
	role := OwnerRole

	canSee := role.CanSeeHiddenColumns()

	assert.True(t, canSee)
}

func TestModeratorCanSeeHiddenColumns(t *testing.T) {
	role := ModeratorRole

	canSee := role.CanSeeHiddenColumns()

	assert.True(t, canSee)
}

func TestParticipantCanNotSeeHiddenColumns(t *testing.T) {
	role := ParticipantRole

	canSee := role.CanSeeHiddenColumns()

	assert.False(t, canSee)
}
