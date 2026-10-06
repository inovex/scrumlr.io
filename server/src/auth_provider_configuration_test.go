package main

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/urfave/cli/v3"
	"scrumlr.io/server/common"
)

func TestConfigureAuthProviderNone(t *testing.T) {
	ctx := t.Context()
	basePath := "/"

	init := &cli.Command{
		Flags: []cli.Flag{},
	}

	providerMap, err := configureAuthProvider(ctx, init, basePath)

	assert.Nil(t, err)
	assert.NotNil(t, providerMap)
	assert.Empty(t, providerMap)
}

func TestConfigureAuthProviderNoSessionSecret(t *testing.T) {
	ctx := t.Context()
	basePath := "/"

	init := &cli.Command{
		Flags: []cli.Flag{
			&cli.StringFlag{Name: "auth-callback-host"},
			&cli.StringFlag{Name: "auth-oidc-discovery-url"},
			&cli.StringFlag{Name: "auth-oidc-client-id"},
			&cli.StringFlag{Name: "auth-oidc-client-secret"},
		},
	}

	err := init.Set("auth-callback-host", "http://localhost:8080/callback")
	assert.NoError(t, err)
	err = init.Set("auth-oidc-discovery-url", "http://localhost:8070/.well-known/openid-configuration")
	assert.NoError(t, err)
	err = init.Set("auth-oidc-client-id", "oidcClientID")
	assert.NoError(t, err)
	err = init.Set("auth-oidc-client-secret", "oidcClientSecret")
	assert.NoError(t, err)

	providerMap, err := configureAuthProvider(ctx, init, basePath)

	assert.Error(t, err)
	assert.Nil(t, providerMap)
}

func TestConfigureAuthProviderGoogle(t *testing.T) {
	ctx := t.Context()
	basePath := "/"

	init := &cli.Command{
		Flags: []cli.Flag{
			&cli.StringFlag{Name: "auth-callback-host"},
			&cli.StringFlag{Name: "auth-google-client-id"},
			&cli.StringFlag{Name: "auth-google-client-secret"},
			&cli.StringFlag{Name: "session-secret"},
		},
	}

	err := init.Set("auth-callback-host", "http://localhost:8080/callback")
	assert.NoError(t, err)
	err = init.Set("auth-google-client-id", "googleClientID")
	assert.NoError(t, err)
	err = init.Set("auth-google-client-secret", "googleClientSecret")
	assert.NoError(t, err)
	err = init.Set("session-secret", "ThisIsNotASecureSessessionSecret")
	assert.NoError(t, err)

	providerMap, err := configureAuthProvider(ctx, init, basePath)

	assert.Nil(t, err)
	assert.NotNil(t, providerMap)
	assert.Len(t, providerMap, 1)

	google, ok := providerMap[string(common.Google)]
	assert.True(t, ok)
	assert.Equal(t, "googleClientID", google.ClientId)
	assert.Equal(t, "googleClientSecret", google.ClientSecret)
	assert.Equal(t, "http://localhost:8080/callback/login/google/callback", google.RedirectUri)
}

func TestConfigureAuthProviderGitHub(t *testing.T) {
	ctx := t.Context()
	basePath := "/"

	init := &cli.Command{
		Flags: []cli.Flag{
			&cli.StringFlag{Name: "auth-callback-host"},
			&cli.StringFlag{Name: "auth-github-client-id"},
			&cli.StringFlag{Name: "auth-github-client-secret"},
			&cli.StringFlag{Name: "session-secret"},
		},
	}

	err := init.Set("auth-callback-host", "http://localhost:8080/callback")
	assert.NoError(t, err)
	err = init.Set("auth-github-client-id", "githubClientID")
	assert.NoError(t, err)
	err = init.Set("auth-github-client-secret", "githubClientSecret")
	assert.NoError(t, err)
	err = init.Set("session-secret", "ThisIsNotASecureSessessionSecret")
	assert.NoError(t, err)

	providerMap, err := configureAuthProvider(ctx, init, basePath)

	assert.Nil(t, err)
	assert.NotNil(t, providerMap)
	assert.Len(t, providerMap, 1)

	github, ok := providerMap[string(common.GitHub)]
	assert.True(t, ok)
	assert.Equal(t, "githubClientID", github.ClientId)
	assert.Equal(t, "githubClientSecret", github.ClientSecret)
	assert.Equal(t, "http://localhost:8080/callback/login/github/callback", github.RedirectUri)
}

