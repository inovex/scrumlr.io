package database

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"scrumlr.io/server/reactions"
)

func TestRunnerForReactions(t *testing.T) {
	t.Run("Get=0", testGetReaction)
	t.Run("Get=1", testGetReactionsForNote)
	t.Run("Get=2", testGetReactions)

	t.Run("Create=0", testCreateReaction)
	t.Run("Create=1", testCreateReactionFailsBecauseUserAlreadyReactedOnThatNote)

	t.Run("Update=0", testUpdateReaction)
	t.Run("Update=1", testUpdateReactionFailsBecauseForbidden)

	t.Run("Delete=0", testDeleteReaction)
	t.Run("Delete=1", testDeleteReactionFailsBecauseForbidden)
}

var notesTestA1 *Note
var boardTestBoard *Board
var reactionUserJay *User
var reactionUserJack *User

func testGetReaction(t *testing.T) {
	reaction := fixture.MustRow("DatabaseReaction.reactionA").(*reactions.DatabaseReaction)
	r, err := reactionDb.GetReaction(reaction.ID)

	assert.Nil(t, err)
	assert.Equal(t, reaction.ID, r.ID)
	assert.Equal(t, reaction.Note, r.Note)
	assert.Equal(t, reaction.User, r.User)
	assert.Equal(t, reaction.ReactionType, r.ReactionType)
}

func testGetReactionsForNote(t *testing.T) {
	notesTestA1 = fixture.MustRow("Note.notesTestA1").(*Note)
	r, err := reactionDb.GetReactionsForNote(notesTestA1.ID)

	assert.Nil(t, err)
	assert.Equal(t, 2, len(r))
}

func testGetReactions(t *testing.T) {
	boardTestBoard = fixture.MustRow("Board.notesTestBoard").(*Board)
	r, err := reactionDb.GetReactions(boardTestBoard.ID)

	assert.Nil(t, err)
	assert.Equal(t, 3, len(r))
}

func testCreateReaction(t *testing.T) {
	boardTestBoard = fixture.MustRow("Board.notesTestBoard").(*Board)
	notesTestA1 = fixture.MustRow("Note.notesTestA1").(*Note)
	reactionUserJay = fixture.MustRow("User.jay").(*User)

	reaction, err := reactionDb.CreateReaction(boardTestBoard.ID, reactions.DatabaseReactionInsert{
		Note:         notesTestA1.ID,
		User:         reactionUserJay.ID,
		ReactionType: reactions.ReactionLike,
	})

	assert.Nil(t, err)
	assert.Equal(t, notesTestA1.ID, reaction.Note)
	assert.Equal(t, reactionUserJay.ID, reaction.User)
	assert.Equal(t, reactions.ReactionLike, reaction.ReactionType)
}

func testCreateReactionFailsBecauseUserAlreadyReactedOnThatNote(t *testing.T) {
	boardTestBoard = fixture.MustRow("Board.notesTestBoard").(*Board)
	notesTestA1 = fixture.MustRow("Note.notesTestA1").(*Note)
	reactionUserJack = fixture.MustRow("User.jack").(*User)

	_, err := reactionDb.CreateReaction(boardTestBoard.ID, reactions.DatabaseReactionInsert{
		Note:         notesTestA1.ID,
		User:         reactionUserJack.ID,
		ReactionType: reactions.ReactionLike,
	})

	assert.NotNil(t, err)
	assert.Error(t, err)
}

func testUpdateReaction(t *testing.T) {
	newReactionType := reactions.ReactionCelebration
	board := fixture.MustRow("Board.notesTestBoard").(*Board) // cannot reuse vars here
	user := fixture.MustRow("User.jack").(*User)
	reaction := fixture.MustRow("DatabaseReaction.reactionA").(*reactions.DatabaseReaction)

	r, err := reactionDb.UpdateReaction(board.ID, user.ID, reaction.ID, reactions.DatabaseReactionUpdate{
		ReactionType: newReactionType,
	})

	assert.Nil(t, err)
	assert.Equal(t, reaction.ID, r.ID)
	assert.Equal(t, user.ID, r.User)
	assert.Equal(t, newReactionType, r.ReactionType)
}

func testUpdateReactionFailsBecauseForbidden(t *testing.T) {
	newReactionType := reactions.ReactionCelebration
	board := fixture.MustRow("Board.notesTestBoard").(*Board)
	wrongUser := fixture.MustRow("User.jane").(*User)
	reaction := fixture.MustRow("DatabaseReaction.reactionA").(*reactions.DatabaseReaction)

	_, err := reactionDb.UpdateReaction(board.ID, wrongUser.ID, reaction.ID, reactions.DatabaseReactionUpdate{
		ReactionType: newReactionType,
	})

	assert.NotNil(t, err)
	assert.Error(t, err)
	assert.ErrorContains(t, err, "forbidden")
}

func testDeleteReaction(t *testing.T) {
	board := fixture.MustRow("Board.notesTestBoard").(*Board)
	user := fixture.MustRow("User.jane").(*User)
	reaction := fixture.MustRow("DatabaseReaction.reactionB").(*reactions.DatabaseReaction)

	err := reactionDb.RemoveReaction(board.ID, user.ID, reaction.ID)

	assert.Nil(t, err)
}

func testDeleteReactionFailsBecauseForbidden(t *testing.T) {
	board := fixture.MustRow("Board.notesTestBoard").(*Board)
	wrongUser := fixture.MustRow("User.jane").(*User)
	reaction := fixture.MustRow("DatabaseReaction.reactionA").(*reactions.DatabaseReaction)

	err := reactionDb.RemoveReaction(board.ID, wrongUser.ID, reaction.ID)

	assert.NotNil(t, err)
	assert.Error(t, err)
	assert.ErrorContains(t, err, "forbidden")
}
