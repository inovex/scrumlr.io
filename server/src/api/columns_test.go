package api

import (
	"errors"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/suite"
	"scrumlr.io/server/columns"
	"scrumlr.io/server/common"
	"scrumlr.io/server/identifiers"
)

type ColumnTestSuite struct {
	suite.Suite
}

func TestColumnTestSuite(t *testing.T) {
	suite.Run(t, new(ColumnTestSuite))
}

func (suite *ColumnTestSuite) TestCreateColumn() {

	testParameterBundles := *TestParameterBundles{}.
		Append("Successful created column", http.StatusCreated, nil, false, false, nil).
		Append("Failed creating column", http.StatusInternalServerError, &common.APIError{
			Err:        errors.New(""),
			StatusCode: http.StatusInternalServerError,
			StatusText: "no",
			ErrorText:  "Could not create column",
		}, false, false, nil)

	for _, tt := range testParameterBundles {
		suite.Run(tt.name, func() {
			s := new(Server)
			columnMock := columns.NewMockColumnService(suite.T())
			name := "TestColumn"
			color := columns.Color("backlog-blue")
			visible := true
			index := 0
			boardID, _ := uuid.NewRandom()
			userID, _ := uuid.NewRandom()

			req := NewTestRequestBuilder("POST", "/", strings.NewReader(fmt.Sprintf(
				`{"name": "%s", "color": "%s", "visible": %t, "index": %d}`, name, color, visible, index,
			))).AddToContext(identifiers.BoardIdentifier, boardID).
				AddToContext(identifiers.UserIdentifier, userID)
			rr := httptest.NewRecorder()

			columnMock.EXPECT().Create(req.req.Context(), columns.ColumnRequest{
				Name:    name,
				Color:   color,
				Visible: &visible,
				Index:   &index,
				Board:   boardID,
				User:    userID,
			}).Return(&columns.Column{
				ID:      uuid.UUID{},
				Name:    name,
				Color:   color,
				Visible: visible,
				Index:   index,
			}, tt.err)

			s.columns = columnMock

			s.createColumn(rr, req.Request())

			suite.Equal(tt.expectedCode, rr.Result().StatusCode)
			columnMock.AssertExpectations(suite.T())
		})
	}
}

func (suite *ColumnTestSuite) TestDeleteColumn() {
	testParameterBundles := *TestParameterBundles{}.
		Append("Successful deleted column", http.StatusNoContent, nil, false, false, nil).
		Append("Failed deleting column", http.StatusInternalServerError, &common.APIError{
			Err:        errors.New(""),
			StatusCode: http.StatusInternalServerError,
			StatusText: "no",
			ErrorText:  "Could not delete column",
		}, false, false, nil)

	for _, tt := range testParameterBundles {
		suite.Run(tt.name, func() {
			s := new(Server)
			columnMock := columns.NewMockColumnService(suite.T())
			boardID, _ := uuid.NewRandom()
			columnID, _ := uuid.NewRandom()
			userID, _ := uuid.NewRandom()

			req := NewTestRequestBuilder("DEL", "/", nil).
				AddToContext(identifiers.BoardIdentifier, boardID).
				AddToContext(identifiers.UserIdentifier, userID).
				AddToContext(identifiers.ColumnIdentifier, columnID)
			rr := httptest.NewRecorder()

			columnMock.EXPECT().Delete(req.req.Context(), boardID, columnID, userID).Return(tt.err)

			s.columns = columnMock
			s.deleteColumn(rr, req.Request())

			suite.Equal(tt.expectedCode, rr.Result().StatusCode)
			columnMock.AssertExpectations(suite.T())
		})
	}
}

