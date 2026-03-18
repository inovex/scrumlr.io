package auth

import (
	"context"
	"crypto/rand"
	"crypto/rsa"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/MicahParks/jwkset"
	"github.com/MicahParks/keyfunc/v3"
	"github.com/go-chi/jwtauth/v5"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
	"golang.org/x/oauth2"
	"scrumlr.io/server/common"
	"scrumlr.io/server/users"
)

func createSignedToken(claims jwt.MapClaims, privateKey *rsa.PrivateKey, t *testing.T, testKID string) string {
	token := jwt.NewWithClaims(jwt.SigningMethodRS256, claims)
	token.Header["kid"] = testKID // Crucial for keyfunc/v3 to find the correct key

	tokenString, err := token.SignedString(privateKey)
	require.NoError(t, err)
	return tokenString
}

func setupMockKeyfunc(t *testing.T) (keyfunc.Keyfunc, *rsa.PrivateKey, string) {
	t.Helper() // Ensures any errors reported point to the caller's line, not inside this helper

	privateKey, err := rsa.GenerateKey(rand.Reader, 2048)
	require.NoError(t, err, "failed to generate rsa key")

	testKID := "test-kid-123"

	jwk, err := jwkset.NewJWKFromKey(&privateKey.PublicKey, jwkset.JWKOptions{
		Metadata: jwkset.JWKMetadataOptions{
			KID: testKID,
		},
	})
	require.NoError(t, err)

	store := jwkset.NewMemoryStorage()
	err = store.KeyWrite(context.Background(), jwk)
	require.NoError(t, err)

	mockKF, err := keyfunc.New(keyfunc.Options{
		Storage: store,
	})
	require.NoError(t, err)

	return mockKF, privateKey, testKID
}

func Test_NewAuthService(t *testing.T) {
	mockUserService := users.NewMockUserService(t)

	providers := map[string]AuthProviderConfiguration{
		"GOOGLE":    {ClientId: "google-id", ClientSecret: "google-secret"},
		"MICROSOFT": {ClientId: "ms-id", ClientSecret: "ms-secret"},
		"OIDC":      {ClientId: "oidc-id", ClientSecret: "oidc-secret"},
		"GITHUB":    {ClientId: "github-id", ClientSecret: "github-secret"},
	}

	service := NewAuthService(providers, "", "", mockUserService)

	assert.NotNil(t, service)
	assert.True(t, service.Exists(common.Google))
	assert.True(t, service.Exists(common.Microsoft))
	assert.True(t, service.Exists(common.TypeOIDC))
	assert.True(t, service.Exists(common.GitHub))
	assert.False(t, service.Exists(common.Apple))

	config, _ := service.GetConfig("GOOGLE")
	assert.NotNil(t, config)
	assert.Equal(t, "google-id", config.ClientID)
}

func Test_AuthConfiguration_Sign(t *testing.T) {
	mockUserService := users.NewMockUserService(t)

	service := NewAuthService(map[string]AuthProviderConfiguration{}, "", "", mockUserService)

	claims := map[string]interface{}{
		"id":   uuid.New().String(),
		"name": "Test-User",
	}

	token, err := service.Sign(claims)
	assert.NoError(t, err)
	assert.NotEmpty(t, token)
}

func Test_ProviderExists(t *testing.T) {
	mockUserService := users.NewMockUserService(t)
	testProviderConf := map[string]AuthProviderConfiguration{
		"GOOGLE": {ClientId: "google-id", ClientSecret: "google-secret"},
	}
	service := NewAuthService(testProviderConf, "", "", mockUserService)

	resp := service.Exists(common.Google)

	assert.True(t, resp)

}

func Test_ProviderExists_Not(t *testing.T) {
	mockUserService := users.NewMockUserService(t)
	testProviderConf := map[string]AuthProviderConfiguration{
		"GOOGLE": {ClientId: "google-id", ClientSecret: "google-secret"},
	}
	service := NewAuthService(testProviderConf, "", "", mockUserService)

	resp := service.Exists(common.Apple)

	assert.False(t, resp)
}

func Test_FetchExternalUser_Google(t *testing.T) {
	mockKF, privateKey, testKID := setupMockKeyfunc(t)

	originalGoogleJWKS := googleJWKS
	googleJWKS = mockKF
	t.Cleanup(func() {
		microsoftJWKS = originalGoogleJWKS
	})

	name := "John Doe"
	provider := common.Google
	sub := "12345"
	avatarURL := "http://avatar.com/jdoe"
	expectedUser := UserInformation{
		Provider:  provider,
		Ident:     sub,
		Name:      name,
		AvatarURL: avatarURL,
	}
	mockUserService := users.NewMockUserService(t)
	tokenExtra := createSignedToken(jwt.MapClaims{
		"sub":     sub,
		"name":    name,
		"picture": avatarURL,
		"email":   "john@example.com",
	}, privateKey, t, testKID)
	service := NewAuthService(map[string]AuthProviderConfiguration{}, "", "", mockUserService)

	extra := map[string]interface{}{}
	if tokenExtra != "" {
		extra["id_token"] = tokenExtra
	}
	token := (&oauth2.Token{}).WithExtra(extra)

	user, err := service.fetchExternalUser(context.Background(), string(provider), token)

	assert.NoError(t, err)
	assert.Equal(t, expectedUser.Ident, user.Ident)
	assert.Equal(t, expectedUser.Name, user.Name)
	assert.Equal(t, expectedUser.AvatarURL, user.AvatarURL)
	assert.Equal(t, expectedUser.Provider, user.Provider)
}

