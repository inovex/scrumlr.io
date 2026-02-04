package notes

import (
	"context"
	"database/sql"
	"errors"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/suite"
	"scrumlr.io/server/common"
	"scrumlr.io/server/realtime"
)

type NoteServiceTestSuite struct {
	suite.Suite
	mockDB                   *MockNotesDatabase
	mockBrokerClient         *realtime.MockClient
	broker                   *realtime.Broker
	mockBoardModifiedUpdater *MockBoardLastModifiedUpdater
	service                  NotesService
	authorID                 uuid.UUID
	boardID                  uuid.UUID
	noteID                   uuid.UUID
	columnID                 uuid.UUID
	callerID                 uuid.UUID
}

func TestNoteServiceTestSuite(t *testing.T) {
	suite.Run(t, new(NoteServiceTestSuite))
}

func (suite *NoteServiceTestSuite) SetupTest() {
	suite.mockDB = NewMockNotesDatabase(suite.T())
	suite.mockBrokerClient = realtime.NewMockClient(suite.T())
	suite.broker = new(realtime.Broker)
	suite.broker.Con = suite.mockBrokerClient
	suite.mockBoardModifiedUpdater = NewMockBoardLastModifiedUpdater(suite.T())
	suite.service = NewNotesService(suite.mockDB, suite.broker, suite.mockBoardModifiedUpdater)
	suite.authorID = uuid.New()
	suite.boardID = uuid.New()
	suite.noteID = uuid.New()
	suite.columnID = uuid.New()
	suite.callerID = uuid.New()
}

func (suite *NoteServiceTestSuite) TearDownTest() {
	suite.mockBoardModifiedUpdater.AssertExpectations(suite.T())
}

func (suite *NoteServiceTestSuite) TestCreate() {
	// given
	text := "This is a text on a note"
	result := suite.createDatabaseNote(text, false)
	suite.expectCreateSuccess(text, result)

	// when
	note, err := suite.service.Create(context.Background(), suite.createNoteCreateRequest(text))

	// then
	suite.Nil(err)
	suite.Equal(suite.noteID, note.ID)
	suite.Equal(suite.authorID, note.Author)
	suite.Equal(text, note.Text)
	suite.False(note.Edited)
	suite.Equal(suite.columnID, note.Position.Column)
	suite.Equal(0, note.Position.Rank)
}

func (suite *NoteServiceTestSuite) TestCreate_EmptyText() {
	// when
	note, err := suite.service.Create(context.Background(), suite.createNoteCreateRequest(""))

	// then
	suite.Nil(note)
	suite.NotNil(err)
	suite.Equal(common.BadRequestError(errors.New("cannot create note with empty text")), err)
}

func (suite *NoteServiceTestSuite) TestCreate_DatabaseError() {
	// given
	text := "This is a text on a note"
	dbError := errors.New("database error")

	suite.mockDB.EXPECT().CreateNote(mock.Anything, suite.createNoteInsert(text)).
		Return(DatabaseNote{}, dbError)

	// when
	note, err := suite.service.Create(context.Background(), suite.createNoteCreateRequest(text))

	// then
	suite.Nil(note)
	suite.NotNil(err)
	suite.Equal(common.InternalServerError, err)
}

func (suite *NoteServiceTestSuite) TestImport() {
	// given
	text := "This is a text on a note"

	suite.mockDB.EXPECT().ImportNote(mock.Anything, suite.createDatabaseNoteImport(text)).
		Return(suite.createDatabaseNote(text, false), nil)

	// when
	note, err := suite.service.Import(context.Background(), suite.createNoteImportRequest(text))

	// then
	suite.Nil(err)
	suite.Equal(suite.noteID, note.ID)
	suite.Equal(suite.authorID, note.Author)
	suite.Equal(text, note.Text)
	suite.False(note.Edited)
	suite.Equal(suite.columnID, note.Position.Column)
	suite.Equal(0, note.Position.Rank)
}

func (suite *NoteServiceTestSuite) TestImport_EmptyText() {
	// when
	note, err := suite.service.Import(context.Background(), suite.createNoteImportRequest(""))

	// then
	suite.Nil(note)
	suite.NotNil(err)
	suite.Equal(common.BadRequestError(errors.New("cannot import note with empty text")), err)
}

