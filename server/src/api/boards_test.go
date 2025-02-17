package api

import (
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
	"scrumlr.io/server/mocks/services"
	"strings"
	"testing"
	"time"
)

type BoardTestSuite struct {
	suite.Suite
}

func TestBoardTestSuite(t *testing.T) {
	suite.Run(t, new(BoardTestSuite))
}

func (suite *BoardTestSuite) createBoard(boardName *string, boardDescription *string, accessPolicy types.AccessPolicy, passphrase *string, salt *string) *dto.Board {
	return &dto.Board{
		ID:                    uuid.New(),
		Name:                  boardName,
		Description:           boardDescription,
		AccessPolicy:          accessPolicy,
		ShowAuthors:           true,
		ShowNotesOfOtherUsers: true,
		ShowNoteReactions:     true,
		AllowStacking:         true,
		IsLocked:              true,
		TimerStart:            nil,
		TimerEnd:              nil,
		SharedNote:            uuid.NullUUID{},
		ShowVoting:            uuid.NullUUID{},
		Passphrase:            passphrase,
		Salt:                  salt,
	}
}

func (suite *BoardTestSuite) TestCreateBoard() {

	testParameterBundles := *TestParameterBundles{}.
		Append("Successfully create board", http.StatusCreated, nil, false, false, nil).
		Append("Failed creating board", http.StatusInternalServerError, &common.APIError{
			Err:        errors.New("failed to create board"),
			StatusCode: http.StatusInternalServerError,
			StatusText: "no",
			ErrorText:  "Could not create board",
		}, false, false, nil)

	for _, te := range testParameterBundles {
		suite.Run(te.name, func() {
			s := new(Server)
			boardMock := services.NewMockBoards(suite.T())

			s.boards = boardMock
			accessPolicy := types.AccessPolicyPublic
			visible := true
			colName := "Lean Coffee"
			color := types.Color("backlog-blue")
			ownerID := uuid.New()

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

			boardMock.EXPECT().Create(req.req.Context(), dto.CreateBoardRequest{
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
			}).Return(suite.createBoard(nil, nil, accessPolicy, nil, nil), te.err)

			rr := httptest.NewRecorder()

			s.createBoard(rr, req.Request())

			suite.Equal(te.expectedCode, rr.Result().StatusCode)
			boardMock.AssertExpectations(suite.T())
		})
	}
}

func (suite *BoardTestSuite) TestDeleteBoard() {

	testParameterBundles := *TestParameterBundles{}.
		Append("Successfully deleted board", http.StatusNoContent, nil, false, false, nil).
		Append("Failed deleting board", http.StatusInternalServerError, &common.APIError{
			Err:        errors.New("failed to delete board"),
			StatusCode: http.StatusInternalServerError,
			StatusText: "no",
			ErrorText:  "Could not delete board",
		}, false, false, nil)

	for _, te := range testParameterBundles {
		suite.Run(te.name, func() {
			s := new(Server)
			boardMock := services.NewMockBoards(suite.T())
			s.boards = boardMock
			boardID := uuid.New()

			req := NewTestRequestBuilder("POST", "/", nil).
				AddToContext(identifiers.BoardIdentifier, boardID)
			boardMock.EXPECT().Delete(req.req.Context(), boardID).Return(te.err)

			rr := httptest.NewRecorder()

			s.deleteBoard(rr, req.Request())

			suite.Equal(te.expectedCode, rr.Result().StatusCode)
			boardMock.AssertExpectations(suite.T())
		})
	}
}

