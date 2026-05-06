package auth

import (
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"errors"
	"strings"
)

func GenerateState(redirectURL, sessionSecret string) (string, error) {
	nonce := make([]byte, 16)
	if _, err := rand.Read(nonce); err != nil {
		return "", errors.New("failed to generate state nonce")
	}

	payload := base64.RawURLEncoding.EncodeToString(nonce)
	if redirectURL != "" {
		payload += "__" + redirectURL
	}

	mac := hmac.New(sha256.New, []byte(sessionSecret))
	mac.Write([]byte(payload))
	sig := base64.RawURLEncoding.EncodeToString(mac.Sum(nil))

	return payload + "." + sig, nil
}

func VerifyState(state, sessionSecret string) (redirectURL string, err error) {
	lastDot := strings.LastIndex(state, ".")
	if lastDot < 0 {
		return "", errors.New("malformed state: missing signature separator")
	}

	payload := state[:lastDot]
	sig := state[lastDot+1:]

	mac := hmac.New(sha256.New, []byte(sessionSecret))
	mac.Write([]byte(payload))
	expected := base64.RawURLEncoding.EncodeToString(mac.Sum(nil))

	if !hmac.Equal([]byte(sig), []byte(expected)) {
		return "", errors.New("invalid state signature")
	}

	parts := strings.SplitN(payload, "__", 2)
	if len(parts) > 1 {
		redirectURL = parts[1]
	}

	return redirectURL, nil
}
