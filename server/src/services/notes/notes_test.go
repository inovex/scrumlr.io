package notes

import (
	"context"
	"testing"

	"scrumlr.io/server/common/dto"
	"scrumlr.io/server/realtime"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/suite"
	"scrumlr.io/server/database"
)

type NoteServiceTestSuite struct {
	suite.Suite
}

type mockClient struct {
	mock.Mock
}

func (mc *mockClient) Publish(subject string, event interface{}) error {
	args := mc.Called(subject, event)
	return args.Error(0)
}

func (mc *mockClient) SubscribeToBoardSessionEvents(subject string) (chan *realtime.BoardSessionRequestEventType, error) {
	args := mc.Called(subject)
	return args.Get(0).(chan *realtime.BoardSessionRequestEventType), args.Error(1)
}

func (mc *mockClient) SubscribeToBoardEvents(subject string) (chan *realtime.BoardEvent, error) {
	args := mc.Called(subject)
	return args.Get(0).(chan *realtime.BoardEvent), args.Error(1)
}

func newBroker(c realtime.Client) *realtime.Broker {
	return &realtime.Broker{Con: c}
}

type DBMock struct {
	DB
	mock.Mock
}

func (m *DBMock) CreateNote(insert database.NoteInsert) (database.Note, error) {
	args := m.Called(insert)
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
	dbMock := new(DBMock)
	s.database = dbMock

	authorID, _ := uuid.NewRandom()
	boardID, _ := uuid.NewRandom()
	colID, _ := uuid.NewRandom()
	txt := "aaaaaaaaaaaaaaaaaaaa"

	dbMock.On("CreateNote", database.NoteInsert{
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
	dbMock.AssertExpectations(suite.T())

}

func (suite *NoteServiceTestSuite) TestDeleteNote() {
	s := new(NoteService)

	dbMock := new(DBMock)
	s.database = dbMock

	clientMock := &mockClient{}
	rtMock := &realtime.Broker{
		Con: clientMock,
	}
	s.realtime = rtMock

	callerID, _ := uuid.NewRandom()
	boardID, _ := uuid.NewRandom()
	noteID, _ := uuid.NewRandom()
	deleteStack := true
	body := dto.NoteDeleteRequest{
		DeleteStack: deleteStack,
	}
	publishSubject := "board." + boardID.String()
	publishEvent := realtime.BoardEvent{
		Type: realtime.BoardEventNoteDeleted,
		Data: map[string]interface{}{
			"deleteStack": deleteStack,
			"note":        noteID,
		},
	}

	ctx := context.Background()
	ctx = context.WithValue(ctx, "User", callerID)
	ctx = context.WithValue(ctx, "Board", boardID)

	dbMock.On("DeleteNote", callerID, boardID, noteID, deleteStack).Return(nil)
	clientMock.On("Publish", publishSubject, publishEvent).Return(nil)

	s.Delete(ctx, body, noteID)

	dbMock.AssertExpectations(suite.T())
	clientMock.AssertExpectations(suite.T())
}
