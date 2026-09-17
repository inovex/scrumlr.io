package api

import (
	"errors"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/suite"
	"scrumlr.io/server/columntemplates"
	"scrumlr.io/server/common"
	"scrumlr.io/server/identifiers"
	"scrumlr.io/server/technical_helper"
)

type ColumnTemplateTestSuite struct {
	suite.Suite
	boardTemplateID     uuid.UUID
	columnTemplateID    uuid.UUID
	userID              uuid.UUID
	server              *Server
	mockColumnTemplates *columntemplates.MockColumnTemplateService
}

type columnTemplateTestIDs struct {
	boardTemplateID  uuid.UUID
	columnTemplateID uuid.UUID
	userID           uuid.UUID
}

func (suite *ColumnTemplateTestSuite) newColumnTemplateTestIDs() columnTemplateTestIDs {
	return columnTemplateTestIDs{
		boardTemplateID:  uuid.New(),
		columnTemplateID: uuid.New(),
		userID:           uuid.New(),
	}
}

func (suite *ColumnTemplateTestSuite) SetupTest() {
	suite.setupState()
}

func (suite *ColumnTemplateTestSuite) SetupSubTest() {
	suite.setupState()
}

func (suite *ColumnTemplateTestSuite) setupState() {
	ids := suite.newColumnTemplateTestIDs()
	suite.boardTemplateID = ids.boardTemplateID
	suite.columnTemplateID = ids.columnTemplateID
	suite.userID = ids.userID

	suite.server = new(Server)
	suite.mockColumnTemplates = columntemplates.NewMockColumnTemplateService(suite.T())
	suite.server.columntemplates = suite.mockColumnTemplates
}

func (suite *ColumnTemplateTestSuite) newColumnTemplate(boardTemplateID, columnTemplateID uuid.UUID) *columntemplates.ColumnTemplate {
	return &columntemplates.ColumnTemplate{
		ID:            columnTemplateID,
		BoardTemplate: boardTemplateID,
		Name:          "TestColumnTemplate",
		Description:   "Template Description",
		Color:         common.Color("backlog-blue"),
		Visible:       true,
		Index:         0,
	}
}

func TestColumnTemplateTestSuite(t *testing.T) {
	suite.Run(t, new(ColumnTemplateTestSuite))
}

func (suite *ColumnTemplateTestSuite) TestCreateColumnTemplate() {
	testParameterBundles := *TestParameterBundles{}.
		Append("Successful created column template", http.StatusCreated, nil, false, false, nil).
		Append("Failed creating column template", http.StatusInternalServerError, &common.APIError{
			Err:        errors.New(""),
			StatusCode: http.StatusInternalServerError,
			StatusText: "no",
			ErrorText:  "Could not create column template",
		}, false, false, nil)

	for _, tt := range testParameterBundles {
		suite.Run(tt.name, func() {
			name := "TestColumnTemplate"
			description := "Template Description"
			color := common.Color("backlog-blue")
			visible := true
			index := 1

			req := technical_helper.NewTestRequestBuilder("POST", "/", strings.NewReader(fmt.Sprintf(
				`{"name":"%s","description":"%s","color":"%s","visible":%t,"index":%d}`,
				name,
				description,
				color,
				visible,
				index,
			))).
				AddToContext(identifiers.BoardTemplateIdentifier, suite.boardTemplateID).
				AddToContext(identifiers.UserIdentifier, suite.userID)
			rr := httptest.NewRecorder()

			suite.mockColumnTemplates.EXPECT().Create(mock.Anything, columntemplates.ColumnTemplateRequest{
				Name:          name,
				Description:   description,
				Color:         color,
				Visible:       &visible,
				Index:         &index,
				BoardTemplate: suite.boardTemplateID,
				User:          suite.userID,
			}).Return(&columntemplates.ColumnTemplate{
				ID:            suite.columnTemplateID,
				BoardTemplate: suite.boardTemplateID,
				Name:          name,
				Description:   description,
				Color:         color,
				Visible:       visible,
				Index:         index,
			}, tt.err)

			suite.server.createColumnTemplate(rr, req.Request())

			suite.Equal(tt.expectedCode, rr.Result().StatusCode)
			suite.mockColumnTemplates.AssertExpectations(suite.T())
		})
	}
}

func (suite *ColumnTemplateTestSuite) TestCreateColumnTemplate_InvalidBody() {
	req := technical_helper.NewTestRequestBuilder("POST", "/", strings.NewReader("{")).
		AddToContext(identifiers.BoardTemplateIdentifier, suite.boardTemplateID).
		AddToContext(identifiers.UserIdentifier, suite.userID)
	rr := httptest.NewRecorder()

	suite.server.createColumnTemplate(rr, req.Request())

	suite.Equal(http.StatusBadRequest, rr.Result().StatusCode)
}

func (suite *ColumnTemplateTestSuite) TestGetColumnTemplate() {
	testParameterBundles := *TestParameterBundles{}.
		Append("Successful get column template", http.StatusOK, nil, false, false, nil).
		Append("Failed getting column template", http.StatusInternalServerError, &common.APIError{
			Err:        errors.New(""),
			StatusCode: http.StatusInternalServerError,
			StatusText: "no",
			ErrorText:  "Could not get column template",
		}, false, false, nil)

	for _, tt := range testParameterBundles {
		suite.Run(tt.name, func() {
			columnTemplate := suite.newColumnTemplate(suite.boardTemplateID, suite.columnTemplateID)

			req := technical_helper.NewTestRequestBuilder("GET", "/", nil).
				AddToContext(identifiers.BoardTemplateIdentifier, suite.boardTemplateID).
				AddToContext(identifiers.ColumnTemplateIdentifier, suite.columnTemplateID)
			rr := httptest.NewRecorder()

			suite.mockColumnTemplates.EXPECT().Get(mock.Anything, suite.boardTemplateID, suite.columnTemplateID).Return(columnTemplate, tt.err)

			suite.server.getColumnTemplate(rr, req.Request())

			suite.Equal(tt.expectedCode, rr.Result().StatusCode)
			suite.mockColumnTemplates.AssertExpectations(suite.T())
		})
	}
}

