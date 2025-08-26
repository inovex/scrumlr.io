package notes

import (
	"context"

	"scrumlr.io/server/common/filter"
	"scrumlr.io/server/logger"
	"scrumlr.io/server/realtime"
	"scrumlr.io/server/votings"

	"database/sql"
	"errors"
	"net/http"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	mock "github.com/stretchr/testify/mock"
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
	authorID := uuid.New()
	boardID := uuid.New()
	colID := uuid.New()
	noteID := uuid.New()
	txt := "aaaaaaaaaaaaaaaaaaaa"
	publishSubject := "board." + boardID.String()
	publishEvent := realtime.BoardEvent{
		Type: realtime.BoardEventNotesUpdated,
		Data: []Note{},
	}

	mockDB := NewMockNotesDatabase(suite.T())
	mockDB.EXPECT().CreateNote(mock.Anything, DatabaseNoteInsert{
		Author: authorID,
		Board:  boardID,
		Column: colID,
		Text:   txt,
	}).Return(DatabaseNote{ID: noteID, Author: authorID, Board: boardID, Column: colID, Text: txt, Stack: uuid.NullUUID{}, Rank: 0, Edited: false}, nil)
	mockDB.EXPECT().GetAll(mock.Anything, boardID).Return([]DatabaseNote{}, nil)

	mockBroker := realtime.NewMockClient(suite.T())
	mockBroker.EXPECT().Publish(publishSubject, publishEvent).Return(nil)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockVotingService := votings.NewMockVotingService(suite.T())

	service := NewNotesService(mockDB, broker, mockVotingService)

	createdNote, err := service.Create(context.Background(), NoteCreateRequest{
		User:   authorID,
		Board:  boardID,
		Column: colID,
		Text:   txt,
	})

	assert.NoError(suite.T(), err)

	// Construct the expected Note output from the returned DatabaseNote
	expectedNote := &Note{
		ID:     noteID,
		Author: authorID,
		Text:   txt,
		Edited: false,
		Position: NotePosition{
			Column: colID,
			Stack:  uuid.NullUUID{},
			Rank:   0,
		},
	}

	assert.NoError(suite.T(), err)
	assert.Equal(suite.T(), expectedNote, createdNote)

	mockDB.AssertExpectations(suite.T())
	mockBroker.AssertExpectations(suite.T())
}

func (suite *NoteServiceTestSuite) TestGetNotes() {
	boardID := uuid.New()
	noteID1 := uuid.New()
	noteID2 := uuid.New()
	authorID1 := uuid.New()
	authorID2 := uuid.New()
	columnID1 := uuid.New()
	columnID2 := uuid.New()
	noteDBList := []DatabaseNote{
		{
			ID:     noteID1,
			Author: authorID1,
			Board:  boardID,
			Column: columnID1,
			Text:   "First note",
			Stack:  uuid.NullUUID{},
			Rank:   0,
			Edited: false,
		},
		{
			ID:     noteID2,
			Author: authorID2,
			Board:  boardID,
			Column: columnID2,
			Text:   "Second note",
			Stack:  uuid.NullUUID{},
			Rank:   1,
			Edited: true,
		},
	}

	mockDB := NewMockNotesDatabase(suite.T())
	mockDB.EXPECT().GetAll(mock.Anything, boardID).Return(noteDBList, nil)

	mockBroker := realtime.NewMockClient(suite.T())
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockVotingService := votings.NewMockVotingService(suite.T())

	service := NewNotesService(mockDB, broker, mockVotingService)
	notes, err := service.GetAll(context.Background(), boardID)

	assert.NoError(suite.T(), err)

	expectedNotes := []*Note{
		{
			ID:     noteID1,
			Author: authorID1,
			Text:   "First note",
			Edited: false,
			Position: NotePosition{
				Column: columnID1,
				Stack:  uuid.NullUUID{},
				Rank:   0,
			},
		},
		{
			ID:     noteID2,
			Author: authorID2,
			Text:   "Second note",
			Edited: true,
			Position: NotePosition{
				Column: columnID2,
				Stack:  uuid.NullUUID{},
				Rank:   1,
			},
		},
	}

	assert.Equal(suite.T(), expectedNotes, notes)
	mockDB.AssertExpectations(suite.T())
}

