package columntemplates

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"scrumlr.io/server/common"
	"scrumlr.io/server/identifiers"
	"scrumlr.io/server/technical_helper"
)

func TestColumnTemplateContext(t *testing.T) {
	templateID := uuid.New()
	api := NewColumnTemplateApi(NewMockColumnTemplateService(t))
	routeContext := chi.NewRouteContext()
	routeContext.URLParams.Add("columnTemplate", templateID.String())
	request := httptest.NewRequest(http.MethodGet, "/"+templateID.String(), nil).
		WithContext(context.WithValue(context.Background(), chi.RouteCtxKey, routeContext))
	response := httptest.NewRecorder()

	api.ColumnTemplateContext(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		assert.Equal(t, templateID, r.Context().Value(identifiers.ColumnTemplateIdentifier))
		w.WriteHeader(http.StatusNoContent)
	})).ServeHTTP(response, request)

	assert.Equal(t, http.StatusNoContent, response.Code)
}

func TestColumnTemplateContext_BadRequest(t *testing.T) {
	api := NewColumnTemplateApi(NewMockColumnTemplateService(t))
	routeContext := chi.NewRouteContext()
	routeContext.URLParams.Add("columnTemplate", "invalid")
	request := httptest.NewRequest(http.MethodGet, "/invalid", nil).
		WithContext(context.WithValue(context.Background(), chi.RouteCtxKey, routeContext))
	response := httptest.NewRecorder()

	api.ColumnTemplateContext(http.HandlerFunc(func(http.ResponseWriter, *http.Request) {
		t.Fatal("next handler should not be called")
	})).ServeHTTP(response, request)

	assert.Equal(t, http.StatusBadRequest, response.Code)
}

func testColumnTemplate() *ColumnTemplate {
	return &ColumnTemplate{
		ID:            uuid.New(),
		BoardTemplate: uuid.New(),
		Name:          "TestColumnTemplate",
		Description:   "Template Description",
		Color:         common.ColorGoalGreen,
		Visible:       true,
		Index:         0,
	}
}

func TestCreateColumnTemplate(t *testing.T) {
	boardID, userID := uuid.New(), uuid.New()
	visible, index := true, 1
	body := ColumnTemplateRequest{
		Name:        "TestColumnTemplate",
		Description: "Template Description",
		Color:       common.ColorGoalGreen,
		Visible:     &visible, Index: &index,
	}
	expectedBody := body
	expectedBody.BoardTemplate, expectedBody.User = boardID, userID
	template := testColumnTemplate()
	template.BoardTemplate = boardID

	service := NewMockColumnTemplateService(t)
	service.EXPECT().Create(mock.Anything, expectedBody).Return(template, nil)
	api := NewColumnTemplateApi(service)
	bodyBytes, err := json.Marshal(body)
	assert.NoError(t, err)
	response := httptest.NewRecorder()
	request := technical_helper.NewTestRequestBuilder(http.MethodPost, "/", bytes.NewReader(bodyBytes))
	request.AddToContext(identifiers.BoardTemplateIdentifier, boardID)
	request.AddToContext(identifiers.UserIdentifier, userID)

	api.CreateColumnTemplate(response, request.Request())

	assert.Equal(t, http.StatusCreated, response.Code)
	var result ColumnTemplate
	assert.NoError(t, json.Unmarshal(response.Body.Bytes(), &result))
	assert.Equal(t, template.ID, result.ID)
}

func TestCreateColumnTemplate_BadRequest(t *testing.T) {
	api := NewColumnTemplateApi(NewMockColumnTemplateService(t))
	response := httptest.NewRecorder()
	request := technical_helper.NewTestRequestBuilder(http.MethodPost, "/", bytes.NewBufferString("{")).
		AddToContext(identifiers.BoardTemplateIdentifier, uuid.New()).
		AddToContext(identifiers.UserIdentifier, uuid.New())

	api.CreateColumnTemplate(response, request.Request())

	assert.Equal(t, http.StatusBadRequest, response.Code)
}

