package info

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/go-chi/render"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"scrumlr.io/server/common"
	"scrumlr.io/server/technical_helper"
)

func TestRegisterRoutes(t *testing.T) {
	mockInfoApi := NewMockInfoApi(t)

	router := NewInfoRouter(mockInfoApi)
	infoRoutes := router.RegisterRoutes()

	routes := infoRoutes.Routes()
	assert.Len(t, routes, 1)
}

func TestGetInfoRegistered(t *testing.T) {
	info := &Info{
		AuthProvider:                  []common.AccountType{common.Google, common.GitHub, common.TypeOIDC},
		AnonymousLoginDisabled:        false,
		AllowAnonymousCustomTemplates: false,
		AllowAnonymousBoardCreation:   true,
		AllowAnonymousHistory:         false,
		ServerTime:                    time.Date(2026, time.August, 28, 16, 35, 0, 0, time.UTC),
		FeedbackEnabled:               true,
	}

	mockInfoApi := NewMockInfoApi(t)
	mockInfoApi.EXPECT().GetInfo(mock.Anything, mock.Anything).
		RunAndReturn(func(w http.ResponseWriter, r *http.Request) {
			render.Status(r, http.StatusOK)
			render.Respond(w, r, info)
		})

	router := NewInfoRouter(mockInfoApi)
	infoRoutes := router.RegisterRoutes()

	rr := httptest.NewRecorder()
	req := technical_helper.NewTestRequestBuilder(http.MethodGet, "/", nil)

	infoRoutes.ServeHTTP(rr, req.Request())

	assert.Equal(t, http.StatusOK, rr.Result().StatusCode)

	var response Info
	err := json.Unmarshal(rr.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, *info, response)
}