func (suite *NoteServiceTestSuite) TestUpdateNote() {
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

	publishSubject := "board." + boardID.String()
	publishEvent := realtime.BoardEvent{
		Type: realtime.BoardEventNotesUpdated,
		Data: []Note{},
	}

	ctx := logger.InitTestLogger(context.Background())

	mockDB := NewMockNotesDatabase(suite.T())
	mockDB.EXPECT().GetAll(mock.Anything, boardID).Return([]DatabaseNote{}, nil)
	mockDB.EXPECT().UpdateNote(mock.Anything, callerID, DatabaseNoteUpdate{
		ID:       noteID,
		Board:    boardID,
		Text:     &txt,
		Position: &posUpdate,
		Edited:   true,
	}).Return(DatabaseNote{}, nil)

	mockBroker := realtime.NewMockClient(suite.T())
	mockBroker.EXPECT().Publish(publishSubject, publishEvent).Return(nil)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockVotingService := votings.NewMockVotingService(suite.T())

	service := NewNotesService(mockDB, broker, mockVotingService)

	_, err := service.Update(ctx, callerID, NoteUpdateRequest{
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
	callerID := uuid.New()
	boardID := uuid.New()
	noteID := uuid.New()
	firstUserId := uuid.New()
	secondUserId := uuid.New()
	deleteStack := true

	ctx := context.Background()

	mockDB := NewMockNotesDatabase(suite.T())
	mockDB.EXPECT().DeleteNote(mock.Anything, callerID, boardID, noteID, deleteStack).Return(nil)

	mockBroker := realtime.NewMockClient(suite.T())
	mockBroker.EXPECT().Publish(mock.AnythingOfType("string"), mock.Anything).Return(nil)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockVotingService := votings.NewMockVotingService(suite.T())
	mockVotingService.EXPECT().GetVotes(mock.Anything, filter.VoteFilter{Note: &noteID}).
		Return([]*votings.Vote{
			{User: firstUserId, Note: noteID},
			{User: secondUserId, Note: noteID},
		}, nil)
	mockVotingService.EXPECT().RemoveVote(mock.Anything, votings.VoteRequest{Note: noteID, User: firstUserId}).Return(nil)
	mockVotingService.EXPECT().RemoveVote(mock.Anything, votings.VoteRequest{Note: noteID, User: secondUserId}).Return(nil)

	service := NewNotesService(mockDB, broker, mockVotingService)

	err := service.Delete(ctx, callerID, NoteDeleteRequest{ID: noteID, Board: boardID, DeleteStack: deleteStack})

	assert.NoError(suite.T(), err)
	mockDB.AssertExpectations(suite.T())
}

func (suite *NoteServiceTestSuite) TestBadInputOnCreate() {
	authorID := uuid.New()
	boardID := uuid.New()
	colID := uuid.New()
	txt := "Text of my new note!"
	dbError := errors.New("no sql connection")
	expectedAPIError := &common.APIError{
		StatusCode: http.StatusInternalServerError,
		StatusText: "Internal server error.",
	}

	mockDB := NewMockNotesDatabase(suite.T())
	mockDB.EXPECT().CreateNote(mock.Anything, DatabaseNoteInsert{
		Author: authorID,
		Board:  boardID,
		Column: colID,
		Text:   txt,
	}).Return(DatabaseNote{}, dbError)

	mockBroker := realtime.NewMockClient(suite.T())
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockVotingService := votings.NewMockVotingService(suite.T())

	service := NewNotesService(mockDB, broker, mockVotingService)
	_, err := service.Create(context.Background(), NoteCreateRequest{
		User:   authorID,
		Board:  boardID,
		Column: colID,
		Text:   txt,
	})

	assert.Error(suite.T(), err)
	assert.Equal(suite.T(), expectedAPIError, err)
}

func (suite *NoteServiceTestSuite) TestNoEntryOnGetNote() {
	boardID, _ := uuid.NewRandom()
	expectedAPIError := &common.APIError{StatusCode: http.StatusNotFound, StatusText: "Resource not found."}

	mockDB := NewMockNotesDatabase(suite.T())
	mockDB.EXPECT().Get(mock.Anything, boardID).Return(DatabaseNote{}, sql.ErrNoRows)

	mockBroker := realtime.NewMockClient(suite.T())
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockVotingService := votings.NewMockVotingService(suite.T())

	service := NewNotesService(mockDB, broker, mockVotingService)
	_, err := service.Get(context.Background(), boardID)

	assert.Error(suite.T(), err)
	assert.Equal(suite.T(), expectedAPIError, err)
}

func (suite *NoteServiceTestSuite) TestGetStackSuccess() {
	noteID := uuid.New()
	expectedNotes := []DatabaseNote{
		{ID: uuid.New(), Text: "Note 1"},
		{ID: uuid.New(), Text: "Note 2"},
	}

	mockDB := NewMockNotesDatabase(suite.T())
	mockDB.EXPECT().GetStack(mock.Anything, noteID).Return(expectedNotes, nil)

	mockBroker := realtime.NewMockClient(suite.T())
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockVotingService := votings.NewMockVotingService(suite.T())

	service := NewNotesService(mockDB, broker, mockVotingService)
	result, err := service.GetStack(context.Background(), noteID)

	assert.NoError(suite.T(), err)
	assert.NotNil(suite.T(), result)
	assert.Len(suite.T(), result, len(expectedNotes))
	mockDB.AssertExpectations(suite.T())
}

func (suite *NoteServiceTestSuite) TestGetStackError() {
	noteID := uuid.New()
	dbError := errors.New("database failure")

	mockDB := NewMockNotesDatabase(suite.T())
	mockDB.EXPECT().GetStack(mock.Anything, noteID).Return(nil, dbError)

	mockBroker := realtime.NewMockClient(suite.T())
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockVotingService := votings.NewMockVotingService(suite.T())

	service := NewNotesService(mockDB, broker, mockVotingService)
	result, err := service.GetStack(context.Background(), noteID)

	assert.Error(suite.T(), err)
	assert.Nil(suite.T(), result)
	assert.Equal(suite.T(), dbError, err)
	mockDB.AssertExpectations(suite.T())
}
