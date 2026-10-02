package auth

import (
	"context"
	"errors"
	"fmt"

	"github.com/coreos/go-oidc/v3/oidc"
	"golang.org/x/oauth2"
	"scrumlr.io/server/account"
)

type OidcAuthProvider struct {
	provider *oidc.Provider
	verifier *oidc.IDTokenVerifier
	config   oauth2.Config
}

func newOidcAuthProvider(ctx context.Context, issuerUrl string, clientId string, clientSecret string, redirectUrl string, scopes ...string) (*OidcAuthProvider, error) {
	oidcProvider := new(OidcAuthProvider)

	provider, err := oidc.NewProvider(ctx, issuerUrl)
	if err != nil {
		return nil, err
	}

	oidcProvider.provider = provider
	oidcProvider.verifier = provider.Verifier(&oidc.Config{ClientID: clientId})
	oidcProvider.config = oauth2.Config{
		ClientID:     clientId,
		ClientSecret: clientSecret,
		Endpoint:     provider.Endpoint(),
		RedirectURL:  redirectUrl,
		Scopes:       scopes,
	}

	return oidcProvider, nil
}

func (provider *OidcAuthProvider) AuthUrl(state string) string {
	return provider.config.AuthCodeURL(state)
}

func (provider *OidcAuthProvider) Authenticate(ctx context.Context, code string) (*UserInformation, error) {
	oauth2Token, err := provider.config.Exchange(ctx, code)
	if err != nil {
		return nil, fmt.Errorf("failed to exchange token: %w", err)
	}

	rawIdToken, ok := oauth2Token.Extra("id_token").(string)
	if !ok {
		return nil, errors.New("failed to get id token")
	}

	idToken, err := provider.verifier.Verify(ctx, rawIdToken)
	if err != nil {
		return nil, fmt.Errorf("failed to verify id token: %w", err)
	}

	var claims struct {
		Name    string `json:"name"`
		Picture string `json:"picture"`
	}

	err = idToken.Claims(&claims)
	if err != nil {
		return nil, fmt.Errorf("failed to extract user claims: %w", err)
	}

	userInfo := UserInformation{
		Provider:  account.OIDC,
		Ident:     idToken.Subject,
		Name:      claims.Name,
		AvatarURL: claims.Picture,
	}

	return &userInfo, nil
}
