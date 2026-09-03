package encoder

import (
	"fmt"
	"strings"
)

const (
	idPrefix = "{"
	idSuffix = "}"
)

type delegatingPasswordEncoder struct {
	encoderId string
	encoders  map[string]PasswordEncoder
}

func NewDelegatingPasswordEncoder(encoderId string, opts ...DelegatingOption) (PasswordEncoder, error) {
	var options delegatingOptions
	for _, opt := range opts {
		err := opt(&options)
		if err != nil {
			return nil, err
		}
	}

	encoder := new(delegatingPasswordEncoder)
	encoder.encoders = options.encoders

	_, ok := encoder.encoders[encoderId]
	if !ok {
		return nil, fmt.Errorf("encoder with id %s is not configured", encoderId)
	}
	encoder.encoderId = encoderId

	return encoder, nil
}

func (d *delegatingPasswordEncoder) Encode(password string) (*string, *string, error) {
	encoder, ok := d.encoders[d.encoderId]
	if !ok {
		return nil, nil, fmt.Errorf("encoder with id %s is not configured", d.encoderId)
	}
	encodedPassword, salt, err := encoder.Encode(password)
	if err != nil {
		return nil, nil, err
	}

	prefixedPassword := fmt.Sprintf("%s%s%s%s", idPrefix, d.encoderId, idSuffix, *encodedPassword)
	return &prefixedPassword, salt, err
}

func (d *delegatingPasswordEncoder) Matches(password, encodedPassword, salt string) (bool, error) {
	id, hash := d.extractIdAndHash(encodedPassword)
	encoder, ok := d.encoders[id]
	if !ok {
		return false, fmt.Errorf("encoder for id %s not configured", id)
	}

	matches, err := encoder.Matches(password, hash, salt)

	return matches, err
}

func (d *delegatingPasswordEncoder) UpgradeEncoding(encodedPassword string) bool {
	id, hash := d.extractIdAndHash(encodedPassword)
	if id != d.encoderId {
		return true
	}

	encoder, ok := d.encoders[id]
	if !ok {
		return true
	}

	return encoder.UpgradeEncoding(hash)
}

func (d *delegatingPasswordEncoder) extractIdAndHash(encodedPassword string) (string, string) {
	if !strings.HasPrefix(encodedPassword, idPrefix) {
		return "", encodedPassword
	}

	idEndIndex := strings.Index(encodedPassword, idSuffix)
	if idEndIndex == -1 {
		return "", encodedPassword
	}

	id := encodedPassword[len(idPrefix):idEndIndex]
	hash := encodedPassword[idEndIndex+len(idSuffix):]

	return id, hash
}
