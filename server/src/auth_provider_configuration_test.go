package main

import (
	"flag"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/urfave/cli/v2"
	"scrumlr.io/server/common"
)

func TestConfigureAuthProviderNone(t *testing.T) {
	basePath := "/"
	flagset := flag.NewFlagSet("scrumlr-tests", flag.ExitOnError)
	init := cli.NewContext(nil, flagset, nil)

	providerMap, err := configureAuthProvider(init, basePath)

	assert.Nil(t, err)
	assert.NotNil(t, providerMap)
	assert.Empty(t, providerMap)
}

func TestConfigureAuthProviderNoSessionSecret(t *testing.T) {
	basePath := "/"
	flagset := flag.NewFlagSet("scrumlr-tests", flag.ExitOnError)
	flagset.String("auth-callback-host", "http://localhost:8080/callback", "")
	flagset.String("auth-oidc-discovery-url", "http://localhost:8070/.well-known/openid-configuration", "")
	flagset.String("auth-oidc-client-id", "oidcClientID", "")
	flagset.String("auth-oidc-client-secret", "oidcClientSecret", "")
	init := cli.NewContext(nil, flagset, nil)

	providerMap, err := configureAuthProvider(init, basePath)

	assert.Error(t, err)
	assert.Nil(t, providerMap)
}

func TestConfigureAuthProviderGoogle(t *testing.T) {
	basePath := "/"
	flagset := flag.NewFlagSet("scrumlr-tests", flag.ExitOnError)
	flagset.String("auth-callback-host", "http://localhost:8080/callback", "")
	flagset.String("auth-google-client-id", "googleClientID", "")
	flagset.String("auth-google-client-secret", "googleClientSecret", "")
	flagset.String("session-secret", "ThisIsNotASecureSessessionSecret", "")
	init := cli.NewContext(nil, flagset, nil)

	providerMap, err := configureAuthProvider(init, basePath)

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
	basePath := "/"
	flagset := flag.NewFlagSet("scrumlr-tests", flag.ExitOnError)
	flagset.String("auth-callback-host", "http://localhost:8080/callback", "")
	flagset.String("auth-github-client-id", "githubClientID", "")
	flagset.String("auth-github-client-secret", "githubClientSecret", "")
	flagset.String("session-secret", "ThisIsNotASecureSessessionSecret", "")
	init := cli.NewContext(nil, flagset, nil)

	providerMap, err := configureAuthProvider(init, basePath)

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
	basePath := "/"
	flagset := flag.NewFlagSet("scrumlr-tests", flag.ExitOnError)
	flagset.String("auth-callback-host", "http://localhost:8080/callback", "")
	flagset.String("auth-microsoft-client-id", "microsoftClientID", "")
	flagset.String("auth-microsoft-client-secret", "microsoftClientSecret", "")
	flagset.String("session-secret", "ThisIsNotASecureSessessionSecret", "")
	init := cli.NewContext(nil, flagset, nil)

	providerMap, err := configureAuthProvider(init, basePath)

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
	basePath := "/"
	flagset := flag.NewFlagSet("scrumlr-tests", flag.ExitOnError)
	flagset.String("auth-callback-host", "http://localhost:8080/callback", "")
	flagset.String("auth-azure-ad-tenant-id", "azureTenantID", "")
	flagset.String("auth-azure-ad-client-id", "azureClientID", "")
	flagset.String("auth-azure-ad-client-secret", "azureClientSecret", "")
	flagset.String("session-secret", "ThisIsNotASecureSessessionSecret", "")
	init := cli.NewContext(nil, flagset, nil)

	providerMap, err := configureAuthProvider(init, basePath)

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
	basePath := "/"
	flagset := flag.NewFlagSet("scrumlr-tests", flag.ExitOnError)
	flagset.String("auth-callback-host", "http://localhost:8080/callback", "")
	flagset.String("auth-apple-client-id", "appleClientID", "")
	flagset.String("auth-apple-client-secret", "appleClientSecret", "")
	flagset.String("session-secret", "ThisIsNotASecureSessessionSecret", "")
	init := cli.NewContext(nil, flagset, nil)

	providerMap, err := configureAuthProvider(init, basePath)

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
	basePath := "/"
	flagset := flag.NewFlagSet("scrumlr-tests", flag.ExitOnError)
	flagset.String("auth-callback-host", "http://localhost:8080/callback", "")
	flagset.String("auth-oidc-discovery-url", "http://localhost:8070/.well-known/openid-configuration", "")
	flagset.String("auth-oidc-client-id", "oidcClientID", "")
	flagset.String("auth-oidc-client-secret", "oidcClientSecret", "")
	flagset.String("session-secret", "ThisIsNotASecureSessessionSecret", "")
	init := cli.NewContext(nil, flagset, nil)

	providerMap, err := configureAuthProvider(init, basePath)

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
	basePath := "/"
	flagset := flag.NewFlagSet("scrumlr-tests", flag.ExitOnError)
	flagset.String("auth-callback-host", "http://localhost:8080/callback", "")
	flagset.String("auth-google-client-id", "googleClientID", "")
	flagset.String("auth-google-client-secret", "googleClientSecret", "")
	flagset.String("auth-github-client-id", "githubClientID", "")
	flagset.String("auth-github-client-secret", "githubClientSecret", "")
	flagset.String("auth-microsoft-client-id", "microsoftClientID", "")
	flagset.String("auth-microsoft-client-secret", "microsoftClientSecret", "")
	flagset.String("auth-azure-ad-tenant-id", "azureTenantID", "")
	flagset.String("auth-azure-ad-client-id", "azureClientID", "")
	flagset.String("auth-azure-ad-client-secret", "azureClientSecret", "")
	flagset.String("auth-apple-client-id", "appleClientID", "")
	flagset.String("auth-apple-client-secret", "appleClientSecret", "")
	flagset.String("auth-oidc-discovery-url", "http://localhost:8070/.well-known/openid-configuration", "")
	flagset.String("auth-oidc-client-id", "oidcClientID", "")
	flagset.String("auth-oidc-client-secret", "oidcClientSecret", "")
	flagset.String("session-secret", "ThisIsNotASecureSessessionSecret", "")
	init := cli.NewContext(nil, flagset, nil)

	providerMap, err := configureAuthProvider(init, basePath)

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
