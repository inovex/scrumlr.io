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

type MockGoroutineRunner struct {
	RunFunc func(fn func())
}

func (m *MockGoroutineRunner) Run(fn func()) {
	if m.RunFunc != nil {
		m.RunFunc(fn)
	}
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
	mockRunner := &MockGoroutineRunner{}
	s.runner = mockRunner

	authorID, _ := uuid.NewRandom()
	boardID, _ := uuid.NewRandom()
	colID, _ := uuid.NewRandom()
	txt := "aaaaaaaaaaaaaaaaaaaa"

	// Create a flag to indicate whether the goroutine was called
	goroutineCalled := false

	// Set up expectations for the mock GoroutineRunner
	mockRunner.RunFunc = func(fn func()) {
		// Set the flag when the goroutine is called
		goroutineCalled = true
	}

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
	assert.True(suite.T(), goroutineCalled, "The goroutine should have been called.")
	mock.AssertExpectations(suite.T())

}
