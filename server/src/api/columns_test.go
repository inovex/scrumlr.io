package api

import (
	"errors"
	"fmt"
	"github.com/google/uuid"
	"github.com/stretchr/testify/suite"
	"net/http"
	"net/http/httptest"
	"scrumlr.io/server/common"
	"scrumlr.io/server/common/dto"
	"scrumlr.io/server/database/types"
	"scrumlr.io/server/identifiers"
	"scrumlr.io/server/mocks/services"
	"strings"
	"testing"
)

type ColumnTestSuite struct {
	suite.Suite
}

func TestColumnTestSuite(t *testing.T) {
	suite.Run(t, new(ColumnTestSuite))
}

func (suite *ColumnTestSuite) TestCreateColumn() {
	tests := []struct {
		name         string
		expectedCode int
		err          error
	}{
		{
			name:         "Successful created column",
			expectedCode: http.StatusCreated,
		},
		{
			name:         "Failed creating column",
			expectedCode: http.StatusInternalServerError,
			err: &common.APIError{
				Err:        errors.New(""),
				StatusCode: http.StatusInternalServerError,
				StatusText: "no",
				ErrorText:  "Could not create column",
			},
		},
	}

	for _, tt := range tests {
		suite.Run(tt.name, func() {
			s := new(Server)
			boardMock := services.NewMockBoards(suite.T())
			name := "TestColumn"
			color := types.Color("backlog-blue")
			visible := true
			index := 0
			boardID, _ := uuid.NewRandom()
			userID, _ := uuid.NewRandom()

			req := NewTestRequestBuilder("POST", "/", strings.NewReader(fmt.Sprintf(
				`{"name": "%s", "color": "%s", "visible": %t, "index": %d}`, name, color, visible, index,
			))).AddToContext(identifiers.BoardIdentifier, boardID).
				AddToContext(identifiers.UserIdentifier, userID)
			rr := httptest.NewRecorder()

			boardMock.EXPECT().CreateColumn(req.req.Context(), dto.ColumnRequest{
				Name:    name,
				Color:   color,
				Visible: &visible,
				Index:   &index,
				Board:   boardID,
				User:    userID,
			}).Return(&dto.Column{
				ID:      uuid.UUID{},
				Name:    name,
				Color:   color,
				Visible: visible,
				Index:   index,
			}, tt.err)

			s.boards = boardMock

			s.createColumn(rr, req.Request())

			suite.Equal(tt.expectedCode, rr.Result().StatusCode)
			boardMock.AssertExpectations(suite.T())
		})
	}
}

func (suite *ColumnTestSuite) TestDeleteColumn() {
	tests := []struct {
		name         string
		expectedCode int
		err          error
	}{
		{
			name:         "Successful deleted column",
			expectedCode: http.StatusNoContent,
		},
		{
			name:         "Failed deleting column",
			expectedCode: http.StatusInternalServerError,
			err: &common.APIError{
				Err:        errors.New(""),
				StatusCode: http.StatusInternalServerError,
				StatusText: "no",
				ErrorText:  "Could not delete column",
			},
		},
	}

	for _, tt := range tests {
		suite.Run(tt.name, func() {
			s := new(Server)
			boardMock := services.NewMockBoards(suite.T())
			boardID, _ := uuid.NewRandom()
			columnID, _ := uuid.NewRandom()
			userID, _ := uuid.NewRandom()

			req := NewTestRequestBuilder("DEL", "/", nil).
				AddToContext(identifiers.BoardIdentifier, boardID).
				AddToContext(identifiers.UserIdentifier, userID).
				AddToContext(identifiers.ColumnIdentifier, columnID)
			rr := httptest.NewRecorder()

			boardMock.EXPECT().DeleteColumn(req.req.Context(), boardID, columnID, userID).Return(tt.err)

			s.boards = boardMock
			s.deleteColumn(rr, req.Request())

			suite.Equal(tt.expectedCode, rr.Result().StatusCode)
			boardMock.AssertExpectations(suite.T())
		})
	}
}