func (suite *NoteServiceTestSuite) TestImport_DatabaseError() {
	// given
	text := "This is a text on a note"
	dbError := errors.New("database error")

	suite.mockDB.EXPECT().ImportNote(mock.Anything, suite.createDatabaseNoteImport(text)).
		Return(DatabaseNote{}, dbError)

	// when
	note, err := suite.service.Import(context.Background(), suite.createNoteImportRequest(text))

	// then
	suite.Nil(note)
	suite.NotNil(err)
	suite.Equal(common.InternalServerError, err)
}

func (suite *NoteServiceTestSuite) TestUpdate_Text_Owner() {
	// given
	text := "Updated text"
	edited := true

	precondition := Precondition{
		StackingAllowed: true,
		CallerRole:      common.OwnerRole,
		Author:          suite.authorID,
	}
	update := DatabaseNoteUpdate{
		ID:       suite.noteID,
		Board:    suite.boardID,
		Text:     &text,
		Position: nil,
		Edited:   edited,
	}
	result := suite.createDatabaseNote(text, edited)

	suite.expectPrecondition(precondition)
	suite.expectUpdateSuccess(update, result)

	// when
	note, err := suite.service.Update(context.Background(), suite.callerID, NoteUpdateRequest{
		Text:     &text,
		ID:       suite.noteID,
		Board:    suite.boardID,
		Position: nil,
		Edited:   edited,
	})

	// then
	suite.Nil(err)
	suite.Equal(suite.noteID, note.ID)
	suite.Equal(suite.authorID, note.Author)
	suite.Equal(text, note.Text)
	suite.True(note.Edited)
	suite.Equal(suite.columnID, note.Position.Column)
	suite.Equal(0, note.Position.Rank)
}

func (suite *NoteServiceTestSuite) TestUpdate_Position_Owner() {
	// given
	stackID := uuid.NullUUID{Valid: true, UUID: uuid.New()}
	text := "Updated text"
	pos := suite.createNotePosition(stackID)

	posUpdate := NoteUpdatePosition{
		Column: suite.columnID,
		Rank:   0,
		Stack:  stackID,
	}
	precondition := Precondition{
		StackingAllowed: true,
		CallerRole:      common.OwnerRole,
		Author:          suite.authorID,
	}
	update := DatabaseNoteUpdate{
		ID:       suite.noteID,
		Board:    suite.boardID,
		Text:     nil,
		Position: &posUpdate,
		Edited:   false,
	}
	result := suite.createDatabaseNote(text, false)

	suite.expectPrecondition(precondition)
	suite.expectUpdateSuccess(update, result)

	// when
	note, err := suite.service.Update(context.Background(), suite.callerID, NoteUpdateRequest{
		ID:       suite.noteID,
		Text:     nil,
		Board:    suite.boardID,
		Position: &pos,
		Edited:   false,
	})

	// then
	suite.Nil(err)
	suite.Equal(suite.noteID, note.ID)
	suite.Equal(suite.authorID, note.Author)
	suite.Equal(text, note.Text)
	suite.False(note.Edited)
	suite.Equal(suite.columnID, note.Position.Column)
	suite.Equal(0, note.Position.Rank)
}

func (suite *NoteServiceTestSuite) TestUpdate_Text_Moderator() {
	// given
	text := "Updated text"

	precondition := Precondition{
		StackingAllowed: true,
		CallerRole:      common.ModeratorRole,
		Author:          suite.authorID,
	}
	update := DatabaseNoteUpdate{
		ID:       suite.noteID,
		Board:    suite.boardID,
		Text:     &text,
		Position: nil,
		Edited:   true,
	}
	result := DatabaseNote{
		ID:     suite.noteID,
		Author: suite.authorID,
		Board:  suite.boardID,
		Column: suite.columnID,
		Text:   text,
		Edited: true,
		Rank:   0,
	}

	suite.expectPrecondition(precondition)
	suite.expectUpdateSuccess(update, result)

	// when
	note, err := suite.service.Update(context.Background(), suite.callerID, NoteUpdateRequest{
		Text:     &text,
		ID:       suite.noteID,
		Board:    suite.boardID,
		Position: nil,
		Edited:   true,
	})

	// then
	suite.Nil(err)
	suite.Equal(suite.noteID, note.ID)
	suite.Equal(suite.authorID, note.Author)
	suite.Equal(text, note.Text)
	suite.True(note.Edited)
	suite.Equal(suite.columnID, note.Position.Column)
	suite.Equal(0, note.Position.Rank)
}

