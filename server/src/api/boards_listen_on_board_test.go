package api

import (
	"sort"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"scrumlr.io/server/common/dto"
	"scrumlr.io/server/database/types"
	"scrumlr.io/server/realtime"
)

var (
	// Test data for event filter helper functions
	moderatorBoardSession = dto.BoardSession{
		User: dto.User{ID: uuid.New()},
		Role: types.SessionRoleModerator,
	}
	ownerBoardSession = dto.BoardSession{
		User: dto.User{ID: uuid.New()},
		Role: types.SessionRoleOwner,
	}
	participantBoardSession = dto.BoardSession{
		User: dto.User{ID: uuid.New()},
		Role: types.SessionRoleParticipant,
	}
	boardSessions = []*dto.BoardSession{
		&participantBoardSession,
		&ownerBoardSession,
		&moderatorBoardSession,
	}
	clients = []client{
		{userID: participantBoardSession.User.ID, conn: nil, role: types.SessionRoleParticipant},
		{userID: ownerBoardSession.User.ID, conn: nil, role: types.SessionRoleOwner},
		{userID: moderatorBoardSession.User.ID, conn: nil, role: types.SessionRoleModerator},
	}

	// Test data for event filtering
	aSeeableColumn = dto.Column{
		ID:      uuid.New(),
		Name:    "Main Thread",
		Color:   "backlog-blue",
		Visible: true,
		Index:   0,
	}
	aModeratorNote = dto.Note{
		ID:     uuid.New(),
		Author: moderatorBoardSession.User.ID,
		Text:   "Moderator Text",
		Position: dto.NotePosition{
			Column: aSeeableColumn.ID,
			Stack:  uuid.NullUUID{},
			Rank:   1,
		},
	}
	aUserNote = dto.Note{
		ID:     uuid.New(),
		Author: participantBoardSession.User.ID,
		Text:   "User Text",
		Position: dto.NotePosition{
			Column: aSeeableColumn.ID,
			Stack:  uuid.NullUUID{},
			Rank:   0,
		},
	}
	aHiddenColumn = dto.Column{
		ID:      uuid.New(),
		Name:    "Lean Coffee",
		Color:   "poker-purple",
		Visible: false,
		Index:   1,
	}
	aOwnerNote = dto.Note{
		ID:     uuid.New(),
		Author: participantBoardSession.User.ID,
		Text:   "Owner Text",
		Position: dto.NotePosition{
			Column: aHiddenColumn.ID,
			Rank:   1,
			Stack:  uuid.NullUUID{},
		},
	}

	boardSub = &BoardSubscription{
		boardParticipants: []*dto.BoardSession{&moderatorBoardSession, &ownerBoardSession, &participantBoardSession},
		boardColumns:      []*dto.Column{&aSeeableColumn, &aHiddenColumn},
		boardNotes:        []*dto.Note{&aUserNote, &aModeratorNote, &aOwnerNote},
		boardSettings: &dto.Board{
			ShowNotesOfOtherUsers: false,
		},
	}

	columnEvent = &realtime.BoardEvent{
		Type: realtime.BoardEventColumnsUpdated,
		Data: []*dto.Column{&aSeeableColumn, &aHiddenColumn},
	}

	noteEvent = &realtime.BoardEvent{
		Type: realtime.BoardEventNotesUpdated,
		Data: []*dto.Note{&aUserNote, &aModeratorNote, &aOwnerNote},
	}
)

func TestEventFilter(t *testing.T) {
	t.Run("TestModIsModerator", testIsModModerator)
	t.Run("TestOwnerIsModerator", testIsOwnerAlsoModerator)
	t.Run("TestIsNotModerator", testIsNotModerator)
	t.Run("TestSortSessions", testSortSessions)
	t.Run("TestParseColumns", testParseColumn)
	t.Run("TestParseNotes", testParseNote)
	t.Run("TestFilterColumnsAsParticipant", testColumnFilterAsParticipant)
	t.Run("TestFilterColumnsAsOwner", testColumnFilterAsOwner)
	t.Run("TestFilterColumnsAsModerator", testColumnFilterAsModerator)
	t.Run("TestFilterNotesAsParticipant", testNoteFilterAsParticipant)
	t.Run("TestFilterNotesAsOwner", testNoteFilterAsOwner)
	t.Run("TestFilterNotesAsModerator", testNoteFilterAsModerator)
	t.Run("TestFilterNotesWithNonExistingUUID", testNoteFilterWithNonExistingUUID)
}

