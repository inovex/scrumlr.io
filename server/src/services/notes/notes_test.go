package notes

import (
	"context"
	"testing"

	"scrumlr.io/server/common/dto"

	"github.com/google/uuid"
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

	s.Create(context.Background(), dto.NoteCreateRequest{
		User:   authorID,
		Board:  boardID,
		Column: colID,
		Text:   txt,
	})

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

	s.Get(context.Background(), noteID)

	mock.AssertExpectations(suite.T())
}

func (suite *NoteServiceTestSuite) TestGetNotes() {
	s := new(NoteService)
	mock := new(DBMock)
	s.database = mock

	boardID, _ := uuid.NewRandom()

	mock.On("GetNotes", boardID).Return([]database.Note{}, nil)

	s.List(context.Background(), boardID)

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
	ctx = context.WithValue(ctx, "User", callerID)

	mock.On("UpdateNote", callerID, database.NoteUpdate{
		ID:       noteID,
		Board:    boardID,
		Text:     &txt,
		Position: &posUpdate,
	}).Return(database.Note{}, nil)

	s.Update(ctx, dto.NoteUpdateRequest{
		Text:     &txt,
		ID:       noteID,
		Board:    boardID,
		Position: &pos,
	})

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
	ctx = context.WithValue(ctx, "User", callerID)
	ctx = context.WithValue(ctx, "Board", boardID)

	mock.On("DeleteNote", callerID, boardID, noteID, deleteStack).Return(nil)

	s.Delete(ctx, body, noteID)

	mock.AssertExpectations(suite.T())
}
