package feedback

import (
	"bytes"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"scrumlr.io/server/technical_helper"
)

func TestApiCreateFeedbackFeatureRequest(t *testing.T) {
	feedbackRequest := FeedbackRequest{
		Contact: new("info@scrumlr.io"),
		Text:    new("I want feature xyz"),
		Type:    FeatureRequest,
	}

	mockFeedbackService := NewMockFeedbackService(t)
	mockFeedbackService.EXPECT().Create(mock.Anything, feedbackRequest.Type, *feedbackRequest.Contact, *feedbackRequest.Text).
		Return(nil)

	api := NewFeedbackApi(mockFeedbackService)

	body, err := json.Marshal(feedbackRequest)
	assert.NoError(t, err)

	rr := httptest.NewRecorder()
	req := technical_helper.NewTestRequestBuilder(http.MethodPost, "/feedback", bytes.NewReader(body))

	api.CreateFeedback(rr, req.Request())

	assert.Equal(t, http.StatusCreated, rr.Result().StatusCode)
}

func TestApiCreateFeedbackFeatureRequestContactNil(t *testing.T) {
	feedbackRequest := FeedbackRequest{
		Contact: nil,
		Text:    new("I want feature xyz"),
		Type:    FeatureRequest,
	}

	mockFeedbackService := NewMockFeedbackService(t)
	mockFeedbackService.EXPECT().Create(mock.Anything, feedbackRequest.Type, "/", *feedbackRequest.Text).
		Return(nil)

	api := NewFeedbackApi(mockFeedbackService)

	body, err := json.Marshal(feedbackRequest)
	assert.NoError(t, err)

	rr := httptest.NewRecorder()
	req := technical_helper.NewTestRequestBuilder(http.MethodPost, "/feedback", bytes.NewReader(body))

	api.CreateFeedback(rr, req.Request())

	assert.Equal(t, http.StatusCreated, rr.Result().StatusCode)
}

func TestApiCreateFeedbackFeatureRequestContactEmpty(t *testing.T) {
	feedbackRequest := FeedbackRequest{
		Contact: new(""),
		Text:    new("I want feature xyz"),
		Type:    FeatureRequest,
	}

	mockFeedbackService := NewMockFeedbackService(t)
	mockFeedbackService.EXPECT().Create(mock.Anything, feedbackRequest.Type, "/", *feedbackRequest.Text).
		Return(nil)

	api := NewFeedbackApi(mockFeedbackService)

	body, err := json.Marshal(feedbackRequest)
	assert.NoError(t, err)

	rr := httptest.NewRecorder()
	req := technical_helper.NewTestRequestBuilder(http.MethodPost, "/feedback", bytes.NewReader(body))

	api.CreateFeedback(rr, req.Request())

	assert.Equal(t, http.StatusCreated, rr.Result().StatusCode)
}

func TestApiCreateFeedbackFeatureRequestTextNil(t *testing.T) {
	feedbackRequest := FeedbackRequest{
		Contact: new("info@scrumlr.io"),
		Text:    nil,
		Type:    FeatureRequest,
	}

	mockFeedbackService := NewMockFeedbackService(t)
	api := NewFeedbackApi(mockFeedbackService)

	body, err := json.Marshal(feedbackRequest)
	assert.NoError(t, err)

	rr := httptest.NewRecorder()
	req := technical_helper.NewTestRequestBuilder(http.MethodPost, "/feedback", bytes.NewReader(body))

	api.CreateFeedback(rr, req.Request())

	assert.Equal(t, http.StatusBadRequest, rr.Result().StatusCode)
}

func TestApiCreateFeedbackFeatureRequestTextEmpty(t *testing.T) {
	feedbackRequest := FeedbackRequest{
		Contact: new("info@scrumlr.io"),
		Text:    new(""),
		Type:    FeatureRequest,
	}

	mockFeedbackService := NewMockFeedbackService(t)
	api := NewFeedbackApi(mockFeedbackService)

	body, err := json.Marshal(feedbackRequest)
	assert.NoError(t, err)

	rr := httptest.NewRecorder()
	req := technical_helper.NewTestRequestBuilder(http.MethodPost, "/feedback", bytes.NewReader(body))

	api.CreateFeedback(rr, req.Request())

	assert.Equal(t, http.StatusBadRequest, rr.Result().StatusCode)
}

func TestApiCreateFeedbackBugReport(t *testing.T) {
	feedbackRequest := FeedbackRequest{
		Contact: new("info@scrumlr.io"),
		Text:    new("There is a bug"),
		Type:    BugReport,
	}

	mockFeedbackService := NewMockFeedbackService(t)
	mockFeedbackService.EXPECT().Create(mock.Anything, feedbackRequest.Type, *feedbackRequest.Contact, *feedbackRequest.Text).
		Return(nil)

	api := NewFeedbackApi(mockFeedbackService)

	body, err := json.Marshal(feedbackRequest)
	assert.NoError(t, err)

	rr := httptest.NewRecorder()
	req := technical_helper.NewTestRequestBuilder(http.MethodPost, "/feedback", bytes.NewReader(body))

	api.CreateFeedback(rr, req.Request())

	assert.Equal(t, http.StatusCreated, rr.Result().StatusCode)
}

