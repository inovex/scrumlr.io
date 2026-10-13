package boardtemplates

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"scrumlr.io/server/identifiers"
)

func TestMiddlewareBoardTemplateContext(t *testing.T) {
	templateID := uuid.New()

	routeContext := chi.NewRouteContext()
	routeContext.URLParams.Add("id", templateID.String())

	request := httptest.NewRequest(http.MethodGet, "/"+templateID.String(), nil).
		WithContext(context.WithValue(context.Background(), chi.RouteCtxKey, routeContext))
	response := httptest.NewRecorder()

	nextHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		assert.Equal(t, templateID, r.Context().Value(identifiers.BoardTemplateIdentifier))
		w.WriteHeader(http.StatusNoContent)
	})

	BoardTemplateContext(nextHandler).ServeHTTP(response, request)

	assert.Equal(t, http.StatusNoContent, response.Code)
}

func TestMiddlewareBoardTemplateContextBadRequest(t *testing.T) {
	routeContext := chi.NewRouteContext()
	routeContext.URLParams.Add("id", "invalid")

	request := httptest.NewRequest(http.MethodGet, "/invalid", nil).
		WithContext(context.WithValue(context.Background(), chi.RouteCtxKey, routeContext))
	response := httptest.NewRecorder()

	next := http.HandlerFunc(func(http.ResponseWriter, *http.Request) {
		t.Fatal("next handler should not be called")
	})

	BoardTemplateContext(next).ServeHTTP(response, request)

	assert.Equal(t, http.StatusBadRequest, response.Code)
}
