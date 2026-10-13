package columntemplates

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"scrumlr.io/server/identifiers"
)

func TestColumnTemplateRouterRegistersRoutes(t *testing.T) {
	api := NewMockColumnTemplateApi(t)

	routes := NewColumnTemplateRouter(api).RegisterRoutes().Routes()

	assert.Len(t, routes, 2)
	assert.ElementsMatch(t, []string{"/", "/{columnTemplate}"}, []string{routes[0].Pattern, routes[1].Pattern})
}

func TestColumnTemplateRouterCreatesTemplate(t *testing.T) {
	api := NewMockColumnTemplateApi(t)

	api.EXPECT().CreateColumnTemplate(mock.Anything, mock.Anything).
		Run(func(w http.ResponseWriter, _ *http.Request) {
			w.WriteHeader(http.StatusCreated)
		})

	router := NewColumnTemplateRouter(api).RegisterRoutes()
	request := httptest.NewRequest(http.MethodPost, "/", nil)
	response := httptest.NewRecorder()

	router.ServeHTTP(response, request)

	assert.Equal(t, http.StatusCreated, response.Code)
}

func TestColumnTemplateRouterGetTemplates(t *testing.T) {
	api := NewMockColumnTemplateApi(t)

	api.EXPECT().GetColumnTemplates(mock.Anything, mock.Anything).
		Run(func(w http.ResponseWriter, _ *http.Request) {
			w.WriteHeader(http.StatusOK)
		})

	router := NewColumnTemplateRouter(api).RegisterRoutes()
	request := httptest.NewRequest(http.MethodGet, "/", nil)
	response := httptest.NewRecorder()

	router.ServeHTTP(response, request)

	assert.Equal(t, http.StatusOK, response.Code)
}

func TestColumnTemplateRouterGetsTemplate(t *testing.T) {
	templateId := uuid.New()

	api := NewMockColumnTemplateApi(t)

	api.EXPECT().GetColumnTemplate(mock.Anything, mock.Anything).
		Run(func(w http.ResponseWriter, r *http.Request) {
			id, ok := r.Context().Value(identifiers.ColumnTemplateIdentifier).(uuid.UUID)

			assert.True(t, ok)
			assert.Equal(t, templateId, id)

			w.WriteHeader(http.StatusOK)
		})

	router := NewColumnTemplateRouter(api).RegisterRoutes()
	request := httptest.NewRequest(http.MethodGet, "/"+templateId.String(), nil)
	response := httptest.NewRecorder()

	router.ServeHTTP(response, request)

	assert.Equal(t, http.StatusOK, response.Code)
}

func TestColumnTemplateRouterUpdatesTemplate(t *testing.T) {
	templateId := uuid.New()

	api := NewMockColumnTemplateApi(t)

	api.EXPECT().UpdateColumnTemplate(mock.Anything, mock.Anything).
		Run(func(w http.ResponseWriter, r *http.Request) {
			id, ok := r.Context().Value(identifiers.ColumnTemplateIdentifier).(uuid.UUID)

			assert.True(t, ok)
			assert.Equal(t, templateId, id)

			w.WriteHeader(http.StatusOK)
		})

	router := NewColumnTemplateRouter(api).RegisterRoutes()
	request := httptest.NewRequest(http.MethodPut, "/"+templateId.String(), nil)
	response := httptest.NewRecorder()

	router.ServeHTTP(response, request)

	assert.Equal(t, http.StatusOK, response.Code)
}

func TestColumnTemplateRouterDeletesTemplate(t *testing.T) {
	templateId := uuid.New()

	api := NewMockColumnTemplateApi(t)

	api.EXPECT().DeleteColumnTemplate(mock.Anything, mock.Anything).
		Run(func(w http.ResponseWriter, r *http.Request) {
			id, ok := r.Context().Value(identifiers.ColumnTemplateIdentifier).(uuid.UUID)

			assert.True(t, ok)
			assert.Equal(t, templateId, id)

			w.WriteHeader(http.StatusNoContent)
		})

	router := NewColumnTemplateRouter(api).RegisterRoutes()
	request := httptest.NewRequest(http.MethodDelete, "/"+templateId.String(), nil)
	response := httptest.NewRecorder()

	router.ServeHTTP(response, request)

	assert.Equal(t, http.StatusNoContent, response.Code)
}
