package encoder

import (
	"crypto/sha512"
	"crypto/subtle"
	"encoding/base64"
	"errors"
	"fmt"
	"math/rand"
	"time"
)

const CHARSET = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

type sha512Encoder struct{}

func NewSha512Encoder() PasswordEncoder {
	encoder := new(sha512Encoder)

	return encoder
}

func (encoder *sha512Encoder) Encode(password string) (*string, *string, error) {
	if password == "" {
		return nil, nil, errors.New("specified string may not be empty")
	}

	salt := encoder.generateRandomSalt(16)
	saltedPassword := fmt.Sprintf("%s:%s", password, salt)

	algorithm := sha512.New()
	algorithm.Write([]byte(saltedPassword))
	encodedPassword := base64.URLEncoding.EncodeToString(algorithm.Sum(nil))

	return &encodedPassword, &salt, nil
}

func (encoder *sha512Encoder) Matches(password, encodedPassword, salt string) (bool, error) {
	saltedPassword := fmt.Sprintf("%s:%s", password, salt)

	algorithm := sha512.New()
	algorithm.Write([]byte(saltedPassword))
	givenEncodedPassword := base64.URLEncoding.EncodeToString(algorithm.Sum(nil))

	matches := subtle.ConstantTimeCompare([]byte(encodedPassword), []byte(givenEncodedPassword)) == 1

	return matches, nil
}

func (encoder *sha512Encoder) UpgradeEncoding(encodedPassword string) bool {
	return true
}

func (encoder *sha512Encoder) generateRandomSalt(length int) string {
	seededRand := rand.New(rand.NewSource(time.Now().UnixNano()))
	b := make([]byte, length)
	for i := range b {
		b[i] = CHARSET[seededRand.Intn(len(CHARSET))]
	}
	return string(b)
}
