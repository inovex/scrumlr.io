package health

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"scrumlr.io/server/technical_helper"
)

func TestRegisterRoutes(t *testing.T) {
	mockHealthApi := NewMockHealthApi(t)

	router := NewHealthRouter(mockHealthApi)
	healthRoutes := router.RegisterRoutes()

	routes := healthRoutes.Routes()
	assert.Len(t, routes, 1)
}

func TestGetHealthRegistered(t *testing.T) {
	mockHealthApi := NewMockHealthApi(t)
	mockHealthApi.EXPECT().Check(mock.Anything, mock.Anything).
		RunAndReturn(func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusNoContent)
		})

	router := NewHealthRouter(mockHealthApi)
	healthRoutes := router.RegisterRoutes()

	rr := httptest.NewRecorder()
	req := technical_helper.NewTestRequestBuilder(http.MethodGet, "/", nil)

	healthRoutes.ServeHTTP(rr, req.Request())

	assert.Equal(t, http.StatusNoContent, rr.Result().StatusCode)
}
