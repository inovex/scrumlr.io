package providers

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"fmt"
	"net/http"

	gooidc "github.com/coreos/go-oidc/v3/oidc"
	"golang.org/x/oauth2"
	"scrumlr.io/server/common"
)

const pkceCookieName = "oauth_pkce"

type OIDCProvider struct {
	name      string
	oauth2Cfg oauth2.Config
	verifier  *gooidc.IDTokenVerifier
}

func NewOIDCProvider(name, clientID, clientSecret, redirectURI, issuerURL string, skipIssuerCheck bool, extraScopes ...string) (*OIDCProvider, error) {
	ctx := context.Background()
	provider, err := gooidc.NewProvider(ctx, issuerURL)
	if err != nil {
		return nil, fmt.Errorf("OIDC discovery failed for %s: %w", name, err)
	}

	scopes := append([]string{gooidc.ScopeOpenID, "profile"}, extraScopes...)

	return &OIDCProvider{
		name: name,
		oauth2Cfg: oauth2.Config{
			ClientID:     clientID,
			ClientSecret: clientSecret,
			RedirectURL:  redirectURI,
			Endpoint:     provider.Endpoint(),
			Scopes:       scopes,
		},
		verifier: provider.Verifier(&gooidc.Config{
			ClientID:        clientID,
			SkipIssuerCheck: skipIssuerCheck,
		}),
	}, nil
}

func (p *OIDCProvider) Name() string { return p.name }

func (p *OIDCProvider) AuthURL(w http.ResponseWriter, r *http.Request, state string) (string, error) {
	verifier, challenge, err := generatePKCE()
	if err != nil {
		return "", fmt.Errorf("failed to generate PKCE pair: %w", err)
	}

	cookie := &http.Cookie{
		Name:     pkceCookieName,
		Value:    verifier,
		Path:     "/",
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
		MaxAge:   600,
	}
	common.SealCookie(r, cookie)
	http.SetCookie(w, cookie)

	return p.oauth2Cfg.AuthCodeURL(state,
		oauth2.SetAuthURLParam("code_challenge", challenge),
		oauth2.SetAuthURLParam("code_challenge_method", "S256"),
	), nil
}

func (p *OIDCProvider) Exchange(ctx context.Context, r *http.Request) (*UserInfo, error) {
	code := r.URL.Query().Get("code")
	if code == "" {
		return nil, fmt.Errorf("no authorization code in callback")
	}

	pkceCookie, err := r.Cookie(pkceCookieName)
	if err != nil {
		return nil, fmt.Errorf("PKCE verifier cookie missing: %w", err)
	}

	token, err := p.oauth2Cfg.Exchange(ctx, code,
		oauth2.SetAuthURLParam("code_verifier", pkceCookie.Value),
	)
	if err != nil {
		return nil, fmt.Errorf("token exchange failed: %w", err)
	}

	rawIDToken, ok := token.Extra("id_token").(string)
	if !ok {
		return nil, fmt.Errorf("no id_token in token response")
	}

	idToken, err := p.verifier.Verify(ctx, rawIDToken)
	if err != nil {
		return nil, fmt.Errorf("ID token verification failed: %w", err)
	}

	var claims struct {
		Name    string `json:"name"`
		Picture string `json:"picture"`
	}
	if err := idToken.Claims(&claims); err != nil {
		return nil, fmt.Errorf("failed to parse ID token claims: %w", err)
	}

	return &UserInfo{
		Subject: idToken.Subject,
		Name:    claims.Name,
		Picture: claims.Picture,
	}, nil
}

func generatePKCE() (verifier, challenge string, err error) {
	buf := make([]byte, 32)
	if _, err = rand.Read(buf); err != nil {
		return
	}
	verifier = base64.RawURLEncoding.EncodeToString(buf)
	sum := sha256.Sum256([]byte(verifier))
	challenge = base64.RawURLEncoding.EncodeToString(sum[:])
	return
}
