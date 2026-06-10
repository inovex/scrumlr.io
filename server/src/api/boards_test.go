package api

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
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
	"github.com/stretchr/testify/suite"
	"scrumlr.io/server/columns"
	"scrumlr.io/server/common"
	"scrumlr.io/server/identifiers"
	"scrumlr.io/server/notes"
	"scrumlr.io/server/sessionrequests"
	"scrumlr.io/server/users"
)

type BoardTestSuite struct {
	suite.Suite
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
			s.basePath = "/"
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

			createdBoard := suite.createBoard(nil, nil, accessPolicy, nil, nil)
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
			}).Return(createdBoard, te.err)

			rr := httptest.NewRecorder()

			s.createBoard(rr, req.Request())

			suite.Equal(te.expectedCode, rr.Result().StatusCode)
			if te.err == nil {
				suite.Equal(fmt.Sprintf("/boards/%s", createdBoard.ID), rr.Result().Header.Get("Location"))
			}
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
			s.basePath = "/"
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
			if te.err == nil {
				switch te.expectedCode {
				case http.StatusSeeOther, http.StatusCreated:
					location := rr.Result().Header.Get("Location")
					suite.True(strings.HasPrefix(location, "/boards/"), "Location header should use configured baseURL, got: %s", location)
					suite.False(strings.Contains(location, "r.Host"), "Location header must not contain r.Host")
				}
			}
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

func (suite *BoardTestSuite) TestProcessImportedNotes_CleansUpCreatedParticipantsOnImportFailure() {
	s := new(Server)
	columnsMock := columns.NewMockColumnService(suite.T())
	notesMock := notes.NewMockNotesService(suite.T())
	usersMock := users.NewMockUserService(suite.T())

	s.columns = columnsMock
	s.notes = notesMock
	s.users = usersMock

	ctx := context.Background()
	boardID := uuid.New()
	importColumnID := uuid.New()
	createdColumnID := uuid.New()
	deletedAuthorID := uuid.New()
	replacementAuthorID := uuid.New()

	body := boards.ImportBoardRequest{
		Columns: []columns.Column{{ID: importColumnID}},
		Notes: []notes.Note{{
			ID:     uuid.New(),
			Author: deletedAuthorID,
			Text:   "Imported note",
			Position: notes.NotePosition{
				Column: importColumnID,
				Stack:  uuid.NullUUID{},
				Rank:   0,
			},
		}},
	}

	columnsMock.EXPECT().GetAll(mock.Anything, boardID).Return([]*columns.Column{{ID: createdColumnID}}, nil)
	usersMock.EXPECT().GetExistingUserIDs(mock.Anything, []uuid.UUID{deletedAuthorID}).Return([]uuid.UUID{}, nil)
	usersMock.EXPECT().CreateAnonymous(mock.Anything, "deleted user "+deletedAuthorID.String()[:5]).Return(&users.User{ID: replacementAuthorID}, nil)
	notesMock.EXPECT().Import(mock.Anything, mock.Anything).Return(nil, errors.New("import failed"))
	usersMock.EXPECT().Delete(mock.Anything, replacementAuthorID).Return(nil)

	err := s.processImportedNotes(ctx, boardID, body)

	suite.Error(err)
}

func (suite *BoardTestSuite) TestReplaceDeletedParticipants_CleansUpOnAnonymousCreationFailure() {
	s := new(Server)
	usersMock := users.NewMockUserService(suite.T())
	s.users = usersMock

	ctx := context.Background()
	firstDeletedAuthorID := uuid.New()
	secondDeletedAuthorID := uuid.New()
	firstReplacementAuthorID := uuid.New()

	body := boards.ImportBoardRequest{
		Notes: []notes.Note{
			{ID: uuid.New(), Author: firstDeletedAuthorID},
			{ID: uuid.New(), Author: secondDeletedAuthorID},
		},
	}

	usersMock.EXPECT().GetExistingUserIDs(mock.Anything, []uuid.UUID{firstDeletedAuthorID, secondDeletedAuthorID}).Return([]uuid.UUID{}, nil)
	usersMock.EXPECT().CreateAnonymous(mock.Anything, "deleted user "+firstDeletedAuthorID.String()[:5]).Return(&users.User{ID: firstReplacementAuthorID}, nil)
	usersMock.EXPECT().CreateAnonymous(mock.Anything, "deleted user "+secondDeletedAuthorID.String()[:5]).Return(nil, errors.New("create failed"))
	usersMock.EXPECT().Delete(mock.Anything, firstReplacementAuthorID).Return(nil)

	_, _, err := s.replaceDeletedParticipants(ctx, body)

	suite.Error(err)
}

type importBoardFixture struct {
	boardName        string
	boardDescription string
	columnName       string
	columnVisible    bool
	columnIndex      int
	columnColor      common.Color

	ownerID         uuid.UUID
	importColumnID  uuid.UUID
	createdBoardID  uuid.UUID
	createdColumnID uuid.UUID
	authorID        uuid.UUID
	importedNoteID  uuid.UUID
}

func newImportBoardFixture() importBoardFixture {
	return importBoardFixture{
		boardName:        "Imported board",
		boardDescription: "Imported board description",
		columnName:       "Start",
		columnVisible:    true,
		columnIndex:      0,
		columnColor:      common.Color("backlog-blue"),
		ownerID:          uuid.New(),
		importColumnID:   uuid.New(),
		createdBoardID:   uuid.New(),
		createdColumnID:  uuid.New(),
		authorID:         uuid.New(),
		importedNoteID:   uuid.New(),
	}
}

