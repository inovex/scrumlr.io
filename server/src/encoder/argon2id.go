package encoder

import (
	"crypto/rand"
	"crypto/subtle"
	"encoding/base64"
	"errors"
	"fmt"
	"strings"

	"golang.org/x/crypto/argon2"
)

type argon2IdEncoder struct {
	keyLength   uint32
	saltLength  int
	memory      uint32
	time        uint32
	parallelism uint8
}

func NewArgon2IdEncoder(opts ...Argon2Options) (PasswordEncoder, error) {
	var options argon2Options
	for _, opt := range opts {
		err := opt(&options)
		if err != nil {
			return nil, err
		}
	}

	encoder := new(argon2IdEncoder)
	encoder.keyLength = options.keyLength
	encoder.saltLength = options.saltLength
	encoder.memory = options.memory
	encoder.time = options.time
	encoder.parallelism = options.parallelism

	return encoder, nil
}

func (encoder *argon2IdEncoder) Encode(password string) (*string, *string, error) {
	if password == "" {
		return nil, nil, errors.New("specified string may not be empty")
	}

	salt, err := encoder.generateRandomSalt(encoder.saltLength)
	if err != nil {
		return nil, nil, err
	}

	encodedPassword := argon2.IDKey([]byte(password), salt, encoder.time, encoder.memory, encoder.parallelism, encoder.keyLength)

	encodedKey := base64.RawStdEncoding.EncodeToString(encodedPassword)
	encodedSalt := base64.RawStdEncoding.EncodeToString(salt)

	hash := fmt.Sprintf("$argon2id$v=%d$m=%d,t=%d,p=%d$%s$%s", argon2.Version, encoder.memory, encoder.time, encoder.parallelism, encodedSalt, encodedKey)

	return &hash, &encodedSalt, nil
}

func (encoder *argon2IdEncoder) Matches(password, encodedPassword, salt string) (bool, error) {
	decodedSalt, err := base64.RawStdEncoding.Strict().DecodeString(salt)
	if err != nil {
		return false, err
	}

	givenEncodedPassword := argon2.IDKey([]byte(password), decodedSalt, encoder.time, encoder.memory, encoder.parallelism, encoder.keyLength)

	encodedKey := base64.RawStdEncoding.EncodeToString(givenEncodedPassword)
	hash := fmt.Sprintf("$argon2id$v=%d$m=%d,t=%d,p=%d$%s$%s", argon2.Version, encoder.memory, encoder.time, encoder.parallelism, salt, encodedKey)

	matches := subtle.ConstantTimeCompare([]byte(encodedPassword), []byte(hash)) == 1

	return matches, nil
}

func (encoder *argon2IdEncoder) UpgradeEncoding(encodedPassword string) bool {
	version, memory, time, parallism, saltLength, keylength, err := encoder.getParameters(encodedPassword)
	if err != nil {
		return true
	}

	return version < argon2.Version ||
		time < encoder.time ||
		memory < encoder.memory ||
		parallism < encoder.parallelism ||
		saltLength < encoder.saltLength ||
		keylength < encoder.keyLength
}

func (encoder *argon2IdEncoder) generateRandomSalt(length int) ([]byte, error) {
	secret := make([]byte, length)
	_, err := rand.Read(secret)
	if err != nil {
		return []byte{}, err
	}

	return secret, nil
}

func (encoder *argon2IdEncoder) getParameters(encodedPassword string) (version int, memory uint32, time uint32, parallelism uint8, saltLength int, keyLength uint32, err error) {
	parts := strings.Split(encodedPassword, "$")
	if len(parts) != 6 {
		err = fmt.Errorf("no valid argon2id encoded password")
		return
	}

	algorithm := parts[1]
	if algorithm != "argon2id" {
		err = fmt.Errorf("encoded password is not argon2id")
		return
	}

	_, err = fmt.Sscanf(parts[2], "v=%d", &version)
	if err != nil {
		return
	}

	_, err = fmt.Sscanf(parts[3], "m=%d,t=%d,p=%d", &memory, &time, &parallelism)
	if err != nil {
		return
	}

	salt, err := base64.RawStdEncoding.Strict().DecodeString(parts[4])
	if err != nil {
		return
	}

	saltLength = len(salt)

	key, err := base64.RawStdEncoding.Strict().DecodeString(parts[5])
	if err != nil {
		return
	}

	keyLength = uint32(len(key))

	return
}
