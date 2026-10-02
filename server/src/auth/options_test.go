package auth

import (
	"errors"
	"fmt"
	"testing"

	"github.com/coreos/go-oidc/v3/oidc"
	"github.com/stretchr/testify/assert"
	"scrumlr.io/server/account"
)

func TestAuthOptionsWithAppleProvider(t *testing.T) {
	mockServer := newMockOidcServer(t, "", appleIssuerUrl, "test-apple-user", "Test User", "http://localhost:8080/avatar.png")
	ctx := mockOidcContext(t, mockServer.server.URL)

	var options options

	appleAuthOption := WithAppleAuthProvider(
		ctx,
		"test-client-id",
		"test-client-secret",
		"http://localhost:8080/login/apple/callback",
		oidc.ScopeOpenID,
		oidc.ScopeProfile,
	)

	err := appleAuthOption(&options)

	assert.NoError(t, err)
	assert.Len(t, options.provider, 1)
	assert.NotNil(t, options.provider[account.Apple])
}

func TestAuthOptionsWithAppleProviderEmptyClientId(t *testing.T) {
	var options options

	appleAuthOption := WithAppleAuthProvider(
		t.Context(),
		"",
		"test-client-secret",
		"http://localhost:8080/login/apple/callback",
		oidc.ScopeOpenID,
		oidc.ScopeProfile,
	)

	err := appleAuthOption(&options)

	assert.Error(t, err)
	assert.Equal(t, errors.New("provided empty client id for apple auth provider"), err)
}

func TestAuthOptionsWithAppleProviderEmptyClientSecret(t *testing.T) {
	var options options

	appleAuthOption := WithAppleAuthProvider(
		t.Context(),
		"test-client-id",
		"",
		"http://localhost:8080/login/apple/callback",
		oidc.ScopeOpenID,
		oidc.ScopeProfile,
	)

	err := appleAuthOption(&options)

	assert.Error(t, err)
	assert.Equal(t, errors.New("provided empty client secret for apple auth provider"), err)
}

func TestAuthOptionsWithAppleProviderEmptyRedirectUrl(t *testing.T) {
	var options options

	appleAuthOption := WithAppleAuthProvider(
		t.Context(),
		"test-client-id",
		"test-client-secret",
		"",
		oidc.ScopeOpenID,
		oidc.ScopeProfile,
	)

	err := appleAuthOption(&options)

	assert.Error(t, err)
	assert.Equal(t, errors.New("provided empty redirect url for apple auth provider"), err)
}

func TestAuthOptionsWithAppleProviderInitError(t *testing.T) {
	mockServer := newMockOidcServer(t, "/accounts", appleIssuerUrl, "test-apple-user", "Test User", "http://localhost:8080/avatar.png")
	ctx := mockOidcContext(t, mockServer.server.URL)

	var options options

	appleAuthOption := WithAppleAuthProvider(
		ctx,
		"test-client-id",
		"test-client-secret",
		"http://localhost:8080/login/apple/callback",
		oidc.ScopeOpenID,
		oidc.ScopeProfile,
	)

	err := appleAuthOption(&options)

	assert.Error(t, err)
}

func TestAuthOptionsWithAzureProvider(t *testing.T) {
	tenantId := "test-tenant-id"
	mockServer := newMockOidcServer(t, fmt.Sprintf("/%s/v2.0", tenantId), fmt.Sprintf(azureIssuerUrlTemplate, tenantId), "test-azure-user", "Test User", "http://localhost:8080/avatar.png")
	ctx := mockOidcContext(t, mockServer.server.URL)

	var options options

	azureAuthOption := WithAzureAuthProvider(
		ctx,
		"test-client-id",
		"test-client-secret",
		tenantId,
		"http://localhost:8080/login/azure_ad/callback",
		oidc.ScopeOpenID,
		oidc.ScopeProfile,
	)

	err := azureAuthOption(&options)

	assert.NoError(t, err)
	assert.Len(t, options.provider, 1)
	assert.NotNil(t, options.provider[account.AzureAd])
}

func TestAuthOptionsWithAzureProviderEmptyClientId(t *testing.T) {
	var options options

	azureAuthOption := WithAzureAuthProvider(
		t.Context(),
		"",
		"test-client-secret",
		"test-tenant-id",
		"http://localhost:8080/login/azure_ad/callback",
		oidc.ScopeOpenID,
		oidc.ScopeProfile,
	)

	err := azureAuthOption(&options)

	assert.Error(t, err)
	assert.Equal(t, errors.New("provided empty client id for azure auth provider"), err)
}

