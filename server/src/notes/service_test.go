package notes

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/suite"
	"scrumlr.io/server/cache"
	"scrumlr.io/server/common"
	"scrumlr.io/server/realtime"
)

type mockWebSocketConnection struct {
	writes []interface{}
	err    error
}

func (m *mockWebSocketConnection) WriteJSON(_ context.Context, v interface{}) error {
	m.writes = append(m.writes, v)
	return m.err
}

type NotesServiceTestSuite struct {
	suite.Suite
	service                  NotesService
	mockDB                   *MockNotesDatabase
	authorID                 uuid.UUID
	boardID                  uuid.UUID
	columnID                 uuid.UUID
	noteID                   uuid.UUID
	rank                     int
	mockBroker               *realtime.MockClient
	broker                   *realtime.Broker
	stackID                  uuid.NullUUID
	mockCache                *cache.MockClient
	mockBoardModifiedUpdater *common.MockBoardLastModifiedUpdater
	pos                      NotePosition
	posUpdate                NoteUpdatePosition
	ctx                      context.Context
}

func TestNotesServiceTestSuite(t *testing.T) {
	suite.Run(t, new(NotesServiceTestSuite))
}

func (suite *NotesServiceTestSuite) SetupTest() {
	suite.mockDB = NewMockNotesDatabase(suite.T())

	suite.mockBroker = realtime.NewMockClient(suite.T())
	suite.broker = new(realtime.Broker)
	suite.broker.Con = suite.mockBroker

	mockCache := cache.NewMockClient(suite.T())
	c := new(cache.Cache)
	c.Con = mockCache
	suite.mockCache = mockCache

	suite.mockBoardModifiedUpdater = common.NewMockBoardLastModifiedUpdater(suite.T())
	suite.service = NewNotesService(suite.mockDB, suite.broker, c, suite.mockBoardModifiedUpdater)

	suite.authorID = uuid.New()
	suite.boardID = uuid.New()
	suite.columnID = uuid.New()
	suite.noteID = uuid.New()
	suite.rank = 0

	suite.stackID = uuid.NullUUID{Valid: true, UUID: uuid.New()}

	suite.pos = NotePosition{
		Column: suite.columnID,
		Rank:   suite.rank,
		Stack:  suite.stackID,
	}

	suite.posUpdate = NoteUpdatePosition{
		Column: suite.columnID,
		Rank:   suite.rank,
		Stack:  suite.stackID,
	}

	suite.ctx = context.Background()
}

func (suite *NotesServiceTestSuite) TearDownTest() {
	suite.mockBoardModifiedUpdater.AssertExpectations(suite.T())
}

func (suite *NotesServiceTestSuite) expectPublish() {
	suite.mockBroker.EXPECT().
		Publish(mock.Anything, mock.AnythingOfType("string"), mock.Anything).
		Return(nil)
}

func (suite *NotesServiceTestSuite) expectNoLock() {
	suite.mockCache.EXPECT().Get(mock.Anything, mock.Anything).Return(nil, &cache.KeyNotFound{})
}

func (suite *NotesServiceTestSuite) expectBoardLastModifiedAtTouched() {
	suite.mockBoardModifiedUpdater.EXPECT().UpdateLastModified(mock.Anything, suite.boardID).Return(nil)
}

func (suite *NotesServiceTestSuite) expectPrecondition(stackingAllowed bool, callerRole common.SessionRole) {
	suite.mockDB.EXPECT().
		GetPrecondition(mock.Anything, suite.noteID, suite.boardID, suite.authorID).
		Return(Precondition{
			StackingAllowed: stackingAllowed,
			CallerRole:      callerRole,
			Author:          suite.authorID,
		}, nil)
}

func (suite *NotesServiceTestSuite) expectGetAllEmpty() {
	suite.mockDB.EXPECT().GetAll(mock.Anything, suite.boardID).
		Return([]DatabaseNote{}, nil)
}

func (suite *NotesServiceTestSuite) assertNoteMatches(text string, note *Note) {
	suite.Equal(suite.noteID, note.ID)
	suite.Equal(suite.authorID, note.Author)
	suite.Equal(text, note.Text)
	suite.Equal(suite.columnID, note.Position.Column)
	suite.Equal(suite.rank, note.Position.Rank)
}

func (suite *NotesServiceTestSuite) Test_Create() {
	edited := false
	text := "This is a text on a note"

	suite.mockDB.EXPECT().CreateNote(mock.Anything, DatabaseNoteInsert{Author: suite.authorID, Board: suite.boardID, Column: suite.columnID, Text: text}).
		Return(DatabaseNote{ID: suite.noteID, Author: suite.authorID, Board: suite.boardID, Column: suite.columnID, Text: text, Stack: uuid.NullUUID{}, Rank: suite.rank, Edited: edited}, nil)
	suite.expectGetAllEmpty()
	suite.expectPublish()
	suite.expectBoardLastModifiedAtTouched()

	note, err := suite.service.Create(context.Background(), NoteCreateRequest{User: suite.authorID, Board: suite.boardID, Column: suite.columnID, Text: text})

	suite.Nil(err)
	suite.assertNoteMatches(text, note)
	suite.Equal(edited, note.Edited)
}

func (suite *NotesServiceTestSuite) Test_Create_EmptyText() {
	text := ""

	note, err := suite.service.Create(context.Background(), NoteCreateRequest{User: suite.authorID, Board: suite.boardID, Column: suite.columnID, Text: text})

	suite.Nil(note)
	suite.NotNil(err)
	suite.Equal(common.BadRequestError(errors.New("cannot create note with empty text")), err)
}

func (suite *NotesServiceTestSuite) Test_Create_DatabaseError() {
	text := "This is a text on a note"
	dbError := errors.New("database error")

	suite.mockDB.EXPECT().CreateNote(mock.Anything, DatabaseNoteInsert{Author: suite.authorID, Board: suite.boardID, Column: suite.columnID, Text: text}).
		Return(DatabaseNote{}, dbError)

	note, err := suite.service.Create(context.Background(), NoteCreateRequest{User: suite.authorID, Board: suite.boardID, Column: suite.columnID, Text: text})

	suite.Nil(note)
	suite.NotNil(err)
	suite.Equal(common.InternalServerError, err)
}