func Test_FetchExternalUser_Azure(t *testing.T) {
	mockKF, privateKey, testKID := setupMockKeyfunc(t)

	originalMicrosoftJWKS := microsoftJWKS
	microsoftJWKS = mockKF
	t.Cleanup(func() {
		microsoftJWKS = originalMicrosoftJWKS
	})

	name := "John Doe"
	provider := common.AzureAd
	sub := "12345"
	avatarURL := "http://avatar.com/jdoe"
	expectedUser := UserInformation{
		Provider:  provider,
		Ident:     sub,
		Name:      name,
		AvatarURL: avatarURL,
	}

	mockUserService := users.NewMockUserService(t)
	tokenExtra := createSignedToken(jwt.MapClaims{
		"id":         sub,
		"login":      name,
		"avatar_url": avatarURL,
		"email":      "john@example.com",
	}, privateKey, t, testKID)

	service := NewAuthService(map[string]AuthProviderConfiguration{}, "", "", mockUserService)

	extra := map[string]interface{}{}
	if tokenExtra != "" {
		extra["id_token"] = tokenExtra
	}
	token := (&oauth2.Token{}).WithExtra(extra)

	user, err := service.fetchExternalUser(context.Background(), string(provider), token)

	assert.NoError(t, err)
	assert.Equal(t, expectedUser.Ident, user.Ident)
	assert.Equal(t, expectedUser.Name, user.Name)
	assert.Equal(t, expectedUser.AvatarURL, user.AvatarURL)
	assert.Equal(t, expectedUser.Provider, user.Provider)
}

func Test_FetchExternalUser_TypeOIDC(t *testing.T) {
	mockKF, privateKey, testKID := setupMockKeyfunc(t)

	originalOIDCJWKS := oidcJWKS
	oidcJWKS = mockKF
	t.Cleanup(func() {
		oidcJWKS = originalOIDCJWKS
	})

	name := "John Doe"
	provider := common.TypeOIDC
	sub := "12345"
	avatarURL := "http://avatar.com/jdoe"
	expectedUser := UserInformation{
		Provider:  provider,
		Ident:     sub,
		Name:      name,
		AvatarURL: avatarURL,
	}
	mockUserService := users.NewMockUserService(t)
	tokenExtra := createSignedToken(jwt.MapClaims{
		"sub":  sub,
		"name": name,
	}, privateKey, t, testKID)

	service := NewAuthService(map[string]AuthProviderConfiguration{}, "", "", mockUserService)

	extra := map[string]interface{}{}
	if tokenExtra != "" {
		extra["id_token"] = tokenExtra
	}
	token := (&oauth2.Token{}).WithExtra(extra)

	user, err := service.fetchExternalUser(context.Background(), string(provider), token)

	assert.NoError(t, err)
	assert.Equal(t, expectedUser.Ident, user.Ident)
	assert.Equal(t, expectedUser.Name, user.Name)
	assert.Equal(t, expectedUser.Provider, user.Provider)
}
func setupCookie(auth *jwtauth.JWTAuth, userID uuid.UUID) *http.Cookie {
	_, tokenString, _ := auth.Encode(map[string]interface{}{"id": userID.String()})
	return &http.Cookie{Name: "jwt", Value: tokenString}
}

func Test_Verifier(t *testing.T) {
	newAuth := jwtauth.New("HS256", []byte("new-secret"), nil)
	oldAuth := jwtauth.New("HS256", []byte("old-secret"), nil)
	userID := uuid.New()
	mockUserService := users.NewMockUserService(t)
	service := AuthConfiguration{
		unsafeAuth:  oldAuth,
		auth:        newAuth,
		userService: mockUserService,
	}

	handlerCalled := false
	nextHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		handlerCalled = true
		_, token, err := jwtauth.FromContext(r.Context())
		assert.NoError(t, err)
		assert.NotNil(t, token)
	})

	mockUserService.EXPECT().IsUserAvailableForKeyMigration(mock.Anything, userID).Return(true, nil)
	mockUserService.EXPECT().SetKeyMigration(mock.Anything, userID).Return(&users.User{}, nil)

	req := httptest.NewRequest("GET", "/", nil)
	req.AddCookie(setupCookie(oldAuth, userID))
	rr := httptest.NewRecorder()

	service.Verifier()(nextHandler).ServeHTTP(rr, req)

	assert.True(t, handlerCalled)
	cookies := rr.Result().Cookies()
	assert.NotEmpty(t, cookies)
	assert.Equal(t, "jwt", cookies[0].Name)
}
