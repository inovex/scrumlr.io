package users

import (
	"errors"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"scrumlr.io/server/common"
	"scrumlr.io/server/identifiers"
	"scrumlr.io/server/sessions"
	"scrumlr.io/server/technical_helper"
)

func TestApiBoardAuthenticatedContext(t *testing.T) {
	userId := uuid.New()
	boardId := uuid.New()

	mockUserService := NewMockUserService(t)
	mockSessionService := sessions.NewMockSessionService(t)
	userApi := NewUserApi(mockUserService, mockSessionService, true, true)

	rr := httptest.NewRecorder()
	req := technical_helper.NewTestRequestBuilder("GET", "/", nil).
		AddToContext(identifiers.UserIdentifier, userId)

	rctx := chi.NewRouteContext()
	rctx.URLParams.Add("id", boardId.String())
	req.AddToContext(chi.RouteCtxKey, rctx)

	mockUserService.EXPECT().Get(mock.Anything, userId).
		Return(&User{ID: userId, AccountType: common.Google}, nil)

	next := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})

	userApi.BoardAuthenticatedContext(next).ServeHTTP(rr, req.Request())

	assert.Equal(t, http.StatusOK, rr.Result().StatusCode)
}

func TestApiBoardAuthenticatedContextNotAuthenticated(t *testing.T) {
	userId := uuid.New()
	boardId := uuid.New()

	mockUserService := NewMockUserService(t)
	mockSessionService := sessions.NewMockSessionService(t)
	userApi := NewUserApi(mockUserService, mockSessionService, true, true)

	rr := httptest.NewRecorder()
	req := technical_helper.NewTestRequestBuilder("GET", "/", nil).
		AddToContext(identifiers.UserIdentifier, userId)

	rctx := chi.NewRouteContext()
	rctx.URLParams.Add("id", boardId.String())
	req.AddToContext(chi.RouteCtxKey, rctx)

	mockUserService.EXPECT().Get(mock.Anything, userId).
		Return(&User{ID: userId, AccountType: common.Anonymous}, nil)

	next := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})

	userApi.BoardAuthenticatedContext(next).ServeHTTP(rr, req.Request())

	assert.Equal(t, http.StatusForbidden, rr.Result().StatusCode)
	assert.Error(t, common.ForbiddenError(errors.New("not authorized")))
}

func TestApiBoardAuthenticatedContextInvalidBoardID(t *testing.T) {
	userId := uuid.New()
	boardId := "abc"

	mockUserService := NewMockUserService(t)
	mockSessionService := sessions.NewMockSessionService(t)
	userApi := NewUserApi(mockUserService, mockSessionService, true, true)
	rr := httptest.NewRecorder()
	req := technical_helper.NewTestRequestBuilder("GET", "/", nil).
		AddToContext(identifiers.UserIdentifier, userId)

	rctx := chi.NewRouteContext()
	rctx.URLParams.Add("id", boardId)
	req.AddToContext(chi.RouteCtxKey, rctx)

	next := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})

	userApi.BoardAuthenticatedContext(next).ServeHTTP(rr, req.Request())

	assert.Equal(t, http.StatusBadRequest, rr.Result().StatusCode)
	assert.Error(t, common.BadRequestError(errors.New("invalid board id")))
}

func TestApiBoardAuthenticatedContextInvalidUserID(t *testing.T) {
	userId := "abc"
	boardId := uuid.New()

	mockUserService := NewMockUserService(t)
	mockSessionService := sessions.NewMockSessionService(t)
	userApi := NewUserApi(mockUserService, mockSessionService, true, true)

	rr := httptest.NewRecorder()
	req := technical_helper.NewTestRequestBuilder("GET", "/", nil).
		AddToContext(identifiers.UserIdentifier, userId)

	rctx := chi.NewRouteContext()
	rctx.URLParams.Add("id", boardId.String())
	req.AddToContext(chi.RouteCtxKey, rctx)

	next := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})

	userApi.BoardAuthenticatedContext(next).ServeHTTP(rr, req.Request())

	assert.Equal(t, http.StatusBadRequest, rr.Result().StatusCode)
}