func (suite *NotesServiceTestSuite) Test_Import() {
	edited := false
	text := "This is a text on a note"

	suite.mockDB.EXPECT().ImportNote(mock.Anything, DatabaseNoteImport{Author: suite.authorID, Board: suite.boardID, Text: text, Position: &NoteUpdatePosition{Column: suite.columnID}}).
		Return(DatabaseNote{ID: suite.noteID, Author: suite.authorID, Board: suite.boardID, Column: suite.columnID, Text: text, Stack: uuid.NullUUID{}, Rank: suite.rank, Edited: edited}, nil)
	suite.expectBoardLastModifiedAtTouched()

	note, err := suite.service.Import(context.Background(), NoteImportRequest{User: suite.authorID, Board: suite.boardID, Text: text, Position: NotePosition{Column: suite.columnID}})

	suite.Nil(err)
	suite.assertNoteMatches(text, note)
	suite.Equal(edited, note.Edited)
}

func (suite *NotesServiceTestSuite) Test_Import_EmptyText() {
	text := ""

	note, err := suite.service.Import(context.Background(), NoteImportRequest{User: suite.authorID, Board: suite.boardID, Text: text, Position: NotePosition{Column: suite.columnID}})

	suite.Nil(note)
	suite.NotNil(err)
	suite.Equal(common.BadRequestError(errors.New("cannot import note with empty text")), err)
}

func (suite *NotesServiceTestSuite) Test_Import_DatabaseError() {
	text := "This is a text on a note"
	dbError := errors.New("database error")

	suite.mockDB.EXPECT().ImportNote(mock.Anything, DatabaseNoteImport{Author: suite.authorID, Board: suite.boardID, Text: text, Position: &NoteUpdatePosition{Column: suite.columnID}}).
		Return(DatabaseNote{}, dbError)

	note, err := suite.service.Import(context.Background(), NoteImportRequest{User: suite.authorID, Board: suite.boardID, Text: text, Position: NotePosition{Column: suite.columnID}})

	suite.Nil(note)
	suite.NotNil(err)
	suite.Equal(common.InternalServerError, err)
}

func (suite *NotesServiceTestSuite) Test_Update_Text_Owner() {
	callerRole := common.OwnerRole
	stackAllowed := true
	text := "Updated text"

	suite.expectNoLock()
	suite.expectPrecondition(stackAllowed, callerRole)
	suite.mockDB.EXPECT().UpdateNote(mock.Anything, suite.authorID, DatabaseNoteUpdate{
		ID:       suite.noteID,
		Board:    suite.boardID,
		Text:     &text,
		Position: nil,
		Edited:   true,
	}).Return(DatabaseNote{ID: suite.noteID, Author: suite.authorID, Board: suite.boardID, Column: suite.columnID, Text: text, Edited: true}, nil)
	suite.expectGetAllEmpty()
	suite.expectPublish()
	suite.expectBoardLastModifiedAtTouched()

	note, err := suite.service.Update(context.Background(), suite.authorID, NoteUpdateRequest{
		Text:     &text,
		ID:       suite.noteID,
		Board:    suite.boardID,
		Position: nil,
		Edited:   true,
	})

	suite.Nil(err)
	suite.assertNoteMatches(text, note)
	suite.True(note.Edited)
}

func (suite *NotesServiceTestSuite) Test_Update_Position_Owner() {
	callerRole := common.OwnerRole
	stackAllowed := true
	text := "Updated text"

	suite.expectNoLock()
	suite.expectPrecondition(stackAllowed, callerRole)
	suite.mockDB.EXPECT().UpdateNote(mock.Anything, suite.authorID, DatabaseNoteUpdate{
		ID:       suite.noteID,
		Board:    suite.boardID,
		Text:     nil,
		Position: &suite.posUpdate,
		Edited:   false,
	}).Return(DatabaseNote{ID: suite.noteID, Author: suite.authorID, Board: suite.boardID, Column: suite.columnID, Text: text, Edited: false}, nil)
	suite.expectGetAllEmpty()
	suite.expectPublish()
	suite.expectBoardLastModifiedAtTouched()

	note, err := suite.service.Update(context.Background(), suite.authorID, NoteUpdateRequest{
		ID:       suite.noteID,
		Text:     nil,
		Board:    suite.boardID,
		Position: &suite.pos,
		Edited:   false,
	})

	suite.Nil(err)
	suite.assertNoteMatches(text, note)
	suite.False(note.Edited)
}

func (suite *NotesServiceTestSuite) Test_Update_Text_Moderator() {
	callerRole := common.ModeratorRole
	stackAllowed := true
	text := "Updated text"

	suite.expectNoLock()
	suite.expectPrecondition(stackAllowed, callerRole)
	suite.mockDB.EXPECT().UpdateNote(mock.Anything, suite.authorID, DatabaseNoteUpdate{
		ID:       suite.noteID,
		Board:    suite.boardID,
		Text:     &text,
		Position: nil,
		Edited:   true,
	}).Return(DatabaseNote{ID: suite.noteID, Author: suite.authorID, Board: suite.boardID, Column: suite.columnID, Text: text, Edited: true}, nil)
	suite.expectGetAllEmpty()
	suite.expectPublish()
	suite.expectBoardLastModifiedAtTouched()

	note, err := suite.service.Update(context.Background(), suite.authorID, NoteUpdateRequest{
		Text:     &text,
		ID:       suite.noteID,
		Board:    suite.boardID,
		Position: nil,
		Edited:   true,
	})

	suite.Nil(err)
	suite.assertNoteMatches(text, note)
	suite.True(note.Edited)
}

func (suite *NotesServiceTestSuite) Test_Update_Position_Moderator() {
	callerRole := common.ModeratorRole
	stackAllowed := true
	text := "Updated text"

	suite.expectNoLock()
	suite.expectPrecondition(stackAllowed, callerRole)
	suite.mockDB.EXPECT().UpdateNote(mock.Anything, suite.authorID, DatabaseNoteUpdate{
		ID:       suite.noteID,
		Board:    suite.boardID,
		Text:     nil,
		Position: &suite.posUpdate,
		Edited:   false,
	}).Return(DatabaseNote{ID: suite.noteID, Author: suite.authorID, Board: suite.boardID, Column: suite.columnID, Text: text, Edited: false}, nil)
	suite.expectGetAllEmpty()
	suite.expectPublish()
	suite.expectBoardLastModifiedAtTouched()

	note, err := suite.service.Update(context.Background(), suite.authorID, NoteUpdateRequest{
		Text:     nil,
		ID:       suite.noteID,
		Board:    suite.boardID,
		Position: &suite.pos,
		Edited:   false,
	})

	suite.Nil(err)
	suite.assertNoteMatches(text, note)
	suite.False(note.Edited)
}