func (suite *NoteServiceTestSuite) TestUpdate_Position_Moderator() {
	// given
	stackID := uuid.NullUUID{Valid: true, UUID: uuid.New()}
	text := "Updated text"
	pos := suite.createNotePosition(stackID)

	posUpdate := NoteUpdatePosition{
		Column: suite.columnID,
		Rank:   0,
		Stack:  stackID,
	}
	precondition := Precondition{
		StackingAllowed: true,
		CallerRole:      common.ModeratorRole,
		Author:          suite.authorID,
	}
	update := DatabaseNoteUpdate{
		ID:       suite.noteID,
		Board:    suite.boardID,
		Text:     nil,
		Position: &posUpdate,
		Edited:   false,
	}
	result := suite.createDatabaseNote(text, false)

	suite.expectPrecondition(precondition)
	suite.expectUpdateSuccess(update, result)

	// when
	note, err := suite.service.Update(context.Background(), suite.callerID, NoteUpdateRequest{
		Text:     nil,
		ID:       suite.noteID,
		Board:    suite.boardID,
		Position: &pos,
		Edited:   false,
	})

	// then
	suite.Nil(err)
	suite.Equal(suite.noteID, note.ID)
	suite.Equal(suite.authorID, note.Author)
	suite.Equal(text, note.Text)
	suite.False(note.Edited)
	suite.Equal(suite.columnID, note.Position.Column)
	suite.Equal(0, note.Position.Rank)
}

func (suite *NoteServiceTestSuite) TestUpdate_Text_Participant() {
	// given
	text := "Updated text"

	precondition := Precondition{
		StackingAllowed: true,
		CallerRole:      common.ParticipantRole,
		Author:          suite.callerID,
	}
	update := DatabaseNoteUpdate{
		ID:       suite.noteID,
		Board:    suite.boardID,
		Text:     &text,
		Position: nil,
		Edited:   true,
	}
	result := suite.createDatabaseNote(text, true)

	suite.expectPrecondition(precondition)
	suite.expectUpdateSuccess(update, result)

	// when
	note, err := suite.service.Update(context.Background(), suite.callerID, NoteUpdateRequest{
		Text:     &text,
		ID:       suite.noteID,
		Board:    suite.boardID,
		Position: nil,
		Edited:   false,
	})

	// then
	suite.Nil(err)
	suite.Equal(suite.noteID, note.ID)
	suite.Equal(suite.authorID, note.Author)
	suite.Equal(text, note.Text)
	suite.True(note.Edited)
	suite.Equal(suite.columnID, note.Position.Column)
	suite.Equal(0, note.Position.Rank)
}

func (suite *NoteServiceTestSuite) TestUpdate_Text_Participant_NotAllowed() {
	// given
	stackID := uuid.NullUUID{Valid: true, UUID: uuid.New()}
	txt := "Updated text"
	pos := suite.createNotePosition(stackID)

	precondition := Precondition{
		StackingAllowed: true,
		CallerRole:      common.ParticipantRole,
		Author:          suite.authorID,
	}

	suite.expectPrecondition(precondition)

	// when
	note, err := suite.service.Update(context.Background(), suite.callerID, NoteUpdateRequest{
		Text:     &txt,
		ID:       suite.noteID,
		Board:    suite.boardID,
		Position: &pos,
		Edited:   true,
	})

	// then
	suite.Nil(note)
	suite.NotNil(err)
	suite.Equal(common.ForbiddenError(errors.New("not allowed to change text of note")), err)
}

