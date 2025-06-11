package api

import (
	"math/rand"
	"scrumlr.io/server/sessions"
	"testing"

	"scrumlr.io/server/boards"
	"scrumlr.io/server/common"
	"scrumlr.io/server/votings"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"scrumlr.io/server/columns"
	"scrumlr.io/server/notes"
	"scrumlr.io/server/realtime"
	"scrumlr.io/server/sessionrequests"
	"scrumlr.io/server/technical_helper"
	"scrumlr.io/server/users"
)

var (
	moderatorUser = users.User{
		ID: uuid.New(),
	}
	ownerUser = users.User{
		ID: uuid.New(),
	}
	participantUser = users.User{
		ID:          uuid.New(),
		AccountType: common.Anonymous,
	}
	moderatorBoardSession = sessions.BoardSession{
		User: moderatorUser.ID,
		Role: common.ModeratorRole,
	}
	ownerBoardSession = sessions.BoardSession{
		User: ownerUser.ID,
		Role: common.OwnerRole,
	}
	participantBoardSession = sessions.BoardSession{
		User: participantUser.ID,
		Role: common.ParticipantRole,
	}
	boardSessions = []*sessions.BoardSession{
		&participantBoardSession,
		&ownerBoardSession,
		&moderatorBoardSession,
	}
	boardSettings = &boards.Board{
		ID:                    uuid.New(),
		AccessPolicy:          boards.Public,
		ShowAuthors:           true,
		ShowNotesOfOtherUsers: true,
		AllowStacking:         true,
	}
	aSeeableColumn = columns.Column{
		ID:      uuid.New(),
		Name:    "Main Thread",
		Color:   "backlog-blue",
		Visible: true,
		Index:   0,
	}
	aModeratorNote = notes.Note{
		ID:     uuid.New(),
		Author: moderatorUser.ID,
		Text:   "Moderator Text",
		Position: notes.NotePosition{
			Column: aSeeableColumn.ID,
			Stack:  uuid.NullUUID{},
			Rank:   1,
		},
	}
	aParticipantNote = notes.Note{
		ID:     uuid.New(),
		Author: participantUser.ID,
		Text:   "User Text",
		Position: notes.NotePosition{
			Column: aSeeableColumn.ID,
			Stack:  uuid.NullUUID{},
			Rank:   0,
		},
	}
	aHiddenColumn = columns.Column{
		ID:      uuid.New(),
		Name:    "Lean Coffee",
		Color:   "poker-purple",
		Visible: false,
		Index:   1,
	}
	aOwnerNote = notes.Note{
		ID:     uuid.New(),
		Author: ownerUser.ID,
		Text:   "Owner Text",
		Position: notes.NotePosition{
			Column: aHiddenColumn.ID,
			Rank:   1,
			Stack:  uuid.NullUUID{},
		},
	}
	boardSub = &BoardSubscription{
		boardParticipants: []*sessions.BoardSession{&moderatorBoardSession, &ownerBoardSession, &participantBoardSession},
		boardColumns:      []*columns.Column{&aSeeableColumn, &aHiddenColumn},
		boardNotes:        []*notes.Note{&aParticipantNote, &aModeratorNote, &aOwnerNote},
		boardSettings: &boards.Board{
			ShowNotesOfOtherUsers: false,
		},
	}
	boardEvent = &realtime.BoardEvent{
		Type: realtime.BoardEventBoardUpdated,
		Data: boardSettings,
	}
	columnEvent = &realtime.BoardEvent{
		Type: realtime.BoardEventColumnsUpdated,
		Data: []*columns.Column{&aSeeableColumn, &aHiddenColumn},
	}
	noteEvent = &realtime.BoardEvent{
		Type: realtime.BoardEventNotesUpdated,
		Data: []*notes.Note{&aParticipantNote, &aModeratorNote, &aOwnerNote},
	}
	votingID   = uuid.New()
	votingData = &votings.VotingUpdated{
		Notes: []uuid.UUID{aParticipantNote.ID, aModeratorNote.ID, aOwnerNote.ID},
		Voting: &votings.Voting{
			ID:                 votingID,
			VoteLimit:          5,
			AllowMultipleVotes: true,
			ShowVotesOfOthers:  false,
			Status:             "CLOSED",
			VotingResults: &votings.VotingResults{
				Total: 5,
				Votes: map[uuid.UUID]votings.VotingResultsPerNote{
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
		Data: boards.FullBoard{
			Board:                &boards.Board{},
			Columns:              []*columns.Column{&aSeeableColumn, &aHiddenColumn},
			Notes:                []*notes.Note{&aOwnerNote, &aModeratorNote, &aParticipantNote},
			Votings:              []*votings.Voting{votingData.Voting},
			Votes:                []*votings.Vote{},
			BoardSessions:        boardSessions,
			BoardSessionRequests: []*sessionrequests.BoardSessionRequest{},
		},
	}
)

func getUserById(id uuid.UUID) users.User {
	if ownerUser.ID == id {
		return ownerUser
	} else if participantUser.ID == id {
		return participantUser
	} else if moderatorUser.ID == id {
		return moderatorUser
	}
	return users.User{}
}

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
	t.Run("TestRaiseHandShouldBeUpdatedAfterParticipantUpdated", testRaiseHandShouldBeUpdatedAfterParticipantUpdated)
	t.Run("TestParticipantUpdatedShouldHandleError", testParticipantUpdatedShouldHandleError)
}

func testRaiseHandShouldBeUpdatedAfterParticipantUpdated(t *testing.T) {

	originalParticipantSession := technical_helper.Filter(boardSub.boardParticipants, func(session *sessions.BoardSession) bool {
		user := getUserById(session.User)
		return user.AccountType == common.Anonymous
	})[0]

	updateEvent := &realtime.BoardEvent{
		Type: realtime.BoardEventParticipantUpdated,
		Data: sessions.BoardSession{
			RaisedHand: true,
			User:       originalParticipantSession.User,
			Role:       common.ParticipantRole,
		},
	}

	isUpdated := boardSub.participantUpdated(updateEvent, true)

	updatedParticipantSession := technical_helper.Filter(boardSub.boardParticipants, func(session *sessions.BoardSession) bool {
		user := getUserById(session.User)
		return user.AccountType == common.Anonymous
	})[0]

	assert.Equal(t, true, isUpdated)
	assert.Equal(t, false, originalParticipantSession.RaisedHand)
	assert.Equal(t, true, updatedParticipantSession.RaisedHand)
}

func testParticipantUpdatedShouldHandleError(t *testing.T) {

	updateEvent := &realtime.BoardEvent{
		Type: realtime.BoardEventParticipantUpdated,
		Data: "SHOULD FAIL",
	}

	isUpdated := boardSub.participantUpdated(updateEvent, true)

	assert.Equal(t, false, isUpdated)
}

func testIsModModerator(t *testing.T) {
	isMod := sessions.CheckSessionRole(moderatorBoardSession.User, boardSessions, []common.SessionRole{common.ModeratorRole, common.OwnerRole})

	assert.NotNil(t, isMod)
	assert.True(t, isMod)
	assert.Equal(t, common.ModeratorRole, moderatorBoardSession.Role)
}

func testIsOwnerModerator(t *testing.T) {
	isMod := sessions.CheckSessionRole(ownerBoardSession.User, boardSessions, []common.SessionRole{common.ModeratorRole, common.OwnerRole})

	assert.NotNil(t, isMod)
	assert.True(t, isMod)
	assert.Equal(t, common.OwnerRole, ownerBoardSession.Role)
}

func testIsParticipantModerator(t *testing.T) {
	isMod := sessions.CheckSessionRole(participantBoardSession.User, boardSessions, []common.SessionRole{common.ModeratorRole, common.OwnerRole})

	assert.NotNil(t, isMod)
	assert.False(t, isMod)
}

func testIsUnknownUuidModerator(t *testing.T) {
	isMod := sessions.CheckSessionRole(uuid.New(), boardSessions, []common.SessionRole{common.ModeratorRole, common.OwnerRole})

	assert.NotNil(t, isMod)
	assert.False(t, isMod)
}

func testParseBoardSettingsData(t *testing.T) {
	expectedBoardSettings := boardSettings
	actualBoardSettings, err := technical_helper.Unmarshal[boards.Board](boardEvent.Data)

	assert.Nil(t, err)
	assert.NotNil(t, actualBoardSettings)
	assert.Equal(t, expectedBoardSettings, actualBoardSettings)
}

func testParseColumnData(t *testing.T) {
	expectedColumns := []*columns.Column{&aSeeableColumn, &aHiddenColumn}
	actualColumns, err := technical_helper.UnmarshalSlice[columns.Column](columnEvent.Data)

	assert.Nil(t, err)
	assert.NotNil(t, actualColumns)
	assert.Equal(t, expectedColumns, actualColumns)
}

func testParseNoteData(t *testing.T) {
	expectedNotes := []*notes.Note{&aParticipantNote, &aModeratorNote, &aOwnerNote}
	actualNotes, err := technical_helper.UnmarshalSlice[notes.Note](noteEvent.Data)

	assert.Nil(t, err)
	assert.NotNil(t, actualNotes)
	assert.Equal(t, expectedNotes, actualNotes)
}

func testParseVotingData(t *testing.T) {
	expectedVoting := votingData
	actualVoting, err := technical_helper.Unmarshal[votings.VotingUpdated](votingEvent.Data)

	assert.Nil(t, err)
	assert.NotNil(t, actualVoting)
	assert.Equal(t, expectedVoting, actualVoting)
}

func testColumnFilterAsParticipant(t *testing.T) {
	expectedColumnEvent := &realtime.BoardEvent{
		Type: realtime.BoardEventColumnsUpdated,
		Data: []*columns.Column{&aSeeableColumn},
	}
	returnedColumnEvent := boardSub.eventFilter(columnEvent, participantBoardSession.User)

	assert.Equal(t, expectedColumnEvent, returnedColumnEvent)
}

func testColumnFilterAsOwner(t *testing.T) {
	expectedColumnEvent := &realtime.BoardEvent{
		Type: realtime.BoardEventColumnsUpdated,
		Data: []*columns.Column{&aSeeableColumn, &aHiddenColumn},
	}
	returnedColumnEvent := boardSub.eventFilter(columnEvent, ownerBoardSession.User)

	assert.Equal(t, expectedColumnEvent, returnedColumnEvent)
}

func testColumnFilterAsModerator(t *testing.T) {
	expectedColumnEvent := &realtime.BoardEvent{
		Type: realtime.BoardEventColumnsUpdated,
		Data: []*columns.Column{&aSeeableColumn, &aHiddenColumn},
	}

	returnedColumnEvent := boardSub.eventFilter(columnEvent, moderatorBoardSession.User)

	assert.Equal(t, expectedColumnEvent, returnedColumnEvent)
}

func testNoteFilterAsParticipant(t *testing.T) {
	expectedNoteEvent := &realtime.BoardEvent{
		Type: realtime.BoardEventNotesUpdated,
		Data: notes.NoteSlice{&aParticipantNote},
	}
	returnedNoteEvent := boardSub.eventFilter(noteEvent, participantBoardSession.User)

	assert.Equal(t, expectedNoteEvent, returnedNoteEvent)
}

func testNoteFilterAsOwner(t *testing.T) {
	expectedNoteEvent := &realtime.BoardEvent{
		Type: realtime.BoardEventNotesUpdated,
		Data: []*notes.Note{&aParticipantNote, &aModeratorNote, &aOwnerNote},
	}
	returnedNoteEvent := boardSub.eventFilter(noteEvent, ownerBoardSession.User)

	assert.Equal(t, expectedNoteEvent, returnedNoteEvent)
}

func testNoteFilterAsModerator(t *testing.T) {
	expectedNoteEvent := &realtime.BoardEvent{
		Type: realtime.BoardEventNotesUpdated,
		Data: []*notes.Note{&aParticipantNote, &aModeratorNote, &aOwnerNote},
	}
	returnedNoteEvent := boardSub.eventFilter(noteEvent, moderatorBoardSession.User)

	assert.Equal(t, expectedNoteEvent, returnedNoteEvent)
}

func testFilterVotingUpdatedAsOwner(t *testing.T) {
	expectedVotingEvent := &realtime.BoardEvent{
		Type: realtime.BoardEventVotingUpdated,
		Data: votingData,
	}
	returnedVoteEvent := boardSub.eventFilter(votingEvent, ownerBoardSession.User)

	assert.NotNil(t, returnedVoteEvent)
	assert.Equal(t, expectedVotingEvent, returnedVoteEvent)
}

func testFilterVotingUpdatedAsModerator(t *testing.T) {
	expectedVotingEvent := &realtime.BoardEvent{
		Type: realtime.BoardEventVotingUpdated,
		Data: votingData,
	}
	returnedVoteEvent := boardSub.eventFilter(votingEvent, moderatorBoardSession.User)

	assert.NotNil(t, returnedVoteEvent)
	assert.Equal(t, expectedVotingEvent, returnedVoteEvent)
}

func testFilterVotingUpdatedAsParticipant(t *testing.T) {
	expectedVoting := &votings.VotingUpdated{
		Notes: []uuid.UUID{aParticipantNote.ID},
		Voting: &votings.Voting{
			ID:                 votingID,
			VoteLimit:          5,
			AllowMultipleVotes: true,
			ShowVotesOfOthers:  false,
			Status:             "CLOSED",
			VotingResults: &votings.VotingResults{
				Total: 2,
				Votes: map[uuid.UUID]votings.VotingResultsPerNote{
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
	returnedVoteEvent := boardSub.eventFilter(votingEvent, participantBoardSession.User)

	assert.NotNil(t, returnedVoteEvent)
	assert.Equal(t, expectedVotingEvent, returnedVoteEvent)
}

func testInitFilterAsOwner(t *testing.T) {
	expectedInitEvent := initEvent
	returnedInitEvent := eventInitFilter(initEvent, ownerBoardSession.User)

	assert.Equal(t, expectedInitEvent, returnedInitEvent)
}

func testInitFilterAsModerator(t *testing.T) {
	expectedInitEvent := initEvent
	returnedInitEvent := eventInitFilter(initEvent, moderatorBoardSession.User)

	assert.Equal(t, expectedInitEvent, returnedInitEvent)
}

func testInitFilterAsParticipant(t *testing.T) {
	expectedVoting := votings.Voting{
		ID:                 votingID,
		VoteLimit:          5,
		AllowMultipleVotes: true,
		ShowVotesOfOthers:  false,
		Status:             "CLOSED",
		VotingResults: &votings.VotingResults{
			Total: 2,
			Votes: map[uuid.UUID]votings.VotingResultsPerNote{
				aParticipantNote.ID: {
					Total: 2,
					Users: nil,
				},
			},
		},
	}
	expectedInitEvent := InitEvent{
		Type: realtime.BoardEventInit,
		Data: boards.FullBoard{
			Board:                &boards.Board{},
			Columns:              []*columns.Column{&aSeeableColumn},
			Notes:                []*notes.Note{&aParticipantNote},
			Votings:              []*votings.Voting{&expectedVoting},
			Votes:                []*votings.Vote{},
			BoardSessions:        boardSessions,
			BoardSessionRequests: []*sessionrequests.BoardSessionRequest{},
		},
	}
	returnedInitEvent := eventInitFilter(initEvent, participantBoardSession.User)

	assert.Equal(t, expectedInitEvent, returnedInitEvent)
}

func TestShouldFailBecauseOfInvalidBordData(t *testing.T) {

	event := buildBoardEvent(buildBoardDto(nil, nil, "lorem ipsum", false), realtime.BoardEventBoardUpdated)
	bordSubscription := buildBordSubscription(boards.Public)

	_, success := bordSubscription.boardUpdated(event, false)

	assert.False(t, success)
}

func TestShouldUpdateBordSubscriptionAsModerator(t *testing.T) {

	nameForUpdate := randSeq(10)
	descriptionForUpdate := randSeq(10)

	event := buildBoardEvent(buildBoardDto(nameForUpdate, descriptionForUpdate, boards.Public, false), realtime.BoardEventBoardUpdated)
	bordSubscription := buildBordSubscription(boards.Public)

	_, success := bordSubscription.boardUpdated(event, true)

	assert.Equal(t, nameForUpdate, bordSubscription.boardSettings.Name)
	assert.Equal(t, descriptionForUpdate, bordSubscription.boardSettings.Description)
	assert.True(t, success)
}

func TestShouldNotUpdateBordSubscriptionWithoutModeratorRights(t *testing.T) {

	nameForUpdate := randSeq(10)
	descriptionForUpdate := randSeq(10)

	event := buildBoardEvent(buildBoardDto(nameForUpdate, descriptionForUpdate, boards.Public, false), realtime.BoardEventBoardUpdated)
	bordSubscription := buildBordSubscription(boards.Public)

	_, success := bordSubscription.boardUpdated(event, false)

	assert.Nil(t, bordSubscription.boardSettings.Name)
	assert.Nil(t, bordSubscription.boardSettings.Description)
	assert.True(t, success)
}

func TestShouldOnlyInsertLatestVotingInInitEventStatusClosed(t *testing.T) {

	latestVotingId := uuid.New()
	newestVotingId := uuid.New()
	clientId := uuid.New()

	initEvent := InitEvent{
		Type: "",
		Data: boards.FullBoard{
			BoardSessions: []*sessions.BoardSession{
				{
					Role: common.ModeratorRole,
					User: clientId,
				},
			},
			Votings: []*votings.Voting{
				buildVoting(latestVotingId, votings.Closed),
				buildVoting(newestVotingId, votings.Closed),
			},
			Votes: []*votings.Vote{
				buildVote(latestVotingId, uuid.New(), uuid.New()),
				buildVote(newestVotingId, uuid.New(), uuid.New()),
			},
		},
	}

	updatedInitEvent := eventInitFilter(initEvent, clientId)

	assert.Equal(t, latestVotingId, updatedInitEvent.Data.Votes[0].Voting)
	assert.Equal(t, latestVotingId, updatedInitEvent.Data.Votings[0].ID)
}

func TestShouldOnlyInsertLatestVotingInInitEventStatusOpen(t *testing.T) {

	latestVotingId := uuid.New()
	newestVotingId := uuid.New()
	clientId := uuid.New()

	initEvent := InitEvent{
		Type: "",
		Data: boards.FullBoard{
			BoardSessions: []*sessions.BoardSession{
				{
					Role: common.ModeratorRole,
					User: clientId,
				},
			},
			Votings: []*votings.Voting{
				buildVoting(latestVotingId, votings.Open),
				buildVoting(newestVotingId, votings.Closed),
			},
			Votes: []*votings.Vote{
				buildVote(latestVotingId, clientId, uuid.New()),
				buildVote(newestVotingId, uuid.New(), uuid.New()),
			},
		},
	}

	updatedInitEvent := eventInitFilter(initEvent, clientId)

	assert.Equal(t, latestVotingId, updatedInitEvent.Data.Votes[0].Voting)
	assert.Equal(t, latestVotingId, updatedInitEvent.Data.Votings[0].ID)
}

func TestShouldBeEmptyVotesInInitEventBecauseIdsDiffer(t *testing.T) {

	clientId := uuid.New()
	latestVotingId := uuid.New()

	orgVoting := []*votings.Voting{
		buildVoting(latestVotingId, votings.Open),
		buildVoting(uuid.New(), votings.Closed),
	}
	orgVote := []*votings.Vote{
		buildVote(uuid.New(), uuid.New(), uuid.New()),
		buildVote(uuid.New(), uuid.New(), uuid.New()),
	}

	initEvent := InitEvent{
		Type: "",
		Data: boards.FullBoard{
			BoardSessions: []*sessions.BoardSession{
				{
					Role: common.ModeratorRole,
					User: clientId,
				},
			},
			Votings: orgVoting,
			Votes:   orgVote,
		},
	}

	updatedInitEvent := eventInitFilter(initEvent, clientId)

	assert.Empty(t, updatedInitEvent.Data.Votes)
	assert.Equal(t, latestVotingId, updatedInitEvent.Data.Votings[0].ID)
}

func TestShouldCreateNewInitEventBecauseNoModeratorRightsWithVisibleVotes(t *testing.T) {

	latestVotingId := uuid.New()
	newestVotingId := uuid.New()
	noteId := uuid.New()
	columnId := uuid.New()
	clientId := uuid.New()
	nameForUpdate := randSeq(10)
	descriptionForUpdate := randSeq(10)

	initEvent := InitEvent{
		Type: "",
		Data: boards.FullBoard{
			Columns: []*columns.Column{buildColumn(columnId, true)},
			Board:   buildBoardDto(nameForUpdate, descriptionForUpdate, boards.Public, true),
			Notes:   []*notes.Note{buildNote(noteId, columnId)},
			BoardSessions: []*sessions.BoardSession{
				{
					Role: common.ParticipantRole,
					User: clientId,
				},
			},
			Votings: []*votings.Voting{
				buildVoting(latestVotingId, votings.Open),
				buildVoting(newestVotingId, votings.Closed),
			},
			Votes: []*votings.Vote{
				buildVote(latestVotingId, clientId, noteId),
				buildVote(newestVotingId, uuid.New(), uuid.New()),
			},
		},
	}

	updatedInitEvent := eventInitFilter(initEvent, clientId)

	assert.Equal(t, noteId, updatedInitEvent.Data.Votes[0].Note)
	assert.Equal(t, clientId, updatedInitEvent.Data.Votes[0].User)
}

func TestShouldFailBecauseOfInvalidVoteData(t *testing.T) {

	event := buildBoardEvent(*buildVote(uuid.New(), uuid.New(), uuid.New()), realtime.BoardEventVotesDeleted)
	bordSubscription := buildBordSubscription(boards.Public)

	_, success := bordSubscription.votesDeleted(event, uuid.New())

	assert.False(t, success)
}

func TestShouldReturnEmptyVotesBecauseUserIdNotMatched(t *testing.T) {

	event := buildBoardEvent([]votings.Vote{*buildVote(uuid.New(), uuid.New(), uuid.New())}, realtime.BoardEventVotesDeleted)
	bordSubscription := buildBordSubscription(boards.Public)

	updatedBordEvent, success := bordSubscription.votesDeleted(event, uuid.New())

	assert.True(t, success)
	assert.Equal(t, 0, len(updatedBordEvent.Data.([]*votings.Vote)))
}

func TestVotesDeleted(t *testing.T) {

	userId := uuid.New()
	event := buildBoardEvent([]votings.Vote{*buildVote(uuid.New(), userId, uuid.New())}, realtime.BoardEventVotesDeleted)
	bordSubscription := buildBordSubscription(boards.Public)

	updatedBordEvent, success := bordSubscription.votesDeleted(event, userId)

	assert.True(t, success)
	assert.Equal(t, 1, len(updatedBordEvent.Data.([]*votings.Vote)))
}

func buildNote(id uuid.UUID, columnId uuid.UUID) *notes.Note {
	return &notes.Note{
		ID:     id,
		Author: uuid.New(),
		Text:   "lorem in ipsum",
		Edited: false,
		Position: notes.NotePosition{
			Column: columnId,
			Stack: uuid.NullUUID{
				UUID:  uuid.New(),
				Valid: true,
			},
			Rank: 0,
		},
	}
}

func buildColumn(id uuid.UUID, visible bool) *columns.Column {
	return &columns.Column{
		ID:      id,
		Visible: visible,
	}
}

func buildVote(votingId uuid.UUID, userId uuid.UUID, noteId uuid.UUID) *votings.Vote {
	return &votings.Vote{
		Voting: votingId,
		User:   userId,
		Note:   noteId,
	}
}

func buildVoting(id uuid.UUID, status votings.VotingStatus) *votings.Voting {
	return &votings.Voting{
		ID:     id,
		Status: status,
	}
}

func buildBordSubscription(accessPolicy boards.AccessPolicy) BoardSubscription {
	return BoardSubscription{
		subscription:      nil,
		clients:           nil,
		boardParticipants: nil,
		boardSettings:     buildBoardDto(nil, nil, accessPolicy, false),
		boardColumns:      nil,
		boardNotes:        nil,
		boardReactions:    nil,
	}
}

func buildBoardEvent(data interface{}, eventType realtime.BoardEventType) *realtime.BoardEvent {
	return &realtime.BoardEvent{
		Type: eventType,
		Data: data,
	}
}

func buildBoardDto(name *string, description *string, accessPolicy boards.AccessPolicy, showNotesOfOtherUsers bool) *boards.Board {
	return &boards.Board{
		ID:                    uuid.UUID{},
		Name:                  name,
		Description:           description,
		AccessPolicy:          accessPolicy,
		ShowAuthors:           false,
		ShowNotesOfOtherUsers: showNotesOfOtherUsers,
		ShowNoteReactions:     false,
		AllowStacking:         false,
		IsLocked:              false,
		TimerStart:            nil,
		TimerEnd:              nil,
		SharedNote:            uuid.NullUUID{},
		ShowVoting:            uuid.NullUUID{},
		Passphrase:            nil,
		Salt:                  nil,
	}
}

func randSeq(n int) *string {
	var letters = []rune("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ")

	b := make([]rune, n)
	for i := range b {
		b[i] = letters[rand.Intn(len(letters))]
	}

	s := string(b)
	return &s
}