func (suite *NotesServiceTestSuite) Test_Update_Text_Participant() {
	callerRole := common.ParticipantRole
	stackAllowed := true
	text := "Updated text"

	suite.expectNoLock()
	suite.expectPrecondition(stackAllowed, callerRole)
	suite.mockDB.EXPECT().UpdateNote(mock.Anything, suite.authorID, DatabaseNoteUpdate{
		ID:       suite.noteID,
		Board:    suite.boardID,
		Text:     &text,
		Position: nil,
		Edited:   true,
	}).Return(DatabaseNote{ID: suite.noteID, Author: suite.authorID, Board: suite.boardID, Column: suite.columnID, Text: text, Edited: true}, nil)
	suite.expectGetAllEmpty()
	suite.expectPublish()
	suite.expectBoardLastModifiedAtTouched()

	note, err := suite.service.Update(context.Background(), suite.authorID, NoteUpdateRequest{
		Text:     &text,
		ID:       suite.noteID,
		Board:    suite.boardID,
		Position: nil,
		Edited:   false,
	})

	suite.Nil(err)
	suite.assertNoteMatches(text, note)
	suite.True(note.Edited)
}

func (suite *NotesServiceTestSuite) Test_Update_Text_Participant_NotAllowed() {
	callerID := uuid.New()
	callerRole := common.ParticipantRole
	stackAllowed := true
	txt := "Updated text"
	pos := suite.pos
	pos.Rank = 0

	suite.mockDB.EXPECT().GetPrecondition(mock.Anything, suite.noteID, suite.boardID, callerID).
		Return(Precondition{StackingAllowed: stackAllowed, CallerRole: callerRole, Author: suite.authorID}, nil)

	note, err := suite.service.Update(context.Background(), callerID, NoteUpdateRequest{
		Text:     &txt,
		ID:       suite.noteID,
		Board:    suite.boardID,
		Position: &pos,
		Edited:   true,
	})

	suite.Nil(note)
	suite.NotNil(err)
	suite.Equal(common.ForbiddenError(errors.New("not allowed to change text of note")), err)
}

func (suite *NotesServiceTestSuite) Test_Update_Position_Participant() {
	callerRole := common.ParticipantRole
	stackAllowed := true
	text := "Updated text"

	suite.expectNoLock()
	suite.expectPrecondition(stackAllowed, callerRole)
	suite.mockDB.EXPECT().UpdateNote(mock.Anything, suite.authorID, DatabaseNoteUpdate{
		ID:       suite.noteID,
		Board:    suite.boardID,
		Text:     nil,
		Position: &suite.posUpdate,
		Edited:   false,
	}).Return(DatabaseNote{ID: suite.noteID, Author: suite.authorID, Board: suite.boardID, Column: suite.columnID, Text: text, Edited: false}, nil)
	suite.expectGetAllEmpty()
	suite.expectPublish()
	suite.expectBoardLastModifiedAtTouched()

	note, err := suite.service.Update(context.Background(), suite.authorID, NoteUpdateRequest{
		Text:     nil,
		ID:       suite.noteID,
		Board:    suite.boardID,
		Position: &suite.pos,
		Edited:   false,
	})

	suite.Nil(err)
	suite.assertNoteMatches(text, note)
	suite.False(note.Edited)
}

func (suite *NotesServiceTestSuite) Test_Update_StackingNotAllowed() {
	callerRole := common.ParticipantRole
	stackAllowed := false
	txt := "Updated text"
	pos := suite.pos
	pos.Rank = 0

	suite.expectNoLock()
	suite.expectPrecondition(stackAllowed, callerRole)

	note, err := suite.service.Update(context.Background(), suite.authorID, NoteUpdateRequest{
		Text:     &txt,
		ID:       suite.noteID,
		Board:    suite.boardID,
		Position: &pos,
		Edited:   true,
	})

	suite.Nil(note)
	suite.NotNil(err)
	suite.Equal(common.ForbiddenError(errors.New("not allowed to stack notes")), err)
}

func (suite *NotesServiceTestSuite) Test_Update_StackOnSelf() {
	callerRole := common.ParticipantRole
	stackAllowed := true
	stackIDNote := uuid.NullUUID{Valid: true, UUID: suite.noteID}
	txt := "Updated text"
	pos := suite.pos
	pos.Rank = 0
	pos.Stack = stackIDNote

	suite.expectNoLock()
	suite.expectPrecondition(stackAllowed, callerRole)

	note, err := suite.service.Update(context.Background(), suite.authorID, NoteUpdateRequest{
		Text:     &txt,
		ID:       suite.noteID,
		Board:    suite.boardID,
		Position: &pos,
		Edited:   true,
	})

	suite.Nil(note)
	suite.NotNil(err)
	suite.Equal(common.ForbiddenError(errors.New("not allowed to stack a note on self")), err)
}

func (suite *NotesServiceTestSuite) Test_Update_DatabaseError() {
	text := "Updated text"
	callerRole := common.ParticipantRole
	stackAllowed := true
	dbError := errors.New("database error")

	suite.expectNoLock()
	suite.expectPrecondition(stackAllowed, callerRole)
	suite.mockDB.EXPECT().UpdateNote(mock.Anything, suite.authorID, DatabaseNoteUpdate{
		ID:       suite.noteID,
		Board:    suite.boardID,
		Text:     &text,
		Position: &suite.posUpdate,
		Edited:   true,
	}).Return(DatabaseNote{}, dbError)

	note, err := suite.service.Update(context.Background(), suite.authorID, NoteUpdateRequest{
		Text:     &text,
		ID:       suite.noteID,
		Board:    suite.boardID,
		Position: &suite.pos,
		Edited:   true,
	})

	suite.Nil(note)
	suite.NotNil(err)
	suite.Equal(common.InternalServerError, err)
}

func (suite *NotesServiceTestSuite) Test_Import_UpdateLastModifiedError() {
	edited := false
	text := "This is a text on a note"

	suite.mockDB.EXPECT().ImportNote(mock.Anything, DatabaseNoteImport{Author: suite.authorID, Board: suite.boardID, Text: text, Position: &NoteUpdatePosition{Column: suite.columnID}}).
		Return(DatabaseNote{ID: suite.noteID, Author: suite.authorID, Board: suite.boardID, Column: suite.columnID, Text: text, Stack: uuid.NullUUID{}, Rank: suite.rank, Edited: edited}, nil)
	suite.mockBoardModifiedUpdater.EXPECT().UpdateLastModified(mock.Anything, suite.boardID).Return(errors.New("cannot update board"))

	note, err := suite.service.Import(context.Background(), NoteImportRequest{User: suite.authorID, Board: suite.boardID, Text: text, Position: NotePosition{Column: suite.columnID}})

	suite.Nil(err)
	suite.assertNoteMatches(text, note)
	suite.Equal(edited, note.Edited)
}