func TestCreateColumnTemplate_ServiceError(t *testing.T) {
	boardID, userID := uuid.New(), uuid.New()
	service := NewMockColumnTemplateService(t)
	service.EXPECT().Create(mock.Anything, mock.MatchedBy(func(body ColumnTemplateRequest) bool {
		return body.BoardTemplate == boardID && body.User == userID
	})).Return(nil, errors.New("service failure"))
	api := NewColumnTemplateApi(service)
	body := ColumnTemplateRequest{
		Color: common.ColorGoalGreen,
	}
	bodyBytes, err := json.Marshal(body)
	assert.NoError(t, err)
	response := httptest.NewRecorder()
	request := technical_helper.NewTestRequestBuilder(http.MethodPost, "/", bytes.NewReader(bodyBytes))
	request.AddToContext(identifiers.BoardTemplateIdentifier, boardID)
	request.AddToContext(identifiers.UserIdentifier, userID)

	api.CreateColumnTemplate(response, request.Request())

	assert.Equal(t, http.StatusInternalServerError, response.Code)
}

func TestGetColumnTemplate(t *testing.T) {
	template := testColumnTemplate()
	service := NewMockColumnTemplateService(t)
	service.EXPECT().Get(mock.Anything, template.BoardTemplate, template.ID).Return(template, nil)
	api := NewColumnTemplateApi(service)
	response := httptest.NewRecorder()
	request := technical_helper.NewTestRequestBuilder(http.MethodGet, "/", nil)
	request.AddToContext(identifiers.BoardTemplateIdentifier, template.BoardTemplate)
	request.AddToContext(identifiers.ColumnTemplateIdentifier, template.ID)

	api.GetColumnTemplate(response, request.Request())

	assert.Equal(t, http.StatusOK, response.Code)
	var result ColumnTemplate
	assert.NoError(t, json.Unmarshal(response.Body.Bytes(), &result))
	assert.Equal(t, template.ID, result.ID)
}

func TestGetColumnTemplate_ServiceError(t *testing.T) {
	boardID, columnID := uuid.New(), uuid.New()
	service := NewMockColumnTemplateService(t)
	service.EXPECT().Get(mock.Anything, boardID, columnID).Return(nil, errors.New("service failure"))
	api := NewColumnTemplateApi(service)
	response := httptest.NewRecorder()
	request := technical_helper.NewTestRequestBuilder(http.MethodGet, "/", nil)
	request.AddToContext(identifiers.BoardTemplateIdentifier, boardID)
	request.AddToContext(identifiers.ColumnTemplateIdentifier, columnID)

	api.GetColumnTemplate(response, request.Request())

	assert.Equal(t, http.StatusInternalServerError, response.Code)
}

func TestGetColumnTemplates(t *testing.T) {
	boardID := uuid.New()
	templates := []*ColumnTemplate{testColumnTemplate()}
	templates[0].BoardTemplate = boardID
	service := NewMockColumnTemplateService(t)
	service.EXPECT().GetAll(mock.Anything, boardID).Return(templates, nil)
	api := NewColumnTemplateApi(service)
	response := httptest.NewRecorder()
	request := technical_helper.NewTestRequestBuilder(http.MethodGet, "/", nil)
	request.AddToContext(identifiers.BoardTemplateIdentifier, boardID)

	api.GetColumnTemplates(response, request.Request())

	assert.Equal(t, http.StatusOK, response.Code)
	var result []*ColumnTemplate
	assert.NoError(t, json.Unmarshal(response.Body.Bytes(), &result))
	assert.Len(t, result, 1)
	assert.Equal(t, templates[0].ID, result[0].ID)
}

func TestGetColumnTemplates_ServiceError(t *testing.T) {
	boardID := uuid.New()
	service := NewMockColumnTemplateService(t)
	service.EXPECT().GetAll(mock.Anything, boardID).Return(nil, errors.New("service failure"))
	api := NewColumnTemplateApi(service)
	response := httptest.NewRecorder()
	request := technical_helper.NewTestRequestBuilder(http.MethodGet, "/", nil)
	request.AddToContext(identifiers.BoardTemplateIdentifier, boardID)

	api.GetColumnTemplates(response, request.Request())

	assert.Equal(t, http.StatusInternalServerError, response.Code)
}