func (suite *ColumnTestSuite) TestUpdateColumn() {

	testParameterBundles := *TestParameterBundles{}.
		Append("Successful updated column", http.StatusOK, nil, false, false, nil).
		Append("Failed updating column", http.StatusInternalServerError, &common.APIError{
			Err:        errors.New(""),
			StatusCode: http.StatusInternalServerError,
			StatusText: "no",
			ErrorText:  "Could not update column",
		}, false, false, nil)

	for _, tt := range testParameterBundles {
		suite.Run(tt.name, func() {
			s := new(Server)
			columnMock := columns.NewMockColumnService(suite.T())
			boardID, _ := uuid.NewRandom()
			columnID, _ := uuid.NewRandom()

			colName := "TestColumn"
			color := columns.Color("online-orange")
			visible := false
			index := 0

			req := NewTestRequestBuilder("PUT", "/", strings.NewReader(
				fmt.Sprintf(`{"name": "%s", "color": "%s", "visible": %v, "index": %d }`, colName, color, visible, index))).
				AddToContext(identifiers.BoardIdentifier, boardID).
				AddToContext(identifiers.ColumnIdentifier, columnID)
			rr := httptest.NewRecorder()

			columnMock.EXPECT().Update(req.req.Context(), columns.ColumnUpdateRequest{
				Name:    colName,
				Color:   color,
				Visible: visible,
				Index:   index,
				ID:      columnID,
				Board:   boardID,
			}).Return(&columns.Column{
				ID:      columnID,
				Name:    colName,
				Color:   color,
				Visible: visible,
				Index:   index,
			}, tt.err)

			s.columns = columnMock

			s.updateColumn(rr, req.Request())

			suite.Equal(tt.expectedCode, rr.Result().StatusCode)
			columnMock.AssertExpectations(suite.T())
		})
	}
}

func (suite *ColumnTestSuite) TestGetColumn() {

	testParameterBundles := *TestParameterBundles{}.
		Append("Successful get column", http.StatusOK, nil, false, false, nil).
		Append("Failed getting column", http.StatusInternalServerError, &common.APIError{
			Err:        errors.New(""),
			StatusCode: http.StatusInternalServerError,
			StatusText: "no",
			ErrorText:  "Could not get column",
		}, false, false, nil)

	for _, tt := range testParameterBundles {
		suite.Run(tt.name, func() {
			s := new(Server)
			columnMock := columns.NewMockColumnService(suite.T())
			boardID, _ := uuid.NewRandom()
			columnID, _ := uuid.NewRandom()

			colName := "Updated Column Name"
			color := columns.Color("online-orange")
			visible := false
			index := 0

			column := &columns.Column{
				ID:      columnID,
				Name:    colName,
				Color:   color,
				Visible: visible,
				Index:   index,
			}

			req := NewTestRequestBuilder("GET", "/", nil).
				AddToContext(identifiers.BoardIdentifier, boardID).
				AddToContext(identifiers.ColumnIdentifier, columnID)
			rr := httptest.NewRecorder()

			columnMock.EXPECT().Get(req.req.Context(), boardID, columnID).Return(column, tt.err)

			s.columns = columnMock

			s.getColumn(rr, req.Request())

			suite.Equal(tt.expectedCode, rr.Result().StatusCode)
			columnMock.AssertExpectations(suite.T())
		})
	}
}

func (suite *ColumnTestSuite) TestGetColumns() {

	testParameterBundles := *TestParameterBundles{}.
		Append("Successful get columns", http.StatusOK, nil, false, false, nil).
		Append("Failed getting columns", http.StatusInternalServerError, &common.APIError{
			Err:        errors.New(""),
			StatusCode: http.StatusInternalServerError,
			StatusText: "no",
			ErrorText:  "Could not get columns",
		}, false, false, nil)

	for _, tt := range testParameterBundles {
		suite.Run(tt.name, func() {
			s := new(Server)
			columnsMock := columns.NewMockColumnService(suite.T())
			boardID, _ := uuid.NewRandom()
			columnID, _ := uuid.NewRandom()

			colName := "TestColumn"
			color := columns.Color("online-orange")
			visible := false
			index := 0

			column := &columns.Column{
				ID:      columnID,
				Name:    colName,
				Color:   color,
				Visible: visible,
				Index:   index,
			}

			req := NewTestRequestBuilder("GET", "/", nil).
				AddToContext(identifiers.BoardIdentifier, boardID)
			rr := httptest.NewRecorder()
			columnsMock.EXPECT().GetAll(req.req.Context(), boardID).Return([]*columns.Column{column}, tt.err)

			s.columns = columnsMock

			s.getColumns(rr, req.Request())

			suite.Equal(tt.expectedCode, rr.Result().StatusCode)
			columnsMock.AssertExpectations(suite.T())
		})
	}
}
