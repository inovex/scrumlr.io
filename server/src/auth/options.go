package auth

import (
	"context"
	"errors"

	"scrumlr.io/server/account"
)

type options struct {
	provider map[account.Type]AuthProvider
}

type AuthOptions func(options *options) error

func WithAppleAuthProvider(ctx context.Context, clientId string, clientSecret string, redirectUrl string, scopes ...string) AuthOptions {
	return func(options *options) error {
		if clientId == "" {
			return errors.New("provided empty client id for apple auth provider")
		}

		if clientSecret == "" {
			return errors.New("provided empty client secret for apple auth provider")
		}

		if redirectUrl == "" {
			return errors.New("provided empty redirect url for apple auth provider")
		}

		provider, err := newAppleAuthProvider(ctx, clientId, clientSecret, redirectUrl, scopes...)
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
		if clientId == "" {
			return errors.New("provided empty client id for azure auth provider")
		}

		if clientSecret == "" {
			return errors.New("provided empty client secret for azure auth provider")
		}

		if tenantId == "" {
			return errors.New("provided empty tenant id for azure auth provider")
		}

		if redirectUrl == "" {
			return errors.New("provided empty redirect url for azure auth provider")
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
		if clientId == "" {
			return errors.New("provided empty client id for github auth provider")
		}

		if clientSecret == "" {
			return errors.New("provided empty client secret for github auth provider")
		}

		if redirectUrl == "" {
			return errors.New("provided empty redirect url for github auth provider")
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
		if clientId == "" {
			return errors.New("provided empty client id for google auth provider")
		}

		if clientSecret == "" {
			return errors.New("provided empty client secret for google auth provider")
		}

		if redirectUrl == "" {
			return errors.New("provided empty redirect url for google auth provider")
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
		if clientId == "" {
			return errors.New("provided empty client id for microsoft auth provider")
		}

		if clientSecret == "" {
			return errors.New("provided empty client secret for microsoft auth provider")
		}

		if redirectUrl == "" {
			return errors.New("provided empty redirect url for microsoft auth provider")
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
		if issuerUrl == "" {
			return errors.New("provided empty issuer url for oidc auth provider")
		}

		if clientId == "" {
			return errors.New("provided empty client id for oidc auth provider")
		}

		if clientSecret == "" {
			return errors.New("provided empty client secret for oidc auth provider")
		}

		if redirectUrl == "" {
			return errors.New("provided empty redirect url for oidc auth provider")
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
