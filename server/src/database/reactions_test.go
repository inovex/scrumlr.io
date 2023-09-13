package database

import (
	"github.com/stretchr/testify/assert"
	"scrumlr.io/server/database/types"
	"testing"
)

func TestRunnerForReactions(t *testing.T) {
	t.Run("Get=0", testGetReaction)
	t.Run("Get=1", testGetReactionsForNote)
	t.Run("Get=2", testGetReactions)

	t.Run("Create=0", testCreateReaction)
	t.Run("Create=1", testCreateReactionFailsBecauseUserAlreadyReactedOnThatNote)
}

var notesTestA1 *Note
var boardTestBoard *Board
var reactionUserJay *User
var reactionUserJack *User

var reactionA *Reaction

func testGetReaction(t *testing.T) {
	reaction := fixture.MustRow("Reaction.reactionA").(*Reaction)
	r, err := testDb.GetReaction(reaction.ID)

	assert.Nil(t, err)
	assert.Equal(t, reaction.ID, r.ID)
	assert.Equal(t, reaction.Note, r.Note)
	assert.Equal(t, reaction.User, r.User)
	assert.Equal(t, reaction.ReactionType, r.ReactionType)
}

func testGetReactionsForNote(t *testing.T) {
	notesTestA1 = fixture.MustRow("Note.notesTestA1").(*Note)
	r, err := testDb.GetReactionsForNote(notesTestA1.ID)

	assert.Nil(t, err)
	assert.Equal(t, 2, len(r))
}

func testGetReactions(t *testing.T) {
	boardTestBoard = fixture.MustRow("Board.notesTestBoard").(*Board)
	r, err := testDb.GetReactions(boardTestBoard.ID)

	assert.Nil(t, err)
	assert.Equal(t, 3, len(r))
}

func testCreateReaction(t *testing.T) {
	boardTestBoard = fixture.MustRow("Board.notesTestBoard").(*Board)
	notesTestA1 = fixture.MustRow("Note.notesTestA1").(*Note)
	reactionUserJay = fixture.MustRow("User.jay").(*User)

	reaction, err := testDb.CreateReaction(boardTestBoard.ID, ReactionInsert{
		Note:         notesTestA1.ID,
		User:         reactionUserJay.ID,
		ReactionType: types.ReactionLike,
	})

	assert.Nil(t, err)
	assert.Equal(t, notesTestA1.ID, reaction.Note)
	assert.Equal(t, reactionUserJay.ID, reaction.User)
	assert.Equal(t, types.ReactionLike, reaction.ReactionType)
}

func testCreateReactionFailsBecauseUserAlreadyReactedOnThatNote(t *testing.T) {
	boardTestBoard = fixture.MustRow("Board.notesTestBoard").(*Board)
	notesTestA1 = fixture.MustRow("Note.notesTestA1").(*Note)
	reactionUserJack = fixture.MustRow("User.jack").(*User)

	_, err := testDb.CreateReaction(boardTestBoard.ID, ReactionInsert{
		Note:         notesTestA1.ID,
		User:         reactionUserJack.ID,
		ReactionType: types.ReactionLike,
	})

	assert.NotNil(t, err)
	assert.Error(t, err)
}
