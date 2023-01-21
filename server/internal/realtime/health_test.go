package realtime_test

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"scrumlr.io/server/internal/realtime"
)

func TestBroker_IsHealthy(t *testing.T) {
	type testCase struct {
		name        string
		setupBroker func(t *testing.T) *realtime.Broker
		expected    bool
	}
	testcases := []testCase{
		{
			name: "nats client has has wrong url",
			setupBroker: func(t *testing.T) *realtime.Broker {
				rt, err := realtime.NewNats("foo")
				require.NotNil(t, err)
				return rt
			},
			expected: false,
		},
		{
			name: "nats client is setup correctly",
			setupBroker: func(t *testing.T) *realtime.Broker {
				rt, err := realtime.NewNats(SetupNatsContainer(t))
				require.Nil(t, err)
				return rt
			},
			expected: true,
		},
	}
	for _, tt := range testcases {
		t.Run(tt.name, func(t *testing.T) {
			assert.Equal(t, tt.expected, tt.setupBroker(t).IsHealthy(), "healthy didn't return expected result")
		})
	}
}
