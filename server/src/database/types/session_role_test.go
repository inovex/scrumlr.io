package types

import (
	"fmt"
	"github.com/stretchr/testify/assert"
	"testing"
)

func TestSessionRoleEnum(t *testing.T) {
	values := []SessionRole{SessionRoleParticipant, SessionRoleModerator, SessionRoleOwner}
	for _, value := range values {
		var sessionRole SessionRole
		err := sessionRole.UnmarshalJSON([]byte(fmt.Sprintf("\"%s\"", value)))
		assert.Nil(t, err)
		assert.Equal(t, value, sessionRole)
	}
}

func TestUnmarshalSessionRoleNil(t *testing.T) {
	var sessionRole SessionRole
	err := sessionRole.UnmarshalJSON(nil)
	assert.NotNil(t, err)
}

func TestUnmarshalSessionRoleEmptyString(t *testing.T) {
	var sessionRole SessionRole
	err := sessionRole.UnmarshalJSON([]byte(""))
	assert.NotNil(t, err)
}

func TestUnmarshalSessionRoleEmptyStringWithQuotation(t *testing.T) {
	var sessionRole SessionRole
	err := sessionRole.UnmarshalJSON([]byte("\"\""))
	assert.NotNil(t, err)
}

func TestUnmarshalSessionRoleRandomValue(t *testing.T) {
	var sessionRole SessionRole
	err := sessionRole.UnmarshalJSON([]byte("\"SOME_RANDOM_VALUE\""))
	assert.NotNil(t, err)
}
