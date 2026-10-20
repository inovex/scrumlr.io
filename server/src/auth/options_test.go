package auth

import (
	"crypto/ecdsa"
	"crypto/elliptic"
	"crypto/rand"
	"crypto/x509"
	"encoding/pem"
	"fmt"
	"testing"
	"time"

	"github.com/coreos/go-oidc/v3/oidc"
	"github.com/stretchr/testify/assert"
	"scrumlr.io/server/account"
	"scrumlr.io/server/timeprovider"
)

func TestAuthOptionsWithAppleProvider(t *testing.T) {
	key, err := ecdsa.GenerateKey(elliptic.P256(), rand.Reader)
	assert.NoError(t, err)
	cert, err := x509.MarshalPKCS8PrivateKey(key)
	assert.NoError(t, err)
	pemKey := pem.EncodeToMemory(&pem.Block{Type: "PRIVATE KEY", Bytes: cert})

	mockServer := newMockOidcServer(t, "", appleIssuerUrl, "test-apple-user", "Test User", "http://localhost:8080/avatar.png")
	ctx := mockOidcContext(t, mockServer.server.URL)

	mockClock := timeprovider.NewMockTimeProvider(t)
	mockClock.EXPECT().Now().Return(time.Date(2026, 10, 7, 11, 48, 23, 42, time.UTC))

	var options options

	appleAuthOption := WithAppleAuthProvider(
		ctx,
		mockClock,
		"test-client-id",
		"test-client-keyId",
		"test-client-teamId",
		string(pemKey),
		"http://localhost:8080/login/apple/callback",
		oidc.ScopeOpenID,
		oidc.ScopeProfile,
	)

	err = appleAuthOption(&options)

	assert.NoError(t, err)
	assert.Len(t, options.provider, 1)
	assert.NotNil(t, options.provider[account.Apple])
}

func TestAuthOptionsWithAppleProviderEmptyClientId(t *testing.T) {
	key, err := ecdsa.GenerateKey(elliptic.P256(), rand.Reader)
	assert.NoError(t, err)
	cert, err := x509.MarshalPKCS8PrivateKey(key)
	assert.NoError(t, err)
	pemKey := pem.EncodeToMemory(&pem.Block{Type: "PRIVATE KEY", Bytes: cert})

	var options options

	mockClock := timeprovider.NewMockTimeProvider(t)

	appleAuthOption := WithAppleAuthProvider(
		t.Context(),
		mockClock,
		"",
		"test-client-keyId",
		"test-client-teamId",
		string(pemKey),
		"http://localhost:8080/login/apple/callback",
		oidc.ScopeOpenID,
		oidc.ScopeProfile,
	)

	err = appleAuthOption(&options)

	assert.NoError(t, err)
	assert.Len(t, options.provider, 0)
}

func TestAuthOptionsWithAppleProviderEmptyKeyId(t *testing.T) {
	key, err := ecdsa.GenerateKey(elliptic.P256(), rand.Reader)
	assert.NoError(t, err)
	cert, err := x509.MarshalPKCS8PrivateKey(key)
	assert.NoError(t, err)
	pemKey := pem.EncodeToMemory(&pem.Block{Type: "PRIVATE KEY", Bytes: cert})

	var options options

	mockClock := timeprovider.NewMockTimeProvider(t)

	appleAuthOption := WithAppleAuthProvider(
		t.Context(),
		mockClock,
		"test-client-id",
		"",
		"test-client-teamId",
		string(pemKey),
		"http://localhost:8080/login/apple/callback",
		oidc.ScopeOpenID,
		oidc.ScopeProfile,
	)

	err = appleAuthOption(&options)

	assert.NoError(t, err)
	assert.Len(t, options.provider, 0)
}

func TestAuthOptionsWithAppleProviderEmptyTeamId(t *testing.T) {
	key, err := ecdsa.GenerateKey(elliptic.P256(), rand.Reader)
	assert.NoError(t, err)
	cert, err := x509.MarshalPKCS8PrivateKey(key)
	assert.NoError(t, err)
	pemKey := pem.EncodeToMemory(&pem.Block{Type: "PRIVATE KEY", Bytes: cert})

	var options options

	mockClock := timeprovider.NewMockTimeProvider(t)

	appleAuthOption := WithAppleAuthProvider(
		t.Context(),
		mockClock,
		"test-client-id",
		"test-client-keyId",
		"",
		string(pemKey),
		"http://localhost:8080/login/apple/callback",
		oidc.ScopeOpenID,
		oidc.ScopeProfile,
	)

	err = appleAuthOption(&options)

	assert.NoError(t, err)
	assert.Len(t, options.provider, 0)
}