func TestApiAnonymousBoardCreationContext(t *testing.T) {
	userId := uuid.New()

	mockUserService := NewMockUserService(t)
	mockSessionService := sessions.NewMockSessionService(t)
	userApi := NewUserApi(mockUserService, mockSessionService, true, true)

	rr := httptest.NewRecorder()
	req := technical_helper.NewTestRequestBuilder("GET", "/", nil).
		AddToContext(identifiers.UserIdentifier, userId)

	rctx := chi.NewRouteContext()
	rctx.URLParams.Add("id", userId.String())
	req.AddToContext(chi.RouteCtxKey, rctx)

	mockUserService.EXPECT().Get(mock.Anything, userId).
		Return(&User{ID: userId, AccountType: common.Anonymous}, nil)

	next := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})

	userApi.AnonymousBoardCreationContext(next).ServeHTTP(rr, req.Request())

	assert.Equal(t, http.StatusOK, rr.Result().StatusCode)
}

func TestApiAnonymousBoardCreationContextNotAllowed(t *testing.T) {
	userId := uuid.New()

	mockUserService := NewMockUserService(t)
	mockSessionService := sessions.NewMockSessionService(t)
	userApi := NewUserApi(mockUserService, mockSessionService, false, true)

	rr := httptest.NewRecorder()
	req := technical_helper.NewTestRequestBuilder("GET", "/", nil).
		AddToContext(identifiers.UserIdentifier, userId)

	rctx := chi.NewRouteContext()
	rctx.URLParams.Add("id", userId.String())

	mockUserService.EXPECT().Get(mock.Anything, userId).
		Return(&User{ID: userId, AccountType: common.Anonymous}, nil)

	next := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})

	userApi.AnonymousBoardCreationContext(next).ServeHTTP(rr, req.Request())

	assert.Equal(t, http.StatusForbidden, rr.Result().StatusCode)
	assert.Error(t, common.ForbiddenError(errors.New("not authorized to create boards anonymously")))
}

func TestApiAnonymousCustomTemplateCreationContextNotAllowed(t *testing.T) {
	userId := uuid.New()

	mockUserService := NewMockUserService(t)
	mockSessionService := sessions.NewMockSessionService(t)
	userApi := NewUserApi(mockUserService, mockSessionService, false, false)

	rr := httptest.NewRecorder()
	req := technical_helper.NewTestRequestBuilder("GET", "/", nil).
		AddToContext(identifiers.UserIdentifier, userId)

	mockUserService.EXPECT().Get(mock.Anything, userId).
		Return(&User{ID: userId, AccountType: common.Anonymous}, nil)

	next := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})

	userApi.AnonymousCustomTemplateCreationContext(next).ServeHTTP(rr, req.Request())

	assert.Equal(t, http.StatusForbidden, rr.Result().StatusCode)
	assert.Error(t, common.ForbiddenError(errors.New("not authorized to create custom templates anonymous")))
}

func TestApiIsAccountOwner(t *testing.T) {
	userId := uuid.New()

	mockUserService := NewMockUserService(t)
	mockSessionService := sessions.NewMockSessionService(t)
	userApi := NewUserApi(mockUserService, mockSessionService, true, true)

	rr := httptest.NewRecorder()
	req := technical_helper.NewTestRequestBuilder(http.MethodDelete, fmt.Sprintf("/%s", userId), nil).
		AddToContext(identifiers.UserIdentifier, userId)

	rctx := chi.NewRouteContext()
	rctx.URLParams.Add("user", userId.String())
	req.AddToContext(chi.RouteCtxKey, rctx)

	next := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})

	userApi.IsAccountOwner(next).ServeHTTP(rr, req.Request())

	assert.Equal(t, http.StatusOK, rr.Result().StatusCode)
}

func TestApiIsAccountOwner_differentIds(t *testing.T) {
	userId := uuid.New()
	requestId := uuid.New()

	mockUserService := NewMockUserService(t)
	mockSessionService := sessions.NewMockSessionService(t)
	userApi := NewUserApi(mockUserService, mockSessionService, true, true)

	rr := httptest.NewRecorder()
	req := technical_helper.NewTestRequestBuilder(http.MethodDelete, fmt.Sprintf("/%s", requestId), nil).
		AddToContext(identifiers.UserIdentifier, userId)

	rctx := chi.NewRouteContext()
	rctx.URLParams.Add("user", requestId.String())
	req.AddToContext(chi.RouteCtxKey, rctx)

	next := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})

	userApi.IsAccountOwner(next).ServeHTTP(rr, req.Request())

	assert.Equal(t, http.StatusBadRequest, rr.Result().StatusCode)
}