func TestAuthOptionsWithAzureProviderEmptyClientSecret(t *testing.T) {
	var options options

	azureAuthOption := WithAzureAuthProvider(
		t.Context(),
		"test-client-id",
		"",
		"test-tenant-id",
		"http://localhost:8080/login/azure_ad/callback",
		oidc.ScopeOpenID,
		oidc.ScopeProfile,
	)

	err := azureAuthOption(&options)

	assert.Error(t, err)
	assert.Equal(t, errors.New("provided empty client secret for azure auth provider"), err)
}

func TestAuthOptionsWithAzureProviderEmptyTenantId(t *testing.T) {
	var options options

	azureAuthOption := WithAzureAuthProvider(
		t.Context(),
		"test-client-id",
		"test-client-secret",
		"",
		"http://localhost:8080/login/azure_ad/callback",
		oidc.ScopeOpenID,
		oidc.ScopeProfile,
	)

	err := azureAuthOption(&options)

	assert.Error(t, err)
	assert.Equal(t, errors.New("provided empty tenant id for azure auth provider"), err)
}

func TestAuthOptionsWithAzureProviderEmptyRedirectUrl(t *testing.T) {
	var options options

	azureAuthOption := WithAzureAuthProvider(
		t.Context(),
		"test-client-id",
		"test-client-secret",
		"test-tenant-id",
		"",
		oidc.ScopeOpenID,
		oidc.ScopeProfile,
	)

	err := azureAuthOption(&options)

	assert.Error(t, err)
	assert.Equal(t, errors.New("provided empty redirect url for azure auth provider"), err)
}

func TestAuthOptionsWithAzureProviderInitError(t *testing.T) {
	tenantId := "test-tenant-id"
	mockServer := newMockOidcServer(t, "", fmt.Sprintf(azureIssuerUrlTemplate, tenantId), "test-azure-user", "Test User", "http://localhost:8080/avatar.png")
	ctx := mockOidcContext(t, mockServer.server.URL)

	var options options

	azureAuthOption := WithAzureAuthProvider(
		ctx,
		"test-client-id",
		"test-client-secret",
		"test-tenant-id",
		"http://localhost:8080/login/azure_ad/callback",
		oidc.ScopeOpenID,
		oidc.ScopeProfile,
	)

	err := azureAuthOption(&options)

	assert.Error(t, err)
}

func TestAuthOptionsWithGithubProvider(t *testing.T) {
	var options options

	githubAuthOption := WithGithubAuthProvider(
		"test-client-id",
		"test-client-secret",
		"http://localhost:8080/login/github/callback",
		"user",
	)
	err := githubAuthOption(&options)

	assert.NoError(t, err)
	assert.Len(t, options.provider, 1)
	assert.NotNil(t, options.provider[account.GitHub])
}

func TestAuthOptionsWithGithubProviderEmptyClientId(t *testing.T) {
	var options options

	googleAuthOption := WithGithubAuthProvider(
		"",
		"test-client-secret",
		"http://localhost:8080/login/github/callback",
		"user",
	)

	err := googleAuthOption(&options)

	assert.Error(t, err)
	assert.Equal(t, errors.New("provided empty client id for github auth provider"), err)
}

func TestAuthOptionsWithGithubProviderEmptyClientSecret(t *testing.T) {
	var options options

	googleAuthOption := WithGithubAuthProvider(
		"test-client-id",
		"",
		"http://localhost:8080/login/github/callback",
		"user",
	)

	err := googleAuthOption(&options)

	assert.Error(t, err)
	assert.Equal(t, errors.New("provided empty client secret for github auth provider"), err)
}

func TestAuthOptionsWithGithubProviderEmptyRedirectUrl(t *testing.T) {
	var options options

	googleAuthOption := WithGithubAuthProvider(
		"test-client-id",
		"test-client-secret",
		"",
		"user",
	)

	err := googleAuthOption(&options)

	assert.Error(t, err)
	assert.Equal(t, errors.New("provided empty redirect url for github auth provider"), err)
}

func TestAuthOptionsWithGoogleProvider(t *testing.T) {
	mockServer := newMockOidcServer(t, "", googleIssuerUrl, "test-google-user", "Test User", "http://localhost:8080/avatar.png")
	ctx := mockOidcContext(t, mockServer.server.URL)

	var options options

	googleAuthOption := WithGoogleAuthProvider(
		ctx,
		"test-client-id",
		"test-client-secret",
		"http://localhost:8080/login/google/callback",
		oidc.ScopeOpenID,
		oidc.ScopeProfile,
	)

	err := googleAuthOption(&options)

	assert.NoError(t, err)
	assert.Len(t, options.provider, 1)
	assert.NotNil(t, options.provider[account.Google])
}

