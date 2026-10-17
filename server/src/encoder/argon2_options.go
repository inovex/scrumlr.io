package encoder

import "errors"

type argon2Options struct {
	keyLength   uint32
	saltLength  int
	memory      uint32
	time        uint32
	parallelism uint8
}

type Argon2Options func(options *argon2Options) error

// Sets the argon2 parameter to the recomendedsettings from OWASP from 2026
// For more information see https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html#password-hashing-algorithms
func WithOWASPRecomended() Argon2Options {
	return func(options *argon2Options) error {
		options.keyLength = 32
		options.saltLength = 16
		options.memory = 9216
		options.time = 4
		options.parallelism = 1
		return nil
	}
}

func WithParameters(keyLength uint32, saltLength int, memory uint32, time uint32, parallelism uint8) Argon2Options {
	return func(options *argon2Options) error {
		options.keyLength = keyLength
		options.saltLength = saltLength
		options.memory = memory

		if time < 1 {
			return errors.New("argon2 time parameter to small")
		}
		options.time = time

		if parallelism < 1 {
			return errors.New("argon2 parallielism to small")
		}
		options.parallelism = parallelism
		return nil
	}
}

func WithKeyLength(keyLength uint32) Argon2Options {
	return func(options *argon2Options) error {
		options.keyLength = keyLength
		return nil
	}
}

func WithSaltLegth(saltLength int) Argon2Options {
	return func(options *argon2Options) error {
		options.saltLength = saltLength
		return nil
	}
}

func WithMemory(memory uint32) Argon2Options {
	return func(options *argon2Options) error {
		options.memory = memory
		return nil
	}
}

func WithTime(time uint32) Argon2Options {
	return func(options *argon2Options) error {
		if time < 1 {
			return errors.New("argon2 time parameter to small")
		}

		options.time = time
		return nil
	}
}

func WithParallelism(parallelism uint8) Argon2Options {
	return func(options *argon2Options) error {
		if parallelism < 1 {
			return errors.New("argon2 parallielism to small")
		}

		options.parallelism = parallelism
		return nil
	}
}
