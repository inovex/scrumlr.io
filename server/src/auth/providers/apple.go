package providers

import (
	"context"
	"crypto/ecdsa"
	"crypto/x509"
	"encoding/json"
	"encoding/pem"
	"fmt"
	"net/http"
	"strings"
	"time"

	gooidc "github.com/coreos/go-oidc/v3/oidc"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/oauth2"
)

type appleProvider struct {
	clientID    string
	teamID      string
	keyID       string
	privateKey  *ecdsa.PrivateKey
	redirectURI string
	oauth2Cfg   oauth2.Config
	verifier    *gooidc.IDTokenVerifier
}

func NewAppleProvider(clientID, teamID, keyID, privateKeyPEM, redirectURI string) (Provider, error) {
	ctx := context.Background()
	oidcProvider, err := gooidc.NewProvider(ctx, "https://appleid.apple.com")
	if err != nil {
		return nil, fmt.Errorf("Apple OIDC discovery failed: %w", err)
	}

	privateKey, err := parseEC8PrivateKey(privateKeyPEM)
	if err != nil {
		return nil, fmt.Errorf("failed to parse Apple private key: %w", err)
	}

	return &appleProvider{
		clientID:    clientID,
		teamID:      teamID,
		keyID:       keyID,
		privateKey:  privateKey,
		redirectURI: redirectURI,
		oauth2Cfg: oauth2.Config{
			ClientID:    clientID,
			RedirectURL: redirectURI,
			Endpoint:    oidcProvider.Endpoint(),
			Scopes:      []string{gooidc.ScopeOpenID, "name"},
		},
		verifier: oidcProvider.Verifier(&gooidc.Config{ClientID: clientID}),
	}, nil
}

func (p *appleProvider) Name() string { return "apple" }

func (p *appleProvider) AuthURL(_ http.ResponseWriter, _ *http.Request, state string) (string, error) {
	return p.oauth2Cfg.AuthCodeURL(state,
		oauth2.SetAuthURLParam("response_mode", "form_post"),
	), nil
}

func (p *appleProvider) Exchange(ctx context.Context, r *http.Request) (*UserInfo, error) {
	if err := r.ParseForm(); err != nil {
		return nil, fmt.Errorf("failed to parse Apple callback form: %w", err)
	}

	code := r.FormValue("code")
	if code == "" {
		return nil, fmt.Errorf("no authorization code in Apple callback")
	}

	clientSecret, err := p.generateClientSecret()
	if err != nil {
		return nil, fmt.Errorf("failed to generate Apple client secret: %w", err)
	}

	cfg := p.oauth2Cfg
	cfg.ClientSecret = clientSecret
	token, err := cfg.Exchange(ctx, code)
	if err != nil {
		return nil, fmt.Errorf("Apple token exchange failed: %w", err)
	}

	rawIDToken, ok := token.Extra("id_token").(string)
	if !ok {
		return nil, fmt.Errorf("no id_token in Apple token response")
	}

	idToken, err := p.verifier.Verify(ctx, rawIDToken)
	if err != nil {
		return nil, fmt.Errorf("Apple ID token verification failed: %w", err)
	}

	var name string
	if userJSON := r.FormValue("user"); userJSON != "" {
		var appleUser struct {
			Name struct {
				FirstName string `json:"firstName"`
				LastName  string `json:"lastName"`
			} `json:"name"`
		}
		if err := json.Unmarshal([]byte(userJSON), &appleUser); err == nil {
			name = strings.TrimSpace(appleUser.Name.FirstName + " " + appleUser.Name.LastName)
		}
	}

	return &UserInfo{
		Subject: idToken.Subject,
		Name:    name,
	}, nil
}

func (p *appleProvider) generateClientSecret() (string, error) {
	now := time.Now()
	claims := jwt.MapClaims{
		"iss": p.teamID,
		"iat": now.Unix(),
		"exp": now.Add(180 * time.Second).Unix(),
		"aud": "https://appleid.apple.com",
		"sub": p.clientID,
	}

	t := jwt.NewWithClaims(jwt.SigningMethodES256, claims)
	t.Header["kid"] = p.keyID

	return t.SignedString(p.privateKey)
}

func parseEC8PrivateKey(pemKey string) (*ecdsa.PrivateKey, error) {
	block, _ := pem.Decode([]byte(pemKey))
	if block == nil {
		return nil, fmt.Errorf("failed to decode PEM block from Apple private key")
	}

	key, err := x509.ParsePKCS8PrivateKey(block.Bytes)
	if err != nil {
		return nil, fmt.Errorf("failed to parse PKCS8 private key: %w", err)
	}

	ecKey, ok := key.(*ecdsa.PrivateKey)
	if !ok {
		return nil, fmt.Errorf("Apple private key is not an ECDSA key")
	}

	return ecKey, nil
}