func (suite *NoteServiceTestSuite) TestUpdate_Position_Participant() {
	// given
	text := "Updated text"
	stackID := uuid.NullUUID{Valid: true, UUID: uuid.New()}
	pos := suite.createNotePosition(stackID)

	posUpdate := NoteUpdatePosition{
		Column: suite.columnID,
		Rank:   0,
		Stack:  stackID,
	}
	precondition := Precondition{
		StackingAllowed: true,
		CallerRole:      common.ParticipantRole,
		Author:          suite.callerID,
	}
	update := DatabaseNoteUpdate{
		ID:       suite.noteID,
		Board:    suite.boardID,
		Text:     nil,
		Position: &posUpdate,
		Edited:   false,
	}
	result := suite.createDatabaseNote(text, false)

	suite.expectPrecondition(precondition)
	suite.expectUpdateSuccess(update, result)

	// when
	note, err := suite.service.Update(context.Background(), suite.callerID, NoteUpdateRequest{
		Text:     nil,
		ID:       suite.noteID,
		Board:    suite.boardID,
		Position: &pos,
		Edited:   false,
	})

	// then
	suite.Nil(err)
	suite.Equal(suite.noteID, note.ID)
	suite.Equal(suite.authorID, note.Author)
	suite.Equal(text, note.Text)
	suite.False(note.Edited)
	suite.Equal(suite.columnID, note.Position.Column)
	suite.Equal(0, note.Position.Rank)
}

func (suite *NoteServiceTestSuite) TestUpdate_StackingNotAllowed() {
	// given
	stackID := uuid.NullUUID{Valid: true, UUID: uuid.New()}
	txt := "Updated text"
	pos := suite.createNotePosition(stackID)

	precondition := Precondition{
		StackingAllowed: false,
		CallerRole:      common.ParticipantRole,
		Author:          suite.callerID,
	}

	suite.expectPrecondition(precondition)

	// when
	note, err := suite.service.Update(context.Background(), suite.callerID, NoteUpdateRequest{
		Text:     &txt,
		ID:       suite.noteID,
		Board:    suite.boardID,
		Position: &pos,
		Edited:   true,
	})

	// then
	suite.Nil(note)
	suite.NotNil(err)
	suite.Equal(common.ForbiddenError(errors.New("not allowed to stack notes")), err)
}

func (suite *NoteServiceTestSuite) TestUpdate_StackOnSelf() {
	// given
	stackID := uuid.NullUUID{Valid: true, UUID: suite.noteID}
	txt := "Updated text"
	pos := suite.createNotePosition(stackID)

	precondition := Precondition{
		StackingAllowed: true,
		CallerRole:      common.ParticipantRole,
		Author:          suite.callerID,
	}

	suite.expectPrecondition(precondition)

	// when
	note, err := suite.service.Update(context.Background(), suite.callerID, NoteUpdateRequest{
		Text:     &txt,
		ID:       suite.noteID,
		Board:    suite.boardID,
		Position: &pos,
		Edited:   true,
	})

	// then
	suite.Nil(note)
	suite.NotNil(err)
	suite.Equal(common.ForbiddenError(errors.New("not allowed to stack a note on self")), err)
}

func (suite *NoteServiceTestSuite) TestUpdate_DatabaseError() {
	// given
	suite.authorID = suite.callerID
	stackId := uuid.NullUUID{Valid: true, UUID: uuid.New()}
	text := "Updated text"
	pos := suite.createNotePosition(stackId)

	posUpdate := NoteUpdatePosition{
		Column: suite.columnID,
		Rank:   0,
		Stack:  stackId,
	}
	dbError := errors.New("database error")

	suite.expectPrecondition(Precondition{StackingAllowed: true, CallerRole: common.ParticipantRole, Author: suite.authorID})
	suite.mockDB.EXPECT().UpdateNote(mock.Anything, suite.callerID, DatabaseNoteUpdate{
		ID:       suite.noteID,
		Board:    suite.boardID,
		Text:     &text,
		Position: &posUpdate,
		Edited:   true,
	}).Return(DatabaseNote{}, dbError)

	// when
	note, err := suite.service.Update(context.Background(), suite.callerID, NoteUpdateRequest{
		Text:     &text,
		ID:       suite.noteID,
		Board:    suite.boardID,
		Position: &pos,
		Edited:   true,
	})

	// then
	suite.Nil(note)
	suite.NotNil(err)
	suite.Equal(common.InternalServerError, err)
}

func (suite *NoteServiceTestSuite) TestDeleteNote() {
	// given
	deleteStack := true

	precondition := Precondition{
		StackingAllowed: true,
		CallerRole:      common.ParticipantRole,
		Author:          suite.callerID,
	}
	stack := []DatabaseNote{
		{ID: suite.noteID, Author: suite.callerID},
		{ID: uuid.New(), Author: suite.callerID, Stack: uuid.NullUUID{UUID: suite.noteID, Valid: true}},
	}

	suite.expectPrecondition(precondition)
	suite.expectDeleteSuccess(deleteStack, stack)

	// when
	err := suite.service.Delete(context.Background(), suite.callerID, suite.createNoteDeleteRequest(deleteStack))

	// then
	suite.Nil(err)
}

