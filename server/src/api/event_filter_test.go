package api

import (
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"scrumlr.io/server/common/dto"
	"scrumlr.io/server/database/types"
	"scrumlr.io/server/realtime"
)

var (
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
	boardSettings = &dto.Board{
		ID:                    uuid.New(),
		AccessPolicy:          types.AccessPolicyPublic,
		ShowAuthors:           true,
		ShowNotesOfOtherUsers: true,
		AllowStacking:         true,
	}
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
	aParticipantNote = dto.Note{
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
		Author: ownerBoardSession.User.ID,
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
		boardNotes:        []*dto.Note{&aParticipantNote, &aModeratorNote, &aOwnerNote},
		boardSettings: &dto.Board{
			ShowNotesOfOtherUsers: false,
		},
	}
	boardEvent = &realtime.BoardEvent{
		Type: realtime.BoardEventBoardUpdated,
		Data: boardSettings,
	}
	columnEvent = &realtime.BoardEvent{
		Type: realtime.BoardEventColumnsUpdated,
		Data: []*dto.Column{&aSeeableColumn, &aHiddenColumn},
	}
	noteEvent = &realtime.BoardEvent{
		Type: realtime.BoardEventNotesUpdated,
		Data: []*dto.Note{&aParticipantNote, &aModeratorNote, &aOwnerNote},
	}
	votingID   = uuid.New()
	votingData = &VotingUpdated{
		Notes: []*dto.Note{&aParticipantNote, &aModeratorNote, &aOwnerNote},
		Voting: &dto.Voting{
			ID:                 votingID,
			VoteLimit:          5,
			AllowMultipleVotes: true,
			ShowVotesOfOthers:  false,
			Status:             "CLOSED",
			VotingResults: &dto.VotingResults{
				Total: 5,
				Votes: map[uuid.UUID]dto.VotingResultsPerNote{
					aParticipantNote.ID: {
						Total: 2,
						Users: nil,
					},
					aModeratorNote.ID: {
						Total: 1,
						Users: nil,
					},
					aOwnerNote.ID: {
						Total: 2,
						Users: nil,
					},
				},
			},
		},
	}
	votingEvent = &realtime.BoardEvent{
		Type: realtime.BoardEventVotingUpdated,
		Data: votingData,
	}
	initEvent = InitEvent{
		Type: realtime.BoardEventInit,
		Data: EventData{
			Board:       &dto.Board{},
			Columns:     []*dto.Column{&aSeeableColumn, &aHiddenColumn},
			Notes:       []*dto.Note{&aOwnerNote, &aModeratorNote, &aParticipantNote},
			Votings:     []*dto.Voting{votingData.Voting},
			Votes:       []*dto.Vote{},
			Sessions:    boardSessions,
			Requests:    []*dto.BoardSessionRequest{},
			Assignments: []*dto.Assignment{},
		},
	}
)

func TestEventFilter(t *testing.T) {
	t.Run("TestIsOwnerModerator", testIsOwnerModerator)
	t.Run("TestIsModModerator", testIsModModerator)
	t.Run("TestIsParticipantModerator", testIsParticipantModerator)
	t.Run("TestIsUnknownUuidModerator", testIsUnknownUuidModerator)
	t.Run("TestParseBoardSettingsData", testParseBoardSettingsData)
	t.Run("TestParseColumnData", testParseColumnData)
	t.Run("TestParseNoteData", testParseNoteData)
	t.Run("TestParseVotingData", testParseVotingData)
	t.Run("TestFilterColumnsAsOwner", testColumnFilterAsOwner)
	t.Run("TestFilterColumnsAsModerator", testColumnFilterAsModerator)
	t.Run("TestFilterColumnsAsParticipant", testColumnFilterAsParticipant)
	t.Run("TestFilterNotesAsOwner", testNoteFilterAsOwner)
	t.Run("TestFilterNotesAsModerator", testNoteFilterAsModerator)
	t.Run("TestFilterNotesAsParticipant", testNoteFilterAsParticipant)
	t.Run("TestFilterVotingUpdatedAsOwner", testFilterVotingUpdatedAsOwner)
	t.Run("TestFilterVotingUpdatedAsModerator", testFilterVotingUpdatedAsModerator)
	t.Run("TestFilterVotingUpdatedAsParticipant", testFilterVotingUpdatedAsParticipant)
	t.Run("TestInitEventAsOwner", testInitFilterAsOwner)
	t.Run("TestInitEventAsModerator", testInitFilterAsModerator)
	t.Run("TestInitEventAsParticipant", testInitFilterAsParticipant)

}

