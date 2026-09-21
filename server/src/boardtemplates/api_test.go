package boardtemplates

import (
	"bytes"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"scrumlr.io/server/columntemplates"
	"scrumlr.io/server/common"
	"scrumlr.io/server/identifiers"
	"scrumlr.io/server/technical_helper"
)

func testBoardTemplate() *BoardTemplate {
	return &BoardTemplate{
		ID:          uuid.New(),
		Creator:     uuid.New(),
		Name:        new("Test template"),
		Description: new("A template for testing"),
		Favourite:   new(false),
	}
}

func requestWithContext(method, path string, body any) (*httptest.ResponseRecorder, *technical_helper.TestRequestBuilder) {
	var bodyReader *bytes.Reader
	if body == nil {
		bodyReader = bytes.NewReader(nil)
	} else {
		bodyBytes, err := json.Marshal(body)
		if err != nil {
			panic(err)
		}
		bodyReader = bytes.NewReader(bodyBytes)
	}

	return httptest.NewRecorder(), technical_helper.NewTestRequestBuilder(method, path, bodyReader)
}

func TestCreateBoardTemplate(t *testing.T) {
	creator := uuid.New()
	body := CreateBoardTemplateRequest{
		Name:        new("Test template"),
		Description: new("A template for testing"),
		Favourite:   new(false),
		Columns: []*columntemplates.ColumnTemplateRequest{
			{Name: "To do", Description: "Tasks to do", Color: common.ColorGoalGreen},
		},
	}
  expectedBody := body
  expectedBody.Creator = creator
	template := testBoardTemplate()

	service := NewMockBoardTemplateService(t)
	service.EXPECT().Create(mock.Anything, expectedBody).Return(template, nil)
	api := NewBoardTemplateApi(service)

	response, request := requestWithContext(http.MethodPost, "/", body)
	request.AddToContext(identifiers.UserIdentifier, creator)

	api.CreateBoardTemplate(response, request.Request())

	assert.Equal(t, http.StatusCreated, response.Code)
	var result BoardTemplate
	assert.NoError(t, json.Unmarshal(response.Body.Bytes(), &result))
	assert.Equal(t, template.ID, result.ID)
}

func TestCreateBoardTemplate_BadRequest(t *testing.T) {
	service := NewMockBoardTemplateService(t)
	api := NewBoardTemplateApi(service)

	response := httptest.NewRecorder()
	request := technical_helper.NewTestRequestBuilder(http.MethodPost, "/", bytes.NewBufferString("{invalid")).
		AddToContext(identifiers.UserIdentifier, uuid.New())

	api.CreateBoardTemplate(response, request.Request())

	assert.Equal(t, http.StatusBadRequest, response.Code)
}

func TestCreateBoardTemplate_ServiceError(t *testing.T) {
	creator := uuid.New()
	body := CreateBoardTemplateRequest{Name: new("Test template")}

	service := NewMockBoardTemplateService(t)
	service.EXPECT().Create(mock.Anything, mock.MatchedBy(func(request CreateBoardTemplateRequest) bool {
		return request.Creator == creator
	})).Return(nil, errors.New("service failure"))
	api := NewBoardTemplateApi(service)

	response, request := requestWithContext(http.MethodPost, "/", body)
	request.AddToContext(identifiers.UserIdentifier, creator)

	api.CreateBoardTemplate(response, request.Request())

	assert.Equal(t, http.StatusInternalServerError, response.Code)
}

func TestGetBoardTemplate(t *testing.T) {
	template := testBoardTemplate()
	service := NewMockBoardTemplateService(t)
	service.EXPECT().Get(mock.Anything, template.ID).Return(template, nil)
	api := NewBoardTemplateApi(service)

	response, request := requestWithContext(http.MethodGet, "/"+template.ID.String(), nil)
	request.AddToContext(identifiers.BoardTemplateIdentifier, template.ID)

	api.GetBoardTemplate(response, request.Request())

	assert.Equal(t, http.StatusOK, response.Code)
	var result BoardTemplate
	assert.NoError(t, json.Unmarshal(response.Body.Bytes(), &result))
	assert.Equal(t, template.ID, result.ID)
}

func TestGetBoardTemplate_ServiceError(t *testing.T) {
	templateID := uuid.New()
	service := NewMockBoardTemplateService(t)
	service.EXPECT().Get(mock.Anything, templateID).Return(nil, errors.New("service failure"))
	api := NewBoardTemplateApi(service)

	response, request := requestWithContext(http.MethodGet, "/"+templateID.String(), nil)
	request.AddToContext(identifiers.BoardTemplateIdentifier, templateID)

	api.GetBoardTemplate(response, request.Request())

	assert.Equal(t, http.StatusInternalServerError, response.Code)
}

