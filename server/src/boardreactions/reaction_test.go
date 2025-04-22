package boardreactions

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestUnmarshalReaction(t *testing.T) {
	s := "heart"
	reaction := Reaction(s)

	assert.NotNil(t, reaction)
	assert.Equal(t, Heart, reaction)
}
