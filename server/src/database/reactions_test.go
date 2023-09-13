package database

import (
	"github.com/stretchr/testify/assert"
	"testing"
)

func TestRunnerForReactions(t *testing.T) {
	t.Run("Get=0", testGetReaction)
	t.Run("Get=1", testGetReactionsForNote)
}

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

}
