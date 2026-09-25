package encoder

import (
	"errors"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestSha512EncoderEncode(t *testing.T) {
	encoder := NewSha512Encoder()
	password := "SuperStrongPassword"

	pass, salt, err := encoder.Encode(password)

	assert.Nil(t, err)
	assert.NotNil(t, pass)
	assert.NotNil(t, salt)
}

func TestSha512EncoderEncodeEmptyPassword(t *testing.T) {
	encoder := NewSha512Encoder()
	password := ""

	pass, salt, err := encoder.Encode(password)

	assert.NotNil(t, err)
	assert.Equal(t, errors.New("specified string may not be empty"), err)
	assert.Nil(t, pass)
	assert.Nil(t, salt)
}

func TestSha512EncoderMatch(t *testing.T) {
	encoder := NewSha512Encoder()
	password := "SuperStrongPassword"

	pass, salt, err := encoder.Encode(password)
	assert.NoError(t, err)
	assert.NotNil(t, pass)
	assert.NotNil(t, salt)

	match, err := encoder.Matches(password, *pass, *salt)

	assert.NoError(t, err)
	assert.True(t, match)
}

func TestSha512EncoderDoNotMatch(t *testing.T) {
	encoder := NewSha512Encoder()
	password := "SuperStrongPassword"

	pass, salt, err := encoder.Encode(password)
	assert.NoError(t, err)
	assert.NotNil(t, pass)
	assert.NotNil(t, salt)

	match, err := encoder.Matches("ThisIsAlsoASuperSecretPassword", *pass, *salt)

	assert.NoError(t, err)
	assert.False(t, match)
}

func TestSha512EncoderUpgradeEncoding(t *testing.T) {
	encoder := NewSha512Encoder()
	password := "SuperStrongPassword"

	pass, _, err := encoder.Encode(password)
	assert.NoError(t, err)

	upgrade := encoder.UpgradeEncoding(*pass)

	assert.True(t, upgrade)
}
