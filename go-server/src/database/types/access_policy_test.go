package types

import (
	"fmt"
	"github.com/stretchr/testify/assert"
	"testing"
)

func TestAccessPolicyEnum(t *testing.T) {
	values := []AccessPolicy{AccessPolicyPublic, AccessPolicyByPassphrase, AccessPolicyByInvite}
	for _, value := range values {
		var accessPolicy AccessPolicy
		err := accessPolicy.UnmarshalJSON([]byte(fmt.Sprintf("\"%s\"", value)))
		assert.Nil(t, err)
		assert.Equal(t, value, accessPolicy)
	}
}

func TestUnmarshalAccessPolicyNil(t *testing.T) {
	var accessPolicy AccessPolicy
	err := accessPolicy.UnmarshalJSON(nil)
	assert.NotNil(t, err)
}

func TestUnmarshalAccessPolicyEmptyString(t *testing.T) {
	var accessPolicy AccessPolicy
	err := accessPolicy.UnmarshalJSON([]byte(""))
	assert.NotNil(t, err)
}

func TestUnmarshalAccessPolicyEmptyStringWithQuotation(t *testing.T) {
	var accessPolicy AccessPolicy
	err := accessPolicy.UnmarshalJSON([]byte("\"\""))
	assert.NotNil(t, err)
}

func TestUnmarshalAccessPolicyRandomValue(t *testing.T) {
	var accessPolicy AccessPolicy
	err := accessPolicy.UnmarshalJSON([]byte("\"SOME_RANDOM_VALUE\""))
	assert.NotNil(t, err)
}
