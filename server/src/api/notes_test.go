package api

import (
	"context"
	"errors"
	"fmt"
	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/suite"
	"net/http"
	"net/http/httptest"
	"scrumlr.io/server/common"
	"scrumlr.io/server/common/dto"
	"scrumlr.io/server/common/filter"
	"scrumlr.io/server/identifiers"
	"scrumlr.io/server/services"
	"strings"
	"testing"
)

type NotesMock struct {
	services.Notes
	mock.Mock
}

func (m *NotesMock) Create(ctx context.Context, req dto.NoteCreateRequest) (*dto.Note, error) {
	args := m.Called(req)
	return args.Get(0).(*dto.Note), args.Error(1)
}
func (m *NotesMock) Get(ctx context.Context, id uuid.UUID) (*dto.Note, error) {
	args := m.Called(id)
	return args.Get(0).(*dto.Note), args.Error(1)
}
func (m *NotesMock) Delete(ctx context.Context, req dto.NoteDeleteRequest, id uuid.UUID) error {
	args := m.Called(id)
	return args.Error(0)

}

type BoardsMock struct {
	services.Boards
	mock.Mock
}

type SessionsMock struct {
	mock.Mock
}

func (m *SessionsMock) SessionExists(ctx context.Context, boardID, userID uuid.UUID) (bool, error) {
	args := m.Called(boardID, userID)
	return args.Bool(0), args.Error(1)
}

func (m *SessionsMock) ParticipantBanned(ctx context.Context, boardID, userID uuid.UUID) (bool, error) {
	args := m.Called(boardID, userID)
	return args.Bool(0), args.Error(1)
}

func (m *SessionsMock) Connect(ctx context.Context, boardID, userID uuid.UUID) error {
	args := m.Called(boardID, userID)
	return args.Error(0)
}

func (m *SessionsMock) Create(ctx context.Context, boardID, userID uuid.UUID) (*dto.BoardSession, error) {
	args := m.Called(boardID, userID)
	return args.Get(0).(*dto.BoardSession), args.Error(1)
}

// Add other missing methods here
func (m *SessionsMock) Get(ctx context.Context, boardID, userID uuid.UUID) (*dto.BoardSession, error) {
	args := m.Called(boardID, userID)
	return args.Get(0).(*dto.BoardSession), args.Error(1)
}

func (m *SessionsMock) Update(ctx context.Context, body dto.BoardSessionUpdateRequest) (*dto.BoardSession, error) {
	args := m.Called(body)
	return args.Get(0).(*dto.BoardSession), args.Error(1)
}

func (m *SessionsMock) UpdateAll(ctx context.Context, body dto.BoardSessionsUpdateRequest) ([]*dto.BoardSession, error) {
	args := m.Called(body)
	return args.Get(0).([]*dto.BoardSession), args.Error(1)
}

func (m *SessionsMock) List(ctx context.Context, boardID uuid.UUID, f filter.BoardSessionFilter) ([]*dto.BoardSession, error) {
	args := m.Called(boardID, f)
	return args.Get(0).([]*dto.BoardSession), args.Error(1)
}

func (m *SessionsMock) Disconnect(ctx context.Context, boardID, userID uuid.UUID) error {
	args := m.Called(boardID, userID)
	return args.Error(0)
}

func (m *SessionsMock) GetSessionRequest(ctx context.Context, boardID, userID uuid.UUID) (*dto.BoardSessionRequest, error) {
	args := m.Called(boardID, userID)
	return args.Get(0).(*dto.BoardSessionRequest), args.Error(1)
}

func (m *SessionsMock) CreateSessionRequest(ctx context.Context, boardID, userID uuid.UUID) (*dto.BoardSessionRequest, error) {
	args := m.Called(boardID, userID)
	return args.Get(0).(*dto.BoardSessionRequest), args.Error(1)
}

func (m *SessionsMock) ListSessionRequest(ctx context.Context, boardID uuid.UUID, statusQuery string) ([]*dto.BoardSessionRequest, error) {
	args := m.Called(boardID, statusQuery)
	return args.Get(0).([]*dto.BoardSessionRequest), args.Error(1)
}

func (m *SessionsMock) UpdateSessionRequest(ctx context.Context, body dto.BoardSessionRequestUpdate) (*dto.BoardSessionRequest, error) {
	args := m.Called(body)
	return args.Get(0).(*dto.BoardSessionRequest), args.Error(1)
}

func (m *SessionsMock) ModeratorSessionExists(ctx context.Context, boardID, userID uuid.UUID) (bool, error) {
	args := m.Called(boardID, userID)
	return args.Bool(0), args.Error(1)
}

func (m *SessionsMock) SessionRequestExists(ctx context.Context, boardID, userID uuid.UUID) (bool, error) {
	args := m.Called(boardID, userID)
	return args.Bool(0), args.Error(1)
}

func (m *BoardsMock) Get(ctx context.Context, id uuid.UUID) (*dto.Board, error) {
	args := m.Called(id)
	return args.Get(0).(*dto.Board), args.Error(1)
}

type NotesTestSuite struct {
	suite.Suite
}

func TestNotesTestSuite(t *testing.T) {
	suite.Run(t, new(NotesTestSuite))
}

