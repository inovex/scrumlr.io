package auth

import (
	"context"
	"errors"
	"fmt"

	"github.com/coreos/go-oidc/v3/oidc"
	"golang.org/x/oauth2"
	"scrumlr.io/server/account"
)

const microsoftIssuerUrl = "https://login.microsoftonline.com/common/v2.0"

type MicrosoftAuthProvider struct {
	provider *oidc.Provider
	verifier *oidc.IDTokenVerifier
	config   oauth2.Config
}

func newMicrosoftAuthProvider(ctx context.Context, clientId string, clientSecret string, redirectUrl string, scopes ...string) (*MicrosoftAuthProvider, error) {
	microsoftProvider := new(MicrosoftAuthProvider)

	provider, err := oidc.NewProvider(ctx, microsoftIssuerUrl)
	if err != nil {
		return nil, err
	}

	microsoftProvider.provider = provider
	microsoftProvider.verifier = provider.Verifier(&oidc.Config{ClientID: clientId})
	microsoftProvider.config = oauth2.Config{
		ClientID:     clientId,
		ClientSecret: clientSecret,
		Endpoint:     provider.Endpoint(),
		RedirectURL:  redirectUrl,
		Scopes:       scopes,
	}

	return microsoftProvider, nil
}

func (provider *MicrosoftAuthProvider) AuthUrl(state string) string {
	return provider.config.AuthCodeURL(state)
}

func (provider *MicrosoftAuthProvider) Authenticate(ctx context.Context, code string) (*UserInformation, error) {
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

	// We take here the oid instead of the subject for backwards compatibility.
	// The id in sub is an id that is unique to the client id and the user,
	// the oid is the unique user id.
	var claims struct {
		Id      string `json:"oid"`
		Name    string `json:"name"`
		Picture string `json:"picture"`
	}

	err = idToken.Claims(&claims)
	if err != nil {
		return nil, fmt.Errorf("failed to extract user claims: %w", err)
	}

	userInfo := UserInformation{
		Provider:  account.Microsoft,
		Ident:     claims.Id,
		Name:      claims.Name,
		AvatarURL: claims.Picture,
	}

	return &userInfo, nil
}
