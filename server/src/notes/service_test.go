package notes

import (
  "context"
  "scrumlr.io/server/identifiers"
  "scrumlr.io/server/logger"
  "scrumlr.io/server/realtime"

  "database/sql"
  "errors"
  "net/http"
  "testing"

  "github.com/google/uuid"
  "github.com/stretchr/testify/assert"
  "github.com/stretchr/testify/mock"
  "github.com/stretchr/testify/suite"
  "scrumlr.io/server/common"
  "scrumlr.io/server/database"
)

type NoteServiceTestSuite struct {
  suite.Suite
}

type mockRtClient struct {
  mock.Mock
}

func (mc *mockRtClient) Publish(subject string, event interface{}) error {
  args := mc.Called(subject, event)
  return args.Error(0)
}

func (mc *mockRtClient) SubscribeToBoardSessionEvents(subject string) (chan *realtime.BoardSessionRequestEventType, error) {
  args := mc.Called(subject)
  return args.Get(0).(chan *realtime.BoardSessionRequestEventType), args.Error(1)
}

func (mc *mockRtClient) SubscribeToBoardEvents(subject string) (chan *realtime.BoardEvent, error) {
  args := mc.Called(subject)
  return args.Get(0).(chan *realtime.BoardEvent), args.Error(1)
}

func TestNoteServiceTestSuite(t *testing.T) {
  suite.Run(t, new(NoteServiceTestSuite))
}

func (suite *NoteServiceTestSuite) TestCreate() {
  s := new(NoteService)
  mockDB := NewMockNotesDatabase(suite.T())
  s.database = mockDB

  clientMock := &mockRtClient{}
  rtMock := &realtime.Broker{
    Con: clientMock,
  }
  s.realtime = rtMock

  authorID, _ := uuid.NewRandom()
  boardID, _ := uuid.NewRandom()
  colID, _ := uuid.NewRandom()
  txt := "aaaaaaaaaaaaaaaaaaaa"
  publishSubject := "board." + boardID.String()
  publishEvent := realtime.BoardEvent{
    Type: realtime.BoardEventNotesUpdated,
    Data: []Note{},
  }

  mockDB.EXPECT().CreateNote(NoteInsertDB{
    Author: authorID,
    Board:  boardID,
    Column: colID,
    Text:   txt,
  }).Return(NoteDB{}, nil)
  mockDB.EXPECT().GetNotes(boardID).Return([]NoteDB{}, nil)

  clientMock.On("Publish", publishSubject, publishEvent).Return(nil)

  _, err := s.Create(logger.InitTestLogger(context.Background()), NoteCreateRequest{
    User:   authorID,
    Board:  boardID,
    Column: colID,
    Text:   txt,
  })
  assert.NoError(suite.T(), err)
  mockDB.AssertExpectations(suite.T())
  clientMock.AssertExpectations(suite.T())

}

func (suite *NoteServiceTestSuite) TestGetNote() {
  s := new(NoteService)
  mockDB := NewMockNotesDatabase(suite.T())
  s.database = mockDB

  noteID, _ := uuid.NewRandom()

  mockDB.EXPECT().GetNote(noteID).Return(NoteDB{
    ID: noteID,
  }, nil)

  _, err := s.Get(logger.InitTestLogger(context.Background()), noteID)

  assert.NoError(suite.T(), err)
  mockDB.AssertExpectations(suite.T())
}

func (suite *NoteServiceTestSuite) TestGetNotes() {
  s := new(NoteService)
  mockDB := NewMockNotesDatabase(suite.T())
  s.database = mockDB

  boardID, _ := uuid.NewRandom()

  mockDB.EXPECT().GetNotes(boardID).Return([]NoteDB{}, nil)

  _, err := s.List(logger.InitTestLogger(context.Background()), boardID)

  assert.NoError(suite.T(), err)
  mockDB.AssertExpectations(suite.T())
}