func TestUpdateColumnTemplate(t *testing.T) {
	template := testColumnTemplate()
	body := ColumnTemplateUpdateRequest{
		Name: "Updated column", Description: "An updated column",
		Color: common.ColorOnlineOrange, Visible: false, Index: 2,
	}
	expectedBody := body
	expectedBody.ID, expectedBody.BoardTemplate = template.ID, template.BoardTemplate
	service := NewMockColumnTemplateService(t)
	service.EXPECT().Update(mock.Anything, expectedBody).Return(template, nil)
	api := NewColumnTemplateApi(service)
	bodyBytes, err := json.Marshal(body)
	assert.NoError(t, err)
	response := httptest.NewRecorder()
	request := technical_helper.NewTestRequestBuilder(http.MethodPut, "/", bytes.NewReader(bodyBytes))
	request.AddToContext(identifiers.BoardTemplateIdentifier, template.BoardTemplate)
	request.AddToContext(identifiers.ColumnTemplateIdentifier, template.ID)

	api.UpdateColumnTemplate(response, request.Request())

	assert.Equal(t, http.StatusOK, response.Code)
	var result ColumnTemplate
	assert.NoError(t, json.Unmarshal(response.Body.Bytes(), &result))
	assert.Equal(t, template.ID, result.ID)
}

func TestUpdateColumnTemplate_BadRequest(t *testing.T) {
	api := NewColumnTemplateApi(NewMockColumnTemplateService(t))
	response := httptest.NewRecorder()
	request := technical_helper.NewTestRequestBuilder(http.MethodPut, "/", bytes.NewBufferString("{")).
		AddToContext(identifiers.BoardTemplateIdentifier, uuid.New()).
		AddToContext(identifiers.ColumnTemplateIdentifier, uuid.New())

	api.UpdateColumnTemplate(response, request.Request())

	assert.Equal(t, http.StatusBadRequest, response.Code)
}

func TestUpdateColumnTemplate_ServiceError(t *testing.T) {
	boardID, columnID := uuid.New(), uuid.New()
	service := NewMockColumnTemplateService(t)
	service.EXPECT().Update(mock.Anything, mock.MatchedBy(func(body ColumnTemplateUpdateRequest) bool {
		return body.ID == columnID && body.BoardTemplate == boardID
	})).Return(nil, errors.New("service failure"))
	api := NewColumnTemplateApi(service)
	body := ColumnTemplateUpdateRequest{
		Color: common.ColorGoalGreen,
	}
	bodyBytes, err := json.Marshal(body)
	assert.NoError(t, err)
	response := httptest.NewRecorder()
	request := technical_helper.NewTestRequestBuilder(http.MethodPut, "/", bytes.NewReader(bodyBytes))
	request.AddToContext(identifiers.BoardTemplateIdentifier, boardID)
	request.AddToContext(identifiers.ColumnTemplateIdentifier, columnID)

	api.UpdateColumnTemplate(response, request.Request())

	assert.Equal(t, http.StatusInternalServerError, response.Code)
}

func TestDeleteColumnTemplate(t *testing.T) {
	boardID, columnID := uuid.New(), uuid.New()
	service := NewMockColumnTemplateService(t)
	service.EXPECT().Delete(mock.Anything, boardID, columnID).Return(nil)
	api := NewColumnTemplateApi(service)
	response := httptest.NewRecorder()
	request := technical_helper.NewTestRequestBuilder(http.MethodDelete, "/", nil)
	request.AddToContext(identifiers.BoardTemplateIdentifier, boardID)
	request.AddToContext(identifiers.ColumnTemplateIdentifier, columnID)

	api.DeleteColumnTemplate(response, request.Request())

	assert.Equal(t, http.StatusNoContent, response.Code)
}

func TestDeleteColumnTemplate_ServiceError(t *testing.T) {
	boardID, columnID := uuid.New(), uuid.New()
	service := NewMockColumnTemplateService(t)
	service.EXPECT().Delete(mock.Anything, boardID, columnID).Return(errors.New("service failure"))
	api := NewColumnTemplateApi(service)
	response := httptest.NewRecorder()
	request := technical_helper.NewTestRequestBuilder(http.MethodDelete, "/", nil)
	request.AddToContext(identifiers.BoardTemplateIdentifier, boardID)
	request.AddToContext(identifiers.ColumnTemplateIdentifier, columnID)

	api.DeleteColumnTemplate(response, request.Request())

	assert.Equal(t, http.StatusInternalServerError, response.Code)
}
