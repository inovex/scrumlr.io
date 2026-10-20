package auth

import (
	"context"
	"slices"

	"github.com/coreos/go-oidc/v3/oidc"
	"scrumlr.io/server/account"
	"scrumlr.io/server/timeprovider"
)

type options struct {
	provider map[account.Type]AuthProvider
}

type AuthOptions func(options *options) error

func WithAppleAuthProvider(ctx context.Context, clock timeprovider.TimeProvider, clientId string, keyId string, teamId string, privateKey string, redirectUrl string, scopes ...string) AuthOptions {
	return func(options *options) error {
		if clientId == "" || keyId == "" || teamId == "" || privateKey == "" || redirectUrl == "" {
			return nil
		}

		if !slices.Contains(scopes, oidc.ScopeOpenID) {
			scopes = append(scopes, oidc.ScopeOpenID)
		}

		if !slices.Contains(scopes, "name") {
			scopes = append(scopes, "name")
		}

		provider, err := newAppleAuthProvider(ctx, clock, clientId, keyId, teamId, privateKey, redirectUrl, scopes...)
		if err != nil {
			return err
		}

		if len(options.provider) == 0 {
			options.provider = make(map[account.Type]AuthProvider)
		}

		options.provider[account.Apple] = provider

		return nil
	}
}

func WithAzureAuthProvider(ctx context.Context, clientId string, clientSecret string, tenantId string, redirectUrl string, scopes ...string) AuthOptions {
	return func(options *options) error {
		if clientId == "" || clientSecret == "" || tenantId == "" || redirectUrl == "" {
			return nil
		}

		if !slices.Contains(scopes, oidc.ScopeOpenID) {
			scopes = append(scopes, oidc.ScopeOpenID)
		}

		if !slices.Contains(scopes, oidc.ScopeProfile) {
			scopes = append(scopes, oidc.ScopeProfile)
		}

		provider, err := newAzureAuthProvider(ctx, clientId, clientSecret, tenantId, redirectUrl, scopes...)
		if err != nil {
			return err
		}

		if len(options.provider) == 0 {
			options.provider = make(map[account.Type]AuthProvider)
		}

		options.provider[account.AzureAd] = provider

		return nil
	}
}

func WithGithubAuthProvider(clientId string, clientSecret string, redirectUrl string, scopes ...string) AuthOptions {
	return func(options *options) error {
		if clientId == "" || clientSecret == "" || redirectUrl == "" {
			return nil
		}

		if !slices.Contains(scopes, "read:user") {
			scopes = append(scopes, "read:user")
		}

		provider, err := newGithubAuthProvider(clientId, clientSecret, redirectUrl, scopes...)
		if err != nil {
			return err
		}

		if len(options.provider) == 0 {
			options.provider = make(map[account.Type]AuthProvider)
		}

		options.provider[account.GitHub] = provider

		return nil
	}
}

func WithGoogleAuthProvider(ctx context.Context, clientId string, clientSecret string, redirectUrl string, scopes ...string) AuthOptions {
	return func(options *options) error {
		if clientId == "" || clientSecret == "" || redirectUrl == "" {
			return nil
		}

		if !slices.Contains(scopes, oidc.ScopeOpenID) {
			scopes = append(scopes, oidc.ScopeOpenID)
		}

		if !slices.Contains(scopes, oidc.ScopeProfile) {
			scopes = append(scopes, oidc.ScopeProfile)
		}

		provider, err := newGoogleAuthProvider(ctx, clientId, clientSecret, redirectUrl, scopes...)
		if err != nil {
			return err
		}

		if len(options.provider) == 0 {
			options.provider = make(map[account.Type]AuthProvider)
		}

		options.provider[account.Google] = provider

		return nil
	}
}

func WithMicrosoftAuthProvider(ctx context.Context, clientId string, clientSecret string, redirectUrl string, scopes ...string) AuthOptions {
	return func(options *options) error {
		if clientId == "" || clientSecret == "" || redirectUrl == "" {
			return nil
		}

		if !slices.Contains(scopes, oidc.ScopeOpenID) {
			scopes = append(scopes, oidc.ScopeOpenID)
		}

		if !slices.Contains(scopes, oidc.ScopeProfile) {
			scopes = append(scopes, oidc.ScopeProfile)
		}

		provider, err := newMicrosoftAuthProvider(ctx, clientId, clientSecret, redirectUrl, scopes...)
		if err != nil {
			return err
		}

		if len(options.provider) == 0 {
			options.provider = make(map[account.Type]AuthProvider)
		}

		options.provider[account.Microsoft] = provider

		return nil
	}
}

func WithOidcAuthProvider(ctx context.Context, issuerUrl string, clientId string, clientSecret string, redirectUrl string, scopes ...string) AuthOptions {
	return func(options *options) error {
		if issuerUrl == "" || clientId == "" || clientSecret == "" || redirectUrl == "" {
			return nil
		}

		if !slices.Contains(scopes, oidc.ScopeOpenID) {
			scopes = append(scopes, oidc.ScopeOpenID)
		}

		if !slices.Contains(scopes, oidc.ScopeProfile) {
			scopes = append(scopes, oidc.ScopeProfile)
		}

		provider, err := newOidcAuthProvider(ctx, issuerUrl, clientId, clientSecret, redirectUrl, scopes...)
		if err != nil {
			return err
		}

		if len(options.provider) == 0 {
			options.provider = make(map[account.Type]AuthProvider)
		}

		options.provider[account.OIDC] = provider

		return nil
	}
}