func (suite *NotesTestSuite) TestCreateNote() {

	tests := []struct {
		name         string
		expectedCode int
		err          error
	}{
		{
			name:         "all ok",
			expectedCode: http.StatusCreated,
		},
		{
			name:         "api err",
			expectedCode: http.StatusConflict,
			err: &common.APIError{
				Err:        errors.New("test"),
				StatusCode: http.StatusConflict,
				StatusText: "no",
				ErrorText:  "way",
			},
		},
		{
			name:         "unexpected err",
			expectedCode: http.StatusInternalServerError,
			err:          errors.New("oops"),
		},
	}
	for _, tt := range tests {
		suite.Run(tt.name, func() {
			s := new(Server)
			mock := new(NotesMock)
			testText := "asdf"

			boardId, _ := uuid.NewRandom()
			userId, _ := uuid.NewRandom()
			colId, _ := uuid.NewRandom()

			mock.On("Create", dto.NoteCreateRequest{
				Board:  boardId,
				User:   userId,
				Text:   testText,
				Column: colId,
			}).Return(&dto.Note{
				Text: testText,
			}, tt.err)

			s.notes = mock

			req := NewTestRequestBuilder("POST", "/", strings.NewReader(fmt.Sprintf(`{
				"column": "%s",
				"text" : "%s"
				}`, colId.String(), testText))).
				AddToContext(identifiers.BoardIdentifier, boardId).
				AddToContext(identifiers.UserIdentifier, userId)
			rr := httptest.NewRecorder()

			s.createNote(rr, req.Request())
			suite.Equal(tt.expectedCode, rr.Result().StatusCode)
			mock.AssertExpectations(suite.T())
		})
	}

}
func (suite *NotesTestSuite) TestGetNote() {

	tests := []struct {
		name         string
		expectedCode int
		err          error
	}{
		{
			name:         "all ok",
			expectedCode: http.StatusOK,
		},
		{
			name:         "api err",
			expectedCode: http.StatusConflict,
			err: &common.APIError{
				Err:        errors.New("foo"),
				StatusCode: http.StatusConflict,
				StatusText: "no",
				ErrorText:  "way",
			},
		},
		{
			name:         "unexpected err",
			expectedCode: http.StatusInternalServerError,
			err:          errors.New("oops"),
		},
	}
	for _, tt := range tests {
		suite.Run(tt.name, func() {
			s := new(Server)
			mock := new(NotesMock)
			s.notes = mock

			noteID, _ := uuid.NewRandom()

			mock.On("Get", noteID).Return(&dto.Note{
				ID: noteID,
			}, tt.err)

			req := NewTestRequestBuilder("GET", "/", nil).
				AddToContext(identifiers.NoteIdentifier, noteID)

			rr := httptest.NewRecorder()

			s.getNote(rr, req.Request())
			suite.Equal(tt.expectedCode, rr.Result().StatusCode)
			mock.AssertExpectations(suite.T())
		})
	}
}
func (suite *NotesTestSuite) TestDeleteNote() {
	tests := []struct {
		name         string
		expectedCode int
		err          error
		allowEditing bool
	}{
		{
			name:         "Delete Note when board is unlocked",
			expectedCode: http.StatusNoContent,
			allowEditing: true,
		},
		{
			name:         "Delete Note when board is locked",
			expectedCode: http.StatusBadRequest,
			err: &common.APIError{
				Err:        errors.New("not allowed to edit a locked board"),
				StatusCode: http.StatusBadRequest,
				StatusText: "Bad request",
				ErrorText:  "something",
			},
			allowEditing: false,
		},
	}
	for _, tt := range tests {
		suite.Run(tt.name, func() {
			s := new(Server)
			noteMock := new(NotesMock)
			s.notes = noteMock
			boardMock := new(BoardsMock)
			s.boards = boardMock
			sessionMock := new(SessionsMock)
			s.sessions = sessionMock

			boardID, _ := uuid.NewRandom()
			userID, _ := uuid.NewRandom()
			noteID, _ := uuid.NewRandom()
			r := chi.NewRouter()
			s.initNoteResources(r)
			boardMock.On("Get", boardID).Return(&dto.Board{
				ID:           boardID,
				AllowEditing: tt.allowEditing,
			}, nil)

			// Mock the SessionExists method
			sessionMock.On("SessionExists", boardID, userID).Return(true, nil)

			// Mock the ModeratorSessionExists method
			sessionMock.On("ModeratorSessionExists", boardID, userID).Return(true, nil)

			// Mock the ParticipantBanned method
			sessionMock.On("ParticipantBanned", boardID, userID).Return(false, nil)

			if tt.allowEditing {
				noteMock.On("Delete", mock.Anything).Return(nil)
			} else {
				boardMock.On("Get", boardID).Return(&dto.Board{
					ID:           boardID,
					AllowEditing: tt.allowEditing,
				}, tt.err)
				noteMock.On("Delete", mock.Anything).Return(tt.err)
			}

			req := NewTestRequestBuilder("DELETE", fmt.Sprintf("/notes/%s", noteID.String()), strings.NewReader(`{"deleteStack": false}`))
			rctx := chi.NewRouteContext()
			rctx.URLParams.Add("id", boardID.String())
			req.AddToContext(chi.RouteCtxKey, rctx)
			req.AddToContext(identifiers.UserIdentifier, userID)

			rr := httptest.NewRecorder()
			r.ServeHTTP(rr, req.Request())

			suite.Equal(tt.expectedCode, rr.Result().StatusCode)
			noteMock.AssertExpectations(suite.T())
			boardMock.AssertExpectations(suite.T())
			sessionMock.AssertExpectations(suite.T())
		})
	}
}