func (f importBoardFixture) body(includeNotes bool) (string, error) {
	notesPayload := []map[string]any{}
	if includeNotes {
		notesPayload = append(notesPayload, map[string]any{
			"id":     f.importedNoteID,
			"author": f.authorID,
			"text":   "Imported note",
			"position": map[string]any{
				"column": f.importColumnID,
				"rank":   0,
			},
		})
	}

	payload := map[string]any{
		"board": map[string]any{
			"name":         f.boardName,
			"description":  f.boardDescription,
			"accessPolicy": "PUBLIC",
		},
		"columns": []map[string]any{{
			"id":      f.importColumnID,
			"name":    f.columnName,
			"color":   f.columnColor,
			"visible": f.columnVisible,
			"index":   f.columnIndex,
		}},
		"notes":   notesPayload,
		"votings": []any{},
	}

	raw, err := json.Marshal(payload)
	if err != nil {
		return "", err
	}

	return string(raw), nil
}

func (f importBoardFixture) createRequest() boards.CreateBoardRequest {
	return boards.CreateBoardRequest{
		Name:         &f.boardName,
		Description:  &f.boardDescription,
		AccessPolicy: boards.Public,
		Passphrase:   nil,
		Columns: []columns.ColumnRequest{{
			Name:    f.columnName,
			Color:   f.columnColor,
			Visible: &f.columnVisible,
			Index:   &f.columnIndex,
		}},
		Owner: f.ownerID,
	}
}

func importBoardRequest(ownerID uuid.UUID, body string) *http.Request {
	return technical_helper.NewTestRequestBuilder("POST", "/", strings.NewReader(body)).
		AddToContext(identifiers.UserIdentifier, ownerID).
		Request()
}

func (suite *BoardTestSuite) TestImportBoardSuccess() {
	s := new(Server)

	boardMock := boards.NewMockBoardService(suite.T())
	columnMock := columns.NewMockColumnService(suite.T())
	notesMock := notes.NewMockNotesService(suite.T())
	usersMock := users.NewMockUserService(suite.T())

	s.boards = boardMock
	s.columns = columnMock
	s.notes = notesMock
	s.users = usersMock

	fixture := newImportBoardFixture()
	body, err := fixture.body(true)
	suite.Require().NoError(err)
	req := importBoardRequest(fixture.ownerID, body)

	boardMock.EXPECT().Create(mock.Anything, fixture.createRequest()).Return(&boards.Board{ID: fixture.createdBoardID}, nil)

	columnMock.EXPECT().GetAll(mock.Anything, fixture.createdBoardID).Return([]*columns.Column{{ID: fixture.createdColumnID}}, nil)
	usersMock.EXPECT().GetExistingUserIDs(mock.Anything, []uuid.UUID{fixture.authorID}).Return([]uuid.UUID{fixture.authorID}, nil)
	notesMock.EXPECT().Import(mock.Anything, notes.NoteImportRequest{
		Text:  "Imported note",
		Board: fixture.createdBoardID,
		User:  fixture.authorID,
		Position: notes.NotePosition{
			Column: fixture.createdColumnID,
			Stack:  uuid.NullUUID{},
			Rank:   0,
		},
	}).Return(&notes.Note{ID: uuid.New(), Author: fixture.authorID}, nil)

	rr := httptest.NewRecorder()

	s.importBoard(rr, req)

	suite.Equal(http.StatusCreated, rr.Result().StatusCode)
	boardMock.AssertExpectations(suite.T())
	columnMock.AssertExpectations(suite.T())
	notesMock.AssertExpectations(suite.T())
	usersMock.AssertExpectations(suite.T())
}

func (suite *BoardTestSuite) TestImportBoardFailedDecodingBody() {
	s := new(Server)

	ownerID := uuid.New()
	req := importBoardRequest(ownerID, `{"board":`)

	rr := httptest.NewRecorder()

	s.importBoard(rr, req)

	suite.Equal(http.StatusBadRequest, rr.Result().StatusCode)
}

func (suite *BoardTestSuite) TestImportBoardCreateFailure() {
	s := new(Server)
	boardMock := boards.NewMockBoardService(suite.T())
	s.boards = boardMock

	fixture := newImportBoardFixture()
	body, err := fixture.body(false)
	suite.Require().NoError(err)
	req := importBoardRequest(fixture.ownerID, body)

	boardMock.EXPECT().Create(mock.Anything, fixture.createRequest()).Return(nil, &common.APIError{
		Err:        errors.New("failed to create board"),
		StatusCode: http.StatusInternalServerError,
		StatusText: "failed",
		ErrorText:  "failed to create board",
	})

	rr := httptest.NewRecorder()

	s.importBoard(rr, req)

	suite.Equal(http.StatusInternalServerError, rr.Result().StatusCode)
	boardMock.AssertExpectations(suite.T())
}

func (suite *BoardTestSuite) TestImportBoardProcessImportedNotesFailure() {
	s := new(Server)
	boardMock := boards.NewMockBoardService(suite.T())
	columnMock := columns.NewMockColumnService(suite.T())

	s.boards = boardMock
	s.columns = columnMock

	fixture := newImportBoardFixture()
	body, err := fixture.body(false)
	suite.Require().NoError(err)
	req := importBoardRequest(fixture.ownerID, body)

	boardMock.EXPECT().Create(mock.Anything, fixture.createRequest()).Return(&boards.Board{ID: fixture.createdBoardID}, nil)
	columnMock.EXPECT().GetAll(mock.Anything, fixture.createdBoardID).Return(nil, errors.New("failed to get imported columns"))
	boardMock.EXPECT().Delete(mock.Anything, fixture.createdBoardID).Return(nil)

	rr := httptest.NewRecorder()

	s.importBoard(rr, req)

	suite.Equal(http.StatusInternalServerError, rr.Result().StatusCode)
	boardMock.AssertExpectations(suite.T())
	columnMock.AssertExpectations(suite.T())
}
