package encoder

import (
	"fmt"
)

type delegatingOptions struct {
	encoders map[string]PasswordEncoder
}

type DelegatingOption func(options *delegatingOptions) error

func WithPasswordEncoder(id string, encoder PasswordEncoder) DelegatingOption {
	return func(options *delegatingOptions) error {
		if len(options.encoders) == 0 {
			options.encoders = make(map[string]PasswordEncoder)
		}

		_, ok := options.encoders[id]
		if ok {
			return fmt.Errorf("encoder with id %s already exists", id)
		}

		options.encoders[id] = encoder
		return nil
	}
}
