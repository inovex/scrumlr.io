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

func TestEventFilter(t *testing.T) {
	t.Run("TestModIsModerator", testIsModModerator)
	t.Run("TestOwnerIsModerator", testIsOwnerAlsoModerator)
	t.Run("TestIsNotModerator", testIsNotModerator)
	t.Run("TestSortSessions", testSortSessions)
	t.Run("TestParseColumns", testParseColumn)
	t.Run("TestParseNotes", testParseNote)
	t.Run("TestFilterColumns", testColumnFilter)
	t.Run("TestFilterNotes", testNoteFilter)
}

var (
	moderatorID = uuid.New()
	moderator   = dto.BoardSession{
		User: dto.User{ID: moderatorID},
		Role: types.SessionRoleModerator,
	}
	ownerID = uuid.New()
	owner   = dto.BoardSession{
		User: dto.User{ID: ownerID},
		Role: types.SessionRoleOwner,
	}

	sessions = []*dto.BoardSession{
		{User: dto.User{ID: uuid.New()}, Role: types.SessionRoleParticipant},
		{User: dto.User{ID: uuid.New()}, Role: types.SessionRoleParticipant},
		&owner,
		{User: dto.User{ID: uuid.New()}, Role: types.SessionRoleParticipant},
		&moderator,
	}
)

func testIsModModerator(t *testing.T) {
	isMod := isModerator(moderatorID, sessions)

	assert.NotNil(t, isMod)
	assert.True(t, isMod)
	assert.Equal(t, types.SessionRoleModerator, moderator.Role)
}

func testIsOwnerAlsoModerator(t *testing.T) {
	isMod := isModerator(ownerID, sessions)

	assert.NotNil(t, isMod)
	assert.True(t, isMod)
	assert.Equal(t, types.SessionRoleOwner, owner.Role)
}

func testIsNotModerator(t *testing.T) {
	isMod := isModerator(uuid.New(), sessions)

	assert.NotNil(t, isMod)
	assert.False(t, isMod)

}

var (
	participantID, _ = uuid.Parse("3113b096-986c-4e23-adf7-b3fa19224bd2")
	uIdTwo, _        = uuid.Parse("3113b096-986c-4e23-adf7-b3fa19224bd3")
	uIdThree, _      = uuid.Parse("3113b096-986c-4e23-adf7-b3fa19224bd4")

	clients = []client{
		{userID: participantID, conn: nil, role: types.SessionRoleParticipant},
		{userID: uIdTwo, conn: nil, role: types.SessionRoleOwner},
		{userID: uIdThree, conn: nil, role: types.SessionRoleModerator},
	}

	expected = []client{
		{userID: uIdThree, conn: nil, role: types.SessionRoleModerator},
		{userID: uIdTwo, conn: nil, role: types.SessionRoleOwner},
		{userID: participantID, conn: nil, role: types.SessionRoleParticipant},
	}
)

func testSortSessions(t *testing.T) {
	sort.Sort(ByRole(clients))

	assert.Equal(t, expected, clients)
}

// Test EventFilter
var (
	columnID, _ = uuid.Parse("90dfa512-2b5c-42ea-9c98-3cc3ff8922Cc")
	aColumn     = dto.Column{
		ID:      columnID,
		Name:    "Lean Coffee",
		Color:   "backlog-blue",
		Visible: false,
		Index:   0,
	}

	columnIDSeeable, _ = uuid.Parse("90dfa512-2b5c-42ea-9c98-3cc3ff8922ff")
	aSeeableColumn     = dto.Column{
		ID:      columnIDSeeable,
		Name:    "Main Thread",
		Color:   "backlog-blue",
		Visible: true,
		Index:   1,
	}

	boardSub = &BoardSubscription{
		boardParticipants: []*dto.BoardSession{},
		boardColumns:      []*dto.Column{&aSeeableColumn},
		boardNotes:        []*dto.Note{},
		boardSettings: &dto.Board{
			ShowNotesOfOtherUsers: false,
		},
	}

	columnEvent = &realtime.BoardEvent{
		Type: realtime.BoardEventColumnsUpdated,
		Data: []dto.Column{aColumn},
	}

	expectedFilteredColumn = &realtime.BoardEvent{
		Type: realtime.BoardEventColumnsUpdated,
		Data: []*dto.Column{},
	}

	noteID, _ = uuid.Parse("90dfa512-2b5c-42ea-9c98-3cc3ff8922CN")
	aNote     = dto.Note{
		ID:     noteID,
		Author: participantID,
		Text:   "Hello World",
		Position: dto.NotePosition{
			Column: columnID,
		},
	}
	noteEvent = &realtime.BoardEvent{
		Type: realtime.BoardEventNotesUpdated,
		Data: []dto.Note{aNote},
	}

	expectedFilteredNotes = &realtime.BoardEvent{
		Type: realtime.BoardEventNotesUpdated,
		Data: []*dto.Note{},
	}
)

func testParseColumn(t *testing.T) {
	parsedColumns, err := parseColumnUpdatedEvent(columnEvent.Data)

	assert.Nil(t, err)
	assert.Equal(t, []*dto.Column{&aColumn}, parsedColumns)
}

func testParseNote(t *testing.T) {
	parsedNotes, err := parseNotesUpdated(noteEvent.Data)

	assert.Nil(t, err)
	assert.Equal(t, []*dto.Note{&aNote}, parsedNotes)
}

func testColumnFilter(t *testing.T) {
	filteredColumns := boardSub.eventFilter(columnEvent, participantID)

	assert.Equal(t, expectedFilteredColumn, filteredColumns)
}

func testNoteFilter(t *testing.T) {
	filteredNotes := boardSub.eventFilter(noteEvent, uuid.New())

	assert.Equal(t, expectedFilteredNotes, filteredNotes)
}
