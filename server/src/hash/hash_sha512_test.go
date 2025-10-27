package hash

import (
	"crypto/sha512"
	"encoding/base64"
	"errors"
	"fmt"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestHashWithSalt(t *testing.T) {
	hashFunc := NewHashSha512()
	passphrase := "SuperStrongPassword"

	pass, salt, err := hashFunc.HashWithSalt(passphrase)

	assert.Nil(t, err)
	assert.NotNil(t, pass)
	assert.NotNil(t, salt)
}

func TestHashWithSaltEmptyPassphrase(t *testing.T) {
	hashFunc := NewHashSha512()
	passphrase := ""

	pass, salt, err := hashFunc.HashWithSalt(passphrase)

	assert.NotNil(t, err)
	assert.Equal(t, errors.New("specified string may not be empty"), err)
	assert.Nil(t, pass)
	assert.Nil(t, salt)
}

func TestHashBySalt(t *testing.T) {
	hashFunc := NewHashSha512()
	passphrase := "SuperStrongPassword"
	salt := "Salt"
	combined := fmt.Sprintf("%s:%s", passphrase, salt)

	algorithm := sha512.New()
	algorithm.Write([]byte(combined))
	encoded := base64.URLEncoding.EncodeToString(algorithm.Sum(nil))

	pass := hashFunc.HashBySalt(passphrase, salt)

	assert.NotNil(t, pass)
	assert.Equal(t, encoded, pass)
}
