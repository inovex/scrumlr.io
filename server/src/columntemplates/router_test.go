package columntemplates

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

func TestColumnTemplateRouterRegistersRoutes(t *testing.T) {
	api := NewMockColumnTemplateApi(t)
	api.EXPECT().ColumnTemplateContext(mock.Anything).
		RunAndReturn(func(next http.Handler) http.Handler { return next })

	routes := NewColumnTemplateRouter(api).RegisterRoutes().Routes()

	assert.Len(t, routes, 2)
	assert.ElementsMatch(t, []string{"/", "/{id}"}, []string{routes[0].Pattern, routes[1].Pattern})
}

func TestColumnTemplateRouterCreatesTemplate(t *testing.T) {
	api := NewMockColumnTemplateApi(t)
	api.EXPECT().ColumnTemplateContext(mock.Anything).
		RunAndReturn(func(next http.Handler) http.Handler { return next })
	api.EXPECT().CreateColumnTemplate(mock.Anything, mock.Anything).
		Run(func(w http.ResponseWriter, _ *http.Request) { w.WriteHeader(http.StatusCreated) })

	router := NewColumnTemplateRouter(api).RegisterRoutes()
	request := httptest.NewRequest(http.MethodPost, "/", nil)
	response := httptest.NewRecorder()

	router.ServeHTTP(response, request)

	assert.Equal(t, http.StatusCreated, response.Code)
}

func TestColumnTemplateRouterGetsTemplates(t *testing.T) {
	api := NewMockColumnTemplateApi(t)
	api.EXPECT().ColumnTemplateContext(mock.Anything).
		RunAndReturn(func(next http.Handler) http.Handler { return next })
	api.EXPECT().GetColumnTemplates(mock.Anything, mock.Anything).
		Run(func(w http.ResponseWriter, _ *http.Request) { w.WriteHeader(http.StatusOK) })

	router := NewColumnTemplateRouter(api).RegisterRoutes()
	request := httptest.NewRequest(http.MethodGet, "/", nil)
	response := httptest.NewRecorder()

	router.ServeHTTP(response, request)

	assert.Equal(t, http.StatusOK, response.Code)
}

func TestColumnTemplateRouterGetsTemplate(t *testing.T) {
	api := NewMockColumnTemplateApi(t)
	api.EXPECT().ColumnTemplateContext(mock.Anything).
		RunAndReturn(func(next http.Handler) http.Handler { return next })
	api.EXPECT().GetColumnTemplate(mock.Anything, mock.Anything).
		Run(func(w http.ResponseWriter, _ *http.Request) { w.WriteHeader(http.StatusOK) })

	router := NewColumnTemplateRouter(api).RegisterRoutes()
	request := httptest.NewRequest(http.MethodGet, "/template-id", nil)
	response := httptest.NewRecorder()

	router.ServeHTTP(response, request)

	assert.Equal(t, http.StatusOK, response.Code)
}

func TestColumnTemplateRouterUpdatesTemplate(t *testing.T) {
	api := NewMockColumnTemplateApi(t)
	api.EXPECT().ColumnTemplateContext(mock.Anything).
		RunAndReturn(func(next http.Handler) http.Handler { return next })
	api.EXPECT().UpdateColumnTemplate(mock.Anything, mock.Anything).
		Run(func(w http.ResponseWriter, _ *http.Request) { w.WriteHeader(http.StatusOK) })

	router := NewColumnTemplateRouter(api).RegisterRoutes()
	request := httptest.NewRequest(http.MethodPut, "/template-id", nil)
	response := httptest.NewRecorder()

	router.ServeHTTP(response, request)

	assert.Equal(t, http.StatusOK, response.Code)
}

func TestColumnTemplateRouterDeletesTemplate(t *testing.T) {
	api := NewMockColumnTemplateApi(t)
	api.EXPECT().ColumnTemplateContext(mock.Anything).
		RunAndReturn(func(next http.Handler) http.Handler { return next })
	api.EXPECT().DeleteColumnTemplate(mock.Anything, mock.Anything).
		Run(func(w http.ResponseWriter, _ *http.Request) { w.WriteHeader(http.StatusNoContent) })

	router := NewColumnTemplateRouter(api).RegisterRoutes()
	request := httptest.NewRequest(http.MethodDelete, "/template-id", nil)
	response := httptest.NewRecorder()

	router.ServeHTTP(response, request)

	assert.Equal(t, http.StatusNoContent, response.Code)
}