func (suite *NotesServiceTestSuite) Test_Update_GetPreconditionError() {
	dbErr := errors.New("database error")

	suite.mockDB.EXPECT().GetPrecondition(mock.Anything, suite.noteID, suite.boardID, suite.authorID).
		Return(Precondition{}, dbErr)

	note, err := suite.service.Update(context.Background(), suite.authorID, NoteUpdateRequest{
		ID:    suite.noteID,
		Board: suite.boardID,
	})

	suite.Nil(note)
	suite.Equal(common.InternalServerError, err)
}

func (suite *NotesServiceTestSuite) Test_Update_GetLockError() {
	callerRole := common.OwnerRole
	stackAllowed := true

	suite.expectPrecondition(stackAllowed, callerRole)
	suite.mockCache.EXPECT().Get(mock.Anything, suite.noteID.String()).Return(nil, errors.New("cache unavailable"))

	note, err := suite.service.Update(context.Background(), suite.authorID, NoteUpdateRequest{
		ID:    suite.noteID,
		Board: suite.boardID,
	})

	suite.Nil(note)
	suite.Equal(common.InternalServerError, err)
}

func (suite *NotesServiceTestSuite) Test_Update_LockedByOtherUser() {
	callerRole := common.OwnerRole
	stackAllowed := true
	otherUser := uuid.New()

	suite.expectPrecondition(stackAllowed, callerRole)
	suite.mockCache.EXPECT().Get(mock.Anything, suite.noteID.String()).Return([]byte(`{"user":"`+otherUser.String()+`","createdAt":"2026-03-17T10:00:00Z"}`), nil)

	note, err := suite.service.Update(context.Background(), suite.authorID, NoteUpdateRequest{
		ID:    suite.noteID,
		Board: suite.boardID,
	})

	suite.Nil(note)
	suite.Equal(common.ConflictError(errors.New("note is currently locked")), err)
}

func (suite *NotesServiceTestSuite) Test_Update_NegativeRankIsResetToZero() {
	callerRole := common.OwnerRole
	stackAllowed := true
	text := "Updated text"

	pos := suite.pos
	pos.Rank = -1

	expectedPosition := suite.posUpdate
	expectedPosition.Rank = 0

	suite.expectNoLock()
	suite.expectPrecondition(stackAllowed, callerRole)
	suite.mockDB.EXPECT().UpdateNote(mock.Anything, suite.authorID, DatabaseNoteUpdate{
		ID:       suite.noteID,
		Board:    suite.boardID,
		Text:     nil,
		Position: &expectedPosition,
		Edited:   false,
	}).Return(DatabaseNote{ID: suite.noteID, Author: suite.authorID, Board: suite.boardID, Column: suite.columnID, Text: text, Edited: false, Rank: 0}, nil)
	suite.expectGetAllEmpty()
	suite.expectPublish()
	suite.expectBoardLastModifiedAtTouched()

	note, err := suite.service.Update(context.Background(), suite.authorID, NoteUpdateRequest{
		ID:       suite.noteID,
		Board:    suite.boardID,
		Position: &pos,
		Edited:   false,
	})

	suite.Nil(err)
	suite.NotNil(note)
	suite.Equal(0, note.Position.Rank)
}

func (suite *NotesServiceTestSuite) expectDeleteSequence(deleteStack bool) {
	suite.mockDB.EXPECT().GetStack(mock.Anything, suite.noteID).
		Return([]DatabaseNote{{ID: suite.noteID, Author: suite.authorID}, {ID: uuid.New(), Author: suite.authorID, Stack: uuid.NullUUID{UUID: suite.noteID, Valid: true}}}, nil)
	suite.mockDB.EXPECT().DeleteNote(mock.Anything, suite.authorID, suite.boardID, suite.noteID, deleteStack).
		Return(nil)
	suite.expectPublish()
	suite.expectBoardLastModifiedAtTouched()
}

func (suite *NotesServiceTestSuite) Test_DeleteNote() {
	callerRole := common.ParticipantRole
	stackAllowed := true
	deleteStack := true

	suite.expectNoLock()
	suite.expectPrecondition(stackAllowed, callerRole)
	suite.expectDeleteSequence(deleteStack)

	err := suite.service.Delete(suite.ctx, suite.authorID, NoteDeleteRequest{ID: suite.noteID, Board: suite.boardID, DeleteStack: deleteStack})

	suite.Nil(err)
}

func (suite *NotesServiceTestSuite) Test_DeleteNote_Owner() {
	callerRole := common.OwnerRole
	stackAllowed := true
	deleteStack := true

	suite.expectNoLock()
	suite.expectPrecondition(stackAllowed, callerRole)
	suite.expectDeleteSequence(deleteStack)

	err := suite.service.Delete(suite.ctx, suite.authorID, NoteDeleteRequest{ID: suite.noteID, Board: suite.boardID, DeleteStack: deleteStack})

	suite.Nil(err)
}

func (suite *NotesServiceTestSuite) Test_DeleteNote_Moderator() {
	callerRole := common.ModeratorRole
	stackAllowed := true
	deleteStack := true

	suite.expectNoLock()
	suite.expectPrecondition(stackAllowed, callerRole)
	suite.expectDeleteSequence(deleteStack)

	err := suite.service.Delete(suite.ctx, suite.authorID, NoteDeleteRequest{ID: suite.noteID, Board: suite.boardID, DeleteStack: deleteStack})

	suite.Nil(err)
}

func (suite *NotesServiceTestSuite) Test_DeleteNote_NotAllowed() {
	callerID := uuid.New()
	callerRole := common.ParticipantRole
	deleteStack := true

	suite.mockDB.EXPECT().GetPrecondition(mock.Anything, suite.noteID, suite.boardID, callerID).
		Return(Precondition{StackingAllowed: true, CallerRole: callerRole, Author: suite.authorID}, nil)

	err := suite.service.Delete(suite.ctx, callerID, NoteDeleteRequest{ID: suite.noteID, Board: suite.boardID, DeleteStack: deleteStack})

	suite.NotNil(err)
	suite.Equal(common.ForbiddenError(errors.New("not allowed to delete note from other user")), err)
}

