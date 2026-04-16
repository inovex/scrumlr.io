package auth

import (
	"bytes"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"golang.org/x/oauth2"
	"scrumlr.io/server/common"
	"scrumlr.io/server/technical_helper"
	"scrumlr.io/server/users"
)

func Test_SignInAnonymously(t *testing.T) {
	mockUser := users.User{ID: uuid.New(), Name: "John Doe"}
	reqBody := AnonymousSignUpRequest{Name: mockUser.Name}
	bodyBytes, _ := json.Marshal(reqBody)
	mockService := NewMockAuthService(t)
	mockUserService := users.NewMockUserService(t)
	api := NewAuthApi(mockService, mockUserService, "http:", "/", nil, false)
	rr := httptest.NewRecorder()
	req := technical_helper.NewTestRequestBuilder("GET", "/login/anonymous", bytes.NewReader(bodyBytes))

	mockUserService.EXPECT().CreateAnonymous(mock.Anything, "John Doe").Return(&mockUser, nil)
	mockService.EXPECT().Sign(map[string]any{"id": mockUser.ID}).Return("valid-jwt-token", nil)

	api.SignInAnonymously(rr, req.Request())

	assert.Equal(t, http.StatusCreated, rr.Result().StatusCode)
	cookies := rr.Result().Cookies()
	assert.NotEmpty(t, cookies)
	assert.Equal(t, "jwt", cookies[0].Name)
	assert.Equal(t, "valid-jwt-token", cookies[0].Value)
	var respUser users.User
	err := json.NewDecoder(rr.Result().Body).Decode(&respUser)
	if err != nil {
		return
	}
	assert.Equal(t, mockUser.ID, respUser.ID)
}

func Test_SignInAnonymously_Service_Failure(t *testing.T) {
	mockUser := users.User{ID: uuid.New(), Name: "John Doe"}
	reqBody := AnonymousSignUpRequest{Name: mockUser.Name}
	bodyBytes, _ := json.Marshal(reqBody)
	mockService := NewMockAuthService(t)
	mockUserService := users.NewMockUserService(t)
	api := NewAuthApi(mockService, mockUserService, "http:", "/", nil, false)
	rr := httptest.NewRecorder()
	req := technical_helper.NewTestRequestBuilder("GET", "/login/anonymous", bytes.NewReader(bodyBytes))

	mockUserService.EXPECT().CreateAnonymous(mock.Anything, "John Doe").Return(nil, errors.New("failed to create new user"))

	api.SignInAnonymously(rr, req.Request())
	assert.Equal(t, http.StatusInternalServerError, rr.Result().StatusCode)
}

func Test_SignInAnonymously_Invalid_Body(t *testing.T) {
	mockService := NewMockAuthService(t)
	mockUserService := users.NewMockUserService(t)
	api := NewAuthApi(mockService, mockUserService, "http:", "/", nil, false)
	rr := httptest.NewRecorder()
	req := technical_helper.NewTestRequestBuilder("GET", "/login/anonymous", bytes.NewReader([]byte("invalid-json")))

	api.SignInAnonymously(rr, req.Request())
	assert.Equal(t, http.StatusBadRequest, rr.Result().StatusCode)
}

func Test_Logout(t *testing.T) {
	mockService := NewMockAuthService(t)
	mockUserService := users.NewMockUserService(t)
	api := NewAuthApi(mockService, mockUserService, "http:", "/", nil, false)
	rr := httptest.NewRecorder()
	req := technical_helper.NewTestRequestBuilder("GET", "/logout", nil)

	api.Logout(rr, req.Request())

	cookies := rr.Result().Cookies()
	assert.NotEmpty(t, cookies)
	assert.Equal(t, "jwt", cookies[0].Name)
	assert.True(t, cookies[0].MaxAge < 0, "Cookie should be expired")
}

func Test_BeginAuth(t *testing.T) {
	mockService := NewMockAuthService(t)
	mockUserService := users.NewMockUserService(t)
	api := NewAuthApi(mockService, mockUserService, "http://localhost:3000", "/", []string{"localhost"}, false)
	rr := httptest.NewRecorder()

	fakeConfig := &oauth2.Config{
		ClientID: "test-client",
		Endpoint: oauth2.Endpoint{AuthURL: "https://provider.com/auth"},
	}

	req := technical_helper.NewTestRequestBuilder("GET", "http://localhost:3000/login/google?state=http://localhost:3000/boards", nil)
	rctx := chi.NewRouteContext()
	rctx.URLParams.Add("provider", "google")
	req.AddToContext(chi.RouteCtxKey, rctx)
	mockService.EXPECT().GetConfig(string(common.Google)).Return(fakeConfig, nil)

	api.BeginAuth(rr, req.Request())

	assert.Equal(t, http.StatusTemporaryRedirect, rr.Result().StatusCode)

	loc, err := rr.Result().Location()
	assert.NoError(t, err)
	if loc != nil {
		assert.Contains(t, loc.String(), fakeConfig.Endpoint.AuthURL)
		assert.Contains(t, loc.String(), "state=") // Ensure state/nonce is generated
	}
}

