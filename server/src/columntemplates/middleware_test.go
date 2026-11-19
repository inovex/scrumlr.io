package columntemplates

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

func TestMiddlewareColumnTemplateContext(t *testing.T) {
	templateID := uuid.New()

	routeContext := chi.NewRouteContext()
	routeContext.URLParams.Add("columnTemplate", templateID.String())

	request := httptest.NewRequest(http.MethodGet, "/"+templateID.String(), nil).
		WithContext(context.WithValue(context.Background(), chi.RouteCtxKey, routeContext))
	response := httptest.NewRecorder()

	next := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		assert.Equal(t, templateID, r.Context().Value(identifiers.ColumnTemplateIdentifier))
		w.WriteHeader(http.StatusNoContent)
	})

	ColumnTemplateContext(next).ServeHTTP(response, request)

	assert.Equal(t, http.StatusNoContent, response.Code)
}

func TestMiddlewareColumnTemplateContextBadRequest(t *testing.T) {

	routeContext := chi.NewRouteContext()
	routeContext.URLParams.Add("columnTemplate", "invalid")

	request := httptest.NewRequest(http.MethodGet, "/invalid", nil).
		WithContext(context.WithValue(context.Background(), chi.RouteCtxKey, routeContext))
	response := httptest.NewRecorder()

	next := http.HandlerFunc(func(http.ResponseWriter, *http.Request) {
		t.Fatal("next handler should not be called")
	})

	ColumnTemplateContext(next).ServeHTTP(response, request)

	assert.Equal(t, http.StatusBadRequest, response.Code)
}
