package auth

import (
	"crypto/ecdsa"
	"crypto/elliptic"
	"crypto/rand"
	"crypto/x509"
	"encoding/pem"
	"net/url"
	"testing"
	"time"

	"github.com/coreos/go-oidc/v3/oidc"
	"github.com/stretchr/testify/assert"
	"scrumlr.io/server/account"
	"scrumlr.io/server/timeprovider"
)

func TestNewAppleAuthProvider(t *testing.T) {
	key, err := ecdsa.GenerateKey(elliptic.P256(), rand.Reader)
	assert.NoError(t, err)
	cert, err := x509.MarshalPKCS8PrivateKey(key)
	assert.NoError(t, err)
	pemKey := pem.EncodeToMemory(&pem.Block{Type: "PRIVATE KEY", Bytes: cert})

	mockServer := newMockOidcServer(t, "", appleIssuerUrl, "test-apple-user", "Test User", "http://localhost:8080/avatar.png")
	ctx := mockOidcContext(t, mockServer.server.URL)

	mockClock := timeprovider.NewMockTimeProvider(t)
	mockClock.EXPECT().Now().Return(time.Date(2026, 10, 7, 11, 48, 23, 42, time.UTC))

	provider, err := newAppleAuthProvider(
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

	assert.NoError(t, err)
	assert.NotNil(t, provider)
}

func TestAppleAuthProviderAuthUrl(t *testing.T) {
	key, err := ecdsa.GenerateKey(elliptic.P256(), rand.Reader)
	assert.NoError(t, err)
	cert, err := x509.MarshalPKCS8PrivateKey(key)
	assert.NoError(t, err)
	pemKey := pem.EncodeToMemory(&pem.Block{Type: "PRIVATE KEY", Bytes: cert})

	mockServer := newMockOidcServer(t, "", appleIssuerUrl, "test-apple-user", "Test User", "http://localhost:8080/avatar.png")
	ctx := mockOidcContext(t, mockServer.server.URL)

	mockClock := timeprovider.NewMockTimeProvider(t)
	mockClock.EXPECT().Now().Return(time.Date(2026, 10, 7, 11, 48, 23, 42, time.UTC))

	provider, err := newAppleAuthProvider(
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

	assert.NoError(t, err)

	authUrl := provider.AuthUrl("random-test-state")
	u, err := url.Parse(authUrl)
	assert.NoError(t, err)

	assert.Equal(t, "test-client-id", u.Query().Get("client_id"))
	assert.Equal(t, "http://localhost:8080/login/apple/callback", u.Query().Get("redirect_uri"))
	assert.Equal(t, "code", u.Query().Get("response_type"))
	assert.Equal(t, "random-test-state", u.Query().Get("state"))
	assert.Contains(t, u.Query().Get("scope"), oidc.ScopeOpenID)
	assert.Contains(t, u.Query().Get("scope"), oidc.ScopeProfile)
}

func TestAppleAuthProviderAuthenticate(t *testing.T) {
	userId := "test-apple-user"

	key, err := ecdsa.GenerateKey(elliptic.P256(), rand.Reader)
	assert.NoError(t, err)
	cert, err := x509.MarshalPKCS8PrivateKey(key)
	assert.NoError(t, err)
	pemKey := pem.EncodeToMemory(&pem.Block{Type: "PRIVATE KEY", Bytes: cert})

	mockServer := newMockOidcServer(t, "", appleIssuerUrl, userId, "", "")
	ctx := mockOidcContext(t, mockServer.server.URL)

	mockClock := timeprovider.NewMockTimeProvider(t)
	mockClock.EXPECT().Now().Return(time.Date(2026, 10, 7, 11, 48, 23, 42, time.UTC))

	provider, err := newAppleAuthProvider(
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

	assert.NoError(t, err)

	user, err := provider.Authenticate(ctx, "valid-test-state")

	assert.NoError(t, err)
	assert.Equal(t, user.Provider, account.Apple)
	assert.Equal(t, user.Ident, userId)
	assert.Equal(t, user.Name, "")
	assert.Equal(t, user.AvatarURL, "")
}
