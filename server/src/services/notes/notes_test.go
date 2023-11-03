package notes

import (
	"context"
	"testing"

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
	assert.NoError(suite.T(), err, "No error in create function.")
	mock.AssertExpectations(suite.T())

}
