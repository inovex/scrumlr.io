package notes

import (
	"context"

	"scrumlr.io/server/identifiers"
	"scrumlr.io/server/realtime"

	"database/sql"
	"errors"
	"net/http"
	"testing"

	"scrumlr.io/server/common"
	"scrumlr.io/server/common/dto"
	"scrumlr.io/server/common/filter"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/suite"
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

func (m *DBMock) GetVotes(f filter.VoteFilter) ([]database.Vote, error) {
	args := m.Called(f)
	return args.Get(0).([]database.Vote), args.Error(1)
}

func TestNoteServiceTestSuite(t *testing.T) {
	suite.Run(t, new(NoteServiceTestSuite))
}

func (suite *NoteServiceTestSuite) TestCreate() {
	s := new(NoteService)
	mock := new(DBMock)
	s.database = mock

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
		Data: []dto.Note{},
	}

	mock.On("CreateNote", database.NoteInsert{
		Author: authorID,
		Board:  boardID,
		Column: colID,
		Text:   txt,
	}).Return(database.Note{}, nil)
	mock.On("GetNotes", boardID).Return([]database.Note{}, nil)

	clientMock.On("Publish", publishSubject, publishEvent).Return(nil)

	_, err := s.Create(context.Background(), dto.NoteCreateRequest{
		User:   authorID,
		Board:  boardID,
		Column: colID,
		Text:   txt,
	})
	assert.NoError(suite.T(), err)
	mock.AssertExpectations(suite.T())
	clientMock.AssertExpectations(suite.T())

}

func (suite *NoteServiceTestSuite) TestGetNote() {
	s := new(NoteService)
	mock := new(DBMock)
	s.database = mock

	noteID, _ := uuid.NewRandom()

	mock.On("GetNote", noteID).Return(database.Note{
		ID: noteID,
	}, nil)

	_, err := s.Get(context.Background(), noteID)

	assert.NoError(suite.T(), err)
	mock.AssertExpectations(suite.T())
}

func (suite *NoteServiceTestSuite) TestGetNotes() {
	s := new(NoteService)
	mock := new(DBMock)
	s.database = mock

	boardID, _ := uuid.NewRandom()

	mock.On("GetNotes", boardID).Return([]database.Note{}, nil)

	_, err := s.List(context.Background(), boardID)

	assert.NoError(suite.T(), err)
	mock.AssertExpectations(suite.T())
}

func (suite *NoteServiceTestSuite) TestUpdateNote() {
	s := new(NoteService)
	mock := new(DBMock)
	s.database = mock
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
	// Mocks for realtime
	publishSubject := "board." + boardID.String()
	publishEvent := realtime.BoardEvent{
		Type: realtime.BoardEventNotesUpdated,
		Data: []dto.Note{},
	}
	clientMock.On("Publish", publishSubject, publishEvent).Return(nil)
	// Mock for the updatedNotes call, which internally calls GetNotes
	mock.On("GetNotes", boardID).Return([]database.Note{}, nil)

	ctx := context.Background()
	ctx = context.WithValue(ctx, identifiers.UserIdentifier, callerID)
	mock.On("UpdateNote", callerID, database.NoteUpdate{
		ID:       noteID,
		Board:    boardID,
		Text:     &txt,
		Position: &posUpdate,
	}).Return(database.Note{}, nil)

	_, err := s.Update(ctx, dto.NoteUpdateRequest{
		Text:     &txt,
		ID:       noteID,
		Board:    boardID,
		Position: &pos,
	})
	assert.NoError(suite.T(), err)
	mock.AssertExpectations(suite.T())
}

func (suite *NoteServiceTestSuite) TestDeleteNote() {
	s := new(NoteService)
	mock := new(DBMock)
	s.database = mock

	clientMock := &mockRtClient{}
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
	voteFilter := filter.VoteFilter{
		User:  &callerID,
		Board: boardID,
		Note:  &noteID,
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
	publishEventVotesUpdated := realtime.BoardEvent{
		Type: realtime.BoardEventVotesUpdated,
		Data: []*dto.Vote{},
	}
	clientMock.On("Publish", publishSubject, publishEventNoteDeleted).Return(nil)
	clientMock.On("Publish", publishSubject, publishEventVotesUpdated).Return(nil)

	ctx := context.Background()
	ctx = context.WithValue(ctx, identifiers.UserIdentifier, callerID)
	ctx = context.WithValue(ctx, identifiers.BoardIdentifier, boardID)
	ctx = context.WithValue(ctx, identifiers.NoteIdentifier, noteID)

	mock.On("GetVotes", voteFilter).Return([]database.Vote{}, nil)
	mock.On("DeleteNote", callerID, boardID, noteID, deleteStack).Return(nil)

	err := s.Delete(ctx, body, noteID)
	assert.NoError(suite.T(), err)
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