func (suite *NotesServiceTestSuite) Test_Get() {
	text := "This is a note"
	edited := true

	suite.mockDB.EXPECT().Get(mock.Anything, suite.noteID).
		Return(DatabaseNote{ID: suite.noteID, Author: suite.authorID, Text: text, Column: suite.columnID, Edited: edited, Rank: suite.rank}, nil)

	note, err := suite.service.Get(context.Background(), suite.noteID)

	suite.Nil(err)
	suite.assertNoteMatches(text, note)
	suite.Equal(edited, note.Edited)
}

func (suite *NotesServiceTestSuite) Test_Get_NotFound() {

	suite.mockDB.EXPECT().Get(mock.Anything, suite.noteID).
		Return(DatabaseNote{}, sql.ErrNoRows)

	note, err := suite.service.Get(context.Background(), suite.noteID)

	suite.Nil(note)
	suite.NotNil(err)
	suite.Equal(common.NotFoundError, err)
}

func (suite *NotesServiceTestSuite) Test_Get_DatabaseError() {
	dbError := errors.New("database error")

	suite.mockDB.EXPECT().Get(mock.Anything, suite.noteID).
		Return(DatabaseNote{}, dbError)

	note, err := suite.service.Get(context.Background(), suite.noteID)

	suite.Nil(note)
	suite.NotNil(err)
	suite.Equal(common.InternalServerError, err)
}

func (suite *NotesServiceTestSuite) Test_GetAll() {
	firstNoteID := uuid.New()
	secondNoteID := uuid.New()
	firstAuthorID := uuid.New()
	secondAuthorID := uuid.New()
	firstColumnID := uuid.New()
	secondColumnID := uuid.New()
	firstNoteText := "This is the first note"
	secondNoteText := "This is the second note"

	suite.mockDB.EXPECT().GetAll(mock.Anything, suite.boardID).
		Return([]DatabaseNote{
			{ID: firstNoteID, Author: firstAuthorID, Board: suite.boardID, Text: firstNoteText, Column: firstColumnID, Stack: uuid.NullUUID{}, Rank: 0, Edited: false},
			{ID: secondNoteID, Author: secondAuthorID, Board: suite.boardID, Text: secondNoteText, Column: secondColumnID, Stack: uuid.NullUUID{}, Rank: 0, Edited: true},
		}, nil)

	notes, err := suite.service.GetAll(context.Background(), suite.boardID)

	suite.Nil(err)
	suite.Len(notes, 2)

	suite.Equal(firstNoteID, notes[0].ID)
	suite.Equal(firstAuthorID, notes[0].Author)
	suite.Equal(firstNoteText, notes[0].Text)
	suite.False(notes[0].Edited)
	suite.Equal(firstColumnID, notes[0].Position.Column)
	suite.Equal(0, notes[0].Position.Rank)

	suite.Equal(secondNoteID, notes[1].ID)
	suite.Equal(secondAuthorID, notes[1].Author)
	suite.Equal(secondNoteText, notes[1].Text)
	suite.True(notes[1].Edited)
	suite.Equal(secondColumnID, notes[1].Position.Column)
	suite.Equal(0, notes[1].Position.Rank)
}

func (suite *NotesServiceTestSuite) Test_GetAll_NotFound() {

	suite.mockDB.EXPECT().GetAll(mock.Anything, suite.boardID).
		Return([]DatabaseNote{}, sql.ErrNoRows)

	notes, err := suite.service.GetAll(context.Background(), suite.boardID)

	suite.Nil(notes)
	suite.NotNil(err)
	suite.Equal(common.NotFoundError, err)
}

func (suite *NotesServiceTestSuite) Test_GetAll_DatabaseError() {
	dbError := errors.New("database error")

	suite.mockDB.EXPECT().GetAll(mock.Anything, suite.boardID).
		Return([]DatabaseNote{}, dbError)

	notes, err := suite.service.GetAll(context.Background(), suite.boardID)

	suite.Nil(notes)
	suite.NotNil(err)
	suite.Equal(common.InternalServerError, err)
}

func (suite *NotesServiceTestSuite) Test_GetStack() {

	suite.mockDB.EXPECT().GetStack(mock.Anything, suite.noteID).
		Return([]DatabaseNote{
			{ID: uuid.New(), Text: "Note 1"},
			{ID: uuid.New(), Text: "Note 2"},
		}, nil)

	result, err := suite.service.GetStack(context.Background(), suite.noteID)

	suite.Nil(err)
	suite.NotNil(result)
	suite.Len(result, 2)
}

func (suite *NotesServiceTestSuite) Test_GetStack_DatabaseError() {
	dbError := errors.New("database error")

	suite.mockDB.EXPECT().GetStack(mock.Anything, suite.noteID).
		Return([]DatabaseNote{}, dbError)

	result, err := suite.service.GetStack(context.Background(), suite.noteID)

	suite.Error(err)
	suite.Nil(result)
	suite.Equal(dbError, err)
}

func (suite *NotesServiceTestSuite) Test_GetByUserAndBoard() {
	oteID := uuid.New()
	noteText := "This is the first note"

	suite.mockDB.EXPECT().GetByUserAndBoard(mock.Anything, suite.authorID, suite.boardID).
		Return([]DatabaseNote{
			{ID: oteID, Author: suite.authorID, Board: suite.boardID, Text: noteText, Column: suite.columnID, Stack: uuid.NullUUID{}, Rank: 0, Edited: false},
		}, nil)

	notes, err := suite.service.GetByUserAndBoard(context.Background(), suite.authorID, suite.boardID)

	suite.Nil(err)
	suite.Len(notes, 1)
	suite.Equal(oteID, notes[0].ID)
	suite.Equal(suite.authorID, notes[0].Author)
	suite.Equal(noteText, notes[0].Text)
	suite.False(notes[0].Edited)
	suite.Equal(suite.columnID, notes[0].Position.Column)
	suite.Equal(0, notes[0].Position.Rank)
}

