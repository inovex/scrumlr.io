package feedback

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"scrumlr.io/server/technical_helper"
)

func TestRegisterRoutes(t *testing.T) {
	mockFeedbackApi := NewMockFeedbackApi(t)

	router := NewFeedbackRouter(mockFeedbackApi)
	feedbackRoutes := router.RegisterRoutes()

	routes := feedbackRoutes.Routes()
	assert.Len(t, routes, 1)
}

func TestPostFeedbackRegistered(t *testing.T) {
	mockFeedbackApi := NewMockFeedbackApi(t)
	mockFeedbackApi.EXPECT().CreateFeedback(mock.Anything, mock.Anything).
		RunAndReturn(func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusCreated)
		})

	router := NewFeedbackRouter(mockFeedbackApi)
	feedbackRoutes := router.RegisterRoutes()

	feedbackRequest := FeedbackRequest{
		Contact: new("info@scrumlr.io"),
		Text:    new("Greate tool"),
		Type:    Praise,
	}

	body, err := json.Marshal(feedbackRequest)
	assert.NoError(t, err)

	rr := httptest.NewRecorder()
	req := technical_helper.NewTestRequestBuilder(http.MethodPost, "/", bytes.NewReader(body))

	feedbackRoutes.ServeHTTP(rr, req.Request())

	assert.Equal(t, http.StatusCreated, rr.Result().StatusCode)
}
