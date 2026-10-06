package boardtemplates

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

func TestBoardTemplateRouterRegistersRoutes(t *testing.T) {
	boardApi := NewMockBoardTemplateApi(t)

	boardApi.EXPECT().BoardTemplateContext(mock.Anything).
		RunAndReturn(func(next http.Handler) http.Handler { return next })

	routes := NewBoardTemplateRouter(boardApi).RegisterRoutes().Routes()

	assert.Len(t, routes, 2)
	assert.ElementsMatch(t, []string{"/", "/{id}/*"}, []string{routes[0].Pattern, routes[1].Pattern})
}

func TestBoardTemplateRouterCreatesTemplate(t *testing.T) {
	boardApi := NewMockBoardTemplateApi(t)

	boardApi.EXPECT().BoardTemplateContext(mock.Anything).
		RunAndReturn(func(next http.Handler) http.Handler { return next })
	boardApi.EXPECT().CreateBoardTemplate(mock.Anything, mock.Anything).
		Run(func(w http.ResponseWriter, _ *http.Request) { w.WriteHeader(http.StatusCreated) })

	router := NewBoardTemplateRouter(boardApi).RegisterRoutes()
	request := httptest.NewRequest(http.MethodPost, "/", nil)
	response := httptest.NewRecorder()

	router.ServeHTTP(response, request)

	assert.Equal(t, http.StatusCreated, response.Code)
}

func TestBoardTemplateRouterGetsTemplates(t *testing.T) {
	boardApi := NewMockBoardTemplateApi(t)
	boardApi.EXPECT().BoardTemplateContext(mock.Anything).
		RunAndReturn(func(next http.Handler) http.Handler { return next })
	boardApi.EXPECT().GetBoardTemplates(mock.Anything, mock.Anything).
		Run(func(w http.ResponseWriter, _ *http.Request) { w.WriteHeader(http.StatusOK) })

	router := NewBoardTemplateRouter(boardApi).RegisterRoutes()
	request := httptest.NewRequest(http.MethodGet, "/", nil)
	response := httptest.NewRecorder()

	router.ServeHTTP(response, request)

	assert.Equal(t, http.StatusOK, response.Code)
}

func TestBoardTemplateRouterGetsTemplate(t *testing.T) {
	boardApi := NewMockBoardTemplateApi(t)
	boardApi.EXPECT().BoardTemplateContext(mock.Anything).
		RunAndReturn(func(next http.Handler) http.Handler { return next })
	boardApi.EXPECT().GetBoardTemplate(mock.Anything, mock.Anything).
		Run(func(w http.ResponseWriter, _ *http.Request) { w.WriteHeader(http.StatusOK) })

	router := NewBoardTemplateRouter(boardApi).RegisterRoutes()
	request := httptest.NewRequest(http.MethodGet, "/template-id", nil)
	response := httptest.NewRecorder()

	router.ServeHTTP(response, request)

	assert.Equal(t, http.StatusOK, response.Code)
}

func TestBoardTemplateRouterUpdatesTemplate(t *testing.T) {
	boardApi := NewMockBoardTemplateApi(t)

	boardApi.EXPECT().BoardTemplateContext(mock.Anything).
		RunAndReturn(func(next http.Handler) http.Handler { return next })
	boardApi.EXPECT().UpdateBoardTemplate(mock.Anything, mock.Anything).
		Run(func(w http.ResponseWriter, _ *http.Request) { w.WriteHeader(http.StatusOK) })

	router := NewBoardTemplateRouter(boardApi).RegisterRoutes()
	request := httptest.NewRequest(http.MethodPut, "/template-id", nil)
	response := httptest.NewRecorder()

	router.ServeHTTP(response, request)

	assert.Equal(t, http.StatusOK, response.Code)
}

func TestBoardTemplateRouterDeletesTemplate(t *testing.T) {
	boardApi := NewMockBoardTemplateApi(t)
	boardApi.EXPECT().BoardTemplateContext(mock.Anything).
		RunAndReturn(func(next http.Handler) http.Handler { return next })
	boardApi.EXPECT().DeleteBoardTemplate(mock.Anything, mock.Anything).
		Run(func(w http.ResponseWriter, _ *http.Request) { w.WriteHeader(http.StatusNoContent) })

	router := NewBoardTemplateRouter(boardApi).RegisterRoutes()
	request := httptest.NewRequest(http.MethodDelete, "/template-id", nil)
	response := httptest.NewRecorder()

	router.ServeHTTP(response, request)

	assert.Equal(t, http.StatusNoContent, response.Code)
}