func (suite *ColumnTestSuite) TestUpdateColumn() {
	tests := []struct {
		name         string
		expectedCode int
		err          error
	}{
		{
			name:         "Successful updated column",
			expectedCode: http.StatusOK,
		},
		{
			name:         "Failed updating column",
			expectedCode: http.StatusInternalServerError,
			err: &common.APIError{
				Err:        errors.New(""),
				StatusCode: http.StatusInternalServerError,
				StatusText: "no",
				ErrorText:  "Could not update column",
			},
		},
	}

	for _, tt := range tests {
		suite.Run(tt.name, func() {
			s := new(Server)
			boardMock := services.NewMockBoards(suite.T())
			boardID, _ := uuid.NewRandom()
			columnID, _ := uuid.NewRandom()

			colName := "TestColumn"
			color := types.Color("online-orange")
			visible := false
			index := 0

			req := NewTestRequestBuilder("PUT", "/", strings.NewReader(
				fmt.Sprintf(`{"name": "%s", "color": "%s", "visible": %v, "index": %d }`, colName, color, visible, index))).
				AddToContext(identifiers.BoardIdentifier, boardID).
				AddToContext(identifiers.ColumnIdentifier, columnID)
			rr := httptest.NewRecorder()

			boardMock.EXPECT().UpdateColumn(req.req.Context(), dto.ColumnUpdateRequest{
				Name:    colName,
				Color:   color,
				Visible: visible,
				Index:   index,
				ID:      columnID,
				Board:   boardID,
			}).Return(&dto.Column{
				ID:      columnID,
				Name:    colName,
				Color:   color,
				Visible: visible,
				Index:   index,
			}, tt.err)

			s.boards = boardMock

			s.updateColumn(rr, req.Request())

			suite.Equal(tt.expectedCode, rr.Result().StatusCode)
			boardMock.AssertExpectations(suite.T())
		})
	}
}

func (suite *ColumnTestSuite) TestGetColumn() {
	tests := []struct {
		name         string
		expectedCode int
		err          error
	}{
		{
			name:         "Successful get column",
			expectedCode: http.StatusOK,
		},
		{
			name:         "Failed getting column",
			expectedCode: http.StatusInternalServerError,
			err: &common.APIError{
				Err:        errors.New(""),
				StatusCode: http.StatusInternalServerError,
				StatusText: "no",
				ErrorText:  "Could not get column",
			},
		},
	}

	for _, tt := range tests {
		suite.Run(tt.name, func() {
			s := new(Server)
			boardMock := services.NewMockBoards(suite.T())
			boardID, _ := uuid.NewRandom()
			columnID, _ := uuid.NewRandom()

			colName := "Updated Column Name"
			color := types.Color("online-orange")
			visible := false
			index := 0

			column := &dto.Column{
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

			boardMock.EXPECT().GetColumn(req.req.Context(), boardID, columnID).Return(column, tt.err)

			s.boards = boardMock

			s.getColumn(rr, req.Request())

			suite.Equal(tt.expectedCode, rr.Result().StatusCode)
			boardMock.AssertExpectations(suite.T())
		})
	}
}

func (suite *ColumnTestSuite) TestGetColumns() {
	tests := []struct {
		name         string
		expectedCode int
		err          error
	}{
		{
			name:         "Successful get columns",
			expectedCode: http.StatusOK,
		},
		{
			name:         "Failed getting columns",
			expectedCode: http.StatusInternalServerError,
			err: &common.APIError{
				Err:        errors.New(""),
				StatusCode: http.StatusInternalServerError,
				StatusText: "no",
				ErrorText:  "Could not get columns",
			},
		},
	}

	for _, tt := range tests {
		suite.Run(tt.name, func() {
			s := new(Server)
			boardMock := services.NewMockBoards(suite.T())
			boardID, _ := uuid.NewRandom()
			columnID, _ := uuid.NewRandom()

			colName := "TestColumn"
			color := types.Color("online-orange")
			visible := false
			index := 0

			column := &dto.Column{
				ID:      columnID,
				Name:    colName,
				Color:   color,
				Visible: visible,
				Index:   index,
			}

			req := NewTestRequestBuilder("GET", "/", nil).
				AddToContext(identifiers.BoardIdentifier, boardID)
			rr := httptest.NewRecorder()
			boardMock.EXPECT().ListColumns(req.req.Context(), boardID).Return([]*dto.Column{column}, tt.err)

			s.boards = boardMock

			s.getColumns(rr, req.Request())

			suite.Equal(tt.expectedCode, rr.Result().StatusCode)
			boardMock.AssertExpectations(suite.T())
		})
	}
}
