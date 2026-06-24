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

func TestOwnerCanPromoteToOwner(t *testing.T) {
	role := OwnerRole

	canPromote := CanPromoteToOwner(role)

	assert.True(t, canPromote)
}

func TestModeratorCanNotPromoteToOwner(t *testing.T) {
	role := ModeratorRole

	canPromote := CanPromoteToOwner(role)

	assert.False(t, canPromote)
}

func TestParticipantCanNotPromoteToOwner(t *testing.T) {
	role := ParticipantRole

	canPromote := CanPromoteToOwner(role)

	assert.False(t, canPromote)
}

func TestOwnerCanPromoteToModerator(t *testing.T) {
	role := OwnerRole

	canPromote := CanPromoteToModerator(role)

	assert.True(t, canPromote)
}

func TestModeratorCanNotPromoteToModerator(t *testing.T) {
	role := ModeratorRole

	canPromote := CanPromoteToModerator(role)

	assert.True(t, canPromote)
}

func TestParticipantCanNotPromoteToModerator(t *testing.T) {
	role := ParticipantRole

	canPromote := CanPromoteToModerator(role)

	assert.False(t, canPromote)
}
