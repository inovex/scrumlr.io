package realtime_test

import (
	"testing"

	"github.com/stretchr/testify/assert"

	"scrumlr.io/server/realtime"
)

func TestRealtime_IsHealthy(t *testing.T) {
	rt, err := realtime.NewNats("foo")
	assert.NotNil(t, err)
	assert.False(t, rt.IsHealthy())

	rt, err = realtime.NewNats(SetupNatsContainer(t))
	assert.Nil(t, err)
	assert.True(t, rt.IsHealthy())
}
