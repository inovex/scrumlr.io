package types

import (
	"fmt"
	"github.com/stretchr/testify/assert"
	"testing"
)

func TestAccountTypeEnum(t *testing.T) {
	values := []AccountType{AccountTypeAnonymous, AccountTypeGoogle, AccountTypeGitHub, AccountTypeMicrosoft, AccountTypeApple}
	for _, value := range values {
		var accountType AccountType
		err := accountType.UnmarshalJSON([]byte(fmt.Sprintf("\"%s\"", value)))
		assert.Nil(t, err)
		assert.Equal(t, value, accountType)
	}
}

func TestUnmarshalAccountTypeNil(t *testing.T) {
	var accountType AccountType
	err := accountType.UnmarshalJSON(nil)
	assert.NotNil(t, err)
}

func TestUnmarshalAccountTypeEmptyString(t *testing.T) {
	var accountType AccountType
	err := accountType.UnmarshalJSON([]byte(""))
	assert.NotNil(t, err)
}

func TestUnmarshalAccountTypeEmptyStringWithQuotation(t *testing.T) {
	var accountType AccountType
	err := accountType.UnmarshalJSON([]byte("\"\""))
	assert.NotNil(t, err)
}

func TestUnmarshalAccountTypeRandomValue(t *testing.T) {
	var accountType AccountType
	err := accountType.UnmarshalJSON([]byte("\"SOME_RANDOM_VALUE\""))
	assert.NotNil(t, err)
}
