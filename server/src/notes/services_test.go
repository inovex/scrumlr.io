package notes

import (
  "context"
  "scrumlr.io/server/common/dto"
  "scrumlr.io/server/identifiers"
  "scrumlr.io/server/logger"
  brokerMock "scrumlr.io/server/mocks/realtime"
  "scrumlr.io/server/realtime"

  "database/sql"
  "errors"
  "net/http"
  "testing"

  "github.com/google/uuid"
  "github.com/stretchr/testify/assert"
  "github.com/stretchr/testify/suite"
  "scrumlr.io/server/common"
)

type NoteServiceTestSuite struct {
  suite.Suite
}

func TestNoteServiceTestSuite(t *testing.T) {
  suite.Run(t, new(NoteServiceTestSuite))
}

func (suite *NoteServiceTestSuite) TestCreate() {
  mockDB := NewMockNotesDatabase(suite.T())
  mockBroker := brokerMock.NewMockClient(suite.T())
  broker := new(realtime.Broker)
  broker.Con = mockBroker
  service := NewNotesService(mockDB, broker)

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

  mockBroker.EXPECT().Publish(publishSubject, publishEvent).Return(nil)

  _, err := service.Create(logger.InitTestLogger(context.Background()), NoteCreateRequest{
    User:   authorID,
    Board:  boardID,
    Column: colID,
    Text:   txt,
  })

  assert.NoError(suite.T(), err)
  mockDB.AssertExpectations(suite.T())
  mockBroker.AssertExpectations(suite.T())

}

func (suite *NoteServiceTestSuite) TestGetNote() {
  mockDB := NewMockNotesDatabase(suite.T())
  broker := new(realtime.Broker)
  service := NewNotesService(mockDB, broker)
  noteID, _ := uuid.NewRandom()

  mockDB.EXPECT().GetNote(noteID).Return(NoteDB{
    ID: noteID,
  }, nil)

  _, err := service.Get(logger.InitTestLogger(context.Background()), noteID)

  assert.NoError(suite.T(), err)
  mockDB.AssertExpectations(suite.T())
}

func (suite *NoteServiceTestSuite) TestGetNotes() {
  mockDB := NewMockNotesDatabase(suite.T())
  broker := new(realtime.Broker)
  service := NewNotesService(mockDB, broker)

  boardID, _ := uuid.NewRandom()

  mockDB.EXPECT().GetNotes(boardID).Return([]NoteDB{}, nil)

  _, err := service.List(logger.InitTestLogger(context.Background()), boardID)

  assert.NoError(suite.T(), err)
  mockDB.AssertExpectations(suite.T())
}

func (suite *NoteServiceTestSuite) TestUpdateNote() {
  mockDB := NewMockNotesDatabase(suite.T())
  mockBroker := brokerMock.NewMockClient(suite.T())
  broker := new(realtime.Broker)
  broker.Con = mockBroker
  service := NewNotesService(mockDB, broker)

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
  mockBroker.EXPECT().Publish(publishSubject, publishEvent).Return(nil)

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

  _, err := service.Update(ctx, NoteUpdateRequest{
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
  mockDB := NewMockNotesDatabase(suite.T())
  mockBroker := brokerMock.NewMockClient(suite.T())
  broker := new(realtime.Broker)
  broker.Con = mockBroker
  service := NewNotesService(mockDB, broker)

  callerID, _ := uuid.NewRandom()
  boardID, _ := uuid.NewRandom()
  noteID, _ := uuid.NewRandom()

  votesToDelete := []*dto.Vote{
    {
      Voting: uuid.UUID{},
      Note:   noteID,
      User:   uuid.UUID{},
    },
    {
      Voting: uuid.UUID{},
      Note:   noteID,
      User:   uuid.UUID{},
    },
  }
  deleteStack := true
  body := NoteDeleteRequest{
    DeleteStack: deleteStack,
  }

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
    Data: votesToDelete,
  }
  mockBroker.EXPECT().Publish(publishSubject, publishEventNoteDeleted).Return(nil)
  mockBroker.EXPECT().Publish(publishSubject, publishEventVotesDeleted).Return(nil)

  ctx := logger.InitTestLogger(context.Background())
  ctx = context.WithValue(ctx, identifiers.UserIdentifier, callerID)
  ctx = context.WithValue(ctx, identifiers.BoardIdentifier, boardID)
  ctx = context.WithValue(ctx, identifiers.NoteIdentifier, noteID)

  if deleteStack {
    mockDB.EXPECT().GetStack(noteID).Return([]NoteDB{}, nil)
  }
  mockDB.EXPECT().DeleteNote(callerID, boardID, noteID, deleteStack).Return(nil)

  err := service.Delete(ctx, body, noteID, votesToDelete)
  assert.NoError(suite.T(), err)
  mockDB.AssertExpectations(suite.T())
}

func (suite *NoteServiceTestSuite) TestBadInputOnCreate() {
  mockDB := NewMockNotesDatabase(suite.T())
  broker := new(realtime.Broker)
  service := NewNotesService(mockDB, broker)

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

  _, err := service.Create(logger.InitTestLogger(context.Background()), NoteCreateRequest{
    User:   authorID,
    Board:  boardID,
    Column: colID,
    Text:   txt,
  })

  assert.Error(suite.T(), err)
  assert.Equal(suite.T(), expectedAPIError, err)
}

func (suite *NoteServiceTestSuite) TestNoEntryOnGetNote() {

  mockDB := NewMockNotesDatabase(suite.T())
  broker := new(realtime.Broker)
  service := NewNotesService(mockDB, broker)

  boardID, _ := uuid.NewRandom()
  expectedAPIError := &common.APIError{StatusCode: http.StatusNotFound, StatusText: "Resource not found."}
  mockDB.EXPECT().GetNote(boardID).Return(NoteDB{}, sql.ErrNoRows)

  _, err := service.Get(logger.InitTestLogger(context.Background()), boardID)

  assert.Error(suite.T(), err)
  assert.Equal(suite.T(), expectedAPIError, err)
}

func (suite *NoteServiceTestSuite) TestGetStackSuccess() {

  mockDB := NewMockNotesDatabase(suite.T())
  broker := new(realtime.Broker)

  service := NewNotesService(mockDB, broker)
  ctx := context.Background()
  noteID := uuid.New()

  expectedNotes := []NoteDB{
    {ID: uuid.New(), Text: "Note 1"},
    {ID: uuid.New(), Text: "Note 2"},
  }

  mockDB.EXPECT().GetStack(noteID).Return(expectedNotes, nil)
  result, err := service.GetStack(ctx, noteID)

  assert.NoError(suite.T(), err)
  assert.NotNil(suite.T(), result)
  assert.Len(suite.T(), result, len(expectedNotes))
  mockDB.AssertExpectations(suite.T())
}

func (suite *NoteServiceTestSuite) TestGetStackError(t *testing.T) {

  mockDB := NewMockNotesDatabase(suite.T())
  broker := new(realtime.Broker)

  service := NewNotesService(mockDB, broker)

  ctx := context.Background()
  noteID := uuid.New()

  mockErr := errors.New("database failure")
  mockDB.EXPECT().GetStack(noteID).Return(nil, mockErr)

  result, err := service.GetStack(ctx, noteID)

  assert.Error(t, err)
  assert.Nil(t, result)
  assert.Equal(t, mockErr, err)
  mockDB.AssertExpectations(t)
}
