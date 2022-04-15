package common

import (
	"crypto/sha512"
	"encoding/base64"
	"errors"
	"fmt"
	"math/rand"
	"time"
)

const CHARSET = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

func RandomString(length int) string {
	seededRand := rand.New(rand.NewSource(time.Now().UnixNano()))
	b := make([]byte, length)
	for i := range b {
		b[i] = CHARSET[seededRand.Intn(len(CHARSET))]
	}
	return string(b)
}

func Sha512WithSalt(passphrase string) (*string, *string, error) {
	if passphrase == "" {
		return nil, nil, errors.New("specified string may not be empty")
	}

	salt := RandomString(16)
	encodedPassphrase := Sha512BySalt(passphrase, salt)

	return &encodedPassphrase, &salt, nil
}

func Sha512BySalt(passphrase string, salt string) string {
	saltedPassphrase := fmt.Sprintf("%s:%s", passphrase, salt)

	algorithm := sha512.New()
	algorithm.Write([]byte(saltedPassphrase))
	encodedPassphrase := base64.URLEncoding.EncodeToString(algorithm.Sum(nil))

	return encodedPassphrase
}