func (suite *ColumnTemplateTestSuite) TestGetColumnTemplates() {
	testParameterBundles := *TestParameterBundles{}.
		Append("Successful get column templates", http.StatusOK, nil, false, false, nil).
		Append("Failed getting column templates", http.StatusInternalServerError, &common.APIError{
			Err:        errors.New(""),
			StatusCode: http.StatusInternalServerError,
			StatusText: "no",
			ErrorText:  "Could not get column templates",
		}, false, false, nil)

	for _, tt := range testParameterBundles {
		suite.Run(tt.name, func() {
			columnTemplate := suite.newColumnTemplate(suite.boardTemplateID, suite.columnTemplateID)

			req := technical_helper.NewTestRequestBuilder("GET", "/", nil).
				AddToContext(identifiers.BoardTemplateIdentifier, suite.boardTemplateID)
			rr := httptest.NewRecorder()

			suite.mockColumnTemplates.EXPECT().GetAll(mock.Anything, suite.boardTemplateID).Return([]*columntemplates.ColumnTemplate{columnTemplate}, tt.err)

			suite.server.getColumnTemplates(rr, req.Request())

			suite.Equal(tt.expectedCode, rr.Result().StatusCode)
			suite.mockColumnTemplates.AssertExpectations(suite.T())
		})
	}
}

func (suite *ColumnTemplateTestSuite) TestUpdateColumnTemplate() {
	testParameterBundles := *TestParameterBundles{}.
		Append("Successful updated column template", http.StatusOK, nil, false, false, nil).
		Append("Failed updating column template", http.StatusInternalServerError, &common.APIError{
			Err:        errors.New(""),
			StatusCode: http.StatusInternalServerError,
			StatusText: "no",
			ErrorText:  "Could not update column template",
		}, false, false, nil)

	for _, tt := range testParameterBundles {
		suite.Run(tt.name, func() {
			name := "UpdatedColumnTemplate"
			description := "Updated Description"
			color := common.Color("online-orange")
			visible := false
			index := 2

			req := technical_helper.NewTestRequestBuilder("PUT", "/", strings.NewReader(fmt.Sprintf(
				`{"name":"%s","description":"%s","color":"%s","visible":%t,"index":%d}`,
				name,
				description,
				color,
				visible,
				index,
			))).
				AddToContext(identifiers.BoardTemplateIdentifier, suite.boardTemplateID).
				AddToContext(identifiers.ColumnTemplateIdentifier, suite.columnTemplateID)
			rr := httptest.NewRecorder()

			suite.mockColumnTemplates.EXPECT().Update(mock.Anything, columntemplates.ColumnTemplateUpdateRequest{
				Name:          name,
				Description:   description,
				Color:         color,
				Visible:       visible,
				Index:         index,
				ID:            suite.columnTemplateID,
				BoardTemplate: suite.boardTemplateID,
			}).Return(&columntemplates.ColumnTemplate{
				ID:            suite.columnTemplateID,
				BoardTemplate: suite.boardTemplateID,
				Name:          name,
				Description:   description,
				Color:         color,
				Visible:       visible,
				Index:         index,
			}, tt.err)

			suite.server.updateColumnTemplate(rr, req.Request())

			suite.Equal(tt.expectedCode, rr.Result().StatusCode)
			suite.mockColumnTemplates.AssertExpectations(suite.T())
		})
	}
}

func (suite *ColumnTemplateTestSuite) TestUpdateColumnTemplate_InvalidBody() {
	req := technical_helper.NewTestRequestBuilder("PUT", "/", strings.NewReader("{")).
		AddToContext(identifiers.BoardTemplateIdentifier, suite.boardTemplateID).
		AddToContext(identifiers.ColumnTemplateIdentifier, suite.columnTemplateID)
	rr := httptest.NewRecorder()

	suite.server.updateColumnTemplate(rr, req.Request())

	suite.Equal(http.StatusBadRequest, rr.Result().StatusCode)
}

func (suite *ColumnTemplateTestSuite) TestDeleteColumnTemplate() {
	testParameterBundles := *TestParameterBundles{}.
		Append("Successful deleted column template", http.StatusNoContent, nil, false, false, nil).
		Append("Failed deleting column template", http.StatusInternalServerError, &common.APIError{
			Err:        errors.New(""),
			StatusCode: http.StatusInternalServerError,
			StatusText: "no",
			ErrorText:  "Could not delete column template",
		}, false, false, nil)

	for _, tt := range testParameterBundles {
		suite.Run(tt.name, func() {
			req := technical_helper.NewTestRequestBuilder("DEL", "/", nil).
				AddToContext(identifiers.BoardTemplateIdentifier, suite.boardTemplateID).
				AddToContext(identifiers.ColumnTemplateIdentifier, suite.columnTemplateID)
			rr := httptest.NewRecorder()

			suite.mockColumnTemplates.EXPECT().Delete(mock.Anything, suite.boardTemplateID, suite.columnTemplateID).Return(tt.err)

			suite.server.deleteColumnTemplate(rr, req.Request())

			suite.Equal(tt.expectedCode, rr.Result().StatusCode)
			suite.mockColumnTemplates.AssertExpectations(suite.T())
		})
	}
}
