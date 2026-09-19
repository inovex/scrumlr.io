package boardtemplates

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

func TestBoardTemplateRouterRegistersRoutes(t *testing.T) {
	api := NewMockBoardTemplateApi(t)

	routes := NewBoardTemplateRouter(api).RegisterRoutes().Routes()

	assert.Len(t, routes, 2)
	assert.ElementsMatch(t, []string{"/", "/{id}"}, []string{routes[0].Pattern, routes[1].Pattern})
}

func TestBoardTemplateRouterDispatchesRoutes(t *testing.T) {
	tests := []struct {
		name           string
		method         string
		path           string
		expectedStatus int
		setExpectation func(*MockBoardTemplateApi)
	}{
		{
			name:           "create template",
			method:         http.MethodPost,
			path:           "/",
			expectedStatus: http.StatusCreated,
			setExpectation: func(api *MockBoardTemplateApi) {
				api.EXPECT().CreateBoardTemplate(mock.Anything, mock.Anything).
					Run(func(w http.ResponseWriter, _ *http.Request) { w.WriteHeader(http.StatusCreated) })
			},
		},
		{
			name:           "get templates",
			method:         http.MethodGet,
			path:           "/",
			expectedStatus: http.StatusOK,
			setExpectation: func(api *MockBoardTemplateApi) {
				api.EXPECT().GetBoardTemplates(mock.Anything, mock.Anything).
					Run(func(w http.ResponseWriter, _ *http.Request) { w.WriteHeader(http.StatusOK) })
			},
		},
		{
			name:           "get template",
			method:         http.MethodGet,
			path:           "/template-id",
			expectedStatus: http.StatusOK,
			setExpectation: func(api *MockBoardTemplateApi) {
				api.EXPECT().GetBoardTemplate(mock.Anything, mock.Anything).
					Run(func(w http.ResponseWriter, _ *http.Request) { w.WriteHeader(http.StatusOK) })
			},
		},
		{
			name:           "update template",
			method:         http.MethodPut,
			path:           "/template-id",
			expectedStatus: http.StatusOK,
			setExpectation: func(api *MockBoardTemplateApi) {
				api.EXPECT().UpdateBoardTemplate(mock.Anything, mock.Anything).
					Run(func(w http.ResponseWriter, _ *http.Request) { w.WriteHeader(http.StatusOK) })
			},
		},
		{
			name:           "delete template",
			method:         http.MethodDelete,
			path:           "/template-id",
			expectedStatus: http.StatusNoContent,
			setExpectation: func(api *MockBoardTemplateApi) {
				api.EXPECT().DeleteBoardTemplate(mock.Anything, mock.Anything).
					Run(func(w http.ResponseWriter, _ *http.Request) { w.WriteHeader(http.StatusNoContent) })
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			api := NewMockBoardTemplateApi(t)
			tt.setExpectation(api)
			router := NewBoardTemplateRouter(api).RegisterRoutes()

			request := httptest.NewRequest(tt.method, tt.path, nil)
			response := httptest.NewRecorder()

			router.ServeHTTP(response, request)

			assert.Equal(t, tt.expectedStatus, response.Code)
		})
	}
}
