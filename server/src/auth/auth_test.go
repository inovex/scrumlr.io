package auth

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/go-chi/jwtauth/v5"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"scrumlr.io/server/account"
	"scrumlr.io/server/technical_helper"
	"scrumlr.io/server/users"
)

func withMockAuthProvider(t *testing.T, provider AuthProvider, accountType account.Type) AuthOptions {
	t.Helper()
	return func(options *options) error {
		if len(options.provider) == 0 {
			options.provider = make(map[account.Type]AuthProvider)
		}

		options.provider[accountType] = provider

		return nil
	}
}

func TestAuthNewAuthService(t *testing.T) {
	ctx := t.Context()

	mockAuthProvider := NewMockAuthProvider(t)
	mockUserService := users.NewMockUserService(t)

	authService, err := NewAuthService(ctx, "", "", mockUserService, withMockAuthProvider(t, mockAuthProvider, account.OIDC))

	assert.NoError(t, err)
	assert.NotNil(t, authService)

	service := authService.(*Service)
	assert.Len(t, service.providers, 1)
}

func TestAuthNewServiceWithoutProvider(t *testing.T) {
	ctx := t.Context()

	mockUserService := users.NewMockUserService(t)

	authService, err := NewAuthService(ctx, "", "", mockUserService)

	assert.NoError(t, err)
	assert.NotNil(t, authService)

	service := authService.(*Service)
	assert.Len(t, service.providers, 0)
}

func TestAuthSign(t *testing.T) {
	ctx := t.Context()

	mockUserService := users.NewMockUserService(t)

	authService, err := NewAuthService(ctx, "", "", mockUserService)
	assert.NoError(t, err)

	id := uuid.New()
	claims := map[string]any{
		"id": id,
	}

	tokenString, err := authService.Sign(claims)
	assert.NoError(t, err)
	assert.NotEmpty(t, tokenString)

	service := authService.(*Service)
	token, err := jwtauth.VerifyToken(service.auth, tokenString)
	assert.NoError(t, err)
	assert.NotNil(t, token)

	var tokenIdString string
	err = token.Get("id", &tokenIdString)
	assert.NoError(t, err)
	tokenId, err := uuid.Parse(tokenIdString)
	assert.NoError(t, err)
	assert.Equal(t, id, tokenId)
}

func TestAuthVerifier(t *testing.T) {
	ctx := t.Context()

	mockUserService := users.NewMockUserService(t)

	authService, err := NewAuthService(ctx, "", "", mockUserService)
	assert.NoError(t, err)

	id := uuid.New()
	claims := map[string]any{
		"id": id,
	}

	tokenString, err := authService.Sign(claims)
	assert.NoError(t, err)

	rr := httptest.NewRecorder()
	req := technical_helper.NewTestRequestBuilder(http.MethodGet, "/", nil)
	req.Req.AddCookie(&http.Cookie{Name: "jwt", Value: tokenString})

	next := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		token, claims, err := jwtauth.FromContext(r.Context())

		assert.NoError(t, err)
		assert.NotNil(t, token)
		assert.NotNil(t, claims)
		assert.Len(t, claims, 1)

		tokenIdString, ok := claims["id"].(string)
		assert.True(t, ok)
		tokenId, err := uuid.Parse(tokenIdString)
		assert.NoError(t, err)

		assert.Equal(t, id, tokenId)

		w.WriteHeader(http.StatusOK)
	})

	handler := authService.Verifier()
	handler(next).ServeHTTP(rr, req.Req)

	assert.Equal(t, http.StatusOK, rr.Result().StatusCode)
}

func TestAuthVerifierNoToken(t *testing.T) {
	ctx := t.Context()

	mockUserService := users.NewMockUserService(t)

	authService, err := NewAuthService(ctx, "", "", mockUserService)
	assert.NoError(t, err)

	rr := httptest.NewRecorder()
	req := technical_helper.NewTestRequestBuilder(http.MethodGet, "/", nil)

	next := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		token, claims, err := jwtauth.FromContext(r.Context())

		assert.Error(t, err)
		assert.Nil(t, token)
		assert.NotNil(t, claims)
		assert.Len(t, claims, 0)

		w.WriteHeader(http.StatusBadRequest)
	})

	handler := authService.Verifier()
	handler(next).ServeHTTP(rr, req.Req)

	assert.Equal(t, http.StatusBadRequest, rr.Result().StatusCode)
}

func TestAuthAuthenticator(t *testing.T) {
	ctx := t.Context()

	mockUserService := users.NewMockUserService(t)

	authService, err := NewAuthService(ctx, "", "", mockUserService)
	assert.NoError(t, err)

	userId := uuid.New()
	claims := map[string]any{
		"id": userId,
	}

	tokenString, err := authService.Sign(claims)
	assert.NoError(t, err)

	rr := httptest.NewRecorder()
	req := technical_helper.NewTestRequestBuilder(http.MethodGet, "/", nil)
	req.Req.AddCookie(&http.Cookie{Name: "jwt", Value: tokenString})

	next := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})

	verifyer := authService.Verifier()
	authenticator := authService.Authenticator()
	verifyer(authenticator(next)).ServeHTTP(rr, req.Req)

	assert.Equal(t, http.StatusOK, rr.Result().StatusCode)
}

func TestAuthConfiguresProvider(t *testing.T) {
	ctx := t.Context()

	mockUserService := users.NewMockUserService(t)

	authService, err := NewAuthService(
		ctx,
		"",
		"",
		mockUserService,
		withMockAuthProvider(t, NewMockAuthProvider(t), account.Apple),
		withMockAuthProvider(t, NewMockAuthProvider(t), account.AzureAd),
		withMockAuthProvider(t, NewMockAuthProvider(t), account.GitHub),
		withMockAuthProvider(t, NewMockAuthProvider(t), account.Google),
		withMockAuthProvider(t, NewMockAuthProvider(t), account.Microsoft),
		withMockAuthProvider(t, NewMockAuthProvider(t), account.OIDC),
	)
	assert.NoError(t, err)

	providers := authService.ConfiguredProvider()
	assert.Len(t, providers, 6)
}

func TestAuthConfiguresProviderNoProvider(t *testing.T) {
	ctx := t.Context()

	mockUserService := users.NewMockUserService(t)

	authService, err := NewAuthService(ctx, "", "", mockUserService)
	assert.NoError(t, err)

	providers := authService.ConfiguredProvider()
	assert.Len(t, providers, 0)
}

func TestAuthGetProvider(t *testing.T) {
	ctx := t.Context()

	mockUserService := users.NewMockUserService(t)

	authService, err := NewAuthService(ctx, "", "", mockUserService, withMockAuthProvider(t, NewMockAuthProvider(t), account.Google))
	assert.NoError(t, err)

	provider, err := authService.GetProvider(account.Google)

	assert.NoError(t, err)
	assert.NotNil(t, provider)
}

func TestAuthGetProviderNoConfigured(t *testing.T) {
	ctx := t.Context()

	mockUserService := users.NewMockUserService(t)

	authService, err := NewAuthService(ctx, "", "", mockUserService)
	assert.NoError(t, err)

	provider, err := authService.GetProvider(account.Google)

	assert.Nil(t, provider)
	assert.Error(t, err)
	assert.Errorf(t, err, "provider for %s not configured", account.Google)
}