func (suite *NotesServiceTestSuite) Test_DeleteUserNotesFromBoard() {
	callerRole := common.ParticipantRole
	stackAllowed := true

	noteA := uuid.New()
	noteB := uuid.New()

	suite.mockDB.EXPECT().
		GetByUserAndBoard(mock.Anything, suite.authorID, suite.boardID).
		Return([]DatabaseNote{
			{ID: noteA, Author: suite.authorID, Board: suite.boardID},
			{ID: noteB, Author: suite.authorID, Board: suite.boardID},
		}, nil)

	suite.mockCache.EXPECT().Get(mock.Anything, mock.Anything).Return(nil, &cache.KeyNotFound{})
	suite.mockDB.EXPECT().
		GetPrecondition(mock.Anything, noteA, suite.boardID, suite.authorID).
		Return(Precondition{
			StackingAllowed: stackAllowed,
			CallerRole:      callerRole,
			Author:          suite.authorID,
		}, nil)
	suite.mockDB.EXPECT().
		DeleteNote(mock.Anything, suite.authorID, suite.boardID, noteA, false).
		Return(nil)
	suite.expectPublish()
	suite.expectBoardLastModifiedAtTouched()

	suite.mockCache.EXPECT().Get(mock.Anything, mock.Anything).Return(nil, &cache.KeyNotFound{})
	suite.mockDB.EXPECT().
		GetPrecondition(mock.Anything, noteB, suite.boardID, suite.authorID).
		Return(Precondition{
			StackingAllowed: stackAllowed,
			CallerRole:      callerRole,
			Author:          suite.authorID,
		}, nil)
	suite.mockDB.EXPECT().
		DeleteNote(mock.Anything, suite.authorID, suite.boardID, noteB, false).
		Return(nil)
	suite.expectPublish()
	suite.expectBoardLastModifiedAtTouched()

	err := suite.service.DeleteUserNotesFromBoard(suite.ctx, suite.authorID, suite.boardID)

	suite.Nil(err)
}

func (suite *NotesServiceTestSuite) Test_DeleteUserNotesFromBoard_NoNotes() {

	suite.mockDB.EXPECT().
		GetByUserAndBoard(mock.Anything, suite.authorID, suite.boardID).
		Return([]DatabaseNote{}, nil)

	err := suite.service.DeleteUserNotesFromBoard(suite.ctx, suite.authorID, suite.boardID)

	suite.Nil(err)
}

func (suite *NotesServiceTestSuite) Test_DeleteUserNotesFromBoard_GetByUserAndBoardError() {
	dbErr := errors.New("db error")

	suite.mockDB.EXPECT().
		GetByUserAndBoard(mock.Anything, suite.authorID, suite.boardID).
		Return([]DatabaseNote{}, dbErr)

	err := suite.service.DeleteUserNotesFromBoard(suite.ctx, suite.authorID, suite.boardID)

	suite.Equal(common.InternalServerError, err)
}

func (suite *NotesServiceTestSuite) Test_handleAcquire_Success() {
	service := suite.service.(*Service)
	conn := &mockWebSocketConnection{}

	suite.mockDB.EXPECT().GetStack(mock.Anything, suite.noteID).
		Return([]DatabaseNote{{ID: suite.noteID, Author: suite.authorID}}, nil)
	suite.mockCache.EXPECT().Create(mock.Anything, suite.noteID.String(), suite.authorID.String(), DefaultTTL).Return(nil)
	suite.expectPublish()

	service.handleAcquire(suite.ctx, suite.noteID, suite.boardID, suite.authorID, conn)

	suite.Len(conn.writes, 1)
	response, ok := conn.writes[0].(DragLockResponse)
	suite.True(ok)
	suite.Equal(WebSocketMessageTypeDragLock, response.Type)
	suite.Equal(DragLockActionAcquire, response.Action)
	suite.Equal(suite.noteID, response.NoteID)
	suite.True(response.Success)
	suite.Empty(response.Error)
}

func (suite *NotesServiceTestSuite) Test_handleAcquire_Failure() {
	service := suite.service.(*Service)
	conn := &mockWebSocketConnection{}

	suite.mockDB.EXPECT().GetStack(mock.Anything, suite.noteID).
		Return([]DatabaseNote{{ID: suite.noteID, Author: suite.authorID}}, nil)
	suite.mockCache.EXPECT().Create(mock.Anything, suite.noteID.String(), suite.authorID.String(), DefaultTTL).Return(errors.New("lock exists"))

	service.handleAcquire(suite.ctx, suite.noteID, suite.boardID, suite.authorID, conn)

	suite.Len(conn.writes, 1)
	response, ok := conn.writes[0].(DragLockResponse)
	suite.True(ok)
	suite.Equal(DragLockActionAcquire, response.Action)
	suite.False(response.Success)
	suite.Equal("Note is currently being dragged by another user", response.Error)
}

func (suite *NotesServiceTestSuite) Test_handleAcquire_WriteJSONError() {
	service := suite.service.(*Service)
	conn := &mockWebSocketConnection{err: errors.New("write failed")}

	suite.mockDB.EXPECT().GetStack(mock.Anything, suite.noteID).
		Return([]DatabaseNote{{ID: suite.noteID, Author: suite.authorID}}, nil)
	suite.mockCache.EXPECT().Create(mock.Anything, suite.noteID.String(), suite.authorID.String(), DefaultTTL).Return(nil)
	suite.expectPublish()

	service.handleAcquire(suite.ctx, suite.noteID, suite.boardID, suite.authorID, conn)

	suite.Len(conn.writes, 1)
	response, ok := conn.writes[0].(DragLockResponse)
	suite.True(ok)
	suite.Equal(DragLockActionAcquire, response.Action)
}

func (suite *NotesServiceTestSuite) Test_handleRelease_Success() {
	service := suite.service.(*Service)
	conn := &mockWebSocketConnection{}

	suite.mockDB.EXPECT().GetStack(mock.Anything, suite.noteID).
		Return([]DatabaseNote{{ID: suite.noteID, Author: suite.authorID}}, nil)
	suite.mockCache.EXPECT().Delete(mock.Anything, suite.noteID.String()).Return(nil)
	suite.expectPublish()

	service.handleRelease(suite.ctx, suite.noteID, suite.boardID, suite.authorID, conn)

	suite.Len(conn.writes, 1)
	response, ok := conn.writes[0].(DragLockResponse)
	suite.True(ok)
	suite.Equal(WebSocketMessageTypeDragLock, response.Type)
	suite.Equal(DragLockActionRelease, response.Action)
	suite.Equal(suite.noteID, response.NoteID)
	suite.True(response.Success)
	suite.Empty(response.Error)
}

func (suite *NotesServiceTestSuite) Test_handleRelease_Failure() {
	service := suite.service.(*Service)
	conn := &mockWebSocketConnection{}

	suite.mockDB.EXPECT().GetStack(mock.Anything, suite.noteID).
		Return([]DatabaseNote{{ID: suite.noteID, Author: suite.authorID}}, nil)
	suite.mockCache.EXPECT().Delete(mock.Anything, suite.noteID.String()).Return(errors.New("release failed"))

	service.handleRelease(suite.ctx, suite.noteID, suite.boardID, suite.authorID, conn)

	suite.Len(conn.writes, 1)
	response, ok := conn.writes[0].(DragLockResponse)
	suite.True(ok)
	suite.Equal(DragLockActionRelease, response.Action)
	suite.False(response.Success)
	suite.Equal("Lock not owned by user or already released", response.Error)
}

