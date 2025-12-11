package reactions

import (
	"fmt"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestReactionTypeEnum(t *testing.T) {
	values := []ReactionType{Thinking, Heart, Like, Dislike, Joy, Celebration, Poop}
	for _, value := range values {
		var reactionType ReactionType
		err := reactionType.UnmarshalJSON([]byte(fmt.Sprintf("\"%s\"", value)))
		assert.Nil(t, err)
		assert.Equal(t, value, reactionType)
	}
}

func TestUnmarshalSessionRoleNil(t *testing.T) {
	var reactionType ReactionType
	err := reactionType.UnmarshalJSON(nil)
	assert.NotNil(t, err)
}

func TestUnmarshalSessionRoleEmptyString(t *testing.T) {
	var reactionType ReactionType
	err := reactionType.UnmarshalJSON([]byte(""))
	assert.NotNil(t, err)
}

func TestUnmarshalSessionRoleEmptyStringWithQuotation(t *testing.T) {
	var reactionType ReactionType
	err := reactionType.UnmarshalJSON([]byte("\"\""))
	assert.NotNil(t, err)
}

func TestUnmarshalSessionRoleRandomValue(t *testing.T) {
	var reactionType ReactionType
	err := reactionType.UnmarshalJSON([]byte("\"SOME_RANDOM_VALUE\""))
	assert.Nil(t, err) // Should accept any valid string now
	assert.Equal(t, ReactionType("SOME_RANDOM_VALUE"), reactionType)
}

func TestUnmarshalSessionRoleTooLong(t *testing.T) {
	var reactionType ReactionType
	// Test string longer than 50 characters
	longString := "this_is_a_very_long_reaction_type_that_exceeds_the_fifty_character_limit"
	err := reactionType.UnmarshalJSON([]byte(fmt.Sprintf("\"%s\"", longString)))
	assert.NotNil(t, err)
}
