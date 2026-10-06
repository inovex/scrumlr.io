package health

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"scrumlr.io/server/technical_helper"
)

func TestApiHealthCheck(t *testing.T) {
	mockHealthService := NewMockHealthService(t)
	mockHealthService.EXPECT().IsRealtimeHealthy(mock.Anything).
		Return(true)
	mockHealthService.EXPECT().IsDatabaseHealthy(mock.Anything).
		Return(true)

	api := NewHealthApi(mockHealthService)

	rr := httptest.NewRecorder()
	req := technical_helper.NewTestRequestBuilder(http.MethodGet, "/health", nil)

	api.Check(rr, req.Request())

	assert.Equal(t, http.StatusNoContent, rr.Result().StatusCode)
}

func TestApiHealthCheckRealtimeNotHealthy(t *testing.T) {
	mockHealthService := NewMockHealthService(t)
	mockHealthService.EXPECT().IsRealtimeHealthy(mock.Anything).
		Return(false)
	mockHealthService.EXPECT().IsDatabaseHealthy(mock.Anything).
		Return(true)

	api := NewHealthApi(mockHealthService)

	rr := httptest.NewRecorder()
	req := technical_helper.NewTestRequestBuilder(http.MethodGet, "/health", nil)

	api.Check(rr, req.Request())

	assert.Equal(t, http.StatusServiceUnavailable, rr.Result().StatusCode)
}

func TestApiHealthCheckDatabaseNotHealthy(t *testing.T) {
	mockHealthService := NewMockHealthService(t)
	mockHealthService.EXPECT().IsRealtimeHealthy(mock.Anything).
		Return(true)
	mockHealthService.EXPECT().IsDatabaseHealthy(mock.Anything).
		Return(false)

	api := NewHealthApi(mockHealthService)

	rr := httptest.NewRecorder()
	req := technical_helper.NewTestRequestBuilder(http.MethodGet, "/health", nil)

	api.Check(rr, req.Request())

	assert.Equal(t, http.StatusServiceUnavailable, rr.Result().StatusCode)
}
