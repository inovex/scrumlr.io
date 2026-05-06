package api

import (
	"database/sql"
	"encoding/csv"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"scrumlr.io/server/hash"
	"scrumlr.io/server/sessions"
	"scrumlr.io/server/technical_helper"

	"scrumlr.io/server/boards"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
	"github.com/stretchr/testify/suite"
	"scrumlr.io/server/columns"
	"scrumlr.io/server/common"
	"scrumlr.io/server/identifiers"
	"scrumlr.io/server/notes"
	"scrumlr.io/server/sessionrequests"
	"scrumlr.io/server/users"
	"scrumlr.io/server/votings"
	"scrumlr.io/server/websocket"
)

type BoardTestSuite struct {
	suite.Suite
}

type spyWebSocketService struct {
	acceptCalled bool
	acceptErr    error
}

func (s *spyWebSocketService) Accept(_ http.ResponseWriter, _ *http.Request, _ bool) (websocket.Connection, error) {
	s.acceptCalled = true
	return nil, s.acceptErr
}

func (s *spyWebSocketService) IsNormalClose(_ error) bool {
	return false
}

type failingResponseWriter struct {
	header http.Header
	status int
}

func (w *failingResponseWriter) Header() http.Header {
	if w.header == nil {
		w.header = make(http.Header)
	}
	return w.header
}

func (w *failingResponseWriter) WriteHeader(statusCode int) {
	w.status = statusCode
}

func (w *failingResponseWriter) Write(_ []byte) (int, error) {
	return 0, errors.New("write failed")
}

func testBoard(accessPolicy boards.AccessPolicy, passphrase *string, salt *string) *boards.Board {
	name := "Test"
	description := "Test board"
	return &boards.Board{
		ID:                    uuid.New(),
		Name:                  &name,
		Description:           &description,
		AccessPolicy:          accessPolicy,
		ShowAuthors:           true,
		ShowNotesOfOtherUsers: true,
		ShowNoteReactions:     true,
		AllowStacking:         true,
		IsLocked:              false,
		SharedNote:            uuid.NullUUID{},
		ShowVoting:            uuid.NullUUID{},
		Passphrase:            passphrase,
		Salt:                  salt,
	}
}

func newJoinBoardRequest(boardParam string, body io.Reader, userID uuid.UUID) *http.Request {
	req := technical_helper.NewTestRequestBuilder("POST", fmt.Sprintf("/%s", boardParam), body).
		AddToContext(identifiers.UserIdentifier, userID)
	rctx := chi.NewRouteContext()
	rctx.URLParams.Add("id", boardParam)
	req.AddToContext(chi.RouteCtxKey, rctx)
	return req.Request()
}

func marshalImportBody(t *testing.T, body boards.ImportBoardRequest) io.Reader {
	raw, err := json.Marshal(body)
	require.NoError(t, err)
	return strings.NewReader(string(raw))
}

func buildImportBody(name string, accessPolicy boards.AccessPolicy, cols []columns.Column, nts []notes.Note) boards.ImportBoardRequest {
	boardName := name
	return boards.ImportBoardRequest{
		Board: &boards.CreateBoardRequest{
			Name:         &boardName,
			AccessPolicy: accessPolicy,
		},
		Columns: cols,
		Notes:   nts,
	}
}

func matchImportCreateRequest(owner uuid.UUID, expected boards.ImportBoardRequest) interface{} {
	return mock.MatchedBy(func(req boards.CreateBoardRequest) bool {
		if req.Owner != owner {
			return false
		}
		if expected.Board == nil || req.Name == nil || expected.Board.Name == nil || *req.Name != *expected.Board.Name {
			return false
		}
		if req.AccessPolicy != expected.Board.AccessPolicy {
			return false
		}
		if len(req.Columns) != len(expected.Columns) {
			return false
		}

		for idx, expectedColumn := range expected.Columns {
			importColumn := req.Columns[idx]
			if importColumn.Name != expectedColumn.Name {
				return false
			}
			if importColumn.Color != expectedColumn.Color {
				return false
			}
			if importColumn.Visible == nil || *importColumn.Visible != expectedColumn.Visible {
				return false
			}
			if importColumn.Index == nil || *importColumn.Index != expectedColumn.Index {
				return false
			}
		}

		return true
	})
}

func TestBoardTestSuite(t *testing.T) {
	suite.Run(t, new(BoardTestSuite))
}