func testIsModModerator(t *testing.T) {
	isMod := isModerator(moderatorBoardSession.User.ID, boardSessions)

	assert.NotNil(t, isMod)
	assert.True(t, isMod)
	assert.Equal(t, types.SessionRoleModerator, moderatorBoardSession.Role)
}

func testIsOwnerModerator(t *testing.T) {
	isMod := isModerator(ownerBoardSession.User.ID, boardSessions)

	assert.NotNil(t, isMod)
	assert.True(t, isMod)
	assert.Equal(t, types.SessionRoleOwner, ownerBoardSession.Role)
}

func testIsParticipantModerator(t *testing.T) {
	isMod := isModerator(participantBoardSession.User.ID, boardSessions)

	assert.NotNil(t, isMod)
	assert.False(t, isMod)
}

func testIsUnknownUuidModerator(t *testing.T) {
	isMod := isModerator(uuid.New(), boardSessions)

	assert.NotNil(t, isMod)
	assert.False(t, isMod)
}

func testParseBoardSettingsData(t *testing.T) {
	expectedBoardSettings := boardSettings
	actualBoardSettings, err := parseBoardUpdated(boardEvent.Data)

	assert.Nil(t, err)
	assert.NotNil(t, actualBoardSettings)
	assert.Equal(t, expectedBoardSettings, actualBoardSettings)
}

func testParseColumnData(t *testing.T) {
	expectedColumns := []*dto.Column{&aSeeableColumn, &aHiddenColumn}
	actualColumns, err := parseColumnUpdated(columnEvent.Data)

	assert.Nil(t, err)
	assert.NotNil(t, actualColumns)
	assert.Equal(t, expectedColumns, actualColumns)
}

func testParseNoteData(t *testing.T) {
	expectedNotes := []*dto.Note{&aParticipantNote, &aModeratorNote, &aOwnerNote}
	actualNotes, err := parseNotesUpdated(noteEvent.Data)

	assert.Nil(t, err)
	assert.NotNil(t, actualNotes)
	assert.Equal(t, expectedNotes, actualNotes)
}

func testParseVotingData(t *testing.T) {
	expectedVoting := votingData
	actualVoting, err := parseVotingUpdated(votingEvent.Data)

	assert.Nil(t, err)
	assert.NotNil(t, actualVoting)
	assert.Equal(t, expectedVoting, actualVoting)
}

func testColumnFilterAsParticipant(t *testing.T) {
	expectedColumnEvent := &realtime.BoardEvent{
		Type: realtime.BoardEventColumnsUpdated,
		Data: []*dto.Column{&aSeeableColumn},
	}
	returnedColumnEvent := boardSub.eventFilter(columnEvent, participantBoardSession.User.ID)

	assert.Equal(t, expectedColumnEvent, returnedColumnEvent)
}

func testColumnFilterAsOwner(t *testing.T) {
	expectedColumnEvent := &realtime.BoardEvent{
		Type: realtime.BoardEventColumnsUpdated,
		Data: []*dto.Column{&aSeeableColumn, &aHiddenColumn},
	}
	returnedColumnEvent := boardSub.eventFilter(columnEvent, ownerBoardSession.User.ID)

	assert.Equal(t, expectedColumnEvent, returnedColumnEvent)
}

func testColumnFilterAsModerator(t *testing.T) {
	expectedColumnEvent := &realtime.BoardEvent{
		Type: realtime.BoardEventColumnsUpdated,
		Data: []*dto.Column{&aSeeableColumn, &aHiddenColumn},
	}

	returnedColumnEvent := boardSub.eventFilter(columnEvent, moderatorBoardSession.User.ID)

	assert.Equal(t, expectedColumnEvent, returnedColumnEvent)
}

func testNoteFilterAsParticipant(t *testing.T) {
	expectedNoteEvent := &realtime.BoardEvent{
		Type: realtime.BoardEventNotesUpdated,
		Data: []*dto.Note{&aParticipantNote},
	}
	returnedNoteEvent := boardSub.eventFilter(noteEvent, participantBoardSession.User.ID)

	assert.Equal(t, expectedNoteEvent, returnedNoteEvent)
}

