package realtime_test

import (
	"testing"

	"github.com/stretchr/testify/assert"

	"scrumlr.io/server/realtime"
)

func TestRealtime_IsHealthy(t *testing.T) {
	rt, err := realtime.New("foo")
	assert.NotNil(t, err)
	assert.False(t, rt.IsHealthy())

	rt, err = realtime.New(SetupNatsContainer(t))
	assert.Nil(t, err)
	assert.True(t, rt.IsHealthy())
}