func (suite *BoardTestSuite) createBoard(boardName *string, boardDescription *string, accessPolicy boards.AccessPolicy, passphrase *string, salt *string) *boards.Board {
	return &boards.Board{
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
			boardMock := boards.NewMockBoardService(suite.T())

			s.boards = boardMock
			accessPolicy := boards.Public
			visible := true
			colName := "Lean Coffee"
			color := common.Color("backlog-blue")
			ownerID := uuid.New()

			req := technical_helper.NewTestRequestBuilder("POST", "/", strings.NewReader(fmt.Sprintf(` {
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

			boardMock.EXPECT().Create(mock.Anything, boards.CreateBoardRequest{
				Name:         nil,
				Description:  nil,
				AccessPolicy: accessPolicy,
				Passphrase:   nil,
				Columns: []columns.ColumnRequest{
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
			boardMock := boards.NewMockBoardService(suite.T())
			s.boards = boardMock
			boardID := uuid.New()

			req := technical_helper.NewTestRequestBuilder("POST", "/", nil).
				AddToContext(identifiers.BoardIdentifier, boardID)
			boardMock.EXPECT().Delete(mock.Anything, boardID).Return(te.err)

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
			boardMock := boards.NewMockBoardService(suite.T())
			s.boards = boardMock
			userID := uuid.New()

			firstBoard := suite.createBoard(new("Test Name"), new("Test Description"), boards.Public, nil, nil)
			secondBoard := suite.createBoard(new("Test Board"), new("Description for second board"), boards.Public, nil, nil)
			boardIDs := []uuid.UUID{firstBoard.ID, secondBoard.ID}

			req := technical_helper.NewTestRequestBuilder("POST", "/", nil).
				AddToContext(identifiers.UserIdentifier, userID)

			boardMock.EXPECT().GetBoards(mock.Anything, userID).Return(boardIDs, te.err)
			if te.err == nil {
				boardMock.EXPECT().BoardOverview(mock.Anything, boardIDs, userID).Return([]*boards.BoardOverview{{
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
			boardMock := boards.NewMockBoardService(suite.T())
			s.boards = boardMock
			boardID := uuid.New()

			board := suite.createBoard(new("Test Name"), new("Test Description"), "", nil, nil)

			req := technical_helper.NewTestRequestBuilder("POST", "/", nil).
				AddToContext(identifiers.BoardIdentifier, boardID)

			boardMock.EXPECT().Get(mock.Anything, boardID).Return(board, te.err)

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
	passphrase := hash.NewHashSha512().HashBySalt("123", salt)

	testParameterBundles := *TestParameterBundles{}.
		Append("Successfully join board", http.StatusSeeOther, nil, true, false, suite.createBoard(&boardName, &boardDescription, boards.Public, nil, nil)).
		Append("Failed joining board", http.StatusInternalServerError,
			&common.APIError{
				Err:        errors.New("failed to join board"),
				StatusCode: http.StatusInternalServerError,
				StatusText: "no",
				ErrorText:  "Could not join board",
			}, true, false, suite.createBoard(&boardName, &boardDescription, boards.Public, nil, nil)).
		Append("Successfully joined board without session", http.StatusCreated, nil, false, false, suite.createBoard(&boardName, &boardDescription, boards.Public, nil, nil)).
		Append("Successfully joined board with passphrase", http.StatusCreated, nil, false, false, suite.createBoard(&boardName, &boardDescription, boards.ByPassphrase, &passphrase, &salt)).
		Append("Successfully join board by invite with existing session request", http.StatusSeeOther, nil, false, true, suite.createBoard(&boardName, &boardDescription, boards.ByInvite, &passphrase, &salt)).
		Append("Successfully join board by invite with existing session request", http.StatusSeeOther, nil, false, false, suite.createBoard(&boardName, &boardDescription, boards.ByInvite, &passphrase, &salt))

	for _, te := range testParameterBundles {
		suite.Run(te.name, func() {
			s := new(Server)
			boardMock := boards.NewMockBoardService(suite.T())
			sessionMock := sessions.NewMockSessionService(suite.T())
			sessionRequestMock := sessionrequests.NewMockSessionRequestService(suite.T())
			s.boards = boardMock
			s.sessions = sessionMock
			s.sessionRequests = sessionRequestMock
			boardID := uuid.New()
			userID := uuid.New()

			req := technical_helper.NewTestRequestBuilder("POST", fmt.Sprintf("/%s", boardID), strings.NewReader(`{"passphrase": "123"}`)).
				AddToContext(identifiers.UserIdentifier, userID)
			rctx := chi.NewRouteContext()
			rctx.URLParams.Add("id", boardID.String())
			req.AddToContext(chi.RouteCtxKey, rctx)

			sessionMock.EXPECT().Exists(mock.Anything, boardID, userID).Return(te.sessionExists, nil)

			if te.sessionExists {
				sessionMock.EXPECT().IsParticipantBanned(mock.Anything, boardID, userID).Return(false, te.err)
			} else {
				boardMock.EXPECT().Get(mock.Anything, boardID).Return(te.board, te.err)
			}

			if te.board.AccessPolicy == boards.ByInvite {
				sessionRequestMock.EXPECT().Exists(mock.Anything, boardID, userID).Return(te.sessionRequestExists, te.err)
				if !te.sessionRequestExists {
					sessionRequestMock.EXPECT().Create(mock.Anything, boardID, userID).Return(new(sessionrequests.BoardSessionRequest), te.err)
				}
			} else {
				if !te.sessionExists {
					sessionMock.EXPECT().Create(mock.Anything, sessions.BoardSessionCreateRequest{Board: boardID, User: userID, Role: common.ParticipantRole}).
						Return(new(sessions.BoardSession), te.err)
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
			boardMock := boards.NewMockBoardService(suite.T())
			s.boards = boardMock
			boardID := uuid.New()

			newName := "UpdatedName"
			newDescription := "UpdatedDescription"
			boardReq := boards.BoardUpdateRequest{
				Name:         &newName,
				Description:  &newDescription,
				AccessPolicy: new(boards.Public),
				ID:           boardID,
			}

			req := technical_helper.NewTestRequestBuilder("PUT", fmt.Sprintf("/%s", boardID), strings.NewReader(fmt.Sprintf(`{
        "id": "%s",
        "name": "%s",
        "description": "%s",
        "accessPolicy": "PUBLIC"
      }`, boardID, newName, newDescription))).
				AddToContext(identifiers.BoardIdentifier, boardID)

			boardMock.EXPECT().Update(mock.Anything, boardReq).Return(new(boards.Board), te.err)

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
			boardMock := boards.NewMockBoardService(suite.T())
			s.boards = boardMock
			boardID := uuid.New()

			minutes := uint8(4)

			req := technical_helper.NewTestRequestBuilder("PUT", "/timer", strings.NewReader(fmt.Sprintf(`{"minutes": %d}`, minutes))).
				AddToContext(identifiers.BoardIdentifier, boardID)

			boardMock.EXPECT().SetTimer(mock.Anything, boardID, minutes).Return(new(boards.Board), te.err)

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
			boardMock := boards.NewMockBoardService(suite.T())
			s.boards = boardMock
			boardID := uuid.New()

			req := technical_helper.NewTestRequestBuilder("DEL", "/timer", nil).
				AddToContext(identifiers.BoardIdentifier, boardID)

			boardMock.EXPECT().DeleteTimer(mock.Anything, boardID).Return(new(boards.Board), tt.err)

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
			boardMock := boards.NewMockBoardService(suite.T())
			s.boards = boardMock
			boardID := uuid.New()

			req := technical_helper.NewTestRequestBuilder("POST", "/timer/increment", nil).
				AddToContext(identifiers.BoardIdentifier, boardID)

			boardMock.EXPECT().IncrementTimer(mock.Anything, boardID).Return(new(boards.Board), tt.err)

			rr := httptest.NewRecorder()

			s.incrementTimer(rr, req.Request())

			suite.Equal(tt.expectedCode, rr.Result().StatusCode)
			boardMock.AssertExpectations(suite.T())
		})
	}
}

func TestGetBoardsBoardOverviewError(t *testing.T) {
	s := &Server{}
	boardMock := boards.NewMockBoardService(t)
	s.boards = boardMock

	userID := uuid.New()
	boardIDs := []uuid.UUID{uuid.New()}

	req := technical_helper.NewTestRequestBuilder("GET", "/boards", nil).
		AddToContext(identifiers.UserIdentifier, userID).
		Request()

	boardMock.EXPECT().GetBoards(mock.Anything, userID).Return(boardIDs, nil)
	boardMock.EXPECT().BoardOverview(mock.Anything, boardIDs, userID).Return(nil, errors.New("overview failed"))

	rr := httptest.NewRecorder()
	s.getBoards(rr, req)

	require.Equal(t, http.StatusInternalServerError, rr.Code)
}

func TestGetBoardWebsocketUpgradePath(t *testing.T) {
	s := &Server{}
	boardMock := boards.NewMockBoardService(t)
	s.boards = boardMock
	wsService := &spyWebSocketService{acceptErr: errors.New("upgrade failed")}
	s.wsService = wsService

	boardID := uuid.New()
	userID := uuid.New()

	req := technical_helper.NewTestRequestBuilder("GET", "/boards", nil).
		AddToContext(identifiers.BoardIdentifier, boardID).
		AddToContext(identifiers.UserIdentifier, userID)
	req.Req.Header.Set("Upgrade", "websocket")

	rr := httptest.NewRecorder()
	s.getBoard(rr, req.Request())

	// Verify the websocket upgrade path was taken; the mock will fail the test automatically
	// if boards.Get is called unexpectedly, so no explicit AssertNotCalled is needed.
	require.True(t, wsService.acceptCalled)
}

func TestGetBoardNotFoundForMissingBoard(t *testing.T) {
	s := &Server{}
	boardMock := boards.NewMockBoardService(t)
	s.boards = boardMock

	boardID := uuid.New()
	req := technical_helper.NewTestRequestBuilder("GET", "/boards", nil).
		AddToContext(identifiers.BoardIdentifier, boardID).
		Request()

	boardMock.EXPECT().Get(mock.Anything, boardID).Return(nil, sql.ErrNoRows)

	rr := httptest.NewRecorder()
	s.getBoard(rr, req)

	require.Equal(t, http.StatusNotFound, rr.Code)
}

func TestJoinBoardParseBoardIDError(t *testing.T) {
	s := &Server{}

	req := newJoinBoardRequest("not-a-uuid", nil, uuid.New())
	rr := httptest.NewRecorder()

	s.joinBoard(rr, req)
	require.Equal(t, http.StatusBadRequest, rr.Code)
}

func TestJoinBoardBannedParticipant(t *testing.T) {
	s := &Server{}
	sessionMock := sessions.NewMockSessionService(t)
	s.sessions = sessionMock

	boardID := uuid.New()
	userID := uuid.New()
	req := newJoinBoardRequest(boardID.String(), nil, userID)

	sessionMock.EXPECT().Exists(mock.Anything, boardID, userID).Return(true, nil)
	sessionMock.EXPECT().IsParticipantBanned(mock.Anything, boardID, userID).Return(true, nil)

	rr := httptest.NewRecorder()
	s.joinBoard(rr, req)

	require.Equal(t, http.StatusForbidden, rr.Code)
}

func TestJoinBoardByPassphraseWrongPassphrase(t *testing.T) {
	s := &Server{}
	boardMock := boards.NewMockBoardService(t)
	sessionMock := sessions.NewMockSessionService(t)
	s.boards = boardMock
	s.sessions = sessionMock

	salt := "salt"
	passphrase := hash.NewHashSha512().HashBySalt("secret", salt)

	boardID := uuid.New()
	userID := uuid.New()
	req := newJoinBoardRequest(boardID.String(), strings.NewReader(`{"passphrase":"wrong"}`), userID)

	sessionMock.EXPECT().Exists(mock.Anything, boardID, userID).Return(false, nil)
	boardMock.EXPECT().Get(mock.Anything, boardID).Return(testBoard(boards.ByPassphrase, &passphrase, &salt), nil)

	rr := httptest.NewRecorder()
	s.joinBoard(rr, req)

	require.Equal(t, http.StatusBadRequest, rr.Code)
}

func TestJoinBoardByInviteCreateRequestError(t *testing.T) {
	s := &Server{}
	boardMock := boards.NewMockBoardService(t)
	sessionMock := sessions.NewMockSessionService(t)
	sessionRequestMock := sessionrequests.NewMockSessionRequestService(t)
	s.boards = boardMock
	s.sessions = sessionMock
	s.sessionRequests = sessionRequestMock

	boardID := uuid.New()
	userID := uuid.New()
	req := newJoinBoardRequest(boardID.String(), nil, userID)

	sessionMock.EXPECT().Exists(mock.Anything, boardID, userID).Return(false, nil)
	boardMock.EXPECT().Get(mock.Anything, boardID).Return(testBoard(boards.ByInvite, nil, nil), nil)
	sessionRequestMock.EXPECT().Exists(mock.Anything, boardID, userID).Return(false, nil)
	sessionRequestMock.EXPECT().Create(mock.Anything, boardID, userID).Return(nil, errors.New("create failed"))

	rr := httptest.NewRecorder()
	s.joinBoard(rr, req)

	require.Equal(t, http.StatusInternalServerError, rr.Code)
}

func TestSetTimerDecodeError(t *testing.T) {
	s := &Server{}
	boardMock := boards.NewMockBoardService(t)
	s.boards = boardMock

	boardID := uuid.New()
	req := technical_helper.NewTestRequestBuilder("POST", "/timer", strings.NewReader("{"))
	req.AddToContext(identifiers.BoardIdentifier, boardID)

	rr := httptest.NewRecorder()
	s.setTimer(rr, req.Request())

	require.Equal(t, http.StatusBadRequest, rr.Code)
	boardMock.AssertNotCalled(t, "SetTimer", mock.Anything, boardID, mock.Anything)
}

func TestExportBoardJSONFiltersInvisibleColumnsAndNotes(t *testing.T) {
	s := &Server{}
	boardMock := boards.NewMockBoardService(t)
	s.boards = boardMock

	boardID := uuid.New()
	visibleColumn := &columns.Column{ID: uuid.New(), Name: "Visible", Visible: true}
	hiddenColumn := &columns.Column{ID: uuid.New(), Name: "Hidden", Visible: false}

	visibleNote := &notes.Note{ID: uuid.New(), Author: uuid.New(), Text: "visible", Position: notes.NotePosition{Column: visibleColumn.ID, Rank: 1}}
	hiddenNote := &notes.Note{ID: uuid.New(), Author: uuid.New(), Text: "hidden", Position: notes.NotePosition{Column: hiddenColumn.ID, Rank: 1}}

	fullBoard := &boards.FullBoard{
		Board:   testBoard(boards.Public, nil, nil),
		Columns: []*columns.Column{visibleColumn, hiddenColumn},
		Notes:   []*notes.Note{visibleNote, hiddenNote},
	}

	req := technical_helper.NewTestRequestBuilder("GET", "/export", nil)
	req.AddToContext(identifiers.BoardIdentifier, boardID)

	boardMock.EXPECT().FullBoard(mock.Anything, boardID).Return(fullBoard, nil)

	rr := httptest.NewRecorder()
	s.exportBoard(rr, req.Request())

	require.Equal(t, http.StatusOK, rr.Code)

	var response struct {
		Columns []struct {
			ID uuid.UUID `json:"id"`
		} `json:"columns"`
		Notes []struct {
			ID uuid.UUID `json:"id"`
		} `json:"notes"`
	}

	require.NoError(t, json.NewDecoder(rr.Body).Decode(&response))
	require.Len(t, response.Columns, 1)
	require.Len(t, response.Notes, 1)
	require.Equal(t, visibleColumn.ID, response.Columns[0].ID)
	require.Equal(t, visibleNote.ID, response.Notes[0].ID)
}

func TestExportBoardCSVIncludesVotesAndAuthorInformation(t *testing.T) {
	s := &Server{}
	boardMock := boards.NewMockBoardService(t)
	userMock := users.NewMockUserService(t)
	s.boards = boardMock
	s.users = userMock

	boardID := uuid.New()
	column := &columns.Column{ID: uuid.New(), Name: "Visible", Visible: true}

	authorID := uuid.New()
	parentNote := &notes.Note{
		ID:     uuid.New(),
		Author: authorID,
		Text:   "parent",
		Position: notes.NotePosition{
			Column: column.ID,
			Rank:   1,
			Stack:  uuid.NullUUID{},
		},
	}

	fullBoard := &boards.FullBoard{
		Board:   testBoard(boards.Public, nil, nil),
		Columns: []*columns.Column{column},
		Notes:   []*notes.Note{parentNote},
		BoardSessions: []*sessions.BoardSession{
			{UserID: authorID},
		},
		Votings: []*votings.Voting{
			{
				Status: votings.Closed,
				VotingResults: &votings.VotingResults{Votes: map[uuid.UUID]votings.VotingResultsPerNote{
					parentNote.ID: {Total: 2},
				}},
			},
		},
	}

	req := technical_helper.NewTestRequestBuilder("GET", "/export", nil)
	req.Req.Header.Set("Accept", "text/csv")
	req.AddToContext(identifiers.BoardIdentifier, boardID)

	boardMock.EXPECT().FullBoard(mock.Anything, boardID).Return(fullBoard, nil)
	userMock.EXPECT().Get(mock.Anything, authorID).Return(&users.User{ID: authorID, Name: "Alice"}, nil).Once()

	rr := httptest.NewRecorder()
	s.exportBoard(rr, req.Request())

	require.Equal(t, http.StatusOK, rr.Code)

	records, err := csv.NewReader(strings.NewReader(rr.Body.String())).ReadAll()
	require.NoError(t, err)
	require.Len(t, records, 2)
	require.Equal(t, []string{"note_id", "author_id", "author", "text", "column_id", "column", "rank", "stack", "voting_0"}, records[0])
	require.Equal(t, "Alice", records[1][2])
	require.Equal(t, "2", records[1][8])
}

func TestExportBoardNotAcceptableForUnsupportedMimeType(t *testing.T) {
	s := &Server{}
	boardMock := boards.NewMockBoardService(t)
	s.boards = boardMock

	boardID := uuid.New()
	fullBoard := &boards.FullBoard{Board: testBoard(boards.Public, nil, nil)}

	req := technical_helper.NewTestRequestBuilder("GET", "/export", nil)
	req.Req.Header.Set("Accept", "application/xml")
	req.AddToContext(identifiers.BoardIdentifier, boardID)

	boardMock.EXPECT().FullBoard(mock.Anything, boardID).Return(fullBoard, nil)

	rr := httptest.NewRecorder()
	s.exportBoard(rr, req.Request())

	require.Equal(t, http.StatusNotAcceptable, rr.Code)
}

func TestImportBoardCreateError(t *testing.T) {
	s := &Server{}
	boardMock := boards.NewMockBoardService(t)
	s.boards = boardMock

	owner := uuid.New()
	col := columns.Column{ID: uuid.New(), Name: "Col", Color: common.ColorBacklogBlue, Visible: true, Index: 0}
	body := buildImportBody("Imported Board", boards.Public, []columns.Column{col}, nil)

	req := technical_helper.NewTestRequestBuilder("POST", "/import", marshalImportBody(t, body))
	req.AddToContext(identifiers.UserIdentifier, owner)

	boardMock.EXPECT().Create(mock.Anything, matchImportCreateRequest(owner, body)).Return(nil, errors.New("create failed"))

	rr := httptest.NewRecorder()
	s.importBoard(rr, req.Request())

	require.Equal(t, http.StatusInternalServerError, rr.Code)
}

func TestImportBoardSuccessWithParentAndChildNotes(t *testing.T) {
	s := &Server{}
	boardMock := boards.NewMockBoardService(t)
	columnMock := columns.NewMockColumnService(t)
	noteMock := notes.NewMockNotesService(t)
	s.boards = boardMock
	s.columns = columnMock
	s.notes = noteMock

	owner := uuid.New()
	newBoard := &boards.Board{ID: uuid.New()}
	oldColumnID := uuid.New()
	newColumnID := uuid.New()
	authorID := uuid.New()

	parentOldID := uuid.New()
	parentImported := &notes.Note{
		ID:     uuid.New(),
		Author: authorID,
		Text:   "Parent",
		Position: notes.NotePosition{
			Column: newColumnID,
			Rank:   0,
			Stack:  uuid.NullUUID{},
		},
	}

	col := columns.Column{ID: oldColumnID, Name: "Col", Color: common.ColorBacklogBlue, Visible: true, Index: 0}
	parent := notes.Note{
		ID:     parentOldID,
		Author: authorID,
		Text:   "Parent",
		Position: notes.NotePosition{
			Column: oldColumnID,
			Rank:   5, // deliberately non-zero to verify the handler always normalises parent rank to 0
			Stack:  uuid.NullUUID{},
		},
	}
	child := notes.Note{
		ID:     uuid.New(),
		Author: authorID,
		Text:   "Child",
		Position: notes.NotePosition{
			Column: oldColumnID,
			Rank:   2,
			Stack:  uuid.NullUUID{UUID: parentOldID, Valid: true},
		},
	}

	body := buildImportBody("Imported Board", boards.Public, []columns.Column{col}, []notes.Note{parent, child})
	req := technical_helper.NewTestRequestBuilder("POST", "/import", marshalImportBody(t, body))
	req.AddToContext(identifiers.UserIdentifier, owner)

	boardMock.EXPECT().Create(mock.Anything, matchImportCreateRequest(owner, body)).Return(newBoard, nil)
	columnMock.EXPECT().GetAll(mock.Anything, newBoard.ID).Return([]*columns.Column{{ID: newColumnID, Name: "Imported"}}, nil)
	// NOTE: importBoard iterates a map[uuid.UUID]notes.Note internally, so only one parent is safe here.
	// Tests with multiple parents would be order-dependent and should not be added without a deterministic sort.
	noteMock.EXPECT().Import(mock.Anything, notes.NoteImportRequest{
		Text: "Parent",
		Position: notes.NotePosition{
			Column: newColumnID,
			Stack:  uuid.NullUUID{},
			Rank:   0, // handler always uses rank 0 for imported parents
		},
		Board: newBoard.ID,
		User:  authorID,
	}).Return(parentImported, nil)
	noteMock.EXPECT().Import(mock.Anything, notes.NoteImportRequest{
		Text:  "Child",
		Board: newBoard.ID,
		User:  authorID,
		Position: notes.NotePosition{
			Column: newColumnID,
			Rank:   2,
			Stack:  uuid.NullUUID{UUID: parentImported.ID, Valid: true},
		},
	}).Return(&notes.Note{}, nil)

	rr := httptest.NewRecorder()
	s.importBoard(rr, req.Request())

	require.Equal(t, http.StatusCreated, rr.Code)
}

func TestImportBoardFailsWhenChildImportFails(t *testing.T) {
	s := &Server{}
	boardMock := boards.NewMockBoardService(t)
	columnMock := columns.NewMockColumnService(t)
	noteMock := notes.NewMockNotesService(t)
	s.boards = boardMock
	s.columns = columnMock
	s.notes = noteMock

	owner := uuid.New()
	newBoard := &boards.Board{ID: uuid.New()}
	oldColumnID := uuid.New()
	newColumnID := uuid.New()
	authorID := uuid.New()

	parentOldID := uuid.New()
	parentImported := &notes.Note{
		ID:     uuid.New(),
		Author: authorID,
		Text:   "Parent",
		Position: notes.NotePosition{
			Column: newColumnID,
			Rank:   0,
			Stack:  uuid.NullUUID{},
		},
	}

	parent := notes.Note{
		ID:     parentOldID,
		Author: authorID,
		Text:   "Parent",
		Position: notes.NotePosition{
			Column: oldColumnID,
			Rank:   0,
			Stack:  uuid.NullUUID{},
		},
	}
	child := notes.Note{
		ID:     uuid.New(),
		Author: authorID,
		Text:   "Child",
		Position: notes.NotePosition{
			Column: oldColumnID,
			Rank:   1,
			Stack:  uuid.NullUUID{UUID: parentOldID, Valid: true},
		},
	}
	col := columns.Column{ID: oldColumnID, Name: "Col", Color: common.ColorBacklogBlue, Visible: true, Index: 0}
	body := buildImportBody("Imported Board", boards.Public, []columns.Column{col}, []notes.Note{parent, child})

	req := technical_helper.NewTestRequestBuilder("POST", "/import", marshalImportBody(t, body))
	req.AddToContext(identifiers.UserIdentifier, owner)

	boardMock.EXPECT().Create(mock.Anything, matchImportCreateRequest(owner, body)).Return(newBoard, nil)
	columnMock.EXPECT().GetAll(mock.Anything, newBoard.ID).Return([]*columns.Column{{ID: newColumnID}}, nil)
	noteMock.EXPECT().Import(mock.Anything, notes.NoteImportRequest{
		Text: "Parent",
		Position: notes.NotePosition{
			Column: newColumnID,
			Stack:  uuid.NullUUID{},
			Rank:   0,
		},
		Board: newBoard.ID,
		User:  authorID,
	}).Return(parentImported, nil)
	noteMock.EXPECT().Import(mock.Anything, notes.NoteImportRequest{
		Text:  "Child",
		Board: newBoard.ID,
		User:  authorID,
		Position: notes.NotePosition{
			Column: newColumnID,
			Rank:   1,
			Stack:  uuid.NullUUID{UUID: parentImported.ID, Valid: true},
		},
	}).Return(nil, errors.New("child import failed"))
	boardMock.EXPECT().Delete(mock.Anything, newBoard.ID).Return(nil)

	rr := httptest.NewRecorder()
	s.importBoard(rr, req.Request())

	require.Equal(t, http.StatusInternalServerError, rr.Code)
}

func TestJoinBoardSessionExistsError(t *testing.T) {
	s := &Server{}
	sessionMock := sessions.NewMockSessionService(t)
	s.sessions = sessionMock

	boardID := uuid.New()
	userID := uuid.New()
	req := newJoinBoardRequest(boardID.String(), nil, userID)

	sessionMock.EXPECT().Exists(mock.Anything, boardID, userID).Return(false, errors.New("failed to check session"))

	rr := httptest.NewRecorder()
	s.joinBoard(rr, req)

	require.Equal(t, http.StatusInternalServerError, rr.Code)
}

func TestJoinBoardBoardLookupError(t *testing.T) {
	s := &Server{}
	boardMock := boards.NewMockBoardService(t)
	sessionMock := sessions.NewMockSessionService(t)
	s.boards = boardMock
	s.sessions = sessionMock

	boardID := uuid.New()
	userID := uuid.New()
	req := newJoinBoardRequest(boardID.String(), nil, userID)

	sessionMock.EXPECT().Exists(mock.Anything, boardID, userID).Return(false, nil)
	boardMock.EXPECT().Get(mock.Anything, boardID).Return(nil, errors.New("db connection failed"))

	rr := httptest.NewRecorder()
	s.joinBoard(rr, req)

	require.Equal(t, http.StatusInternalServerError, rr.Code)
}

func TestJoinBoardBoardNotFound(t *testing.T) {
	s := &Server{}
	boardMock := boards.NewMockBoardService(t)
	sessionMock := sessions.NewMockSessionService(t)
	s.boards = boardMock
	s.sessions = sessionMock

	boardID := uuid.New()
	userID := uuid.New()
	req := newJoinBoardRequest(boardID.String(), nil, userID)

	sessionMock.EXPECT().Exists(mock.Anything, boardID, userID).Return(false, nil)
	boardMock.EXPECT().Get(mock.Anything, boardID).Return(nil, sql.ErrNoRows)

	rr := httptest.NewRecorder()
	s.joinBoard(rr, req)

	require.Equal(t, http.StatusNotFound, rr.Code)
}

func TestJoinBoardByPassphraseMissingPassphrase(t *testing.T) {
	s := &Server{}
	boardMock := boards.NewMockBoardService(t)
	sessionMock := sessions.NewMockSessionService(t)
	s.boards = boardMock
	s.sessions = sessionMock

	salt := "salt"
	passphrase := hash.NewHashSha512().HashBySalt("secret", salt)

	boardID := uuid.New()
	userID := uuid.New()
	req := newJoinBoardRequest(boardID.String(), strings.NewReader(`{}`), userID)

	sessionMock.EXPECT().Exists(mock.Anything, boardID, userID).Return(false, nil)
	boardMock.EXPECT().Get(mock.Anything, boardID).Return(testBoard(boards.ByPassphrase, &passphrase, &salt), nil)

	rr := httptest.NewRecorder()
	s.joinBoard(rr, req)

	require.Equal(t, http.StatusBadRequest, rr.Code)
}

func TestJoinBoardUnknownAccessPolicyReturnsBadRequest(t *testing.T) {
	s := &Server{}
	boardMock := boards.NewMockBoardService(t)
	sessionMock := sessions.NewMockSessionService(t)
	s.boards = boardMock
	s.sessions = sessionMock

	boardID := uuid.New()
	userID := uuid.New()
	req := newJoinBoardRequest(boardID.String(), nil, userID)

	sessionMock.EXPECT().Exists(mock.Anything, boardID, userID).Return(false, nil)
	boardMock.EXPECT().Get(mock.Anything, boardID).Return(testBoard(boards.AccessPolicy("UNKNOWN"), nil, nil), nil)

	rr := httptest.NewRecorder()
	s.joinBoard(rr, req)

	require.Equal(t, http.StatusBadRequest, rr.Code)
}

func TestExportBoardFullBoardError(t *testing.T) {
	s := &Server{}
	boardMock := boards.NewMockBoardService(t)
	s.boards = boardMock

	boardID := uuid.New()
	req := technical_helper.NewTestRequestBuilder("GET", "/export", nil)
	req.AddToContext(identifiers.BoardIdentifier, boardID)

	boardMock.EXPECT().FullBoard(mock.Anything, boardID).Return(nil, errors.New("full board failed"))

	rr := httptest.NewRecorder()
	s.exportBoard(rr, req.Request())

	require.Equal(t, http.StatusInternalServerError, rr.Code)
}

func TestExportBoardCSVWriteError(t *testing.T) {
	s := &Server{}
	boardMock := boards.NewMockBoardService(t)
	s.boards = boardMock

	boardID := uuid.New()
	fullBoard := &boards.FullBoard{
		Board: testBoard(boards.Public, nil, nil),
		Columns: []*columns.Column{
			{ID: uuid.New(), Name: "Visible", Visible: true},
		},
		Notes: []*notes.Note{},
	}

	req := technical_helper.NewTestRequestBuilder("GET", "/export", nil)
	req.Req.Header.Set("Accept", "text/csv")
	req.AddToContext(identifiers.BoardIdentifier, boardID)

	boardMock.EXPECT().FullBoard(mock.Anything, boardID).Return(fullBoard, nil)

	failingWriter := &failingResponseWriter{}
	s.exportBoard(failingWriter, req.Request())

	require.Equal(t, http.StatusInternalServerError, failingWriter.status)
}

func TestImportBoardDecodeError(t *testing.T) {
	s := &Server{}
	boardMock := boards.NewMockBoardService(t)
	s.boards = boardMock

	owner := uuid.New()
	req := technical_helper.NewTestRequestBuilder("POST", "/import", strings.NewReader("{"))
	req.AddToContext(identifiers.UserIdentifier, owner)

	rr := httptest.NewRecorder()
	s.importBoard(rr, req.Request())

	require.Equal(t, http.StatusBadRequest, rr.Code)
	boardMock.AssertNotCalled(t, "Create", mock.Anything, mock.Anything)
}

func TestImportBoardFailsWhenParentImportFails(t *testing.T) {
	s := &Server{}
	boardMock := boards.NewMockBoardService(t)
	columnMock := columns.NewMockColumnService(t)
	noteMock := notes.NewMockNotesService(t)
	s.boards = boardMock
	s.columns = columnMock
	s.notes = noteMock

	owner := uuid.New()
	newBoard := &boards.Board{ID: uuid.New()}
	oldColumnID := uuid.New()
	newColumnID := uuid.New()
	authorID := uuid.New()

	parent := notes.Note{
		ID:     uuid.New(),
		Author: authorID,
		Text:   "Parent",
		Position: notes.NotePosition{
			Column: oldColumnID,
			Rank:   0,
			Stack:  uuid.NullUUID{},
		},
	}
	col := columns.Column{ID: oldColumnID, Name: "Col", Color: common.ColorBacklogBlue, Visible: true, Index: 0}
	body := buildImportBody("Imported Board", boards.Public, []columns.Column{col}, []notes.Note{parent})

	req := technical_helper.NewTestRequestBuilder("POST", "/import", marshalImportBody(t, body))
	req.AddToContext(identifiers.UserIdentifier, owner)

	boardMock.EXPECT().Create(mock.Anything, matchImportCreateRequest(owner, body)).Return(newBoard, nil)
	columnMock.EXPECT().GetAll(mock.Anything, newBoard.ID).Return([]*columns.Column{{ID: newColumnID}}, nil)
	noteMock.EXPECT().Import(mock.Anything, notes.NoteImportRequest{
		Text: "Parent",
		Position: notes.NotePosition{
			Column: newColumnID,
			Stack:  uuid.NullUUID{},
			Rank:   0,
		},
		Board: newBoard.ID,
		User:  authorID,
	}).Return(nil, errors.New("parent import failed"))
	boardMock.EXPECT().Delete(mock.Anything, newBoard.ID).Return(nil)

	rr := httptest.NewRecorder()
	s.importBoard(rr, req.Request())

	require.Equal(t, http.StatusInternalServerError, rr.Code)
}