func testNoteFilterAsOwner(t *testing.T) {
	expectedNoteEvent := &realtime.BoardEvent{
		Type: realtime.BoardEventNotesUpdated,
		Data: []*dto.Note{&aParticipantNote, &aModeratorNote, &aOwnerNote},
	}
	returnedNoteEvent := boardSub.eventFilter(noteEvent, ownerBoardSession.User.ID)

	assert.Equal(t, expectedNoteEvent, returnedNoteEvent)
}

func testNoteFilterAsModerator(t *testing.T) {
	expectedNoteEvent := &realtime.BoardEvent{
		Type: realtime.BoardEventNotesUpdated,
		Data: []*dto.Note{&aParticipantNote, &aModeratorNote, &aOwnerNote},
	}
	returnedNoteEvent := boardSub.eventFilter(noteEvent, moderatorBoardSession.User.ID)

	assert.Equal(t, expectedNoteEvent, returnedNoteEvent)
}

func testFilterVotingUpdatedAsOwner(t *testing.T) {
	expectedVotingEvent := &realtime.BoardEvent{
		Type: realtime.BoardEventVotingUpdated,
		Data: votingData,
	}
	returnedVoteEvent := boardSub.eventFilter(votingEvent, ownerBoardSession.User.ID)

	assert.NotNil(t, returnedVoteEvent)
	assert.Equal(t, expectedVotingEvent, returnedVoteEvent)
}

func testFilterVotingUpdatedAsModerator(t *testing.T) {
	expectedVotingEvent := &realtime.BoardEvent{
		Type: realtime.BoardEventVotingUpdated,
		Data: votingData,
	}
	returnedVoteEvent := boardSub.eventFilter(votingEvent, moderatorBoardSession.User.ID)

	assert.NotNil(t, returnedVoteEvent)
	assert.Equal(t, expectedVotingEvent, returnedVoteEvent)
}

func testFilterVotingUpdatedAsParticipant(t *testing.T) {
	expectedVoting := &VotingUpdated{
		Notes: []*dto.Note{&aParticipantNote},
		Voting: &dto.Voting{
			ID:                 votingID,
			VoteLimit:          5,
			AllowMultipleVotes: true,
			ShowVotesOfOthers:  false,
			Status:             "CLOSED",
			VotingResults: &dto.VotingResults{
				Total: 2,
				Votes: map[uuid.UUID]dto.VotingResultsPerNote{
					aParticipantNote.ID: {
						Total: 2,
						Users: nil,
					},
				},
			},
		},
	}
	expectedVotingEvent := &realtime.BoardEvent{
		Type: realtime.BoardEventVotingUpdated,
		Data: expectedVoting,
	}
	returnedVoteEvent := boardSub.eventFilter(votingEvent, participantBoardSession.User.ID)

	assert.NotNil(t, returnedVoteEvent)
	assert.Equal(t, expectedVotingEvent, returnedVoteEvent)
}

func testInitFilterAsOwner(t *testing.T) {
	expectedInitEvent := initEvent
	returnedInitEvent := eventInitFilter(initEvent, ownerBoardSession.User.ID)

	assert.Equal(t, expectedInitEvent, returnedInitEvent)
}

func testInitFilterAsModerator(t *testing.T) {
	expectedInitEvent := initEvent
	returnedInitEvent := eventInitFilter(initEvent, moderatorBoardSession.User.ID)

	assert.Equal(t, expectedInitEvent, returnedInitEvent)
}

func testInitFilterAsParticipant(t *testing.T) {
	expectedVoting := dto.Voting{
		ID:                 votingID,
		VoteLimit:          5,
		AllowMultipleVotes: true,
		ShowVotesOfOthers:  false,
		Status:             "CLOSED",
		VotingResults: &dto.VotingResults{
			Total: 2,
			Votes: map[uuid.UUID]dto.VotingResultsPerNote{
				aParticipantNote.ID: {
					Total: 2,
					Users: nil,
				},
			},
		},
	}
	expectedInitEvent := InitEvent{
		Type: realtime.BoardEventInit,
		Data: EventData{
			Board:       &dto.Board{},
			Columns:     []*dto.Column{&aSeeableColumn},
			Notes:       []*dto.Note{&aParticipantNote},
			Votings:     []*dto.Voting{&expectedVoting},
			Votes:       []*dto.Vote{},
			Sessions:    boardSessions,
			Requests:    []*dto.BoardSessionRequest{},
			Assignments: []*dto.Assignment{},
		},
	}
	returnedInitEvent := eventInitFilter(initEvent, participantBoardSession.User.ID)

	assert.Equal(t, expectedInitEvent, returnedInitEvent)
}