func TestAuthOptionsWithGoogleProviderEmptyClientId(t *testing.T) {
	var options options

	googleAuthOption := WithGoogleAuthProvider(
		t.Context(),
		"",
		"test-client-secret",
		"http://localhost:8080/login/google/callback",
		oidc.ScopeOpenID,
		oidc.ScopeProfile,
	)

	err := googleAuthOption(&options)

	assert.Error(t, err)
	assert.Equal(t, errors.New("provided empty client id for google auth provider"), err)
}

func TestAuthOptionsWithGoogleProviderEmptyClientSecret(t *testing.T) {
	var options options

	googleAuthOption := WithGoogleAuthProvider(
		t.Context(),
		"test-client-id",
		"",
		"http://localhost:8080/login/google/callback",
		oidc.ScopeOpenID,
		oidc.ScopeProfile,
	)

	err := googleAuthOption(&options)

	assert.Error(t, err)
	assert.Equal(t, errors.New("provided empty client secret for google auth provider"), err)
}

func TestAuthOptionsWithGoogleProviderEmptyRedirectUrl(t *testing.T) {
	var options options

	googleAuthOption := WithGoogleAuthProvider(
		t.Context(),
		"test-client-id",
		"test-client-secret",
		"",
		oidc.ScopeOpenID,
		oidc.ScopeProfile,
	)

	err := googleAuthOption(&options)

	assert.Error(t, err)
	assert.Equal(t, errors.New("provided empty redirect url for google auth provider"), err)
}

func TestAuthOptionsWithGoogleProviderInitError(t *testing.T) {
	mockServer := newMockOidcServer(t, "/accounts", googleIssuerUrl, "test-google-user", "Test User", "http://localhost:8080/avatar.png")
	ctx := mockOidcContext(t, mockServer.server.URL)

	var options options

	googleAuthOption := WithGoogleAuthProvider(
		ctx,
		"test-client-id",
		"test-client-secret",
		"http://localhost:8080/login/google/callback",
		oidc.ScopeOpenID,
		oidc.ScopeProfile,
	)

	err := googleAuthOption(&options)

	assert.Error(t, err)
}

func TestAuthOptionsWithMicrosoftProvider(t *testing.T) {
	mockServer := newMockOidcServer(t, "/common/v2.0", microsoftIssuerUrl, "test-microsoft-user", "Test User", "http://localhost:8080/avatar.png")
	ctx := mockOidcContext(t, mockServer.server.URL)

	var options options

	microsoftAuthOption := WithMicrosoftAuthProvider(
		ctx,
		"test-client-id",
		"test-client-secret",
		"http://localhost:8080/login/microsoft/callback",
		oidc.ScopeOpenID,
		oidc.ScopeProfile,
	)

	err := microsoftAuthOption(&options)

	assert.NoError(t, err)
	assert.Len(t, options.provider, 1)
	assert.NotNil(t, options.provider[account.Microsoft])
}

func TestAuthOptionsWithMicrosoftProviderEmptyClientId(t *testing.T) {
	var options options

	microsoftAuthOption := WithMicrosoftAuthProvider(
		t.Context(),
		"",
		"test-client-secret",
		"http://localhost:8080/login/microsoft/callback",
		oidc.ScopeOpenID,
		oidc.ScopeProfile,
	)

	err := microsoftAuthOption(&options)

	assert.Error(t, err)
	assert.Equal(t, errors.New("provided empty client id for microsoft auth provider"), err)
}

func TestAuthOptionsWithMicrosoftProviderEmptyClientSecret(t *testing.T) {
	var options options

	microsoftAuthOption := WithMicrosoftAuthProvider(
		t.Context(),
		"test-client-id",
		"",
		"http://localhost:8080/login/microsoft/callback",
		oidc.ScopeOpenID,
		oidc.ScopeProfile,
	)

	err := microsoftAuthOption(&options)

	assert.Error(t, err)
	assert.Equal(t, errors.New("provided empty client secret for microsoft auth provider"), err)
}

func TestAuthOptionsWithMicrosoftProviderEmptyRedirectUrl(t *testing.T) {
	var options options

	microsoftAuthOption := WithMicrosoftAuthProvider(
		t.Context(),
		"test-client-id",
		"test-client-secret",
		"",
		oidc.ScopeOpenID,
		oidc.ScopeProfile,
	)

	err := microsoftAuthOption(&options)

	assert.Error(t, err)
	assert.Equal(t, errors.New("provided empty redirect url for microsoft auth provider"), err)
}

