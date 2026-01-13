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
	"github.com/stretchr/testify/suite"
	"golang.org/x/oauth2"
	"scrumlr.io/server/common"
	"scrumlr.io/server/technical_helper"
	"scrumlr.io/server/users"
)

type AuthTestSuite struct {
	suite.Suite
}

func TestAuthTestSuite(t *testing.T) {
	suite.Run(t, new(AuthTestSuite))
}

func Test_SignInAnonymously(t *testing.T) {
	mockUser := users.User{ID: uuid.New(), Name: "John Doe"}
	reqBody := AnonymousSignUpRequest{Name: mockUser.Name}
	bodyBytes, _ := json.Marshal(reqBody)
	mockService := NewMockAuthService(t)
	mockUserService := users.NewMockUserService(t)
	api := NewAuthApi(mockService, mockUserService)
	rr := httptest.NewRecorder()
	req := technical_helper.NewTestRequestBuilder("GET", "/login/anonymous", bytes.NewReader(bodyBytes))

	mockUserService.EXPECT().CreateAnonymous(mock.Anything, "John Doe").Return(&mockUser, nil)
	mockService.EXPECT().Sign(map[string]interface{}{"id": mockUser.ID}).Return("valid-jwt-token", nil)

	api.SignInAnonymously(rr, req.Request())

	assert.Equal(t, http.StatusCreated, rr.Result().StatusCode)
	cookies := rr.Result().Cookies()
	assert.NotEmpty(t, cookies)
	assert.Equal(t, "jwt", cookies[0].Name)
	assert.Equal(t, "valid-jwt-token", cookies[0].Value)
	var respUser users.User
	json.NewDecoder(rr.Result().Body).Decode(&respUser)
	assert.Equal(t, mockUser.ID, respUser.ID)
}

func Test_SignInAnonymously_Service_Failure(t *testing.T) {
	mockUser := users.User{ID: uuid.New(), Name: "John Doe"}
	reqBody := AnonymousSignUpRequest{Name: mockUser.Name}
	bodyBytes, _ := json.Marshal(reqBody)
	mockService := NewMockAuthService(t)
	mockUserService := users.NewMockUserService(t)
	api := NewAuthApi(mockService, mockUserService)
	rr := httptest.NewRecorder()
	req := technical_helper.NewTestRequestBuilder("GET", "/login/anonymous", bytes.NewReader(bodyBytes))

	mockUserService.EXPECT().CreateAnonymous(mock.Anything, "John Doe").Return(nil, errors.New("failed to create new user"))

	api.SignInAnonymously(rr, req.Request())
	assert.Equal(t, http.StatusInternalServerError, rr.Result().StatusCode)
}

func Test_SignInAnonymously_Invalid_Body(t *testing.T) {
	mockService := NewMockAuthService(t)
	mockUserService := users.NewMockUserService(t)
	api := NewAuthApi(mockService, mockUserService)
	rr := httptest.NewRecorder()
	req := technical_helper.NewTestRequestBuilder("GET", "/login/anonymous", bytes.NewReader([]byte("invalid-json")))

	api.SignInAnonymously(rr, req.Request())
	assert.Equal(t, http.StatusBadRequest, rr.Result().StatusCode)
}

func Test_Logout(t *testing.T) {
	mockService := NewMockAuthService(t)
	mockUserService := users.NewMockUserService(t)
	api := NewAuthApi(mockService, mockUserService)
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
	api := NewAuthApi(mockService, mockUserService)
	rr := httptest.NewRecorder()

	fakeConfig := &oauth2.Config{
		ClientID: "test-client",
		Endpoint: oauth2.Endpoint{AuthURL: "https://provider.com/auth"},
	}

	req := technical_helper.NewTestRequestBuilder("GET", "/login/google", nil)
	rctx := chi.NewRouteContext()
	rctx.URLParams.Add("provider", "google")
	req.AddToContext(chi.RouteCtxKey, rctx)
	mockService.EXPECT().GetConfig(string(common.Google)).Return(fakeConfig)

	api.BeginAuth(rr, req.Request())

	assert.Equal(t, http.StatusTemporaryRedirect, rr.Result().StatusCode)

	loc, _ := rr.Result().Location()
	assert.Contains(t, loc.String(), fakeConfig.Endpoint.AuthURL)
	assert.Contains(t, loc.String(), "state=") // Ensure state/nonce is generated
}

func Test_Callback(t *testing.T) {
	mockService := NewMockAuthService(t)
	mockUserService := users.NewMockUserService(t)
	api := NewAuthApi(mockService, mockUserService)
	rr := httptest.NewRecorder()

	req := technical_helper.NewTestRequestBuilder(http.MethodGet, "/callback/google?state=nonce123__http://localhost:3000/board&code=authcode", nil)
	rctx := chi.NewRouteContext()
	rctx.URLParams.Add("provider", "google")
	req.AddToContext(chi.RouteCtxKey, rctx)

	expectedCookie := &http.Cookie{Name: "jwt", Value: "new-token"}

	mockService.EXPECT().Exists(common.AccountType("GOOGLE")).Return(true)
	mockService.EXPECT().HandleCallback(mock.Anything, "GOOGLE", "authcode").Return(expectedCookie, nil)

	api.Callback(rr, req.Request())

	assert.Equal(t, http.StatusSeeOther, rr.Result().StatusCode)

	loc, _ := rr.Result().Location()
	assert.Equal(t, "http://localhost:3000/board", loc.String())

	cookies := rr.Result().Cookies()
	assert.NotEmpty(t, cookies)
	assert.Equal(t, "jwt", cookies[0].Name)
	assert.Equal(t, "new-token", cookies[0].Value)
}
