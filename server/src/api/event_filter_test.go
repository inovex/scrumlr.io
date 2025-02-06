package api

import (
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"math/rand"
	"scrumlr.io/server/columns"
	"scrumlr.io/server/common/dto"
	"scrumlr.io/server/database/types"
	"scrumlr.io/server/notes"
	"scrumlr.io/server/realtime"
	"scrumlr.io/server/session_helper"
	"scrumlr.io/server/technical_helper"
	"scrumlr.io/server/votes"
	"testing"
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
		User: dto.User{
			ID:          uuid.New(),
			AccountType: types.AccountTypeAnonymous,
		},
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
	aSeeableColumn = columns.Column{
		ID:      uuid.New(),
		Name:    "Main Thread",
		Color:   "backlog-blue",
		Visible: true,
		Index:   0,
	}
	aModeratorNote = notes.Note{
		ID:     uuid.New(),
		Author: moderatorBoardSession.User.ID,
		Text:   "Moderator Text",
		Position: notes.NotePosition{
			Column: aSeeableColumn.ID,
			Stack:  uuid.NullUUID{},
			Rank:   1,
		},
	}
	aParticipantNote = notes.Note{
		ID:     uuid.New(),
		Author: participantBoardSession.User.ID,
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
		Author: ownerBoardSession.User.ID,
		Text:   "Owner Text",
		Position: notes.NotePosition{
			Column: aHiddenColumn.ID,
			Rank:   1,
			Stack:  uuid.NullUUID{},
		},
	}
	boardSub = &BoardSubscription{
		boardParticipants: []*dto.BoardSession{&moderatorBoardSession, &ownerBoardSession, &participantBoardSession},
		boardColumns:      []*columns.Column{&aSeeableColumn, &aHiddenColumn},
		boardNotes:        []*notes.Note{&aParticipantNote, &aModeratorNote, &aOwnerNote},
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
		Data: []*columns.Column{&aSeeableColumn, &aHiddenColumn},
	}
	noteEvent = &realtime.BoardEvent{
		Type: realtime.BoardEventNotesUpdated,
		Data: []*notes.Note{&aParticipantNote, &aModeratorNote, &aOwnerNote},
	}
	votingID   = uuid.New()
	votingData = &votes.VotingUpdated{
		Notes: []*notes.Note{&aParticipantNote, &aModeratorNote, &aOwnerNote},
		Voting: &votes.Voting{
			ID:                 votingID,
			VoteLimit:          5,
			AllowMultipleVotes: true,
			ShowVotesOfOthers:  false,
			Status:             "CLOSED",
			VotingResults: &votes.VotingResults{
				Total: 5,
				Votes: map[uuid.UUID]votes.VotingResultsPerNote{
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
		Data: dto.FullBoard{
			Board:                &dto.Board{},
			Columns:              []*columns.Column{&aSeeableColumn, &aHiddenColumn},
			Notes:                []*notes.Note{&aOwnerNote, &aModeratorNote, &aParticipantNote},
			Votings:              []*votes.Voting{votingData.Voting},
			Votes:                []*dto.Vote{},
			BoardSessions:        boardSessions,
			BoardSessionRequests: []*dto.BoardSessionRequest{},
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
	t.Run("TestRaiseHandShouldBeUpdatedAfterParticipantUpdated", testRaiseHandShouldBeUpdatedAfterParticipantUpdated)
	t.Run("TestParticipantUpdatedShouldHandleError", testParticipantUpdatedShouldHandleError)
}

func testRaiseHandShouldBeUpdatedAfterParticipantUpdated(t *testing.T) {

	originalParticipantSession := technical_helper.Filter(boardSub.boardParticipants, func(session *dto.BoardSession) bool {
		return session.User.AccountType == types.AccountTypeAnonymous
	})[0]

	updateEvent := &realtime.BoardEvent{
		Type: realtime.BoardEventParticipantUpdated,
		Data: dto.BoardSession{
			RaisedHand: true,
			User: dto.User{
				ID:          originalParticipantSession.User.ID,
				AccountType: types.AccountTypeAnonymous,
			},
			Role: types.SessionRoleParticipant,
		},
	}

	isUpdated := boardSub.participantUpdated(updateEvent, true)

	updatedParticipantSession := technical_helper.Filter(boardSub.boardParticipants, func(session *dto.BoardSession) bool {
		return session.User.AccountType == types.AccountTypeAnonymous
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
	isMod := session_helper.CheckSessionRole(moderatorBoardSession.User.ID, boardSessions, []types.SessionRole{types.SessionRoleModerator, types.SessionRoleOwner})

	assert.NotNil(t, isMod)
	assert.True(t, isMod)
	assert.Equal(t, types.SessionRoleModerator, moderatorBoardSession.Role)
}

func testIsOwnerModerator(t *testing.T) {
	isMod := session_helper.CheckSessionRole(ownerBoardSession.User.ID, boardSessions, []types.SessionRole{types.SessionRoleModerator, types.SessionRoleOwner})

	assert.NotNil(t, isMod)
	assert.True(t, isMod)
	assert.Equal(t, types.SessionRoleOwner, ownerBoardSession.Role)
}

func testIsParticipantModerator(t *testing.T) {
	isMod := session_helper.CheckSessionRole(participantBoardSession.User.ID, boardSessions, []types.SessionRole{types.SessionRoleModerator, types.SessionRoleOwner})

	assert.NotNil(t, isMod)
	assert.False(t, isMod)
}

func testIsUnknownUuidModerator(t *testing.T) {
	isMod := session_helper.CheckSessionRole(uuid.New(), boardSessions, []types.SessionRole{types.SessionRoleModerator, types.SessionRoleOwner})

	assert.NotNil(t, isMod)
	assert.False(t, isMod)
}

func testParseBoardSettingsData(t *testing.T) {
	expectedBoardSettings := boardSettings
	actualBoardSettings, err := technical_helper.Unmarshal[dto.Board](boardEvent.Data)

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
	actualVoting, err := technical_helper.Unmarshal[votes.VotingUpdated](votingEvent.Data)

	assert.Nil(t, err)
	assert.NotNil(t, actualVoting)
	assert.Equal(t, expectedVoting, actualVoting)
}

func testColumnFilterAsParticipant(t *testing.T) {
	expectedColumnEvent := &realtime.BoardEvent{
		Type: realtime.BoardEventColumnsUpdated,
		Data: []*columns.Column{&aSeeableColumn},
	}
	returnedColumnEvent := boardSub.eventFilter(columnEvent, participantBoardSession.User.ID)

	assert.Equal(t, expectedColumnEvent, returnedColumnEvent)
}

func testColumnFilterAsOwner(t *testing.T) {
	expectedColumnEvent := &realtime.BoardEvent{
		Type: realtime.BoardEventColumnsUpdated,
		Data: []*columns.Column{&aSeeableColumn, &aHiddenColumn},
	}
	returnedColumnEvent := boardSub.eventFilter(columnEvent, ownerBoardSession.User.ID)

	assert.Equal(t, expectedColumnEvent, returnedColumnEvent)
}

func testColumnFilterAsModerator(t *testing.T) {
	expectedColumnEvent := &realtime.BoardEvent{
		Type: realtime.BoardEventColumnsUpdated,
		Data: []*columns.Column{&aSeeableColumn, &aHiddenColumn},
	}

	returnedColumnEvent := boardSub.eventFilter(columnEvent, moderatorBoardSession.User.ID)

	assert.Equal(t, expectedColumnEvent, returnedColumnEvent)
}

func testNoteFilterAsParticipant(t *testing.T) {
	expectedNoteEvent := &realtime.BoardEvent{
		Type: realtime.BoardEventNotesUpdated,
		Data: notes.NoteSlice{&aParticipantNote},
	}
	returnedNoteEvent := boardSub.eventFilter(noteEvent, participantBoardSession.User.ID)

	assert.Equal(t, expectedNoteEvent, returnedNoteEvent)
}

func testNoteFilterAsOwner(t *testing.T) {
	expectedNoteEvent := &realtime.BoardEvent{
		Type: realtime.BoardEventNotesUpdated,
		Data: []*notes.Note{&aParticipantNote, &aModeratorNote, &aOwnerNote},
	}
	returnedNoteEvent := boardSub.eventFilter(noteEvent, ownerBoardSession.User.ID)

	assert.Equal(t, expectedNoteEvent, returnedNoteEvent)
}

func testNoteFilterAsModerator(t *testing.T) {
	expectedNoteEvent := &realtime.BoardEvent{
		Type: realtime.BoardEventNotesUpdated,
		Data: []*notes.Note{&aParticipantNote, &aModeratorNote, &aOwnerNote},
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
	expectedVoting := &votes.VotingUpdated{
		Notes: []*notes.Note{&aParticipantNote},
		Voting: &votes.Voting{
			ID:                 votingID,
			VoteLimit:          5,
			AllowMultipleVotes: true,
			ShowVotesOfOthers:  false,
			Status:             "CLOSED",
			VotingResults: &votes.VotingResults{
				Total: 2,
				Votes: map[uuid.UUID]votes.VotingResultsPerNote{
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
	expectedVoting := votes.Voting{
		ID:                 votingID,
		VoteLimit:          5,
		AllowMultipleVotes: true,
		ShowVotesOfOthers:  false,
		Status:             "CLOSED",
		VotingResults: &votes.VotingResults{
			Total: 2,
			Votes: map[uuid.UUID]votes.VotingResultsPerNote{
				aParticipantNote.ID: {
					Total: 2,
					Users: nil,
				},
			},
		},
	}
	expectedInitEvent := InitEvent{
		Type: realtime.BoardEventInit,
		Data: dto.FullBoard{
			Board:                &dto.Board{},
			Columns:              []*columns.Column{&aSeeableColumn},
			Notes:                []*notes.Note{&aParticipantNote},
			Votings:              []*votes.Voting{&expectedVoting},
			Votes:                []*dto.Vote{},
			BoardSessions:        boardSessions,
			BoardSessionRequests: []*dto.BoardSessionRequest{},
		},
	}
	returnedInitEvent := eventInitFilter(initEvent, participantBoardSession.User.ID)

	assert.Equal(t, expectedInitEvent, returnedInitEvent)
}

func TestShouldFailBecauseOfInvalidBordData(t *testing.T) {

	event := buildBoardEvent(buildBoardDto(nil, nil, "lorem ipsum"), realtime.BoardEventBoardUpdated)
	bordSubscription := buildBordSubscription(types.AccessPolicyPublic)

	_, success := bordSubscription.boardUpdated(event, false)

	assert.False(t, success)
}

func TestShouldUpdateBordSubscriptionAsModerator(t *testing.T) {

	nameForUpdate := randSeq(10)
	descriptionForUpdate := randSeq(10)

	event := buildBoardEvent(buildBoardDto(nameForUpdate, descriptionForUpdate, types.AccessPolicyPublic), realtime.BoardEventBoardUpdated)
	bordSubscription := buildBordSubscription(types.AccessPolicyPublic)

	_, success := bordSubscription.boardUpdated(event, true)

	assert.Equal(t, nameForUpdate, bordSubscription.boardSettings.Name)
	assert.Equal(t, descriptionForUpdate, bordSubscription.boardSettings.Description)
	assert.True(t, success)
}

func TestShouldNotUpdateBordSubscriptionWithoutModeratorRights(t *testing.T) {

	nameForUpdate := randSeq(10)
	descriptionForUpdate := randSeq(10)

	event := buildBoardEvent(buildBoardDto(nameForUpdate, descriptionForUpdate, types.AccessPolicyPublic), realtime.BoardEventBoardUpdated)
	bordSubscription := buildBordSubscription(types.AccessPolicyPublic)

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
		Data: dto.FullBoard{
			BoardSessions: []*dto.BoardSession{
				{
					Role: types.SessionRoleModerator,
					User: dto.User{ID: clientId},
				},
			},
			Votings: []*votes.Voting{
				buildVoting(latestVotingId, types.VotingStatusClosed),
				buildVoting(newestVotingId, types.VotingStatusClosed),
			},
			Votes: []*dto.Vote{
				buildVote(latestVotingId, uuid.New()),
				buildVote(newestVotingId, uuid.New()),
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
		Data: dto.FullBoard{
			BoardSessions: []*dto.BoardSession{
				{
					Role: types.SessionRoleModerator,
					User: dto.User{ID: clientId},
				},
			},
			Votings: []*votes.Voting{
				buildVoting(latestVotingId, types.VotingStatusOpen),
				buildVoting(newestVotingId, types.VotingStatusClosed),
			},
			Votes: []*dto.Vote{
				buildVote(latestVotingId, clientId),
				buildVote(newestVotingId, uuid.New()),
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

	orgVoting := []*votes.Voting{
		buildVoting(latestVotingId, types.VotingStatusOpen),
		buildVoting(uuid.New(), types.VotingStatusClosed),
	}
	orgVote := []*dto.Vote{
		buildVote(uuid.New(), uuid.New()),
		buildVote(uuid.New(), uuid.New()),
	}

	initEvent := InitEvent{
		Type: "",
		Data: dto.FullBoard{
			BoardSessions: []*dto.BoardSession{
				{
					Role: types.SessionRoleModerator,
					User: dto.User{ID: clientId},
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

func TestShouldFailBecauseOfInvalidVoteData(t *testing.T) {

	event := buildBoardEvent(*buildVote(uuid.New(), uuid.New()), realtime.BoardEventVotesDeleted)
	bordSubscription := buildBordSubscription(types.AccessPolicyPublic)

	_, success := bordSubscription.votesDeleted(event, uuid.New())

	assert.False(t, success)
}

func TestShouldReturnEmptyVotesBecauseUserIdNotMatched(t *testing.T) {

	event := buildBoardEvent([]dto.Vote{*buildVote(uuid.New(), uuid.New())}, realtime.BoardEventVotesDeleted)
	bordSubscription := buildBordSubscription(types.AccessPolicyPublic)

	updatedBordEvent, success := bordSubscription.votesDeleted(event, uuid.New())

	assert.True(t, success)
	assert.Equal(t, 0, len(updatedBordEvent.Data.([]*dto.Vote)))
}

func TestVotesDeleted(t *testing.T) {

	userId := uuid.New()
	event := buildBoardEvent([]dto.Vote{*buildVote(uuid.New(), userId)}, realtime.BoardEventVotesDeleted)
	bordSubscription := buildBordSubscription(types.AccessPolicyPublic)

	updatedBordEvent, success := bordSubscription.votesDeleted(event, userId)

	assert.True(t, success)
	assert.Equal(t, 1, len(updatedBordEvent.Data.([]*dto.Vote)))
}

func buildVote(votingId uuid.UUID, userId uuid.UUID) *dto.Vote {
	return &dto.Vote{
		Voting: votingId,
		User:   userId,
	}
}

func buildVoting(id uuid.UUID, status types.VotingStatus) *votes.Voting {
	return &votes.Voting{
		ID:     id,
		Status: status,
	}
}

func buildBordSubscription(accessPolicy types.AccessPolicy) BoardSubscription {
	return BoardSubscription{
		subscription:      nil,
		clients:           nil,
		boardParticipants: nil,
		boardSettings:     buildBoardDto(nil, nil, accessPolicy),
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

func buildBoardDto(name *string, description *string, accessPolicy types.AccessPolicy) *dto.Board {
	return &dto.Board{
		ID:                    uuid.UUID{},
		Name:                  name,
		Description:           description,
		AccessPolicy:          accessPolicy,
		ShowAuthors:           false,
		ShowNotesOfOtherUsers: false,
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
