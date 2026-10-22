package encoder

import (
	"fmt"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestWithPasswordEncoder(t *testing.T) {
	var options delegatingOptions

	encoder := NewSha512Encoder()
	id := "sha512"

	encoderOption := WithPasswordEncoder(id, encoder)

	err := encoderOption(&options)

	assert.NoError(t, err)
	assert.Len(t, options.encoders, 1)
}

func TestWithDuplicatePasswordEncoder(t *testing.T) {
	var options delegatingOptions

	encoder := NewSha512Encoder()
	id := "sha512"

	encoderOption := WithPasswordEncoder(id, encoder)

	err := encoderOption(&options)
	assert.NoError(t, err)
	assert.Len(t, options.encoders, 1)

	err = encoderOption(&options)
	assert.Error(t, err)
	assert.Equal(t, fmt.Errorf("encoder with id %s already exists", id), err)
}
