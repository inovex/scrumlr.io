package auth

import (
	"fmt"
	"net/url"
	"testing"

	"github.com/coreos/go-oidc/v3/oidc"
	"github.com/stretchr/testify/assert"
	"scrumlr.io/server/account"
)

func TestNewAzureAuthProvider(t *testing.T) {
	tenantId := "test-tenant-id"

	mockServer := newMockOidcServer(t, fmt.Sprintf("/%s/v2.0", tenantId), fmt.Sprintf(azureIssuerUrlTemplate, tenantId), "test-azure-user", "Test User", "http://localhost:8080/avatar.png")
	ctx := mockOidcContext(t, mockServer.server.URL)

	provider, err := newAzureAuthProvider(
		ctx,
		"test-client-id",
		"test-client-secret",
		tenantId,
		"http://localhost:8080/login/azure_ad/callback",
		oidc.ScopeOpenID,
		oidc.ScopeProfile,
	)

	assert.NoError(t, err)
	assert.NotNil(t, provider)
}

func TestAzureAuthProviderAuthUrl(t *testing.T) {
	tenantId := "test-tenant-id"
	mockServer := newMockOidcServer(t, fmt.Sprintf("/%s/v2.0", tenantId), fmt.Sprintf(azureIssuerUrlTemplate, tenantId), "test-azure-user", "Test User", "http://localhost:8080/avatar.png")
	ctx := mockOidcContext(t, mockServer.server.URL)

	provider, err := newAzureAuthProvider(
		ctx,
		"test-client-id",
		"test-client-secret",
		tenantId,
		"http://localhost:8080/login/azure_ad/callback",
		oidc.ScopeOpenID,
		oidc.ScopeProfile,
	)

	assert.NoError(t, err)

	authUrl := provider.AuthUrl("random-test-state")
	u, err := url.Parse(authUrl)
	assert.NoError(t, err)

	assert.Equal(t, "test-client-id", u.Query().Get("client_id"))
	assert.Equal(t, "http://localhost:8080/login/azure_ad/callback", u.Query().Get("redirect_uri"))
	assert.Equal(t, "code", u.Query().Get("response_type"))
	assert.Equal(t, "random-test-state", u.Query().Get("state"))
	assert.Contains(t, u.Query().Get("scope"), oidc.ScopeOpenID)
	assert.Contains(t, u.Query().Get("scope"), oidc.ScopeProfile)
}

func TestAzureAuthProviderAuthenticate(t *testing.T) {
	tenantId := "test-tenant-id"
	userId := "test-azure-user"
	userName := "Test User"
	userPicture := "http://localhost:8080/avatar.png"

	mockServer := newMockOidcServer(t, fmt.Sprintf("/%s/v2.0", tenantId), fmt.Sprintf(azureIssuerUrlTemplate, tenantId), userId, userName, userPicture)
	ctx := mockOidcContext(t, mockServer.server.URL)

	provider, err := newAzureAuthProvider(
		ctx,
		"test-client-id",
		"test-client-secret",
		tenantId,
		"http://localhost:8080/login/azure_ad/callback",
		oidc.ScopeOpenID,
		oidc.ScopeProfile,
	)

	assert.NoError(t, err)

	user, err := provider.Authenticate(ctx, "valid-test-state")

	assert.NoError(t, err)
	assert.Equal(t, user.Provider, account.AzureAd)
	assert.Equal(t, user.Ident, userId)
	assert.Equal(t, user.Name, userName)
	assert.Equal(t, user.AvatarURL, userPicture)
}
