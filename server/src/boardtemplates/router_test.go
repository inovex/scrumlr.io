package boardtemplates

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"scrumlr.io/server/identifiers"
)

func TestBoardTemplateRouterRegistersRoutes(t *testing.T) {
	boardApi := NewMockBoardTemplateApi(t)

	routes := NewBoardTemplateRouter(boardApi).RegisterRoutes().Routes()

	assert.Len(t, routes, 2)
	assert.ElementsMatch(t, []string{"/", "/{id}/*"}, []string{routes[0].Pattern, routes[1].Pattern})
}

func TestBoardTemplateRouterCreateTemplate(t *testing.T) {
	boardApi := NewMockBoardTemplateApi(t)

	boardApi.EXPECT().CreateBoardTemplate(mock.Anything, mock.Anything).
		RunAndReturn(func(w http.ResponseWriter, _ *http.Request) {
			w.WriteHeader(http.StatusCreated)
		})

	router := NewBoardTemplateRouter(boardApi).RegisterRoutes()
	request := httptest.NewRequest(http.MethodPost, "/", nil)
	response := httptest.NewRecorder()

	router.ServeHTTP(response, request)

	assert.Equal(t, http.StatusCreated, response.Code)
}

func TestBoardTemplateRouterGetTemplates(t *testing.T) {
	boardApi := NewMockBoardTemplateApi(t)

	boardApi.EXPECT().GetBoardTemplates(mock.Anything, mock.Anything).
		Run(func(w http.ResponseWriter, _ *http.Request) {
			w.WriteHeader(http.StatusOK)
		})

	router := NewBoardTemplateRouter(boardApi).RegisterRoutes()
	request := httptest.NewRequest(http.MethodGet, "/", nil)
	response := httptest.NewRecorder()

	router.ServeHTTP(response, request)

	assert.Equal(t, http.StatusOK, response.Code)
}

func TestBoardTemplateRouterGetTemplate(t *testing.T) {
	templateId := uuid.New()
	boardApi := NewMockBoardTemplateApi(t)

	boardApi.EXPECT().GetBoardTemplate(mock.Anything, mock.Anything).
		Run(func(w http.ResponseWriter, r *http.Request) {
			id, ok := r.Context().Value(identifiers.BoardTemplateIdentifier).(uuid.UUID)

			assert.True(t, ok)
			assert.Equal(t, templateId, id)

			w.WriteHeader(http.StatusOK)
		})

	router := NewBoardTemplateRouter(boardApi).RegisterRoutes()
	request := httptest.NewRequest(http.MethodGet, "/"+templateId.String(), nil)
	response := httptest.NewRecorder()

	router.ServeHTTP(response, request)

	assert.Equal(t, http.StatusOK, response.Code)
}

func TestBoardTemplateRouterUpdatesTemplate(t *testing.T) {
	templateId := uuid.New()

	boardApi := NewMockBoardTemplateApi(t)

	boardApi.EXPECT().UpdateBoardTemplate(mock.Anything, mock.Anything).
		Run(func(w http.ResponseWriter, r *http.Request) {
			id, ok := r.Context().Value(identifiers.BoardTemplateIdentifier).(uuid.UUID)

			assert.True(t, ok)
			assert.Equal(t, templateId, id)

			w.WriteHeader(http.StatusOK)
		})

	router := NewBoardTemplateRouter(boardApi).RegisterRoutes()
	request := httptest.NewRequest(http.MethodPut, "/"+templateId.String(), nil)
	response := httptest.NewRecorder()

	router.ServeHTTP(response, request)

	assert.Equal(t, http.StatusOK, response.Code)
}

func TestBoardTemplateRouterDeletesTemplate(t *testing.T) {
	templateId := uuid.New()

	boardApi := NewMockBoardTemplateApi(t)

	boardApi.EXPECT().DeleteBoardTemplate(mock.Anything, mock.Anything).
		Run(func(w http.ResponseWriter, r *http.Request) {
			id, ok := r.Context().Value(identifiers.BoardTemplateIdentifier).(uuid.UUID)

			assert.True(t, ok)
			assert.Equal(t, templateId, id)

			w.WriteHeader(http.StatusNoContent)
		})

	router := NewBoardTemplateRouter(boardApi).RegisterRoutes()
	request := httptest.NewRequest(http.MethodDelete, "/"+templateId.String(), nil)
	response := httptest.NewRecorder()

	router.ServeHTTP(response, request)

	assert.Equal(t, http.StatusNoContent, response.Code)
}
