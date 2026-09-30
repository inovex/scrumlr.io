package auth

import (
	"net/url"
	"testing"

	"github.com/coreos/go-oidc/v3/oidc"
	"github.com/stretchr/testify/assert"
	"scrumlr.io/server/account"
)

func TestNewGoogleAuthProvider(t *testing.T) {
	mockServer := newMockOidcServer(t, "", googleIssuerUrl, "test-google-user", "Test User", "http://localhost:8080/avatar.png")
	ctx := mockOidcContext(t, mockServer.server.URL)

	provider, err := newGoogleAuthProvider(
		ctx,
		"test-client-id",
		"test-client-secret",
		"http://localhost:8080/login/google/callback",
		oidc.ScopeOpenID,
		oidc.ScopeProfile,
	)

	assert.NoError(t, err)
	assert.NotNil(t, provider)
}

func TestGoogleAuthProviderAuthUrl(t *testing.T) {
	mockServer := newMockOidcServer(t, "", googleIssuerUrl, "test-google-user", "Test User", "http://localhost:8080/avatar.png")
	ctx := mockOidcContext(t, mockServer.server.URL)

	provider, err := newGoogleAuthProvider(
		ctx,
		"test-client-id",
		"test-client-secret",
		"http://localhost:8080/login/google/callback",
		oidc.ScopeOpenID,
		oidc.ScopeProfile,
	)

	assert.NoError(t, err)

	authUrl := provider.AuthUrl("random-test-state")
	u, err := url.Parse(authUrl)
	assert.NoError(t, err)

	assert.Equal(t, "test-client-id", u.Query().Get("client_id"))
	assert.Equal(t, "http://localhost:8080/login/google/callback", u.Query().Get("redirect_uri"))
	assert.Equal(t, "code", u.Query().Get("response_type"))
	assert.Equal(t, "random-test-state", u.Query().Get("state"))
	assert.Contains(t, u.Query().Get("scope"), oidc.ScopeOpenID)
	assert.Contains(t, u.Query().Get("scope"), oidc.ScopeProfile)
}

func TestGoogleAuthProviderAuthenticate(t *testing.T) {
	userId := "test-google-user"
	userName := "Test User"
	userPicture := "http://localhost:8080/avatar.png"

	mockServer := newMockOidcServer(t, "", googleIssuerUrl, userId, userName, userPicture)
	ctx := mockOidcContext(t, mockServer.server.URL)

	provider, err := newGoogleAuthProvider(
		ctx,
		"test-client-id",
		"test-client-secret",
		"http://localhost:8080/login/google/callback",
		oidc.ScopeOpenID,
		oidc.ScopeProfile,
	)

	assert.NoError(t, err)

	user, err := provider.Authenticate(ctx, "valid-test-state")

	assert.NoError(t, err)
	assert.Equal(t, user.Provider, account.Google)
	assert.Equal(t, user.Ident, userId)
	assert.Equal(t, user.Name, userName)
	assert.Equal(t, user.AvatarURL, userPicture)
}