func (suite *NoteServiceTestSuite) TestDeleteNote_Owner() {
	// given
	deleteStack := true

	precondition := Precondition{
		StackingAllowed: true,
		CallerRole:      common.OwnerRole,
		Author:          suite.authorID,
	}
	stack := []DatabaseNote{
		{ID: suite.noteID, Author: suite.authorID},
		{ID: uuid.New(), Author: suite.authorID, Stack: uuid.NullUUID{UUID: suite.noteID, Valid: true}},
	}

	suite.expectPrecondition(precondition)
	suite.expectDeleteSuccess(deleteStack, stack)

	// when
	err := suite.service.Delete(context.Background(), suite.callerID, suite.createNoteDeleteRequest(deleteStack))

	// then
	suite.Nil(err)
}

func (suite *NoteServiceTestSuite) TestDeleteNote_Moderator() {
	// given
	deleteStack := true

	precondition := Precondition{
		StackingAllowed: true,
		CallerRole:      common.ModeratorRole,
		Author:          suite.authorID,
	}
	stack := []DatabaseNote{
		{ID: suite.noteID, Author: suite.authorID},
		{ID: uuid.New(), Author: suite.authorID, Stack: uuid.NullUUID{UUID: suite.noteID, Valid: true}},
	}

	suite.expectPrecondition(precondition)
	suite.expectDeleteSuccess(deleteStack, stack)

	// when
	err := suite.service.Delete(context.Background(), suite.callerID, suite.createNoteDeleteRequest(deleteStack))

	// then
	suite.Nil(err)
}

func (suite *NoteServiceTestSuite) TestDeleteNote_NotAllowed() {
	// given
	precondition := Precondition{
		StackingAllowed: true,
		CallerRole:      common.ParticipantRole,
		Author:          suite.authorID,
	}

	suite.expectPrecondition(precondition)

	// when
	err := suite.service.Delete(context.Background(), suite.callerID, suite.createNoteDeleteRequest(true))

	// then
	suite.NotNil(err)
	suite.Equal(common.ForbiddenError(errors.New("not allowed to delete note from other user")), err)
}

func (suite *NoteServiceTestSuite) TestGet() {
	// given
	text := "This is a note"
	edited := true

	suite.mockDB.EXPECT().Get(mock.Anything, suite.noteID).
		Return(suite.createDatabaseNote(text, edited), nil)

	// when
	note, err := suite.service.Get(context.Background(), suite.noteID)

	// then
	suite.Nil(err)
	suite.Equal(suite.noteID, note.ID)
	suite.Equal(suite.authorID, note.Author)
	suite.Equal(text, note.Text)
	suite.Equal(edited, note.Edited)
	suite.Equal(suite.columnID, note.Position.Column)
	suite.Equal(0, note.Position.Rank)
}

func (suite *NoteServiceTestSuite) TestGet_NotFound() {
	// given
	suite.mockDB.EXPECT().Get(mock.Anything, suite.noteID).
		Return(DatabaseNote{}, sql.ErrNoRows)

	// when
	note, err := suite.service.Get(context.Background(), suite.noteID)

	// then
	suite.Nil(note)
	suite.NotNil(err)
	suite.Equal(common.NotFoundError, err)
}

func (suite *NoteServiceTestSuite) TestGet_DatabaseError() {
	// given
	dbError := errors.New("database error")

	suite.mockDB.EXPECT().Get(mock.Anything, suite.noteID).
		Return(DatabaseNote{}, dbError)

	// when
	note, err := suite.service.Get(context.Background(), suite.noteID)

	// then
	suite.Nil(note)
	suite.NotNil(err)
	suite.Equal(common.InternalServerError, err)
}

func (suite *NoteServiceTestSuite) TestGetStack_DatabaseError() {
	// given
	dbError := errors.New("database error")

	suite.mockDB.EXPECT().GetStack(mock.Anything, suite.noteID).
		Return([]DatabaseNote{}, dbError)

	// when
	result, err := suite.service.GetStack(context.Background(), suite.noteID)

	// then
	suite.Error(err)
	suite.Nil(result)
	suite.Equal(dbError, err)
}