func (suite *NotesServiceTestSuite) Test_handleRelease_WriteJSONError() {
	service := suite.service.(*Service)
	conn := &mockWebSocketConnection{err: errors.New("write failed")}

	suite.mockDB.EXPECT().GetStack(mock.Anything, suite.noteID).
		Return([]DatabaseNote{{ID: suite.noteID, Author: suite.authorID}}, nil)
	suite.mockCache.EXPECT().Delete(mock.Anything, suite.noteID.String()).Return(nil)
	suite.expectPublish()

	service.handleRelease(suite.ctx, suite.noteID, suite.boardID, suite.authorID, conn)

	suite.Len(conn.writes, 1)
	response, ok := conn.writes[0].(DragLockResponse)
	suite.True(ok)
	suite.Equal(DragLockActionRelease, response.Action)
}

func (suite *NotesServiceTestSuite) Test_HandleWebSocketMessage_InvalidJSON() {
	service := suite.service.(*Service)
	conn := &mockWebSocketConnection{}

	service.HandleWebSocketMessage(suite.ctx, suite.boardID, suite.authorID, conn, json.RawMessage("{invalid"))

	suite.Len(conn.writes, 1)
	response, ok := conn.writes[0].(DragLockResponse)
	suite.True(ok)
	suite.Equal(WebSocketMessageTypeDragLock, response.Type)
	suite.Equal("ERROR", response.Action)
	suite.False(response.Success)
	suite.Equal("Invalid message format", response.Error)
}

func (suite *NotesServiceTestSuite) Test_HandleWebSocketMessage_UnknownAction() {
	service := suite.service.(*Service)
	conn := &mockWebSocketConnection{}

	unknownAction := "UNKNOWN"
	payload, err := json.Marshal(DragLockMessage{Action: unknownAction, NoteID: suite.noteID})
	suite.NoError(err)

	service.HandleWebSocketMessage(suite.ctx, suite.boardID, suite.authorID, conn, payload)

	suite.Len(conn.writes, 1)
	response, ok := conn.writes[0].(DragLockResponse)
	suite.True(ok)
	suite.Equal(unknownAction, response.Action)
	suite.Equal(suite.noteID, response.NoteID)
	suite.False(response.Success)
	suite.Equal("Unknown action", response.Error)
}

func (suite *NotesServiceTestSuite) Test_HandleWebSocketMessage_Acquire() {
	service := suite.service.(*Service)
	conn := &mockWebSocketConnection{}

	suite.mockDB.EXPECT().GetStack(mock.Anything, suite.noteID).
		Return([]DatabaseNote{{ID: suite.noteID, Author: suite.authorID}}, nil)
	suite.mockCache.EXPECT().Create(mock.Anything, suite.noteID.String(), suite.authorID.String(), DefaultTTL).Return(nil)
	suite.expectPublish()

	payload, err := json.Marshal(DragLockMessage{Action: DragLockActionAcquire, NoteID: suite.noteID})
	suite.NoError(err)

	service.HandleWebSocketMessage(suite.ctx, suite.boardID, suite.authorID, conn, payload)

	suite.Len(conn.writes, 1)
	response, ok := conn.writes[0].(DragLockResponse)
	suite.True(ok)
	suite.Equal(DragLockActionAcquire, response.Action)
	suite.True(response.Success)
	suite.Empty(response.Error)
}

func (suite *NotesServiceTestSuite) Test_HandleWebSocketMessage_Release() {
	service := suite.service.(*Service)
	conn := &mockWebSocketConnection{}

	suite.mockDB.EXPECT().GetStack(mock.Anything, suite.noteID).
		Return([]DatabaseNote{{ID: suite.noteID, Author: suite.authorID}}, nil)
	suite.mockCache.EXPECT().Delete(mock.Anything, suite.noteID.String()).Return(nil)
	suite.expectPublish()

	payload, err := json.Marshal(DragLockMessage{Action: DragLockActionRelease, NoteID: suite.noteID})
	suite.NoError(err)

	service.HandleWebSocketMessage(suite.ctx, suite.boardID, suite.authorID, conn, payload)

	suite.Len(conn.writes, 1)
	response, ok := conn.writes[0].(DragLockResponse)
	suite.True(ok)
	suite.Equal(DragLockActionRelease, response.Action)
	suite.True(response.Success)
	suite.Empty(response.Error)
}

func (suite *NotesServiceTestSuite) Test_Delete_GetPreconditionError() {
	dbErr := errors.New("database error")

	suite.mockDB.EXPECT().GetPrecondition(mock.Anything, suite.noteID, suite.boardID, suite.authorID).
		Return(Precondition{}, dbErr)

	err := suite.service.Delete(suite.ctx, suite.authorID, NoteDeleteRequest{ID: suite.noteID, Board: suite.boardID, DeleteStack: false})

	suite.Equal(dbErr, err)
}

func (suite *NotesServiceTestSuite) Test_Delete_GetLockError() {
	callerRole := common.OwnerRole

	suite.expectPrecondition(true, callerRole)
	suite.mockCache.EXPECT().Get(mock.Anything, suite.noteID.String()).Return(nil, errors.New("cache unavailable"))

	err := suite.service.Delete(suite.ctx, suite.authorID, NoteDeleteRequest{ID: suite.noteID, Board: suite.boardID, DeleteStack: false})

	suite.Equal(common.InternalServerError, err)
}

func (suite *NotesServiceTestSuite) Test_Delete_LockedByOtherUser() {
	callerRole := common.OwnerRole
	otherUser := uuid.New()

	suite.expectPrecondition(true, callerRole)
	suite.mockCache.EXPECT().Get(mock.Anything, suite.noteID.String()).Return([]byte(`{"user":"`+otherUser.String()+`","createdAt":"2026-03-17T10:00:00Z"}`), nil)

	err := suite.service.Delete(suite.ctx, suite.authorID, NoteDeleteRequest{ID: suite.noteID, Board: suite.boardID, DeleteStack: false})

	suite.Equal(common.ConflictError(errors.New("note is currently locked")), err)
}

func (suite *NotesServiceTestSuite) Test_Delete_DeleteStackGetStackError() {
	callerRole := common.OwnerRole

	suite.expectNoLock()
	suite.expectPrecondition(true, callerRole)
	suite.mockDB.EXPECT().GetStack(mock.Anything, suite.noteID).Return([]DatabaseNote{}, errors.New("stack query failed"))

	err := suite.service.Delete(suite.ctx, suite.authorID, NoteDeleteRequest{ID: suite.noteID, Board: suite.boardID, DeleteStack: true})

	suite.Equal(common.InternalServerError, err)
}

