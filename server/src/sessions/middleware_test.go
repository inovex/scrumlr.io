package sessions

import (
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"scrumlr.io/server/common"
	"scrumlr.io/server/identifiers"
	"scrumlr.io/server/technical_helper"
)

func TestApiBoardParticipantContext(t *testing.T) {
	boardID := uuid.New()
	userID := uuid.New()

	sessionServiceMock := NewMockSessionService(t)
	sessionApi := NewSessionApi(sessionServiceMock)
	req := technical_helper.NewTestRequestBuilder("GET", "/", nil).
		AddToContext(identifiers.UserIdentifier, userID)

	rctx := chi.NewRouteContext()
	rctx.URLParams.Add("id", boardID.String())
	req.AddToContext(chi.RouteCtxKey, rctx)

	rr := httptest.NewRecorder()

	next := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})
	sessionServiceMock.EXPECT().Exists(mock.Anything, boardID, userID).Return(true, nil)
	sessionServiceMock.EXPECT().IsParticipantBanned(mock.Anything, boardID, userID).Return(false, nil)

	sessionApi.BoardParticipantContext(next).ServeHTTP(rr, req.Request())

	assert.Equal(t, http.StatusOK, rr.Result().StatusCode)
}

func TestApiBoardParticipantContextNoParticipant(t *testing.T) {
	boardID := uuid.New()
	userID := uuid.New()

	sessionServiceMock := NewMockSessionService(t)
	sessionApi := NewSessionApi(sessionServiceMock)
	req := technical_helper.NewTestRequestBuilder("GET", "/", nil).
		AddToContext(identifiers.UserIdentifier, userID)

	rctx := chi.NewRouteContext()
	rctx.URLParams.Add("id", boardID.String())
	req.AddToContext(chi.RouteCtxKey, rctx)

	rr := httptest.NewRecorder()

	next := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})
	sessionServiceMock.EXPECT().Exists(mock.Anything, boardID, userID).Return(false, nil)

	sessionApi.BoardParticipantContext(next).ServeHTTP(rr, req.Request())

	assert.Equal(t, http.StatusForbidden, rr.Result().StatusCode)
}

func TestApiBoardParticipantContextParticipantBanned(t *testing.T) {
	boardID := uuid.New()
	userID := uuid.New()

	sessionServiceMock := NewMockSessionService(t)
	sessionApi := NewSessionApi(sessionServiceMock)
	req := technical_helper.NewTestRequestBuilder("GET", "/", nil).
		AddToContext(identifiers.UserIdentifier, userID)

	rctx := chi.NewRouteContext()
	rctx.URLParams.Add("id", boardID.String())
	req.AddToContext(chi.RouteCtxKey, rctx)

	rr := httptest.NewRecorder()

	next := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})
	sessionServiceMock.EXPECT().Exists(mock.Anything, boardID, userID).Return(true, nil)
	sessionServiceMock.EXPECT().IsParticipantBanned(mock.Anything, boardID, userID).Return(true, nil)

	sessionApi.BoardParticipantContext(next).ServeHTTP(rr, req.Request())

	assert.Equal(t, http.StatusForbidden, rr.Result().StatusCode)
	assert.Error(t, common.ForbiddenError(errors.New("participant is currently banned from this session")))
}

func TestApiBoardModeratorContextExists(t *testing.T) {
	boardID := uuid.New()
	userID := uuid.New()
	sessionServiceMock := NewMockSessionService(t)
	sessionApi := NewSessionApi(sessionServiceMock)
	req := technical_helper.NewTestRequestBuilder("GET", "/", nil).
		AddToContext(identifiers.UserIdentifier, userID)

	rctx := chi.NewRouteContext()
	rctx.URLParams.Add("id", boardID.String())
	req.AddToContext(chi.RouteCtxKey, rctx)

	rr := httptest.NewRecorder()

	next := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})

	sessionServiceMock.EXPECT().ModeratorSessionExists(mock.Anything, boardID, userID).Return(true, nil)

	sessionApi.BoardModeratorContext(next).ServeHTTP(rr, req.Request())

	assert.Equal(t, http.StatusOK, rr.Result().StatusCode)
}

func TestApiBoardModeratorContextDoesNotExists(t *testing.T) {
	boardID := uuid.New()
	userID := uuid.New()
	sessionServiceMock := NewMockSessionService(t)
	sessionApi := NewSessionApi(sessionServiceMock)
	req := technical_helper.NewTestRequestBuilder("GET", "/", nil).
		AddToContext(identifiers.UserIdentifier, userID)

	rctx := chi.NewRouteContext()
	rctx.URLParams.Add("id", boardID.String())
	req.AddToContext(chi.RouteCtxKey, rctx)

	rr := httptest.NewRecorder()

	next := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})

	sessionServiceMock.EXPECT().ModeratorSessionExists(mock.Anything, boardID, userID).Return(false, nil)

	sessionApi.BoardModeratorContext(next).ServeHTTP(rr, req.Request())

	assert.Equal(t, http.StatusNotFound, rr.Result().StatusCode)
}

func TestApiBoardOwnerContextExists(t *testing.T) {
	boardID := uuid.New()
	userID := uuid.New()
	sessionServiceMock := NewMockSessionService(t)
	sessionApi := NewSessionApi(sessionServiceMock)
	req := technical_helper.NewTestRequestBuilder("GET", "/", nil).
		AddToContext(identifiers.UserIdentifier, userID)

	rctx := chi.NewRouteContext()
	rctx.URLParams.Add("id", boardID.String())
	req.AddToContext(chi.RouteCtxKey, rctx)

	rr := httptest.NewRecorder()

	next := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})

	sessionServiceMock.EXPECT().OwnerSessionExists(mock.Anything, boardID, userID).Return(true, nil)

	sessionApi.BoardOwnerContext(next).ServeHTTP(rr, req.Request())

	assert.Equal(t, http.StatusOK, rr.Result().StatusCode)
}

func TestApiBoardOwnerContextDoesNotExists(t *testing.T) {
	boardID := uuid.New()
	userID := uuid.New()
	sessionServiceMock := NewMockSessionService(t)
	sessionApi := NewSessionApi(sessionServiceMock)
	req := technical_helper.NewTestRequestBuilder("GET", "/", nil).
		AddToContext(identifiers.UserIdentifier, userID)

	rctx := chi.NewRouteContext()
	rctx.URLParams.Add("id", boardID.String())
	req.AddToContext(chi.RouteCtxKey, rctx)

	rr := httptest.NewRecorder()

	next := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})

	sessionServiceMock.EXPECT().OwnerSessionExists(mock.Anything, boardID, userID).Return(false, nil)

	sessionApi.BoardOwnerContext(next).ServeHTTP(rr, req.Request())

	assert.Equal(t, http.StatusNotFound, rr.Result().StatusCode)
}
