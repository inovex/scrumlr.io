package encoder

import (
	"encoding/base64"
	"errors"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestArgon2IdencoderEncode(t *testing.T) {
	encoder, err := NewArgon2IdEncoder(WithOWASPRecomended())
	assert.NoError(t, err)

	password := "SuperStrongPassword"

	pass, salt, err := encoder.Encode(password)

	assert.Nil(t, err)
	assert.NotNil(t, pass)
	assert.NotNil(t, salt)
}

func TestArgon2IdEncoderEncodeEmptyPassword(t *testing.T) {
	encoder, err := NewArgon2IdEncoder(WithOWASPRecomended())
	assert.NoError(t, err)

	password := ""

	pass, salt, err := encoder.Encode(password)

	assert.NotNil(t, err)
	assert.Equal(t, errors.New("specified string may not be empty"), err)
	assert.Nil(t, pass)
	assert.Nil(t, salt)
}

func TestArgon2IdEncoderMatch(t *testing.T) {
	encoder, err := NewArgon2IdEncoder(WithOWASPRecomended())
	assert.NoError(t, err)

	password := "SuperStrongPassword"

	pass, salt, err := encoder.Encode(password)
	assert.NoError(t, err)
	assert.NotNil(t, pass)
	assert.NotNil(t, salt)

	match, err := encoder.Matches(password, *pass, *salt)

	assert.NoError(t, err)
	assert.True(t, match)
}

func TestArgon2IdEncoderDoNotMatch(t *testing.T) {
	encoder, err := NewArgon2IdEncoder(WithOWASPRecomended())
	assert.NoError(t, err)

	password := "SuperStrongPassword"

	pass, salt, err := encoder.Encode(password)
	assert.NoError(t, err)
	assert.NotNil(t, pass)
	assert.NotNil(t, salt)

	match, err := encoder.Matches("ThisIsAlsoASuperStrongPassword123", *pass, *salt)

	assert.NoError(t, err)
	assert.False(t, match)
}

func TestArgon2IdEncoderMatchInvalidSalt(t *testing.T) {
	encoder, err := NewArgon2IdEncoder(WithOWASPRecomended())
	assert.NoError(t, err)

	password := "SuperStrongPassword"

	pass, salt, err := encoder.Encode(password)
	assert.NoError(t, err)
	assert.NotNil(t, pass)
	assert.NotNil(t, salt)

	match, err := encoder.Matches(password, *pass, "ThisIsNotBase64Encoded")

	assert.Error(t, err)
	assert.False(t, match)
}

func TestArgon2IdEncoderMatchWrongSalt(t *testing.T) {
	encoder, err := NewArgon2IdEncoder(WithOWASPRecomended())
	assert.NoError(t, err)

	password := "SuperStrongPassword"
	wrongSalt := base64.RawStdEncoding.EncodeToString([]byte("ThisIsNottThesaltYouAreLookingFor"))

	pass, salt, err := encoder.Encode(password)
	assert.NoError(t, err)
	assert.NotNil(t, pass)
	assert.NotNil(t, salt)

	match, err := encoder.Matches(password, *pass, wrongSalt)

	assert.NoError(t, err)
	assert.False(t, match)
}

func TestArgon2IdEncoderUpgradeEncoding(t *testing.T) {
	encoder, err := NewArgon2IdEncoder(WithOWASPRecomended())
	assert.NoError(t, err)

	password := "SuperStrongPassword"

	pass, _, err := encoder.Encode(password)
	assert.NoError(t, err)
	assert.NotNil(t, pass)

	encoder, err = NewArgon2IdEncoder(WithOWASPRecomended(), WithParallelism(2))

	upgrade := encoder.UpgradeEncoding(*pass)

	assert.True(t, upgrade)
}

func TestArgon2IdEncoderNoUpgradeNeeded(t *testing.T) {
	encoder, err := NewArgon2IdEncoder(WithOWASPRecomended())
	assert.NoError(t, err)

	password := "SuperStrongPassword"

	pass, _, err := encoder.Encode(password)
	assert.NoError(t, err)
	assert.NotNil(t, pass)

	upgrade := encoder.UpgradeEncoding(*pass)

	assert.False(t, upgrade)
}