func TestGetBoardTemplates(t *testing.T) {
	userID := uuid.New()
	templates := []*BoardTemplateFull{{Template: testBoardTemplate()}}
	service := NewMockBoardTemplateService(t)
	service.EXPECT().GetAll(mock.Anything, userID).Return(templates, nil)
	api := NewBoardTemplateApi(service)

	response, request := requestWithContext(http.MethodGet, "/", nil)
	request.AddToContext(identifiers.UserIdentifier, userID)

	api.GetBoardTemplates(response, request.Request())

	assert.Equal(t, http.StatusOK, response.Code)
	var result []*BoardTemplateFull
	assert.NoError(t, json.Unmarshal(response.Body.Bytes(), &result))
	assert.Len(t, result, 1)
	assert.Equal(t, templates[0].Template.ID, result[0].Template.ID)
}

func TestGetBoardTemplates_ServiceError(t *testing.T) {
	userID := uuid.New()
	service := NewMockBoardTemplateService(t)
	service.EXPECT().GetAll(mock.Anything, userID).Return(nil, errors.New("service failure"))
	api := NewBoardTemplateApi(service)

	response, request := requestWithContext(http.MethodGet, "/", nil)
	request.AddToContext(identifiers.UserIdentifier, userID)

	api.GetBoardTemplates(response, request.Request())

	assert.Equal(t, http.StatusInternalServerError, response.Code)
}

func TestUpdateBoardTemplate(t *testing.T) {
	template := testBoardTemplate()
	body := BoardTemplateUpdateRequest{
		Name:        new("Updated template"),
		Description: new("Updated description"),
		Favourite:   new(true),
	}
	expectedBody := body
	expectedBody.ID = template.ID

	service := NewMockBoardTemplateService(t)
	service.EXPECT().Update(mock.Anything, expectedBody).Return(template, nil)
	api := NewBoardTemplateApi(service)

	response, request := requestWithContext(http.MethodPut, "/"+template.ID.String(), body)
	request.AddToContext(identifiers.BoardTemplateIdentifier, template.ID)

	api.UpdateBoardTemplate(response, request.Request())

	assert.Equal(t, http.StatusOK, response.Code)
	var result BoardTemplate
	assert.NoError(t, json.Unmarshal(response.Body.Bytes(), &result))
	assert.Equal(t, template.ID, result.ID)
}

func TestUpdateBoardTemplate_BadRequest(t *testing.T) {
	templateID := uuid.New()
	service := NewMockBoardTemplateService(t)
	api := NewBoardTemplateApi(service)

	response := httptest.NewRecorder()
	request := technical_helper.NewTestRequestBuilder(http.MethodPut, "/"+templateID.String(), bytes.NewBufferString("{invalid"))
	request.AddToContext(identifiers.BoardTemplateIdentifier, templateID)

	api.UpdateBoardTemplate(response, request.Request())

	assert.Equal(t, http.StatusBadRequest, response.Code)
}

func TestUpdateBoardTemplate_ServiceError(t *testing.T) {
	templateID := uuid.New()
	service := NewMockBoardTemplateService(t)
	service.EXPECT().Update(mock.Anything, mock.MatchedBy(func(request BoardTemplateUpdateRequest) bool {
		return request.ID == templateID
	})).Return(nil, errors.New("service failure"))
	api := NewBoardTemplateApi(service)

	response, request := requestWithContext(http.MethodPut, "/"+templateID.String(), BoardTemplateUpdateRequest{})
	request.AddToContext(identifiers.BoardTemplateIdentifier, templateID)

	api.UpdateBoardTemplate(response, request.Request())

	assert.Equal(t, http.StatusInternalServerError, response.Code)
}

func TestDeleteBoardTemplate(t *testing.T) {
	templateID := uuid.New()
	service := NewMockBoardTemplateService(t)
	service.EXPECT().Delete(mock.Anything, templateID).Return(nil)
	api := NewBoardTemplateApi(service)

	response, request := requestWithContext(http.MethodDelete, "/"+templateID.String(), nil)
	request.AddToContext(identifiers.BoardTemplateIdentifier, templateID)

	api.DeleteBoardTemplate(response, request.Request())

	assert.Equal(t, http.StatusNoContent, response.Code)
}

func TestDeleteBoardTemplate_ServiceError(t *testing.T) {
	templateID := uuid.New()
	service := NewMockBoardTemplateService(t)
	service.EXPECT().Delete(mock.Anything, templateID).Return(errors.New("service failure"))
	api := NewBoardTemplateApi(service)

	response, request := requestWithContext(http.MethodDelete, "/"+templateID.String(), nil)
	request.AddToContext(identifiers.BoardTemplateIdentifier, templateID)

	api.DeleteBoardTemplate(response, request.Request())

	assert.Equal(t, http.StatusInternalServerError, response.Code)
}