func (suite *NoteServiceTestSuite) TestUpdateNote() {
  s := new(NoteService)
  mockDB := NewMockNotesDatabase(suite.T())
  s.database = mockDB

  clientMock := &mockRtClient{}
  rtMock := &realtime.Broker{
    Con: clientMock,
  }
  s.realtime = rtMock

  callerID, _ := uuid.NewRandom()
  noteID, _ := uuid.NewRandom()
  boardID, _ := uuid.NewRandom()
  colID, _ := uuid.NewRandom()
  stackID := uuid.NullUUID{Valid: true, UUID: uuid.New()}
  txt := "Updated text"
  pos := NotePosition{
    Column: colID,
    Rank:   0,
    Stack:  stackID,
  }
  posUpdate := NoteUpdatePosition{
    Column: colID,
    Rank:   0,
    Stack:  stackID,
  }
  // Mocks for realtime
  publishSubject := "board." + boardID.String()
  publishEvent := realtime.BoardEvent{
    Type: realtime.BoardEventNotesUpdated,
    Data: []Note{},
  }
  clientMock.On("Publish", publishSubject, publishEvent).Return(nil)
  // Mock for the updatedNotes call, which internally calls GetNotes
  mockDB.EXPECT().GetNotes(boardID).Return([]NoteDB{}, nil)

  ctx := logger.InitTestLogger(context.Background())

  ctx = context.WithValue(ctx, identifiers.UserIdentifier, callerID)

  mockDB.EXPECT().UpdateNote(callerID, NoteUpdateDB{
    ID:       noteID,
    Board:    boardID,
    Text:     &txt,
    Position: &posUpdate,
    Edited:   true,
  }).Return(NoteDB{}, nil)

  _, err := s.Update(ctx, NoteUpdateRequest{
    Text:     &txt,
    ID:       noteID,
    Board:    boardID,
    Position: &pos,
    Edited:   true,
  })
  assert.NoError(suite.T(), err)
  mockDB.AssertExpectations(suite.T())
}

func (suite *NoteServiceTestSuite) TestDeleteNote() {
  s := new(NoteService)
  mockDB := NewMockNotesDatabase(suite.T())
  s.database = mockDB

  clientMock := &mockRtClient{}
  rtMock := &realtime.Broker{
    Con: clientMock,
  }
  s.realtime = rtMock

  callerID, _ := uuid.NewRandom()
  boardID, _ := uuid.NewRandom()
  noteID, _ := uuid.NewRandom()
  deleteStack := true
  body := NoteDeleteRequest{
    DeleteStack: deleteStack,
  }
  //voteFilter := filter.VoteFilter{
  //	Board: boardID,
  //	Note:  &noteID,
  //}

  // Mocks only for the realtime stuff
  publishSubject := "board." + boardID.String()
  deletedNoteRealTimeUpdate := map[string]interface{}{
    "note":        noteID,
    "deleteStack": deleteStack,
  }
  publishEventNoteDeleted := realtime.BoardEvent{
    Type: realtime.BoardEventNoteDeleted,
    Data: deletedNoteRealTimeUpdate,
  }
  publishEventVotesDeleted := realtime.BoardEvent{
    Type: realtime.BoardEventVotesDeleted,
    Data: []database.Vote{},
  }
  clientMock.On("Publish", publishSubject, publishEventNoteDeleted).Return(nil)
  clientMock.On("Publish", publishSubject, publishEventVotesDeleted).Return(nil)

  ctx := logger.InitTestLogger(context.Background())
  ctx = context.WithValue(ctx, identifiers.UserIdentifier, callerID)
  ctx = context.WithValue(ctx, identifiers.BoardIdentifier, boardID)
  ctx = context.WithValue(ctx, identifiers.NoteIdentifier, noteID)

  //mockDB.EXPECT().GetVotes(voteFilter).Return([]database.Vote{}, nil)
  if deleteStack {
    mockDB.EXPECT().GetChildNotes(noteID).Return([]NoteDB{}, nil)
    //mock.On("GetVotes", voteFilter).Return([]database.Vote{}, nil)
  }
  mockDB.EXPECT().DeleteNote(callerID, boardID, noteID, deleteStack).Return(nil)

  err := s.Delete(ctx, body, noteID)
  assert.NoError(suite.T(), err)
  mockDB.AssertExpectations(suite.T())
}

func (suite *NoteServiceTestSuite) TestBadInputOnCreate() {
  s := new(NoteService)
  mockDB := NewMockNotesDatabase(suite.T())
  s.database = mockDB

  authorID, _ := uuid.NewRandom()
  boardID, _ := uuid.NewRandom()
  colID, _ := uuid.NewRandom()
  txt := "Text of my new note!"

  aDBError := errors.New("no sql connection")
  expectedAPIError := &common.APIError{
    StatusCode: http.StatusInternalServerError,
    StatusText: "Internal server error.",
  }

  mockDB.EXPECT().CreateNote(NoteInsertDB{
    Author: authorID,
    Board:  boardID,
    Column: colID,
    Text:   txt,
  }).Return(NoteDB{}, aDBError)

  _, err := s.Create(logger.InitTestLogger(context.Background()), NoteCreateRequest{
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
  mockDB := NewMockNotesDatabase(suite.T())
  s.database = mockDB

  boardID, _ := uuid.NewRandom()
  expectedAPIError := &common.APIError{StatusCode: http.StatusNotFound, StatusText: "Resource not found."}
  mockDB.EXPECT().GetNote(boardID).Return(NoteDB{}, sql.ErrNoRows)

  _, err := s.Get(logger.InitTestLogger(context.Background()), boardID)

  assert.Error(suite.T(), err)
  assert.Equal(suite.T(), expectedAPIError, err)
}