func TestApiCreateFeedbackBugReportContactNil(t *testing.T) {
	feedbackRequest := FeedbackRequest{
		Contact: nil,
		Text:    new("There is a bug"),
		Type:    BugReport,
	}

	mockFeedbackService := NewMockFeedbackService(t)
	mockFeedbackService.EXPECT().Create(mock.Anything, feedbackRequest.Type, "/", *feedbackRequest.Text).
		Return(nil)

	api := NewFeedbackApi(mockFeedbackService)

	body, err := json.Marshal(feedbackRequest)
	assert.NoError(t, err)

	rr := httptest.NewRecorder()
	req := technical_helper.NewTestRequestBuilder(http.MethodPost, "/feedback", bytes.NewReader(body))

	api.CreateFeedback(rr, req.Request())

	assert.Equal(t, http.StatusCreated, rr.Result().StatusCode)
}

func TestApiCreateFeedbackBugReportContactEmpty(t *testing.T) {
	feedbackRequest := FeedbackRequest{
		Contact: new(""),
		Text:    new("There is a bug"),
		Type:    BugReport,
	}

	mockFeedbackService := NewMockFeedbackService(t)
	mockFeedbackService.EXPECT().Create(mock.Anything, feedbackRequest.Type, "/", *feedbackRequest.Text).
		Return(nil)

	api := NewFeedbackApi(mockFeedbackService)

	body, err := json.Marshal(feedbackRequest)
	assert.NoError(t, err)

	rr := httptest.NewRecorder()
	req := technical_helper.NewTestRequestBuilder(http.MethodPost, "/feedback", bytes.NewReader(body))

	api.CreateFeedback(rr, req.Request())

	assert.Equal(t, http.StatusCreated, rr.Result().StatusCode)
}

func TestApiCreateFeedbackBugReportTextNil(t *testing.T) {
	feedbackRequest := FeedbackRequest{
		Contact: new("info@scrumlr.io"),
		Text:    nil,
		Type:    BugReport,
	}

	mockFeedbackService := NewMockFeedbackService(t)
	api := NewFeedbackApi(mockFeedbackService)

	body, err := json.Marshal(feedbackRequest)
	assert.NoError(t, err)

	rr := httptest.NewRecorder()
	req := technical_helper.NewTestRequestBuilder(http.MethodPost, "/feedback", bytes.NewReader(body))

	api.CreateFeedback(rr, req.Request())

	assert.Equal(t, http.StatusBadRequest, rr.Result().StatusCode)
}

func TestApiCreateFeedbackBugReportTextEmpty(t *testing.T) {
	feedbackRequest := FeedbackRequest{
		Contact: new("info@scrumlr.io"),
		Text:    new(""),
		Type:    BugReport,
	}

	mockFeedbackService := NewMockFeedbackService(t)
	api := NewFeedbackApi(mockFeedbackService)

	body, err := json.Marshal(feedbackRequest)
	assert.NoError(t, err)

	rr := httptest.NewRecorder()
	req := technical_helper.NewTestRequestBuilder(http.MethodPost, "/feedback", bytes.NewReader(body))

	api.CreateFeedback(rr, req.Request())

	assert.Equal(t, http.StatusBadRequest, rr.Result().StatusCode)
}

func TestApiCreateFeedbackPraise(t *testing.T) {
	feedbackRequest := FeedbackRequest{
		Contact: new("info@scrumlr.io"),
		Text:    new("Great tool"),
		Type:    Praise,
	}

	mockFeedbackService := NewMockFeedbackService(t)
	mockFeedbackService.EXPECT().Create(mock.Anything, feedbackRequest.Type, *feedbackRequest.Contact, *feedbackRequest.Text).
		Return(nil)

	api := NewFeedbackApi(mockFeedbackService)

	body, err := json.Marshal(feedbackRequest)
	assert.NoError(t, err)

	rr := httptest.NewRecorder()
	req := technical_helper.NewTestRequestBuilder(http.MethodPost, "/feedback", bytes.NewReader(body))

	api.CreateFeedback(rr, req.Request())

	assert.Equal(t, http.StatusCreated, rr.Result().StatusCode)
}

