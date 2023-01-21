package api

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"net/http/httptest"
	"scrumlr.io/server/internal/common"
	"scrumlr.io/server/internal/common/dto"
	"scrumlr.io/server/internal/services"
	"strings"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/suite"
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
				AddToContext("Board", boardId).
				AddToContext("User", userId)
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
				AddToContext("Note", noteID)

			rr := httptest.NewRecorder()

			s.getNote(rr, req.Request())
			suite.Equal(tt.expectedCode, rr.Result().StatusCode)
			mock.AssertExpectations(suite.T())
		})
	}

}
