package api

import (
	"context"
	"errors"
	"fmt"
	"github.com/go-chi/chi/v5"
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
	"time"
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

func (m *BoardMock) GetBoards(ctx context.Context, userID uuid.UUID) ([]uuid.UUID, error) {
	args := m.Called(userID)
	return args.Get(0).([]uuid.UUID), args.Error(1)
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
			name:         "Successfully received boards",
			expectedCode: http.StatusOK,
			err:          nil,
		},
		{
			name:         "Failed receiving boards",
			expectedCode: http.StatusInternalServerError,
			err: &common.APIError{
				Err:        errors.New("failed to receive boards"),
				StatusCode: http.StatusInternalServerError,
				StatusText: "no",
				ErrorText:  "Could not receive boards",
			},
		},
	}

	for _, tt := range tests {
		suite.Run(tt.name, func() {
			s := new(Server)
			mock := new(BoardMock)
			s.boards = mock

			userID, _ := uuid.NewRandom()

			boardName := "Test Name"
			boardDescription := "Test Description"
			firstBoard := &dto.Board{
				ID:                    uuid.New(),
				Name:                  &boardName,
				Description:           &boardDescription,
				AccessPolicy:          "",
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
			}

			boardName = "Test Board"
			boardDescription = "Description for second board"
			secondBoard := &dto.Board{
				ID:                    uuid.New(),
				Name:                  &boardName,
				Description:           &boardDescription,
				AccessPolicy:          "",
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
			}
			boardIDs := []uuid.UUID{firstBoard.ID, secondBoard.ID}

			mock.On("GetBoards", userID).Return(boardIDs, tt.err)
			if tt.err == nil {
				mock.On("BoardOverview", boardIDs, userID).Return([]*dto.BoardOverview{{
					Board:        firstBoard,
					Columns:      1,
					CreatedAt:    time.Time{},
					Participants: 3,
				},
					{
						Board:        secondBoard,
						Columns:      2,
						CreatedAt:    time.Time{},
						Participants: 4,
					},
				}, tt.err)
			}

			req := NewTestRequestBuilder("POST", "/", nil).
				AddToContext(identifiers.UserIdentifier, userID)

			rr := httptest.NewRecorder()

			s.getBoards(rr, req.Request())

			suite.Equal(tt.expectedCode, rr.Result().StatusCode)
			mock.AssertExpectations(suite.T())
		})
	}
}

func (suite *BoardTestSuite) TestGetBoard() {
	tests := []struct {
		name         string
		expectedCode int
		err          error
	}{
		{
			name:         "Successfully received boards",
			expectedCode: http.StatusOK,
			err:          nil,
		},
		{
			name:         "Failed receiving boards",
			expectedCode: http.StatusInternalServerError,
			err: &common.APIError{
				Err:        errors.New("failed to receive boards"),
				StatusCode: http.StatusInternalServerError,
				StatusText: "no",
				ErrorText:  "Could not receive boards",
			},
		},
	}

	for _, tt := range tests {
		suite.Run(tt.name, func() {
			s := new(Server)
			mock := new(BoardMock)
			s.boards = mock

			boardID, _ := uuid.NewRandom()

			boardName := "Test Name"
			boardDescription := "Test Description"
			board := &dto.Board{
				ID:                    uuid.New(),
				Name:                  &boardName,
				Description:           &boardDescription,
				AccessPolicy:          "",
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
			}

			mock.On("Get", boardID).Return(board, tt.err)

			req := NewTestRequestBuilder("POST", "/", nil).
				AddToContext(identifiers.BoardIdentifier, boardID)

			rr := httptest.NewRecorder()

			s.getBoard(rr, req.Request())

			suite.Equal(tt.expectedCode, rr.Result().StatusCode)
			mock.AssertExpectations(suite.T())
		})
	}
}