func Test_Callback(t *testing.T) {
	mockService := NewMockAuthService(t)
	mockUserService := users.NewMockUserService(t)
	api := NewAuthApi(mockService, mockUserService, "http:", "/", []string{"localhost"}, false)
	rr := httptest.NewRecorder()
	oauthCookie := &http.Cookie{
		Name:     "oauth_state",
		Value:    "nonce123",
		MaxAge:   100,
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
		Path:     "/",
	}

	req := technical_helper.NewTestRequestBuilder(http.MethodGet, "/callback/google?state=nonce123__http://localhost:3000/board&code=authcode", nil)
	rctx := chi.NewRouteContext()
	rctx.URLParams.Add("provider", "google")
	req.AddToContext(chi.RouteCtxKey, rctx)
	req.Req.AddCookie(oauthCookie)

	expectedCookie := &http.Cookie{Name: "jwt", Value: "new-token"}

	mockService.EXPECT().Exists(common.AccountType("GOOGLE")).Return(true)
	mockService.EXPECT().HandleCallback(mock.Anything, "GOOGLE", "authcode").Return(expectedCookie, nil)

	api.Callback(rr, req.Request())

	assert.Equal(t, http.StatusSeeOther, rr.Result().StatusCode)

	loc, err := rr.Result().Location()
	assert.NoError(t, err)
	if loc != nil {
		assert.Equal(t, "http://localhost:3000/board", loc.String())
	}

	cookies := rr.Result().Cookies()
	assert.NotEmpty(t, cookies)
	assert.Equal(t, "jwt", cookies[1].Name)
	assert.Equal(t, "new-token", cookies[1].Value)
}

func Test_IsSafeRedirect(t *testing.T) {
	api := &API{
		hostPath:                 "http://scrumlr.io",
		allowedRedirectHostnames: []string{"localhost", "staging.scrumlr.io", "scrumlr.io"},
	}

	tests := []struct {
		url      string
		expected string
		safe     bool
	}{
		{"/board/123", "/board/123", true},
		{"/login", "/login", true},
		{"//evil.com", "", false},
		{"http://scrumlr.io/board", "http://scrumlr.io/board", true},
		{"http://localhost:3000/callback", "http://localhost:3000/callback", true},
		{"http://staging.scrumlr.io/", "http://staging.scrumlr.io/", true},
		{"http://evil.com", "", false},
		{"javascript:alert(1)", "", false},
		{"\\evil.com", "", false}, // Normalized to /evil.com, then rejected because not starting with /
		{"", "", false},
	}

	for _, tt := range tests {
		t.Run(tt.url, func(t *testing.T) {
			got, safe := api.isSafeRedirect(tt.url)
			assert.Equal(t, tt.safe, safe)
			if tt.safe {
				assert.Equal(t, tt.expected, got)
			}
		})
	}
}

func Test_AnonymousLoginDisabledContext(t *testing.T) {
	mockService := NewMockAuthService(t)
	mockUserService := users.NewMockUserService(t)

	t.Run("allowed", func(t *testing.T) {
		api := NewAuthApi(mockService, mockUserService, "http:", "/", nil, false)
		rr := httptest.NewRecorder()
		req, _ := http.NewRequest("POST", "/login/anonymous", nil)
		next := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusOK)
		})

		api.AnonymousLoginDisabledContext(next).ServeHTTP(rr, req)
		assert.Equal(t, http.StatusOK, rr.Code)
	})

	t.Run("forbidden", func(t *testing.T) {
		api := NewAuthApi(mockService, mockUserService, "http:", "/", nil, true)
		rr := httptest.NewRecorder()
		req, _ := http.NewRequest("POST", "/login/anonymous", nil)
		next := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusOK)
		})

		api.AnonymousLoginDisabledContext(next).ServeHTTP(rr, req)
		assert.Equal(t, http.StatusForbidden, rr.Code)
	})
}
