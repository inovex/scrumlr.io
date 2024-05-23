package api

import (
	"context"
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
	"strings"
	"testing"
)

func (m *BoardMock) Create(ctx context.Context, req dto.CreateBoardRequest) (*dto.Board, error) {
	args := m.Called(req)
	return args.Get(0).(*dto.Board), args.Error(1)
}

func (m *BoardMock) Delete(ctx context.Context, boardID uuid.UUID) error {
	args := m.Called(boardID)
	return args.Error(0)
}

func (m *BoardMock) BoardOverview(ctx context.Context, boardIDs []uuid.UUID, userID uuid.UUID) ([]*dto.BoardOverview, error) {
	args := m.Called(boardIDs, userID)
	return args.Get(0).([]*dto.BoardOverview), args.Error(1)
}

func (m *BoardMock) Get(ctx context.Context, boardID uuid.UUID) (*dto.Board, error) {
	args := m.Called(boardID)
	return args.Get(0).(*dto.Board), args.Error(1)
}

func (m *BoardMock) Update(ctx context.Context, req dto.BoardUpdateRequest) (*dto.Board, error) {
	args := m.Called(req)
	return args.Get(0).(*dto.Board), args.Error(1)
}

func (m *BoardMock) SetTimer(ctx context.Context, boardID uuid.UUID, minutes uint8) (*dto.Board, error) {
	args := m.Called(boardID, minutes)
	return args.Get(0).(*dto.Board), args.Error(1)
}

func (m *BoardMock) DeleteTimer(ctx context.Context, boardID uuid.UUID) (*dto.Board, error) {
	args := m.Called(boardID)
	return args.Get(0).(*dto.Board), args.Error(1)
}

func (m *BoardMock) IncrementTimer(ctx context.Context, boardID uuid.UUID) (*dto.Board, error) {
	args := m.Called(boardID)
	return args.Get(0).(*dto.Board), args.Error(1)
}

func (m *BoardMock) FullBoard(ctx context.Context, boardID uuid.UUID) (*dto.Board, []*dto.BoardSessionRequest, []*dto.BoardSession, []*dto.Column, []*dto.Note, []*dto.Reaction, []*dto.Voting, []*dto.Vote, error) {
	args := m.Called(boardID)
	return args.Get(0).(*dto.Board), args.Get(1).([]*dto.BoardSessionRequest), args.Get(2).([]*dto.BoardSession), args.Get(3).([]*dto.Column), args.Get(4).([]*dto.Note), args.Get(5).([]*dto.Reaction), args.Get(6).([]*dto.Voting), args.Get(7).([]*dto.Vote), args.Error(8)
}

type BoardTestSuite struct {
	suite.Suite
}

func TestBoardTestSuite(t *testing.T) {
	suite.Run(t, new(BoardTestSuite))
}

func (suite *BoardTestSuite) TestCreateBoard() {
	tests := []struct {
		name         string
		expectedCode int
		err          error
	}{
		{
			name:         "Successfully create board",
			expectedCode: http.StatusCreated,
			err:          nil,
		},
		{
			name:         "Failed creating board",
			expectedCode: http.StatusInternalServerError,
			err: &common.APIError{
				Err:        errors.New("failed to create board"),
				StatusCode: http.StatusInternalServerError,
				StatusText: "no",
				ErrorText:  "Could not create board",
			},
		},
	}

	for _, tt := range tests {
		suite.Run(tt.name, func() {
			s := new(Server)
			mock := new(BoardMock)
			s.boards = mock
			accessPolicy := types.AccessPolicyPublic
			visible := true
			ownerID, _ := uuid.NewRandom()
			colName := "Lean Coffee"
			color := types.Color("backlog-blue")
			boardID, _ := uuid.NewRandom()

			mock.On("Create", dto.CreateBoardRequest{
				Name:         nil,
				Description:  nil,
				AccessPolicy: accessPolicy,
				Passphrase:   nil,
				Columns: []dto.ColumnRequest{
					{
						Name:    colName,
						Color:   color,
						Visible: &visible,
						Index:   nil,
						Board:   uuid.Nil,
						User:    uuid.Nil,
					},
				},
				Owner: ownerID,
			}).Return(&dto.Board{
				ID:                    boardID,
				Name:                  nil,
				Description:           nil,
				AccessPolicy:          accessPolicy,
				ShowAuthors:           true,
				ShowNotesOfOtherUsers: true,
				ShowNoteReactions:     true,
				AllowStacking:         true,
				AllowEditing:          true,
				TimerStart:            nil,
				TimerEnd:              nil,
				SharedNote:            uuid.NullUUID{},
				ShowVoting:            uuid.NullUUID{},
				Passphrase:            nil,
				Salt:                  nil,
			}, tt.err)

			req := NewTestRequestBuilder("POST", "/", strings.NewReader(fmt.Sprintf(` {
       "accessPolicy": "%s",
       "columns": [
         {
           "name": "%s",
           "visible": %v,
           "color": "%s"
         }
       ]
      }`, accessPolicy, colName, visible, color))).
				AddToContext(identifiers.UserIdentifier, ownerID)

			rr := httptest.NewRecorder()

			s.createBoard(rr, req.Request())

			suite.Equal(tt.expectedCode, rr.Result().StatusCode)
			mock.AssertExpectations(suite.T())
		})
	}
}

func (suite *BoardTestSuite) TestDeleteBoard() {
	tests := []struct {
		name         string
		expectedCode int
		err          error
	}{
		{
			name:         "Successfully deleted board",
			expectedCode: http.StatusNoContent,
			err:          nil,
		},
		{
			name:         "Failed deleting board",
			expectedCode: http.StatusInternalServerError,
			err: &common.APIError{
				Err:        errors.New("failed to delete board"),
				StatusCode: http.StatusInternalServerError,
				StatusText: "no",
				ErrorText:  "Could not delete board",
			},
		},
	}

	for _, tt := range tests {
		suite.Run(tt.name, func() {
			s := new(Server)
			mock := new(BoardMock)
			s.boards = mock

			boardID, _ := uuid.NewRandom()

			mock.On("Delete", boardID).Return(tt.err)

			req := NewTestRequestBuilder("POST", "/", nil).
				AddToContext(identifiers.BoardIdentifier, boardID)

			rr := httptest.NewRecorder()

			s.deleteBoard(rr, req.Request())

			suite.Equal(tt.expectedCode, rr.Result().StatusCode)
			mock.AssertExpectations(suite.T())
		})
	}
}

func (suite *BoardTestSuite) TestGetBoards() {
	tests := []struct {
		name         string
		expectedCode int
		err          error
	}{
		{
			name:         "Successfully deleted board",
			expectedCode: http.StatusNoContent,
			err:          nil,
		},
		{
			name:         "Failed deleting board",
			expectedCode: http.StatusInternalServerError,
			err: &common.APIError{
				Err:        errors.New("failed to delete board"),
				StatusCode: http.StatusInternalServerError,
				StatusText: "no",
				ErrorText:  "Could not delete board",
			},
		},
	}

	for _, tt := range tests {
		suite.Run(tt.name, func() {
			s := new(Server)
			mock := new(BoardMock)
			s.boards = mock

			boardID, _ := uuid.NewRandom()

			mock.On("Delete", boardID).Return(tt.err)

			req := NewTestRequestBuilder("POST", "/", nil).
				AddToContext(identifiers.BoardIdentifier, boardID)

			rr := httptest.NewRecorder()

			s.deleteBoard(rr, req.Request())

			suite.Equal(tt.expectedCode, rr.Result().StatusCode)
			mock.AssertExpectations(suite.T())
		})
	}
}