func TestAuthOptionsWithMicrosoftProviderInitError(t *testing.T) {
	mockServer := newMockOidcServer(t, "", microsoftIssuerUrl, "test-microsoft-user", "Test User", "http://localhost:8080/avatar.png")
	ctx := mockOidcContext(t, mockServer.server.URL)

	var options options

	microsoftAuthOption := WithMicrosoftAuthProvider(
		ctx,
		"test-client-id",
		"test-client-secret",
		"http://localhost:8080/login/microsoft/callback",
		oidc.ScopeOpenID,
		oidc.ScopeProfile,
	)

	err := microsoftAuthOption(&options)

	assert.Error(t, err)
}

func TestAuthOptionsWithOidcProvider(t *testing.T) {
	issuerUrl := "http://localhost:8080/oidc"
	mockServer := newMockOidcServer(t, "/oidc", issuerUrl, "test-oidc-user", "Test User", "http://localhost:8080/avatar.png")
	ctx := mockOidcContext(t, mockServer.server.URL)

	var options options

	oidcAuthOption := WithOidcAuthProvider(
		ctx,
		issuerUrl,
		"test-client-id",
		"test-client-secret",
		"http://localhost:8080/login/oidc/callback",
		oidc.ScopeOpenID,
		oidc.ScopeProfile,
	)

	err := oidcAuthOption(&options)

	assert.NoError(t, err)
	assert.Len(t, options.provider, 1)
	assert.NotNil(t, options.provider[account.OIDC])
}

func TestAuthOptionsWithOidcProviderEmptyIssuerUrl(t *testing.T) {
	var options options

	oidcAuthOption := WithOidcAuthProvider(
		t.Context(),
		"",
		"test-client-id",
		"test-client-secret",
		"http://localhost:8080/login/oidc/callback",
		oidc.ScopeOpenID,
		oidc.ScopeProfile,
	)

	err := oidcAuthOption(&options)

	assert.Error(t, err)
	assert.Equal(t, errors.New("provided empty issuer url for oidc auth provider"), err)
}

func TestAuthOptionsWithOidcProviderEmptyClientId(t *testing.T) {
	var options options

	oidcAuthOption := WithOidcAuthProvider(
		t.Context(),
		"http://localhost:8080/oidc",
		"",
		"test-client-secret",
		"http://localhost:8080/login/oidc/callback",
		oidc.ScopeOpenID,
		oidc.ScopeProfile,
	)

	err := oidcAuthOption(&options)

	assert.Error(t, err)
	assert.Equal(t, errors.New("provided empty client id for oidc auth provider"), err)
}

func TestAuthOptionsWithOidcProviderEmptyClientSecret(t *testing.T) {
	var options options

	oidcAuthOption := WithOidcAuthProvider(
		t.Context(),
		"http://localhost:8080/oidc",
		"test-client-id",
		"",
		"http://localhost:8080/login/oidc/callback",
		oidc.ScopeOpenID,
		oidc.ScopeProfile,
	)

	err := oidcAuthOption(&options)

	assert.Error(t, err)
	assert.Equal(t, errors.New("provided empty client secret for oidc auth provider"), err)
}

func TestAuthOptionsWithOidcProviderEmptyRedirectUrl(t *testing.T) {
	var options options

	oidcAuthOption := WithOidcAuthProvider(
		t.Context(),
		"http://localhost:8080/oidc",
		"test-client-id",
		"test-client-secret",
		"",
		oidc.ScopeOpenID,
		oidc.ScopeProfile,
	)

	err := oidcAuthOption(&options)

	assert.Error(t, err)
	assert.Equal(t, errors.New("provided empty redirect url for oidc auth provider"), err)
}

func TestAuthOptionsWithOidcProviderInitError(t *testing.T) {
	mockServer := newMockOidcServer(t, "", "http://invalid-issuer", "test-oidc-user", "Test User", "http://localhost:8080/avatar.png")
	ctx := mockOidcContext(t, mockServer.server.URL)

	var options options

	oidcAuthOption := WithOidcAuthProvider(
		ctx,
		"http://localhost:8080/oidc",
		"test-client-id",
		"test-client-secret",
		"http://localhost:8080/login/oidc/callback",
		oidc.ScopeOpenID,
		oidc.ScopeProfile,
	)

	err := oidcAuthOption(&options)

	assert.Error(t, err)
}