func (suite *BoardTestSuite) TestJoinBoard() {
	boardName := "Test Name"
	boardDescription := "Test Description"
	salt := "z9YcpBno6azI2ueA"
	passphrase := common.Sha512BySalt("123", salt)

	tests := []struct {
		name                 string
		expectedCode         int
		err                  error
		sessionExists        bool
		sessionRequestExists bool
		board                *dto.Board
	}{
		{
			name:          "Successfully join board",
			expectedCode:  http.StatusSeeOther,
			err:           nil,
			sessionExists: true,
			board: &dto.Board{
				ID:                    uuid.New(),
				Name:                  &boardName,
				Description:           &boardDescription,
				AccessPolicy:          types.AccessPolicyPublic,
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
			},
		},
		{
			name:         "Failed joining board",
			expectedCode: http.StatusInternalServerError,
			err: &common.APIError{
				Err:        errors.New("failed to join board"),
				StatusCode: http.StatusInternalServerError,
				StatusText: "no",
				ErrorText:  "Could not join board",
			},
			sessionExists: true,
			board: &dto.Board{
				ID:                    uuid.New(),
				Name:                  &boardName,
				Description:           &boardDescription,
				AccessPolicy:          types.AccessPolicyPublic,
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
			},
		},
		{
			name:          "Successfully joined board without session",
			expectedCode:  http.StatusCreated,
			err:           nil,
			sessionExists: false,
			board: &dto.Board{
				ID:                    uuid.New(),
				Name:                  &boardName,
				Description:           &boardDescription,
				AccessPolicy:          types.AccessPolicyPublic,
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
			},
		}, {
			name:          "Successfully joined board with passphrase",
			expectedCode:  http.StatusCreated,
			err:           nil,
			sessionExists: false,
			board: &dto.Board{
				ID:                    uuid.New(),
				Name:                  &boardName,
				Description:           &boardDescription,
				AccessPolicy:          types.AccessPolicyByPassphrase,
				ShowAuthors:           true,
				ShowNotesOfOtherUsers: true,
				ShowNoteReactions:     true,
				AllowStacking:         true,
				AllowEditing:          true,
				TimerStart:            nil,
				TimerEnd:              nil,
				SharedNote:            uuid.NullUUID{},
				ShowVoting:            uuid.NullUUID{},
				Passphrase:            &passphrase,
				Salt:                  &salt,
			},
		},
		{
			name:          "Successfully join board by invite with existing session request",
			expectedCode:  http.StatusSeeOther,
			err:           nil,
			sessionExists: false,
			board: &dto.Board{
				ID:                    uuid.New(),
				Name:                  &boardName,
				Description:           &boardDescription,
				AccessPolicy:          types.AccessPolicyByInvite,
				ShowAuthors:           true,
				ShowNotesOfOtherUsers: true,
				ShowNoteReactions:     true,
				AllowStacking:         true,
				AllowEditing:          true,
				TimerStart:            nil,
				TimerEnd:              nil,
				SharedNote:            uuid.NullUUID{},
				ShowVoting:            uuid.NullUUID{},
				Passphrase:            &passphrase,
				Salt:                  &salt,
			},
			sessionRequestExists: true,
		},
		{
			name:          "Successfully join board by invite with existing session request",
			expectedCode:  http.StatusSeeOther,
			err:           nil,
			sessionExists: false,
			board: &dto.Board{
				ID:                    uuid.New(),
				Name:                  &boardName,
				Description:           &boardDescription,
				AccessPolicy:          types.AccessPolicyByInvite,
				ShowAuthors:           true,
				ShowNotesOfOtherUsers: true,
				ShowNoteReactions:     true,
				AllowStacking:         true,
				AllowEditing:          true,
				TimerStart:            nil,
				TimerEnd:              nil,
				SharedNote:            uuid.NullUUID{},
				ShowVoting:            uuid.NullUUID{},
				Passphrase:            &passphrase,
				Salt:                  &salt,
			},
			sessionRequestExists: false,
		},
	}

	for _, tt := range tests {
		suite.Run(tt.name, func() {
			s := new(Server)
			mock := new(BoardMock)
			sessionMock := new(SessionsMock)
			s.boards = mock
			s.sessions = sessionMock

			boardID, _ := uuid.NewRandom()
			userID, _ := uuid.NewRandom()
			sessionMock.On("SessionExists", boardID, userID).Return(tt.sessionExists, nil)
			if tt.sessionExists {
				sessionMock.On("ParticipantBanned", boardID, userID).Return(false, tt.err)
			} else {
				//sessionMock.On("SessionExists", boardID, userID).Return(false, nil)
				mock.On("Get", boardID).Return(tt.board, tt.err)
			}

			if tt.board.AccessPolicy == types.AccessPolicyByInvite {
				sessionMock.On("SessionRequestExists", boardID, userID).Return(tt.sessionRequestExists, tt.err)
				if !tt.sessionRequestExists {
					sessionMock.On("CreateSessionRequest", boardID, userID).Return(new(dto.BoardSessionRequest), tt.err)
				}
			} else {
				if !tt.sessionExists {
					sessionMock.On("Create", boardID, userID).Return(new(dto.BoardSession), tt.err)
				}

			}

			req := NewTestRequestBuilder("POST", fmt.Sprintf("/%s", boardID), strings.NewReader(`{"passphrase": "123"}`)).
				AddToContext(identifiers.UserIdentifier, userID)
			rctx := chi.NewRouteContext()
			rctx.URLParams.Add("id", boardID.String())
			req.AddToContext(chi.RouteCtxKey, rctx)

			rr := httptest.NewRecorder()

			s.joinBoard(rr, req.Request())

			suite.Equal(tt.expectedCode, rr.Result().StatusCode)
			mock.AssertExpectations(suite.T())
			sessionMock.AssertExpectations(suite.T())
		})
	}
}