func (suite *BoardTestSuite) TestGetBoards() {

	testParameterBundles := *TestParameterBundles{}.
		Append("Successfully received boards", http.StatusOK, nil, false, false, nil).
		Append("Failed receiving boards", http.StatusInternalServerError, &common.APIError{
			Err:        errors.New("failed to receive boards"),
			StatusCode: http.StatusInternalServerError,
			StatusText: "no",
			ErrorText:  "Could not receive boards",
		}, false, false, nil)

	for _, te := range testParameterBundles {
		suite.Run(te.name, func() {
			s := new(Server)
			boardMock := services.NewMockBoards(suite.T())
			s.boards = boardMock
			userID := uuid.New()

			boardName := "Test Name"
			boardDescription := "Test Description"
			firstBoard := suite.createBoard(&boardName, &boardDescription, types.AccessPolicyPublic, nil, nil)

			boardName = "Test Board"
			boardDescription = "Description for second board"
			secondBoard := suite.createBoard(&boardName, &boardDescription, types.AccessPolicyPublic, nil, nil)
			boardIDs := []uuid.UUID{firstBoard.ID, secondBoard.ID}

			req := NewTestRequestBuilder("POST", "/", nil).
				AddToContext(identifiers.UserIdentifier, userID)

			boardMock.EXPECT().GetBoards(req.req.Context(), userID).Return(boardIDs, te.err)
			if te.err == nil {
				boardMock.EXPECT().BoardOverview(req.req.Context(), boardIDs, userID).Return([]*dto.BoardOverview{{
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
				}, te.err)
			}

			rr := httptest.NewRecorder()

			s.getBoards(rr, req.Request())

			suite.Equal(te.expectedCode, rr.Result().StatusCode)
			boardMock.AssertExpectations(suite.T())
		})
	}
}

func (suite *BoardTestSuite) TestGetBoard() {

	testParameterBundles := *TestParameterBundles{}.
		Append("Successfully received boards", http.StatusOK, nil, false, false, nil).
		Append("Failed receiving boards", http.StatusInternalServerError, &common.APIError{
			Err:        errors.New("failed to receive boards"),
			StatusCode: http.StatusInternalServerError,
			StatusText: "no",
			ErrorText:  "Could not receive boards",
		}, false, false, nil)

	for _, te := range testParameterBundles {
		suite.Run(te.name, func() {
			s := new(Server)
			boardMock := services.NewMockBoards(suite.T())
			s.boards = boardMock
			boardID := uuid.New()

			boardName := "Test Name"
			boardDescription := "Test Description"
			board := suite.createBoard(&boardName, &boardDescription, "", nil, nil)

			req := NewTestRequestBuilder("POST", "/", nil).
				AddToContext(identifiers.BoardIdentifier, boardID)

			boardMock.EXPECT().Get(req.req.Context(), boardID).Return(board, te.err)

			rr := httptest.NewRecorder()

			s.getBoard(rr, req.Request())

			suite.Equal(te.expectedCode, rr.Result().StatusCode)
			boardMock.AssertExpectations(suite.T())
		})
	}
}

func (suite *BoardTestSuite) TestJoinBoard() {
	boardName := "Test Name"
	boardDescription := "Test Description"
	salt := "z9YcpBno6azI2ueA"
	passphrase := common.Sha512BySalt("123", salt)

	testParameterBundles := *TestParameterBundles{}.
		Append("Successfully join board", http.StatusSeeOther, nil, true, false, suite.createBoard(&boardName, &boardDescription, types.AccessPolicyPublic, nil, nil)).
		Append("Failed joining board", http.StatusInternalServerError,
			&common.APIError{
				Err:        errors.New("failed to join board"),
				StatusCode: http.StatusInternalServerError,
				StatusText: "no",
				ErrorText:  "Could not join board",
			}, true, false, suite.createBoard(&boardName, &boardDescription, types.AccessPolicyPublic, nil, nil)).
		Append("Successfully joined board without session", http.StatusCreated, nil, false, false, suite.createBoard(&boardName, &boardDescription, types.AccessPolicyPublic, nil, nil)).
		Append("Successfully joined board with passphrase", http.StatusCreated, nil, false, false, suite.createBoard(&boardName, &boardDescription, types.AccessPolicyByPassphrase, &passphrase, &salt)).
		Append("Successfully join board by invite with existing session request", http.StatusSeeOther, nil, false, true, suite.createBoard(&boardName, &boardDescription, types.AccessPolicyByInvite, &passphrase, &salt)).
		Append("Successfully join board by invite with existing session request", http.StatusSeeOther, nil, false, false, suite.createBoard(&boardName, &boardDescription, types.AccessPolicyByInvite, &passphrase, &salt))

	for _, te := range testParameterBundles {
		suite.Run(te.name, func() {
			s := new(Server)
			boardMock := services.NewMockBoards(suite.T())
			sessionMock := services.NewMockBoardSessions(suite.T())
			s.boards = boardMock
			s.sessions = sessionMock
			boardID := uuid.New()
			userID := uuid.New()

			req := NewTestRequestBuilder("POST", fmt.Sprintf("/%s", boardID), strings.NewReader(`{"passphrase": "123"}`)).
				AddToContext(identifiers.UserIdentifier, userID)
			rctx := chi.NewRouteContext()
			rctx.URLParams.Add("id", boardID.String())
			req.AddToContext(chi.RouteCtxKey, rctx)

			sessionMock.EXPECT().SessionExists(req.req.Context(), boardID, userID).Return(te.sessionExists, nil)

			if te.sessionExists {
				sessionMock.EXPECT().ParticipantBanned(req.req.Context(), boardID, userID).Return(false, te.err)
			} else {
				boardMock.EXPECT().Get(req.req.Context(), boardID).Return(te.board, te.err)
			}

			if te.board.AccessPolicy == types.AccessPolicyByInvite {
				sessionMock.EXPECT().SessionRequestExists(req.req.Context(), boardID, userID).Return(te.sessionRequestExists, te.err)
				if !te.sessionRequestExists {
					sessionMock.EXPECT().CreateSessionRequest(req.req.Context(), boardID, userID).Return(new(dto.BoardSessionRequest), te.err)
				}
			} else {
				if !te.sessionExists {
					sessionMock.EXPECT().Create(req.req.Context(), boardID, userID).Return(new(dto.BoardSession), te.err)
				}

			}

			rr := httptest.NewRecorder()

			s.joinBoard(rr, req.Request())

			suite.Equal(te.expectedCode, rr.Result().StatusCode)
			boardMock.AssertExpectations(suite.T())
			sessionMock.AssertExpectations(suite.T())
		})
	}
}

func (suite *BoardTestSuite) TestUpdateBoards() {

	testParameterBundles := *TestParameterBundles{}.
		Append("Successfully updated boards", http.StatusOK, nil, false, false, nil).
		Append("Failed updating board", http.StatusInternalServerError, &common.APIError{
			Err:        errors.New("failed to update board"),
			StatusCode: http.StatusInternalServerError,
			StatusText: "no",
			ErrorText:  "Could not update board",
		}, false, false, nil)

	for _, te := range testParameterBundles {
		suite.Run(te.name, func() {
			s := new(Server)
			boardMock := services.NewMockBoards(suite.T())
			s.boards = boardMock
			boardID := uuid.New()

			newName := "UpdatedName"
			newDescription := "UpdatedDescription"
			accessPolicy := types.AccessPolicyPublic
			boardReq := dto.BoardUpdateRequest{
				Name:         &newName,
				Description:  &newDescription,
				AccessPolicy: &accessPolicy,
				ID:           boardID,
			}

			req := NewTestRequestBuilder("PUT", fmt.Sprintf("/%s", boardID), strings.NewReader(fmt.Sprintf(`{
        "id": "%s",
        "name": "%s",
        "description": "%s",
        "accessPolicy": "PUBLIC"
      }`, boardID, newName, newDescription))).
				AddToContext(identifiers.BoardIdentifier, boardID)

			boardMock.EXPECT().Update(req.req.Context(), boardReq).Return(new(dto.Board), te.err)

			rr := httptest.NewRecorder()

			s.updateBoard(rr, req.Request())

			suite.Equal(te.expectedCode, rr.Result().StatusCode)
			boardMock.AssertExpectations(suite.T())
		})
	}
}

func (suite *BoardTestSuite) TestSetTimer() {

	testParameterBundles := *TestParameterBundles{}.
		Append("Successfully set timer", http.StatusOK, nil, false, false, nil).
		Append("Failed set timer", http.StatusInternalServerError, &common.APIError{
			Err:        errors.New("failed to set timer"),
			StatusCode: http.StatusInternalServerError,
			StatusText: "no",
			ErrorText:  "Could not set timer",
		}, false, false, nil)

	for _, te := range testParameterBundles {
		suite.Run(te.name, func() {
			s := new(Server)
			boardMock := services.NewMockBoards(suite.T())
			s.boards = boardMock
			boardID := uuid.New()

			minutes := uint8(4)

			req := NewTestRequestBuilder("PUT", "/timer", strings.NewReader(fmt.Sprintf(`{"minutes": %d}`, minutes))).
				AddToContext(identifiers.BoardIdentifier, boardID)

			boardMock.EXPECT().SetTimer(req.req.Context(), boardID, minutes).Return(new(dto.Board), te.err)

			rr := httptest.NewRecorder()

			s.setTimer(rr, req.Request())

			suite.Equal(te.expectedCode, rr.Result().StatusCode)
			boardMock.AssertExpectations(suite.T())
		})
	}
}

func (suite *BoardTestSuite) TestDeleteTimer() {

	testParameterBundles := TestParameterBundles{}.
		Append("Successfully deleted timer", http.StatusOK, nil, false, false, nil).
		Append("Failed deleting timer", http.StatusInternalServerError, &common.APIError{
			Err:        errors.New("failed to delete timer"),
			StatusCode: http.StatusInternalServerError,
			StatusText: "no",
			ErrorText:  "Could not delete timer",
		}, false, false, nil)

	for _, tt := range *testParameterBundles {
		suite.Run(tt.name, func() {
			s := new(Server)
			boardMock := services.NewMockBoards(suite.T())
			s.boards = boardMock
			boardID := uuid.New()

			req := NewTestRequestBuilder("DEL", "/timer", nil).
				AddToContext(identifiers.BoardIdentifier, boardID)

			boardMock.EXPECT().DeleteTimer(req.req.Context(), boardID).Return(new(dto.Board), tt.err)

			rr := httptest.NewRecorder()

			s.deleteTimer(rr, req.Request())

			suite.Equal(tt.expectedCode, rr.Result().StatusCode)
			boardMock.AssertExpectations(suite.T())
		})
	}
}

func (suite *BoardTestSuite) TestIncrementTimer() {

	testParameterBundles := *TestParameterBundles{}.
		Append("Successfully increment timer", http.StatusOK, nil, false, false, nil).
		Append("Failed incrementing timer", http.StatusInternalServerError, &common.APIError{
			Err:        errors.New("failed to increment timer"),
			StatusCode: http.StatusInternalServerError,
			StatusText: "no",
			ErrorText:  "Could not increment timer",
		}, false, false, nil)

	for _, tt := range testParameterBundles {
		suite.Run(tt.name, func() {
			s := new(Server)
			boardMock := services.NewMockBoards(suite.T())
			s.boards = boardMock
			boardID := uuid.New()

			req := NewTestRequestBuilder("POST", "/timer/increment", nil).
				AddToContext(identifiers.BoardIdentifier, boardID)

			boardMock.EXPECT().IncrementTimer(req.req.Context(), boardID).Return(new(dto.Board), tt.err)

			rr := httptest.NewRecorder()

			s.incrementTimer(rr, req.Request())

			suite.Equal(tt.expectedCode, rr.Result().StatusCode)
			boardMock.AssertExpectations(suite.T())
		})
	}
}
