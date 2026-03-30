package boardreactions

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestUnmarshalReaction(t *testing.T) {
	reaction := Reaction("heart")

	assert.NotNil(t, reaction)
	assert.Equal(t, Heart, reaction)
}
