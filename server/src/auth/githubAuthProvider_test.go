package auth

import (
	"net/url"
	"testing"

	"github.com/stretchr/testify/assert"
	"scrumlr.io/server/account"
)

func TestNewGitHubAuthProvider(t *testing.T) {
	provider, err := newGithubAuthProvider(
		"test-client-id",
		"test-client-secret",
		"http://localhost:8080/login/github/callback",
		"user",
	)

	assert.NoError(t, err)
	assert.NotNil(t, provider)
}

func TestGitHubAuthProviderAuthUrl(t *testing.T) {
	provider, err := newGithubAuthProvider(
		"test-client-id",
		"test-client-secret",
		"http://localhost:8080/login/github/callback",
		"user",
	)

	assert.NoError(t, err)

	authUrl := provider.AuthUrl("random-test-state")
	u, err := url.Parse(authUrl)
	assert.NoError(t, err)

	assert.Equal(t, "test-client-id", u.Query().Get("client_id"))
	assert.Equal(t, "http://localhost:8080/login/github/callback", u.Query().Get("redirect_uri"))
	assert.Equal(t, "code", u.Query().Get("response_type"))
	assert.Equal(t, "random-test-state", u.Query().Get("state"))
	assert.Contains(t, u.Query().Get("scope"), "user")
}

func TestGithubAuthProviderAuthenticate(t *testing.T) {
	userId := "42"
	userName := "Test User"
	userPicture := "http://localhost:8080/avatar.png"

	mockServer := newMockOidcServer(t, "", githubAuthUrl, userId, userName, userPicture)
	ctx := mockOidcContext(t, mockServer.server.URL)

	provider, err := newGithubAuthProvider(
		"test-client-id",
		"test-client-secret",
		"http://localhost:8080/login/github/callback",
		"user",
	)

	assert.NoError(t, err)

	user, err := provider.Authenticate(ctx, "valid-test-state")

	assert.NoError(t, err)
	assert.Equal(t, user.Provider, account.GitHub)
	assert.Equal(t, user.Ident, userId)
	assert.Equal(t, user.Name, userName)
	assert.Equal(t, user.AvatarURL, userPicture)
}
