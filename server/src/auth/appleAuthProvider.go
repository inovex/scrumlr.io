package auth

import (
	"context"
	"crypto/ecdsa"
	"crypto/x509"
	"encoding/pem"
	"errors"
	"fmt"
	"strings"
	"sync"
	"time"

	"github.com/coreos/go-oidc/v3/oidc"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/oauth2"
	"scrumlr.io/server/account"
	"scrumlr.io/server/logger"
	"scrumlr.io/server/timeprovider"
)

const appleIssuerUrl = "https://appleid.apple.com"

type AppleAuthProvider struct {
	provider *oidc.Provider
	verifier *oidc.IDTokenVerifier
	config   oauth2.Config
	clock    timeprovider.TimeProvider

	clientSecretMux sync.RWMutex
	clientId        string
	keyId           string
	teamId          string
	privateKey      *ecdsa.PrivateKey
	expiresAt       time.Time
}

func newAppleAuthProvider(ctx context.Context, clock timeprovider.TimeProvider, clientId string, keyId string, teamId string, privateKey string, redirectUrl string, scopes ...string) (*AppleAuthProvider, error) {
	appleProvider := new(AppleAuthProvider)
	appleProvider.clock = clock

	provider, err := oidc.NewProvider(ctx, appleIssuerUrl)
	if err != nil {
		return nil, err
	}

	appleProvider.clientId = clientId
	appleProvider.teamId = teamId
	appleProvider.keyId = keyId

	key, err := appleProvider.parsePrivateKey(privateKey)
	if err != nil {
		return nil, err
	}

	appleProvider.privateKey = key

	clientSecret, expiresAt, err := appleProvider.createClientSecret()
	if err != nil {
		return nil, fmt.Errorf("failed to create apple client secret: %w", err)
	}

	appleProvider.expiresAt = expiresAt

	appleProvider.provider = provider
	appleProvider.verifier = provider.Verifier(&oidc.Config{ClientID: clientId})
	appleProvider.config = oauth2.Config{
		ClientID:     clientId,
		ClientSecret: clientSecret,
		Endpoint:     provider.Endpoint(),
		RedirectURL:  redirectUrl,
		Scopes:       scopes,
	}
	appleProvider.config.Endpoint.AuthStyle = oauth2.AuthStyleInParams

	return appleProvider, nil
}

func (provider *AppleAuthProvider) AuthUrl(state string) string {
	return provider.config.AuthCodeURL(state, oauth2.SetAuthURLParam("response_mode", "form_post"))
}

func (provider *AppleAuthProvider) Authenticate(ctx context.Context, code string) (*UserInformation, error) {
	err := provider.updateClientSecret()
	if err != nil {
		return nil, fmt.Errorf("failed to update client secret: %w", err)
	}

	oauth2Token, err := provider.config.Exchange(ctx, code)
	if err != nil {
		return nil, fmt.Errorf("failed to exchange token: %w", err)
	}

	rawIdToken, ok := oauth2Token.Extra("id_token").(string)
	if !ok {
		return nil, errors.New("failed to get id token")
	}

	logger.Get().Debugf("oauth token: %+v", oauth2Token)
	logger.Get().Debugf("id token: %s", rawIdToken)

	idToken, err := provider.verifier.Verify(ctx, rawIdToken)
	if err != nil {
		return nil, fmt.Errorf("failed to verify id token: %w", err)
	}

	var claims struct {
		Email string `json:"email"`
	}

	err = idToken.Claims(&claims)
	if err != nil {
		return nil, fmt.Errorf("failed to extract user claims: %w", err)
	}

	userInfo := UserInformation{
		Provider: account.Apple,
		Ident:    idToken.Subject,
	}

	if userInfo.Ident == "" {
		return nil, errors.New("failed to extract user identifier")
	}

	return &userInfo, nil
}

// The client secret must be a signed jwt
// https://developer.apple.com/documentation/accountorganizationaldatasharing/creating-a-client-secret
func (provider *AppleAuthProvider) createClientSecret() (string, time.Time, error) {
	now := provider.clock.Now()
	expiresAt := now.Add(time.Hour * 24)

	token := jwt.NewWithClaims(jwt.SigningMethodES256, jwt.MapClaims{
		"iss": provider.teamId,
		"iat": now.Unix(),
		"exp": now.Add(time.Hour * 24).Unix(),
		"aud": appleIssuerUrl,
		"sub": provider.clientId,
	})
	token.Header["kid"] = provider.keyId

	secret, err := token.SignedString(provider.privateKey)
	if err != nil {
		return "", time.Now(), fmt.Errorf("failed to sign apple secret: %w", err)
	}

	return secret, expiresAt, nil
}

func (provider *AppleAuthProvider) updateClientSecret() error {
	now := provider.clock.Now()

	provider.clientSecretMux.RLock()
	needsRefesh := now.Add(time.Hour).After(provider.expiresAt)
	provider.clientSecretMux.RUnlock()

	if !needsRefesh {
		return nil
	}

	provider.clientSecretMux.Lock()
	defer provider.clientSecretMux.Unlock()

	secret, expiresAt, err := provider.createClientSecret()
	if err != nil {
		return err
	}

	provider.config.ClientSecret = secret
	provider.expiresAt = expiresAt

	return nil
}

func (provider *AppleAuthProvider) parsePrivateKey(privateKey string) (*ecdsa.PrivateKey, error) {
	block, rest := pem.Decode([]byte(strings.TrimSpace(strings.ReplaceAll(privateKey, "\\n", "\n"))))
	if block == nil || len(rest) > 0 {
		return nil, errors.New("invalide private key")
	}

	key, err := x509.ParsePKCS8PrivateKey(block.Bytes)
	if err != nil {
		return nil, fmt.Errorf("failed to parse private key %w", err)
	}

	ecdsaKey, ok := key.(*ecdsa.PrivateKey)
	if !ok {
		return nil, errors.New("no valid ecdas key provided")
	}

	return ecdsaKey, nil
}