func TestAuthOptionsWithAppleProviderEmptyPrivateKey(t *testing.T) {
	mockServer := newMockOidcServer(t, "", appleIssuerUrl, "test-apple-user", "Test User", "http://localhost:8080/avatar.png")
	ctx := mockOidcContext(t, mockServer.server.URL)

	mockClock := timeprovider.NewMockTimeProvider(t)

	var options options

	appleAuthOption := WithAppleAuthProvider(
		ctx,
		mockClock,
		"test-client-id",
		"test-client-keyId",
		"test-client-teamId",
		"",
		"http://localhost:8080/login/apple/callback",
		oidc.ScopeOpenID,
		oidc.ScopeProfile,
	)

	err := appleAuthOption(&options)

	assert.NoError(t, err)
	assert.Len(t, options.provider, 0)
}

func TestAuthOptionsWithAppleProviderInvalidPrivateKey(t *testing.T) {
	mockServer := newMockOidcServer(t, "", appleIssuerUrl, "test-apple-user", "Test User", "http://localhost:8080/avatar.png")
	ctx := mockOidcContext(t, mockServer.server.URL)

	mockClock := timeprovider.NewMockTimeProvider(t)

	var options options

	appleAuthOption := WithAppleAuthProvider(
		ctx,
		mockClock,
		"test-client-id",
		"test-client-keyId",
		"test-client-teamId",
		"test-client-private-key",
		"http://localhost:8080/login/apple/callback",
		oidc.ScopeOpenID,
		oidc.ScopeProfile,
	)

	err := appleAuthOption(&options)

	assert.Error(t, err)
	assert.Errorf(t, err, "failed to create apple client secret: invalide private key")
	assert.Len(t, options.provider, 0)
}

func TestAuthOptionsWithAppleProviderEmptyRedirectUrl(t *testing.T) {
	key, err := ecdsa.GenerateKey(elliptic.P256(), rand.Reader)
	assert.NoError(t, err)
	cert, err := x509.MarshalPKCS8PrivateKey(key)
	assert.NoError(t, err)
	pemKey := pem.EncodeToMemory(&pem.Block{Type: "PRIVATE KEY", Bytes: cert})

	var options options

	mockClock := timeprovider.NewMockTimeProvider(t)

	appleAuthOption := WithAppleAuthProvider(
		t.Context(),
		mockClock,
		"test-client-id",
		"test-client-keyId",
		"test-client-teamId",
		string(pemKey),
		"",
		oidc.ScopeOpenID,
		oidc.ScopeProfile,
	)

	err = appleAuthOption(&options)

	assert.NoError(t, err)
	assert.Len(t, options.provider, 0)
}

func TestAuthOptionsWithAppleProviderInitError(t *testing.T) {
	mockServer := newMockOidcServer(t, "/accounts", appleIssuerUrl, "test-apple-user", "Test User", "http://localhost:8080/avatar.png")
	ctx := mockOidcContext(t, mockServer.server.URL)

	mockClock := timeprovider.NewMockTimeProvider(t)

	var options options

	appleAuthOption := WithAppleAuthProvider(
		ctx,
		mockClock,
		"test-client-id",
		"test-client-secret",
		"http://localhost:8080/login/apple/callback",
		oidc.ScopeOpenID,
		oidc.ScopeProfile,
	)

	err := appleAuthOption(&options)

	assert.Error(t, err)
	assert.Len(t, options.provider, 0)
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

	assert.NoError(t, err)
	assert.Len(t, options.provider, 0)
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

	assert.NoError(t, err)
	assert.Len(t, options.provider, 0)
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

	assert.NoError(t, err)
	assert.Len(t, options.provider, 0)
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

	assert.NoError(t, err)
	assert.Len(t, options.provider, 0)
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
	assert.Len(t, options.provider, 0)
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

	assert.NoError(t, err)
	assert.Len(t, options.provider, 0)
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

	assert.NoError(t, err)
	assert.Len(t, options.provider, 0)
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

	assert.NoError(t, err)
	assert.Len(t, options.provider, 0)
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

	assert.NoError(t, err)
	assert.Len(t, options.provider, 0)
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

	assert.NoError(t, err)
	assert.Len(t, options.provider, 0)
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

	assert.NoError(t, err)
	assert.Len(t, options.provider, 0)
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
	assert.Len(t, options.provider, 0)
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

	assert.NoError(t, err)
	assert.Len(t, options.provider, 0)
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

	assert.NoError(t, err)
	assert.Len(t, options.provider, 0)
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

	assert.NoError(t, err)
	assert.Len(t, options.provider, 0)
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
	assert.Len(t, options.provider, 0)
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

	assert.NoError(t, err)
	assert.Len(t, options.provider, 0)
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

	assert.NoError(t, err)
	assert.Len(t, options.provider, 0)
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

	assert.NoError(t, err)
	assert.Len(t, options.provider, 0)
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

	assert.NoError(t, err)
	assert.Len(t, options.provider, 0)
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
	assert.Len(t, options.provider, 0)
}