func TestConfigureAuthProviderMicrosoft(t *testing.T) {
	ctx := t.Context()
	basePath := "/"

	init := &cli.Command{
		Flags: []cli.Flag{
			&cli.StringFlag{Name: "auth-callback-host"},
			&cli.StringFlag{Name: "auth-microsoft-client-id"},
			&cli.StringFlag{Name: "auth-microsoft-client-secret"},
			&cli.StringFlag{Name: "session-secret"},
		},
	}

	err := init.Set("auth-callback-host", "http://localhost:8080/callback")
	assert.NoError(t, err)
	err = init.Set("auth-microsoft-client-id", "microsoftClientID")
	assert.NoError(t, err)
	err = init.Set("auth-microsoft-client-secret", "microsoftClientSecret")
	assert.NoError(t, err)
	err = init.Set("session-secret", "ThisIsNotASecureSessessionSecret")
	assert.NoError(t, err)

	providerMap, err := configureAuthProvider(ctx, init, basePath)

	assert.Nil(t, err)
	assert.NotNil(t, providerMap)
	assert.Len(t, providerMap, 1)

	microsoft, ok := providerMap[string(common.Microsoft)]
	assert.True(t, ok)
	assert.Equal(t, "microsoftClientID", microsoft.ClientId)
	assert.Equal(t, "microsoftClientSecret", microsoft.ClientSecret)
	assert.Equal(t, "http://localhost:8080/callback/login/microsoft/callback", microsoft.RedirectUri)
}

func TestConfigureAuthProviderAzure(t *testing.T) {
	ctx := t.Context()
	basePath := "/"

	init := &cli.Command{
		Flags: []cli.Flag{
			&cli.StringFlag{Name: "auth-callback-host"},
			&cli.StringFlag{Name: "auth-azure-ad-tenant-id"},
			&cli.StringFlag{Name: "auth-azure-ad-client-id"},
			&cli.StringFlag{Name: "auth-azure-ad-client-secret"},
			&cli.StringFlag{Name: "session-secret"},
		},
	}

	err := init.Set("auth-callback-host", "http://localhost:8080/callback")
	assert.NoError(t, err)
	err = init.Set("auth-azure-ad-tenant-id", "azureTenantID")
	assert.NoError(t, err)
	err = init.Set("auth-azure-ad-client-id", "azureClientID")
	assert.NoError(t, err)
	err = init.Set("auth-azure-ad-client-secret", "azureClientSecret")
	assert.NoError(t, err)
	err = init.Set("session-secret", "ThisIsNotASecureSessessionSecret")
	assert.NoError(t, err)

	providerMap, err := configureAuthProvider(ctx, init, basePath)

	assert.Nil(t, err)
	assert.NotNil(t, providerMap)
	assert.Len(t, providerMap, 1)

	azure, ok := providerMap[string(common.AzureAd)]
	assert.True(t, ok)
	assert.Equal(t, "azureTenantID", azure.TenantId)
	assert.Equal(t, "azureClientID", azure.ClientId)
	assert.Equal(t, "azureClientSecret", azure.ClientSecret)
	assert.Equal(t, "http://localhost:8080/callback/login/azure_ad/callback", azure.RedirectUri)
}

func TestConfigureAuthProviderApple(t *testing.T) {
	ctx := t.Context()
	basePath := "/"

	init := &cli.Command{
		Flags: []cli.Flag{
			&cli.StringFlag{Name: "auth-callback-host"},
			&cli.StringFlag{Name: "auth-apple-client-id"},
			&cli.StringFlag{Name: "auth-apple-client-secret"},
			&cli.StringFlag{Name: "session-secret"},
		},
	}

	err := init.Set("auth-callback-host", "http://localhost:8080/callback")
	assert.NoError(t, err)
	err = init.Set("auth-apple-client-id", "appleClientID")
	assert.NoError(t, err)
	err = init.Set("auth-apple-client-secret", "appleClientSecret")
	assert.NoError(t, err)
	err = init.Set("session-secret", "ThisIsNotASecureSessessionSecret")
	assert.NoError(t, err)

	providerMap, err := configureAuthProvider(ctx, init, basePath)

	assert.Nil(t, err)
	assert.NotNil(t, providerMap)
	assert.Len(t, providerMap, 1)

	apple, ok := providerMap[string(common.Apple)]
	assert.True(t, ok)
	assert.Equal(t, "appleClientID", apple.ClientId)
	assert.Equal(t, "appleClientSecret", apple.ClientSecret)
	assert.Equal(t, "http://localhost:8080/callback/login/apple/callback", apple.RedirectUri)
}

