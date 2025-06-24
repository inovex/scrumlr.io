package database

import (
	"scrumlr.io/server/sessions"
	"testing"

	"scrumlr.io/server/boards"

	"scrumlr.io/server/notes"

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

var notesTestA1 *notes.DatabaseNote
var boardTestBoard *boards.DatabaseBoard
var reactionUserJay *sessions.DatabaseUser
var reactionUserJack *sessions.DatabaseUser

func testGetReaction(t *testing.T) {
	reaction := fixture.MustRow("DatabaseReaction.reactionA").(*reactions.DatabaseReaction)
	r, err := reactionDb.Get(reaction.ID)

	assert.Nil(t, err)
	assert.Equal(t, reaction.ID, r.ID)
	assert.Equal(t, reaction.Note, r.Note)
	assert.Equal(t, reaction.User, r.User)
	assert.Equal(t, reaction.ReactionType, r.ReactionType)
}

func testGetReactionsForNote(t *testing.T) {
	notesTestA1 = fixture.MustRow("DatabaseNote.notesTestA1").(*notes.DatabaseNote)
	r, err := reactionDb.GetAllForNote(notesTestA1.ID)

	assert.Nil(t, err)
	assert.Equal(t, 2, len(r))
}

func testGetReactions(t *testing.T) {
	boardTestBoard = fixture.MustRow("DatabaseBoard.notesTestBoard").(*boards.DatabaseBoard)
	r, err := reactionDb.GetAll(boardTestBoard.ID)

	assert.Nil(t, err)
	assert.Equal(t, 3, len(r))
}

func testCreateReaction(t *testing.T) {
	boardTestBoard = fixture.MustRow("DatabaseBoard.notesTestBoard").(*boards.DatabaseBoard)
	notesTestA1 = fixture.MustRow("DatabaseNote.notesTestA1").(*notes.DatabaseNote)
	reactionUserJay = fixture.MustRow("DatabaseUser.jay").(*sessions.DatabaseUser)

	reaction, err := reactionDb.Create(boardTestBoard.ID, reactions.DatabaseReactionInsert{
		Note:         notesTestA1.ID,
		User:         reactionUserJay.ID,
		ReactionType: reactions.Like,
	})

	assert.Nil(t, err)
	assert.Equal(t, notesTestA1.ID, reaction.Note)
	assert.Equal(t, reactionUserJay.ID, reaction.User)
	assert.Equal(t, reactions.Like, reaction.ReactionType)
}

func testCreateReactionFailsBecauseUserAlreadyReactedOnThatNote(t *testing.T) {
	boardTestBoard = fixture.MustRow("DatabaseBoard.notesTestBoard").(*boards.DatabaseBoard)
	notesTestA1 = fixture.MustRow("DatabaseNote.notesTestA1").(*notes.DatabaseNote)
	reactionUserJack = fixture.MustRow("DatabaseUser.jack").(*sessions.DatabaseUser)

	_, err := reactionDb.Create(boardTestBoard.ID, reactions.DatabaseReactionInsert{
		Note:         notesTestA1.ID,
		User:         reactionUserJack.ID,
		ReactionType: reactions.Like,
	})

	assert.NotNil(t, err)
	assert.Error(t, err)
}

func testUpdateReaction(t *testing.T) {
	newReactionType := reactions.Celebration
	board := fixture.MustRow("DatabaseBoard.notesTestBoard").(*boards.DatabaseBoard) // cannot reuse vars here
	user := fixture.MustRow("DatabaseUser.jack").(*sessions.DatabaseUser)
	reaction := fixture.MustRow("DatabaseReaction.reactionA").(*reactions.DatabaseReaction)

	r, err := reactionDb.Update(board.ID, user.ID, reaction.ID, reactions.DatabaseReactionUpdate{
		ReactionType: newReactionType,
	})

	assert.Nil(t, err)
	assert.Equal(t, reaction.ID, r.ID)
	assert.Equal(t, user.ID, r.User)
	assert.Equal(t, newReactionType, r.ReactionType)
}

func testUpdateReactionFailsBecauseForbidden(t *testing.T) {
	newReactionType := reactions.Celebration
	board := fixture.MustRow("DatabaseBoard.notesTestBoard").(*boards.DatabaseBoard)
	wrongUser := fixture.MustRow("DatabaseUser.jane").(*sessions.DatabaseUser)
	reaction := fixture.MustRow("DatabaseReaction.reactionA").(*reactions.DatabaseReaction)

	_, err := reactionDb.Update(board.ID, wrongUser.ID, reaction.ID, reactions.DatabaseReactionUpdate{
		ReactionType: newReactionType,
	})

	assert.NotNil(t, err)
	assert.Error(t, err)
	assert.ErrorContains(t, err, "forbidden")
}

func testDeleteReaction(t *testing.T) {
	board := fixture.MustRow("DatabaseBoard.notesTestBoard").(*boards.DatabaseBoard)
	user := fixture.MustRow("DatabaseUser.jane").(*sessions.DatabaseUser)
	reaction := fixture.MustRow("DatabaseReaction.reactionB").(*reactions.DatabaseReaction)

	err := reactionDb.Delete(board.ID, user.ID, reaction.ID)

	assert.Nil(t, err)
}

func testDeleteReactionFailsBecauseForbidden(t *testing.T) {
	board := fixture.MustRow("DatabaseBoard.notesTestBoard").(*boards.DatabaseBoard)
	wrongUser := fixture.MustRow("DatabaseUser.jane").(*sessions.DatabaseUser)
	reaction := fixture.MustRow("DatabaseReaction.reactionA").(*reactions.DatabaseReaction)

	err := reactionDb.Delete(board.ID, wrongUser.ID, reaction.ID)

	assert.NotNil(t, err)
	assert.Error(t, err)
	assert.ErrorContains(t, err, "forbidden")
}