func testIsModModerator(t *testing.T) {
	isMod := isModerator(moderatorBoardSession.User.ID, boardSessions)

	assert.NotNil(t, isMod)
	assert.True(t, isMod)
	assert.Equal(t, types.SessionRoleModerator, moderatorBoardSession.Role)
}

func testIsOwnerAlsoModerator(t *testing.T) {
	isMod := isModerator(ownerBoardSession.User.ID, boardSessions)

	assert.NotNil(t, isMod)
	assert.True(t, isMod)
	assert.Equal(t, types.SessionRoleOwner, ownerBoardSession.Role)
}

func testIsNotModerator(t *testing.T) {
	isMod := isModerator(uuid.New(), boardSessions)

	assert.NotNil(t, isMod)
	assert.False(t, isMod)
}

func testSortSessions(t *testing.T) {
	expected := []client{
		{userID: moderatorBoardSession.User.ID, conn: nil, role: types.SessionRoleModerator},
		{userID: ownerBoardSession.User.ID, conn: nil, role: types.SessionRoleOwner},
		{userID: participantBoardSession.User.ID, conn: nil, role: types.SessionRoleParticipant},
	}

	sort.Sort(ByRole(clients))
	assert.Equal(t, expected, clients)
}

func testParseColumn(t *testing.T) {
	expectedColumns := []*dto.Column{&aSeeableColumn, &aHiddenColumn}
	actualColumns, err := parseColumnUpdatedEvent(columnEvent.Data)

	assert.Nil(t, err)
	assert.NotNil(t, actualColumns)
	assert.Equal(t, expectedColumns, actualColumns)
}

func testParseNote(t *testing.T) {
	expectedNotes := []*dto.Note{&aUserNote, &aModeratorNote, &aOwnerNote}
	actualNotes, err := parseNotesUpdated(noteEvent.Data)

	assert.Nil(t, err)
	assert.NotNil(t, actualNotes)
	assert.Equal(t, expectedNotes, actualNotes)
}

func testColumnFilterAsParticipant(t *testing.T) {
	expectedFilteredColumns := []*dto.Column{&aSeeableColumn}
	returnedColumnEvent := boardSub.eventFilter(columnEvent, participantBoardSession.User.ID)

	assert.Equal(t, expectedFilteredColumns, returnedColumnEvent.Data)
}
func testColumnFilterAsOwner(t *testing.T) {
	expectedFilteredColumns := []*dto.Column{&aSeeableColumn, &aHiddenColumn}
	returnedColumnEvent := boardSub.eventFilter(columnEvent, ownerBoardSession.User.ID)

	assert.Equal(t, expectedFilteredColumns, returnedColumnEvent.Data)
}
func testColumnFilterAsModerator(t *testing.T) {
	expectedFilteredColumns := []*dto.Column{&aSeeableColumn, &aHiddenColumn}
	returnedColumnEvent := boardSub.eventFilter(columnEvent, moderatorBoardSession.User.ID)

	assert.Equal(t, expectedFilteredColumns, returnedColumnEvent.Data)
}

func testNoteFilterAsParticipant(t *testing.T) {
	expectedNotes := []*dto.Note{&aUserNote}
	returnedNoteEvent := boardSub.eventFilter(noteEvent, participantBoardSession.User.ID)

	assert.Equal(t, expectedNotes, returnedNoteEvent.Data)
}
func testNoteFilterAsOwner(t *testing.T) {
	expectedNotes := []*dto.Note{&aUserNote, &aModeratorNote, &aOwnerNote}
	returnedNoteEvent := boardSub.eventFilter(noteEvent, ownerBoardSession.User.ID)

	assert.Equal(t, expectedNotes, returnedNoteEvent.Data)
}
func testNoteFilterAsModerator(t *testing.T) {
	expectedNotes := []*dto.Note{&aUserNote, &aModeratorNote, &aOwnerNote}
	returnedNoteEvent := boardSub.eventFilter(noteEvent, moderatorBoardSession.User.ID)

	assert.Equal(t, expectedNotes, returnedNoteEvent.Data)
}
func testNoteFilterWithNonExistingUUID(t *testing.T) {
	expectedNotes := []*dto.Note{}
	returnedNoteEvent := boardSub.eventFilter(noteEvent, uuid.New())

	assert.Equal(t, expectedNotes, returnedNoteEvent.Data)
}
