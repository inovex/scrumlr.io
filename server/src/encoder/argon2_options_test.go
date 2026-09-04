package encoder

import (
	"errors"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestArgon2OptionsOWASPRecomended(t *testing.T) {
	var options argon2Options

	argon2Option := WithOWASPRecomended()

	err := argon2Option(&options)

	assert.NoError(t, err)

	assert.Equal(t, uint32(32), options.keyLength)
	assert.Equal(t, 16, options.saltLength)
	assert.Equal(t, uint32(9216), options.memory)
	assert.Equal(t, uint32(4), options.time)
	assert.Equal(t, uint8(1), options.parallelism)
}

func TestArgon2OptionsWithParameters(t *testing.T) {
	var options argon2Options

	argon2Option := WithParameters(32, 16, 65536, 3, 2)

	err := argon2Option(&options)

	assert.NoError(t, err)
	assert.Equal(t, uint32(32), options.keyLength)
	assert.Equal(t, 16, options.saltLength)
	assert.Equal(t, uint32(65536), options.memory)
	assert.Equal(t, uint32(3), options.time)
	assert.Equal(t, uint8(2), options.parallelism)
}

func TestArgon2OptionsWithParametersTimeError(t *testing.T) {
	var options argon2Options

	argon2Option := WithParameters(32, 16, 65536, 0, 2)

	err := argon2Option(&options)

	assert.Error(t, err)
	assert.Equal(t, errors.New("argon2 time parameter to small"), err)
}

func TestArgon2OptionsWithParametersParallelismError(t *testing.T) {
	var options argon2Options

	argon2Option := WithParameters(32, 16, 65536, 3, 0)

	err := argon2Option(&options)

	assert.Error(t, err)
	assert.Equal(t, errors.New("argon2 parallielism to small"), err)
}

func TestArgon2OptionsWithKeyLength(t *testing.T) {
	var options argon2Options

	argon2Option := WithKeyLength(64)

	err := argon2Option(&options)

	assert.NoError(t, err)
	assert.Equal(t, uint32(64), options.keyLength)
}

func TestArgon2OptionsWithSaltLength(t *testing.T) {
	var options argon2Options

	argon2Option := WithSaltLegth(32)

	err := argon2Option(&options)

	assert.NoError(t, err)
	assert.Equal(t, 32, options.saltLength)
}

func TestArgon2OptionsWithMemory(t *testing.T) {
	var options argon2Options

	argon2Option := WithMemory(16384)

	err := argon2Option(&options)

	assert.NoError(t, err)
	assert.Equal(t, uint32(16384), options.memory)
}

func TestArgon2OptionsWithTime(t *testing.T) {
	var options argon2Options

	argon2Option := WithTime(5)

	err := argon2Option(&options)

	assert.NoError(t, err)
	assert.Equal(t, uint32(5), options.time)
}

func TestArgon2OptionsWithTimeError(t *testing.T) {
	var options argon2Options

	argon2Option := WithTime(0)

	err := argon2Option(&options)

	assert.Error(t, err)
	assert.Equal(t, errors.New("argon2 time parameter to small"), err)
}

func TestArgon2OptionsWithParallelism(t *testing.T) {
	var options argon2Options

	argon2Option := WithParallelism(4)

	err := argon2Option(&options)

	assert.NoError(t, err)
	assert.Equal(t, uint8(4), options.parallelism)
}

func TestArgon2OptionsWithParallelismError(t *testing.T) {
	var options argon2Options

	argon2Option := WithParallelism(0)

	err := argon2Option(&options)

	assert.Error(t, err)
	assert.Equal(t, errors.New("argon2 parallielism to small"), err)
}
