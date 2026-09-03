package encoder

import (
	"fmt"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestDelegatingPasswordEncoderEncode(t *testing.T) {
	password := "SuperStrongPassword"
	salt := "pepper"

	noopEncoder := NewMockPasswordEncoder(t)
	noopEncoder.EXPECT().Encode(password).Return(&password, &salt, nil)

	passwordEncoder, err := NewDelegatingPasswordEncoder("noop", WithPasswordEncoder("noop", noopEncoder))
	assert.NoError(t, err)

	encodedPassword, retrievedSalt, err := passwordEncoder.Encode(password)
	assert.NoError(t, err)
	assert.Equal(t, fmt.Sprintf("{noop}%s", password), *encodedPassword)
	assert.Equal(t, salt, *retrievedSalt)
}

func TestDelegatingPasswordEncoderMatch(t *testing.T) {
	password := "SuperStrongPassword"
	encodedPassword := fmt.Sprintf("{noop}%s", password)
	salt := "pepper"

	noopEncoder := NewMockPasswordEncoder(t)
	noopEncoder.EXPECT().Matches(password, password, salt).Return(true, nil)

	passwordEncoder, err := NewDelegatingPasswordEncoder("noop", WithPasswordEncoder("noop", noopEncoder))
	assert.NoError(t, err)

	matches, err := passwordEncoder.Matches(password, encodedPassword, salt)

	assert.NoError(t, err)
	assert.True(t, matches)
}

func TestDelegatingPasswordencoderUpgradeNewEncoder(t *testing.T) {
	encodedPassword := "{noop}SuperStrongPassword"

	noopEncoder := NewMockPasswordEncoder(t)
	shaEncoder := NewMockPasswordEncoder(t)

	passwordEncoder, err := NewDelegatingPasswordEncoder("sha", WithPasswordEncoder("noop", noopEncoder), WithPasswordEncoder("sha", shaEncoder))
	assert.NoError(t, err)

	upgrade := passwordEncoder.UpgradeEncoding(encodedPassword)

	assert.True(t, upgrade)
}

func TestDelegatingPasswordencoderUpgradeEncoderUpgrade(t *testing.T) {
	password := "SuperStrongPassword"
	encodedPassword := fmt.Sprintf("{noop}%s", password)

	noopEncoder := NewMockPasswordEncoder(t)
	noopEncoder.EXPECT().UpgradeEncoding(password).Return(true)

	passwordEncoder, err := NewDelegatingPasswordEncoder("noop", WithPasswordEncoder("noop", noopEncoder))
	assert.NoError(t, err)

	upgrade := passwordEncoder.UpgradeEncoding(encodedPassword)

	assert.True(t, upgrade)
}

func TestDelegatingPasswordencoderUpgradeEncoderNotFound(t *testing.T) {
	encodedPassword := "{sha}SuperStrongPassword"

	noopEncoder := NewMockPasswordEncoder(t)

	passwordEncoder, err := NewDelegatingPasswordEncoder("noop", WithPasswordEncoder("noop", noopEncoder))
	assert.NoError(t, err)

	upgrade := passwordEncoder.UpgradeEncoding(encodedPassword)

	assert.True(t, upgrade)
}

func TestDelegatingPasswordEncoderExtractIdAndHash(t *testing.T) {
	password := "SuperStrongPassword"
	encodedPassword := fmt.Sprintf("{noop}%s", password)

	noopEncoder := NewMockPasswordEncoder(t)

	passwordEncoder, err := NewDelegatingPasswordEncoder("noop", WithPasswordEncoder("noop", noopEncoder))
	assert.NoError(t, err)
	encoder := passwordEncoder.(*delegatingPasswordEncoder)

	id, hash := encoder.extractIdAndHash(encodedPassword)

	assert.Equal(t, "noop", id)
	assert.Equal(t, password, hash)
}

func TestDelegatingPasswordEncoderExtractIdAndHashWithoutId(t *testing.T) {
	password := "SuperStrongPassword"
	encodedPassword := fmt.Sprintf("%s", password)

	noopEncoder := NewMockPasswordEncoder(t)

	passwordEncoder, err := NewDelegatingPasswordEncoder("noop", WithPasswordEncoder("noop", noopEncoder))
	assert.NoError(t, err)
	encoder := passwordEncoder.(*delegatingPasswordEncoder)

	id, hash := encoder.extractIdAndHash(encodedPassword)

	assert.Equal(t, "", id)
	assert.Equal(t, password, hash)
}

func TestDelegatingPasswordEncoderExtractIdAndHashEmptyId(t *testing.T) {
	password := "SuperStrongPassword"
	encodedPassword := fmt.Sprintf("{}%s", password)

	noopEncoder := NewMockPasswordEncoder(t)

	passwordEncoder, err := NewDelegatingPasswordEncoder("noop", WithPasswordEncoder("noop", noopEncoder))
	assert.NoError(t, err)
	encoder := passwordEncoder.(*delegatingPasswordEncoder)

	id, hash := encoder.extractIdAndHash(encodedPassword)

	assert.Equal(t, "", id)
	assert.Equal(t, password, hash)
}

func TestDelegatingPasswordEncoderExtractIdAndHashEmptyHash(t *testing.T) {
	password := ""
	encodedPassword := fmt.Sprintf("{noop}%s", password)

	noopEncoder := NewMockPasswordEncoder(t)

	passwordEncoder, err := NewDelegatingPasswordEncoder("noop", WithPasswordEncoder("noop", noopEncoder))
	assert.NoError(t, err)
	encoder := passwordEncoder.(*delegatingPasswordEncoder)

	id, hash := encoder.extractIdAndHash(encodedPassword)

	assert.Equal(t, "noop", id)
	assert.Equal(t, password, hash)
}

func TestDelegatingPasswordEncoderExtractIdAndHashEmptyHashIncompleteId(t *testing.T) {
	password := ""
	encodedPassword := fmt.Sprintf("{noop%s", password)

	noopEncoder := NewMockPasswordEncoder(t)

	passwordEncoder, err := NewDelegatingPasswordEncoder("noop", WithPasswordEncoder("noop", noopEncoder))
	assert.NoError(t, err)
	encoder := passwordEncoder.(*delegatingPasswordEncoder)

	id, hash := encoder.extractIdAndHash(encodedPassword)

	assert.Equal(t, "", id)
	assert.Equal(t, fmt.Sprintf("{noop%s", password), hash)
}