func (suite *NotesServiceTestSuite) Test_Delete_DeleteNoteError() {
	callerRole := common.OwnerRole
	dbErr := errors.New("delete failed")

	suite.expectNoLock()
	suite.expectPrecondition(true, callerRole)
	suite.mockDB.EXPECT().DeleteNote(mock.Anything, suite.authorID, suite.boardID, suite.noteID, false).Return(dbErr)

	err := suite.service.Delete(suite.ctx, suite.authorID, NoteDeleteRequest{ID: suite.noteID, Board: suite.boardID, DeleteStack: false})

	suite.Equal(dbErr, err)
}

func (suite *NotesServiceTestSuite) Test_AcquireLock_GetStackError() {
	suite.mockDB.EXPECT().GetStack(mock.Anything, suite.noteID).Return([]DatabaseNote{}, errors.New("stack query failed"))

	locked := suite.service.AcquireLock(suite.ctx, suite.noteID, suite.authorID, suite.boardID)

	suite.False(locked)
}

func (suite *NotesServiceTestSuite) Test_AcquireLock_CreateError() {
	suite.mockDB.EXPECT().GetStack(mock.Anything, suite.noteID).
		Return([]DatabaseNote{{ID: suite.noteID, Author: suite.authorID}}, nil)
	suite.mockCache.EXPECT().Create(mock.Anything, suite.noteID.String(), suite.authorID.String(), DefaultTTL).
		Return(errors.New("lock exists"))

	locked := suite.service.AcquireLock(suite.ctx, suite.noteID, suite.authorID, suite.boardID)

	suite.False(locked)
}

func (suite *NotesServiceTestSuite) Test_AcquireLock_Success() {
	stackChild := uuid.New()

	suite.mockDB.EXPECT().GetStack(mock.Anything, suite.noteID).
		Return([]DatabaseNote{{ID: suite.noteID, Author: suite.authorID}, {ID: stackChild, Author: suite.authorID}}, nil)
	suite.mockCache.EXPECT().Create(mock.Anything, suite.noteID.String(), suite.authorID.String(), DefaultTTL).Return(nil)
	suite.mockCache.EXPECT().Create(mock.Anything, stackChild.String(), suite.authorID.String(), DefaultTTL).Return(nil)
	suite.expectPublish()

	locked := suite.service.AcquireLock(suite.ctx, suite.noteID, suite.authorID, suite.boardID)

	suite.True(locked)
}

func (suite *NotesServiceTestSuite) Test_ReleaseLock_GetStackError() {
	suite.mockDB.EXPECT().GetStack(mock.Anything, suite.noteID).Return([]DatabaseNote{}, errors.New("stack query failed"))

	released := suite.service.ReleaseLock(suite.ctx, suite.noteID, suite.authorID, suite.boardID)

	suite.False(released)
}

func (suite *NotesServiceTestSuite) Test_ReleaseLock_DeleteError() {
	suite.mockDB.EXPECT().GetStack(mock.Anything, suite.noteID).
		Return([]DatabaseNote{{ID: suite.noteID, Author: suite.authorID}}, nil)
	suite.mockCache.EXPECT().Delete(mock.Anything, suite.noteID.String()).Return(errors.New("delete failed"))

	released := suite.service.ReleaseLock(suite.ctx, suite.noteID, suite.authorID, suite.boardID)

	suite.False(released)
}

func (suite *NotesServiceTestSuite) Test_ReleaseLock_Success() {
	stackChild := uuid.New()

	suite.mockDB.EXPECT().GetStack(mock.Anything, suite.noteID).
		Return([]DatabaseNote{{ID: suite.noteID, Author: suite.authorID}, {ID: stackChild, Author: suite.authorID}}, nil)
	suite.mockCache.EXPECT().Delete(mock.Anything, suite.noteID.String()).Return(nil)
	suite.mockCache.EXPECT().Delete(mock.Anything, stackChild.String()).Return(nil)
	suite.expectPublish()

	released := suite.service.ReleaseLock(suite.ctx, suite.noteID, suite.authorID, suite.boardID)

	suite.True(released)
}

func (suite *NotesServiceTestSuite) Test_GetLock_UnmarshalError() {
	suite.mockCache.EXPECT().Get(mock.Anything, suite.noteID.String()).Return([]byte("not-json"), nil)

	lock, err := suite.service.GetLock(suite.ctx, suite.noteID)

	suite.Nil(lock)
	suite.Error(err)
}

func (suite *NotesServiceTestSuite) Test_IsLocked_GetStackError() {
	suite.mockDB.EXPECT().GetStack(mock.Anything, suite.noteID).Return([]DatabaseNote{}, errors.New("stack query failed"))

	locked := suite.service.IsLocked(suite.ctx, suite.noteID)

	suite.False(locked)
}

func (suite *NotesServiceTestSuite) Test_IsLocked_True() {
	stackChild := uuid.New()

	suite.mockDB.EXPECT().GetStack(mock.Anything, suite.noteID).
		Return([]DatabaseNote{{ID: suite.noteID, Author: suite.authorID}, {ID: stackChild, Author: suite.authorID}}, nil)
	suite.mockCache.EXPECT().Get(mock.Anything, suite.noteID.String()).Return(nil, &cache.KeyNotFound{})
	suite.mockCache.EXPECT().Get(mock.Anything, stackChild.String()).Return([]byte(`{"user":"`+suite.authorID.String()+`","createdAt":"2026-03-17T10:00:00Z"}`), nil)

	locked := suite.service.IsLocked(suite.ctx, suite.noteID)

	suite.True(locked)
}

func (suite *NotesServiceTestSuite) Test_IsLocked_False() {
	stackChild := uuid.New()

	suite.mockDB.EXPECT().GetStack(mock.Anything, suite.noteID).
		Return([]DatabaseNote{{ID: suite.noteID, Author: suite.authorID}, {ID: stackChild, Author: suite.authorID}}, nil)
	suite.mockCache.EXPECT().Get(mock.Anything, suite.noteID.String()).Return(nil, &cache.KeyNotFound{})
	suite.mockCache.EXPECT().Get(mock.Anything, stackChild.String()).Return(nil, errors.New("cache unavailable"))

	locked := suite.service.IsLocked(suite.ctx, suite.noteID)

	suite.False(locked)
}