func (suite *BoardTestSuite) TestUpdateBoards() {
	tests := []struct {
		name         string
		expectedCode int
		err          error
	}{
		{
			name:         "Successfully updated boards",
			expectedCode: http.StatusOK,
			err:          nil,
		},
		{
			name:         "Failed updating board",
			expectedCode: http.StatusInternalServerError,
			err: &common.APIError{
				Err:        errors.New("failed to update board"),
				StatusCode: http.StatusInternalServerError,
				StatusText: "no",
				ErrorText:  "Could not update board",
			},
		},
	}

	for _, tt := range tests {
		suite.Run(tt.name, func() {
			s := new(Server)
			mock := new(BoardMock)
			s.boards = mock

			newName := "UpdatedName"
			newDescription := "UpdatedDescription"
			boardID, _ := uuid.NewRandom()
			accessPolicy := types.AccessPolicyPublic
			boardReq := dto.BoardUpdateRequest{
				Name:         &newName,
				Description:  &newDescription,
				AccessPolicy: &accessPolicy,
				ID:           boardID,
			}

			mock.On("Update", boardReq).Return(new(dto.Board), tt.err)

			req := NewTestRequestBuilder("PUT", fmt.Sprintf("/%s", boardID), strings.NewReader(fmt.Sprintf(`{
        "id": "%s",
        "name": "%s",
        "description": "%s",
        "accessPolicy": "PUBLIC"
      }`, boardID, newName, newDescription))).
				AddToContext(identifiers.BoardIdentifier, boardID)

			rr := httptest.NewRecorder()

			s.updateBoard(rr, req.Request())

			suite.Equal(tt.expectedCode, rr.Result().StatusCode)
			mock.AssertExpectations(suite.T())
		})
	}
}

func (suite *BoardTestSuite) TestSetTimer() {
	tests := []struct {
		name         string
		expectedCode int
		err          error
	}{
		{
			name:         "Successfully set timer",
			expectedCode: http.StatusOK,
			err:          nil,
		},
		{
			name:         "Failed set timer",
			expectedCode: http.StatusInternalServerError,
			err: &common.APIError{
				Err:        errors.New("failed to set timer"),
				StatusCode: http.StatusInternalServerError,
				StatusText: "no",
				ErrorText:  "Could not set timer",
			},
		},
	}

	for _, tt := range tests {
		suite.Run(tt.name, func() {
			s := new(Server)
			mock := new(BoardMock)
			s.boards = mock

			boardID, _ := uuid.NewRandom()

			minutes := uint8(4)

			mock.On("SetTimer", boardID, minutes).Return(new(dto.Board), tt.err)

			req := NewTestRequestBuilder("PUT", "/timer", strings.NewReader(fmt.Sprintf(`{"minutes": %d}`, minutes))).
				AddToContext(identifiers.BoardIdentifier, boardID)

			rr := httptest.NewRecorder()

			s.setTimer(rr, req.Request())

			suite.Equal(tt.expectedCode, rr.Result().StatusCode)
			mock.AssertExpectations(suite.T())
		})
	}
}

func (suite *BoardTestSuite) TestDeleteTimer() {
	tests := []struct {
		name         string
		expectedCode int
		err          error
	}{
		{
			name:         "Successfully deleted timer",
			expectedCode: http.StatusOK,
			err:          nil,
		},
		{
			name:         "Failed deleting timer",
			expectedCode: http.StatusInternalServerError,
			err: &common.APIError{
				Err:        errors.New("failed to delete timer"),
				StatusCode: http.StatusInternalServerError,
				StatusText: "no",
				ErrorText:  "Could not delete timer",
			},
		},
	}

	for _, tt := range tests {
		suite.Run(tt.name, func() {
			s := new(Server)
			mock := new(BoardMock)
			s.boards = mock

			boardID, _ := uuid.NewRandom()

			mock.On("DeleteTimer", boardID).Return(new(dto.Board), tt.err)

			req := NewTestRequestBuilder("DEL", "/timer", nil).
				AddToContext(identifiers.BoardIdentifier, boardID)

			rr := httptest.NewRecorder()

			s.deleteTimer(rr, req.Request())

			suite.Equal(tt.expectedCode, rr.Result().StatusCode)
			mock.AssertExpectations(suite.T())
		})
	}
}

func (suite *BoardTestSuite) TestIncrementTimer() {
	tests := []struct {
		name         string
		expectedCode int
		err          error
	}{
		{
			name:         "Successfully increment timer",
			expectedCode: http.StatusOK,
			err:          nil,
		},
		{
			name:         "Failed incrementing timer",
			expectedCode: http.StatusInternalServerError,
			err: &common.APIError{
				Err:        errors.New("failed to increment timer"),
				StatusCode: http.StatusInternalServerError,
				StatusText: "no",
				ErrorText:  "Could not increment timer",
			},
		},
	}

	for _, tt := range tests {
		suite.Run(tt.name, func() {
			s := new(Server)
			mock := new(BoardMock)
			s.boards = mock

			boardID, _ := uuid.NewRandom()

			mock.On("IncrementTimer", boardID).Return(new(dto.Board), tt.err)

			req := NewTestRequestBuilder("POST", "/timer/increment", nil).
				AddToContext(identifiers.BoardIdentifier, boardID)

			rr := httptest.NewRecorder()

			s.incrementTimer(rr, req.Request())

			suite.Equal(tt.expectedCode, rr.Result().StatusCode)
			mock.AssertExpectations(suite.T())
		})
	}
}
