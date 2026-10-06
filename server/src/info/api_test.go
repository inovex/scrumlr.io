package info

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"scrumlr.io/server/common"
	"scrumlr.io/server/technical_helper"
)

func TestApiGetInfo(t *testing.T) {
	expectedInfo := &Info{
		AuthProvider:                  []common.AccountType{common.Google, common.GitHub, common.TypeOIDC},
		AnonymousLoginDisabled:        false,
		AllowAnonymousCustomTemplates: false,
		AllowAnonymousBoardCreation:   true,
		AllowAnonymousHistory:         false,
		ServerTime:                    time.Date(2026, time.August, 28, 16, 35, 0, 0, time.UTC),
		FeedbackEnabled:               true,
	}

	mockInfoService := NewMockInfoService(t)
	mockInfoService.EXPECT().Get(mock.Anything).
		Return(expectedInfo)

	api := NewInfoApi(mockInfoService)

	rr := httptest.NewRecorder()
	req := technical_helper.NewTestRequestBuilder(http.MethodGet, "/info", nil)

	api.GetInfo(rr, req.Request())

	assert.Equal(t, http.StatusOK, rr.Result().StatusCode)

	var response Info
	err := json.Unmarshal(rr.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, *expectedInfo, response)
}