func TestConfigureAuthProviderOIDC(t *testing.T) {
	ctx := t.Context()
	basePath := "/"

	init := &cli.Command{
		Flags: []cli.Flag{
			&cli.StringFlag{Name: "auth-callback-host"},
			&cli.StringFlag{Name: "auth-oidc-discovery-url"},
			&cli.StringFlag{Name: "auth-oidc-client-id"},
			&cli.StringFlag{Name: "auth-oidc-client-secret"},
			&cli.StringFlag{Name: "session-secret"},
		},
	}

	err := init.Set("auth-callback-host", "http://localhost:8080/callback")
	assert.NoError(t, err)
	err = init.Set("auth-oidc-discovery-url", "http://localhost:8070/.well-known/openid-configuration")
	assert.NoError(t, err)
	err = init.Set("auth-oidc-client-id", "oidcClientID")
	assert.NoError(t, err)
	err = init.Set("auth-oidc-client-secret", "oidcClientSecret")
	assert.NoError(t, err)
	err = init.Set("session-secret", "ThisIsNotASecureSessessionSecret")
	assert.NoError(t, err)

	providerMap, err := configureAuthProvider(ctx, init, basePath)

	assert.Nil(t, err)
	assert.NotNil(t, providerMap)
	assert.Len(t, providerMap, 1)

	oidc, ok := providerMap[string(common.TypeOIDC)]
	assert.True(t, ok)
	assert.Equal(t, "http://localhost:8070/.well-known/openid-configuration", oidc.DiscoveryUri)
	assert.Equal(t, "oidcClientID", oidc.ClientId)
	assert.Equal(t, "oidcClientSecret", oidc.ClientSecret)
	assert.Equal(t, "http://localhost:8080/callback/login/oidc/callback", oidc.RedirectUri)
	assert.Equal(t, "", oidc.UserIdentScope)
	assert.Equal(t, "", oidc.UserNameScope)
}

func TestConfigureAuthProvider(t *testing.T) {
	ctx := t.Context()
	basePath := "/"

	init := &cli.Command{
		Flags: []cli.Flag{
			&cli.StringFlag{Name: "auth-callback-host"},
			&cli.StringFlag{Name: "auth-google-client-id"},
			&cli.StringFlag{Name: "auth-google-client-secret"},
			&cli.StringFlag{Name: "auth-github-client-id"},
			&cli.StringFlag{Name: "auth-github-client-secret"},
			&cli.StringFlag{Name: "auth-microsoft-client-id"},
			&cli.StringFlag{Name: "auth-microsoft-client-secret"},
			&cli.StringFlag{Name: "auth-azure-ad-tenant-id"},
			&cli.StringFlag{Name: "auth-azure-ad-client-id"},
			&cli.StringFlag{Name: "auth-azure-ad-client-secret"},
			&cli.StringFlag{Name: "auth-apple-client-id"},
			&cli.StringFlag{Name: "auth-apple-client-secret"},
			&cli.StringFlag{Name: "auth-oidc-discovery-url"},
			&cli.StringFlag{Name: "auth-oidc-client-id"},
			&cli.StringFlag{Name: "auth-oidc-client-secret"},
			&cli.StringFlag{Name: "session-secret"},
		},
	}

	err := init.Set("auth-callback-host", "http://localhost:8080/callback")
	assert.NoError(t, err)
	err = init.Set("auth-google-client-id", "googleClientID")
	assert.NoError(t, err)
	err = init.Set("auth-google-client-secret", "googleClientSecret")
	assert.NoError(t, err)
	err = init.Set("auth-github-client-id", "githubClientID")
	assert.NoError(t, err)
	err = init.Set("auth-github-client-secret", "githubClientSecret")
	assert.NoError(t, err)
	err = init.Set("auth-microsoft-client-id", "microsoftClientID")
	assert.NoError(t, err)
	err = init.Set("auth-microsoft-client-secret", "microsoftClientSecret")
	assert.NoError(t, err)
	err = init.Set("auth-azure-ad-tenant-id", "azureTenantID")
	assert.NoError(t, err)
	err = init.Set("auth-azure-ad-client-id", "azureClientID")
	assert.NoError(t, err)
	err = init.Set("auth-azure-ad-client-secret", "azureClientSecret")
	assert.NoError(t, err)
	err = init.Set("auth-apple-client-id", "appleClientID")
	assert.NoError(t, err)
	err = init.Set("auth-apple-client-secret", "appleClientSecret")
	assert.NoError(t, err)
	err = init.Set("auth-oidc-discovery-url", "http://localhost:8070/.well-known/openid-configuration")
	assert.NoError(t, err)
	err = init.Set("auth-oidc-client-id", "oidcClientID")
	assert.NoError(t, err)
	err = init.Set("auth-oidc-client-secret", "oidcClientSecret")
	assert.NoError(t, err)
	err = init.Set("session-secret", "ThisIsNotASecureSessessionSecret")
	assert.NoError(t, err)

	providerMap, err := configureAuthProvider(ctx, init, basePath)

	assert.Nil(t, err)
	assert.NotNil(t, providerMap)
	assert.Len(t, providerMap, 6)

	_, ok := providerMap[string(common.Google)]
	assert.True(t, ok)
	_, ok = providerMap[string(common.GitHub)]
	assert.True(t, ok)
	_, ok = providerMap[string(common.Microsoft)]
	assert.True(t, ok)
	_, ok = providerMap[string(common.AzureAd)]
	assert.True(t, ok)
	_, ok = providerMap[string(common.Apple)]
	assert.True(t, ok)
	_, ok = providerMap[string(common.TypeOIDC)]
	assert.True(t, ok)
}