// Helper methods

func (suite *NoteServiceTestSuite) createNoteInsert(text string) DatabaseNoteInsert {
	return DatabaseNoteInsert{
		Author: suite.authorID,
		Board:  suite.boardID,
		Column: suite.columnID,
		Text:   text,
	}
}

func (suite *NoteServiceTestSuite) createDatabaseNote(text string, edited bool) DatabaseNote {
	return DatabaseNote{
		ID:     suite.noteID,
		Author: suite.authorID,
		Board:  suite.boardID,
		Column: suite.columnID,
		Text:   text,
		Stack:  uuid.NullUUID{},
		Edited: edited,
	}
}

func (suite *NoteServiceTestSuite) createNoteCreateRequest(text string) NoteCreateRequest {
	return NoteCreateRequest{
		User:   suite.authorID,
		Board:  suite.boardID,
		Column: suite.columnID,
		Text:   text,
	}
}

func (suite *NoteServiceTestSuite) createNoteDeleteRequest(deleteStack bool) NoteDeleteRequest {
	return NoteDeleteRequest{
		ID:          suite.noteID,
		Board:       suite.boardID,
		DeleteStack: deleteStack,
	}
}

func (suite *NoteServiceTestSuite) createNotePosition(stack uuid.NullUUID) NotePosition {
	return NotePosition{
		Column: suite.columnID,
		Rank:   0,
		Stack:  stack,
	}
}

func (suite *NoteServiceTestSuite) createDatabaseNoteImport(text string) DatabaseNoteImport {
	return DatabaseNoteImport{
		Author:   suite.authorID,
		Board:    suite.boardID,
		Text:     text,
		Position: &NoteUpdatePosition{Column: suite.columnID},
	}
}
func (suite *NoteServiceTestSuite) createNoteImportRequest(text string) NoteImportRequest {
	return NoteImportRequest{
		User:     suite.authorID,
		Board:    suite.boardID,
		Text:     text,
		Position: NotePosition{Column: suite.columnID},
	}
}

func (suite *NoteServiceTestSuite) expectBroadcast() {
	suite.mockBrokerClient.EXPECT().Publish(mock.Anything, mock.AnythingOfType("string"), mock.Anything).Return(nil)
}

func (suite *NoteServiceTestSuite) expectBoardTouched() {
	suite.mockBoardModifiedUpdater.EXPECT().UpdateLastModified(mock.Anything, suite.boardID).Return(nil)
}

func (suite *NoteServiceTestSuite) expectNotesUpdated() {
	suite.mockDB.EXPECT().GetAll(mock.Anything, suite.boardID).Return([]DatabaseNote{}, nil)
	suite.expectBroadcast()
}

func (suite *NoteServiceTestSuite) expectCreateSuccess(text string, result DatabaseNote) {
	noteInsert := suite.createNoteInsert(text)
	suite.mockDB.EXPECT().CreateNote(mock.Anything, noteInsert).Return(result, nil)
	suite.expectNotesUpdated()
	suite.expectBoardTouched()
}

func (suite *NoteServiceTestSuite) expectUpdateSuccess(update DatabaseNoteUpdate, result DatabaseNote) {
	suite.mockDB.EXPECT().UpdateNote(mock.Anything, suite.callerID, update).Return(result, nil)
	suite.expectNotesUpdated()
	suite.expectBoardTouched()
}

func (suite *NoteServiceTestSuite) expectDeleteSuccess(deleteStack bool, stack []DatabaseNote) {
	suite.mockDB.EXPECT().GetStack(mock.Anything, suite.noteID).Return(stack, nil)
	suite.mockDB.EXPECT().DeleteNote(mock.Anything, suite.callerID, suite.boardID, suite.noteID, deleteStack).Return(nil)
	suite.expectBroadcast()
	suite.expectBoardTouched()
}

func (suite *NoteServiceTestSuite) expectPrecondition(precondition Precondition) {
	suite.mockDB.EXPECT().GetPrecondition(mock.Anything, suite.noteID, suite.boardID, suite.callerID).Return(precondition, nil)
}
