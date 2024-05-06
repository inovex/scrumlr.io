package notes

import (
	"context"
	"database/sql"
	"errors"
	"net/http"
	"scrumlr.io/server/identifiers"
	"testing"

	"scrumlr.io/server/common"
	"scrumlr.io/server/common/dto"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/suite"
	"scrumlr.io/server/database"
)

type NoteServiceTestSuite struct {
	suite.Suite
}

type DBMock struct {
	DB
	mock.Mock
}

func (m *DBMock) CreateNote(insert database.NoteInsert) (database.Note, error) {
	args := m.Called(insert)
	return args.Get(0).(database.Note), args.Error(1)
}

func (m *DBMock) GetNote(id uuid.UUID) (database.Note, error) {
	args := m.Called(id)
	return args.Get(0).(database.Note), args.Error(1)
}

func (m *DBMock) GetNotes(board uuid.UUID, columns ...uuid.UUID) ([]database.Note, error) {
	args := m.Called(board)
	return args.Get(0).([]database.Note), args.Error(1)
}

func (m *DBMock) UpdateNote(caller uuid.UUID, update database.NoteUpdate) (database.Note, error) {
	args := m.Called(caller, update)
	return args.Get(0).(database.Note), args.Error(1)
}

func (m *DBMock) DeleteNote(caller uuid.UUID, board uuid.UUID, id uuid.UUID, deleteStack bool) error {
	args := m.Called(caller, board, id, deleteStack)
	return args.Error(0)
}

func TestNoteServiceTestSuite(t *testing.T) {
	suite.Run(t, new(NoteServiceTestSuite))
}

func (suite *NoteServiceTestSuite) TestCreate() {
	s := new(NoteService)
	mock := new(DBMock)
	s.database = mock

	authorID, _ := uuid.NewRandom()
	boardID, _ := uuid.NewRandom()
	colID, _ := uuid.NewRandom()
	txt := "aaaaaaaaaaaaaaaaaaaa"

	mock.On("CreateNote", database.NoteInsert{
		Author: authorID,
		Board:  boardID,
		Column: colID,
		Text:   txt,
	}).Return(database.Note{}, nil)

	_, err := s.Create(context.Background(), dto.NoteCreateRequest{
		User:   authorID,
		Board:  boardID,
		Column: colID,
		Text:   txt,
	})

	assert.Nil(suite.T(), err)
	mock.AssertExpectations(suite.T())

}

func (suite *NoteServiceTestSuite) TestGetNote() {
	s := new(NoteService)
	mock := new(DBMock)
	s.database = mock

	noteID, _ := uuid.NewRandom()

	mock.On("GetNote", noteID).Return(database.Note{
		ID: noteID,
	}, nil)

	get, err := s.Get(context.Background(), noteID)
	assert.NotNil(suite.T(), get)
	assert.Nil(suite.T(), err)
	mock.AssertExpectations(suite.T())
}

func (suite *NoteServiceTestSuite) TestGetNotes() {
	s := new(NoteService)
	mock := new(DBMock)
	s.database = mock

	boardID, _ := uuid.NewRandom()

	mock.On("GetNotes", boardID).Return([]database.Note{}, nil)

	get, err := s.List(context.Background(), boardID)
	assert.NotNil(suite.T(), get)
	assert.Nil(suite.T(), err)
	mock.AssertExpectations(suite.T())
}

func (suite *NoteServiceTestSuite) TestUpdateNote() {
	s := new(NoteService)
	mock := new(DBMock)
	s.database = mock

	callerID, _ := uuid.NewRandom()
	noteID, _ := uuid.NewRandom()
	boardID, _ := uuid.NewRandom()
	colID, _ := uuid.NewRandom()
	stackID := uuid.NullUUID{Valid: true, UUID: uuid.New()}
	txt := "Updated text"
	pos := dto.NotePosition{
		Column: colID,
		Rank:   0,
		Stack:  stackID,
	}
	posUpdate := database.NoteUpdatePosition{
		Column: colID,
		Rank:   0,
		Stack:  stackID,
	}
	ctx := context.Background()
	ctx = context.WithValue(ctx, identifiers.UserIdentifier, callerID)

	mock.On("UpdateNote", callerID, database.NoteUpdate{
		ID:       noteID,
		Board:    boardID,
		Text:     &txt,
		Position: &posUpdate,
	}).Return(database.Note{}, nil)

	update, err := s.Update(ctx, dto.NoteUpdateRequest{
		Text:     &txt,
		ID:       noteID,
		Board:    boardID,
		Position: &pos,
	})

	assert.NotNil(suite.T(), update)
	assert.Nil(suite.T(), err)
	mock.AssertExpectations(suite.T())
}

func (suite *NoteServiceTestSuite) TestDeleteNote() {
	s := new(NoteService)
	mock := new(DBMock)
	s.database = mock

	callerID, _ := uuid.NewRandom()
	boardID, _ := uuid.NewRandom()
	noteID, _ := uuid.NewRandom()
	deleteStack := true
	body := dto.NoteDeleteRequest{
		DeleteStack: deleteStack,
	}

	ctx := context.Background()
	ctx = context.WithValue(ctx, identifiers.UserIdentifier, callerID)
	ctx = context.WithValue(ctx, identifiers.BoardIdentifier, boardID)

	mock.On("DeleteNote", callerID, boardID, noteID, deleteStack).Return(nil)

	err := s.Delete(ctx, body, noteID)

	assert.Nil(suite.T(), err)
	mock.AssertExpectations(suite.T())
}

func (suite *NoteServiceTestSuite) TestBadInputOnCreate() {
	s := new(NoteService)
	mock := new(DBMock)
	s.database = mock

	authorID, _ := uuid.NewRandom()
	boardID, _ := uuid.NewRandom()
	colID, _ := uuid.NewRandom()
	txt := "Text of my new note!"

	aDBError := errors.New("no sql connection")
	expectedAPIError := &common.APIError{
		StatusCode: http.StatusInternalServerError,
		StatusText: "Internal server error.",
	}

	mock.On("CreateNote", database.NoteInsert{
		Author: authorID,
		Board:  boardID,
		Column: colID,
		Text:   txt,
	}).Return(database.Note{}, aDBError)

	_, err := s.Create(context.Background(), dto.NoteCreateRequest{
		User:   authorID,
		Board:  boardID,
		Column: colID,
		Text:   txt,
	})

	assert.Error(suite.T(), err)
	assert.Equal(suite.T(), expectedAPIError, err)
}

func (suite *NoteServiceTestSuite) TestNoEntryOnGetNote() {
	s := new(NoteService)
	mock := new(DBMock)
	s.database = mock

	boardID, _ := uuid.NewRandom()
	expectedAPIError := &common.APIError{StatusCode: http.StatusNotFound, StatusText: "Resource not found."}
	mock.On("GetNote", boardID).Return(database.Note{}, sql.ErrNoRows)

	_, err := s.Get(context.Background(), boardID)

	assert.Error(suite.T(), err)
	assert.Equal(suite.T(), expectedAPIError, err)
}