func TestApiCreateFeedbackPraiseContactNil(t *testing.T) {
	feedbackRequest := FeedbackRequest{
		Contact: nil,
		Text:    new("Great tool"),
		Type:    Praise,
	}

	mockFeedbackService := NewMockFeedbackService(t)
	mockFeedbackService.EXPECT().Create(mock.Anything, feedbackRequest.Type, "/", *feedbackRequest.Text).
		Return(nil)

	api := NewFeedbackApi(mockFeedbackService)

	body, err := json.Marshal(feedbackRequest)
	assert.NoError(t, err)

	rr := httptest.NewRecorder()
	req := technical_helper.NewTestRequestBuilder(http.MethodPost, "/feedback", bytes.NewReader(body))

	api.CreateFeedback(rr, req.Request())

	assert.Equal(t, http.StatusCreated, rr.Result().StatusCode)
}

func TestApiCreateFeedbackPraiseContactEmpty(t *testing.T) {
	feedbackRequest := FeedbackRequest{
		Contact: new(""),
		Text:    new("Great tool"),
		Type:    Praise,
	}

	mockFeedbackService := NewMockFeedbackService(t)
	mockFeedbackService.EXPECT().Create(mock.Anything, feedbackRequest.Type, "/", *feedbackRequest.Text).
		Return(nil)

	api := NewFeedbackApi(mockFeedbackService)

	body, err := json.Marshal(feedbackRequest)
	assert.NoError(t, err)

	rr := httptest.NewRecorder()
	req := technical_helper.NewTestRequestBuilder(http.MethodPost, "/feedback", bytes.NewReader(body))

	api.CreateFeedback(rr, req.Request())

	assert.Equal(t, http.StatusCreated, rr.Result().StatusCode)
}

func TestApiCreateFeedbackPraiseTextNil(t *testing.T) {
	feedbackRequest := FeedbackRequest{
		Contact: new("info@scrumlr.io"),
		Text:    nil,
		Type:    Praise,
	}

	mockFeedbackService := NewMockFeedbackService(t)
	mockFeedbackService.EXPECT().Create(mock.Anything, feedbackRequest.Type, *feedbackRequest.Contact, "/").
		Return(nil)

	api := NewFeedbackApi(mockFeedbackService)

	body, err := json.Marshal(feedbackRequest)
	assert.NoError(t, err)

	rr := httptest.NewRecorder()
	req := technical_helper.NewTestRequestBuilder(http.MethodPost, "/feedback", bytes.NewReader(body))

	api.CreateFeedback(rr, req.Request())

	assert.Equal(t, http.StatusCreated, rr.Result().StatusCode)
}

func TestApiCreateFeedbackPraiseTextEmpty(t *testing.T) {
	feedbackRequest := FeedbackRequest{
		Contact: new("info@scrumlr.io"),
		Text:    new(""),
		Type:    Praise,
	}

	mockFeedbackService := NewMockFeedbackService(t)
	mockFeedbackService.EXPECT().Create(mock.Anything, feedbackRequest.Type, *feedbackRequest.Contact, "/").
		Return(nil)

	api := NewFeedbackApi(mockFeedbackService)

	body, err := json.Marshal(feedbackRequest)
	assert.NoError(t, err)

	rr := httptest.NewRecorder()
	req := technical_helper.NewTestRequestBuilder(http.MethodPost, "/feedback", bytes.NewReader(body))

	api.CreateFeedback(rr, req.Request())

	assert.Equal(t, http.StatusCreated, rr.Result().StatusCode)
}

func TestApiCreateFeedbackInvalidBody(t *testing.T) {
	feedbackRequest := `
    {
      "contact": "info@scrumlr.io",
      "text": "This is a great text",
      "type": "Type"
    }
  `

	mockFeedbackService := NewMockFeedbackService(t)
	api := NewFeedbackApi(mockFeedbackService)

	body, err := json.Marshal(feedbackRequest)
	assert.NoError(t, err)

	rr := httptest.NewRecorder()
	req := technical_helper.NewTestRequestBuilder(http.MethodPost, "/feedback", bytes.NewReader(body))

	api.CreateFeedback(rr, req.Request())

	assert.Equal(t, http.StatusBadRequest, rr.Result().StatusCode)
}

func TestApiCreateFeedbackServiceError(t *testing.T) {
	feedbackRequest := FeedbackRequest{
		Contact: new("info@scrumlr.io"),
		Text:    new("Greate tool"),
		Type:    Praise,
	}

	mockFeedbackService := NewMockFeedbackService(t)
	mockFeedbackService.EXPECT().Create(mock.Anything, feedbackRequest.Type, *feedbackRequest.Contact, *feedbackRequest.Text).
		Return(errors.New("service error"))
	api := NewFeedbackApi(mockFeedbackService)

	body, err := json.Marshal(feedbackRequest)
	assert.NoError(t, err)

	rr := httptest.NewRecorder()
	req := technical_helper.NewTestRequestBuilder(http.MethodPost, "/feedback", bytes.NewReader(body))

	api.CreateFeedback(rr, req.Request())

	assert.Equal(t, http.StatusInternalServerError, rr.Result().StatusCode)
}
