package auth

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"regexp"
	"strings"

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

	request, err := http.NewRequest(http.MethodGet, microsoftIssuerUrl+"/.well-known/openid-configuration", nil)
	if err != nil {
		return nil, err
	}

	client := http.DefaultClient
	c, ok := ctx.Value(oauth2.HTTPClient).(*http.Client)
	if ok {
		client = c
	}

	response, err := client.Do(request.WithContext(ctx))
	if err != nil {
		return microsoftProvider, err
	}
	defer func() {
		_ = response.Body.Close()
	}()

	providerConfig := &oidc.ProviderConfig{}
	err = json.NewDecoder(response.Body).Decode(providerConfig)
	if err != nil {
		return microsoftProvider, err
	}

	providerConfig.IssuerURL = strings.Replace(providerConfig.IssuerURL, "{tenantid}", "common", 1)
	if providerConfig.IssuerURL != microsoftIssuerUrl {
		return nil, &oidc.IssuerMismatchError{
			Provided:   microsoftIssuerUrl,
			Discovered: providerConfig.IssuerURL,
		}
	}

	provider := providerConfig.NewProvider(ctx)

	microsoftProvider.provider = provider
	microsoftProvider.verifier = provider.Verifier(&oidc.Config{
		ClientID: clientId,
		// Microslop replaces the tenant id of `common` with an internal tenant id.
		// For that reason the issuer url check always fails and must be performed manually.
		SkipIssuerCheck: true,
	})
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

	// This regex matches the issuer url where the tenantid is either a uuid or the string `common`
	match, err := regexp.MatchString(`https://login\.microsoftonline\.com/([0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}\b|common)/v2\.0`, idToken.Issuer)
	if err != nil {
		return nil, fmt.Errorf("failed to verify id token: %w", err)
	}

	if !match {
		return nil, errors.New("issuer does not match")
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

	if userInfo.Ident == "" {
		return nil, errors.New("failed to extract user identifier")
	}

	if userInfo.Name == "" {
		return nil, fmt.Errorf("failed to extract name information for user %s", userInfo.Ident)
	}

	return &userInfo, nil
}
