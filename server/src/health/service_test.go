package health

import (
	"errors"
	"testing"

	"github.com/stretchr/testify/assert"
	"scrumlr.io/server/realtime"
)

func TestDatabaseHealthy(t *testing.T) {
	mockHealthDb := NewMockHealthDatabase(t)
	mockHealthDb.EXPECT().IsHealthy().Return(true)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	healthService := NewHealthService(mockHealthDb, broker)
	healthDb := healthService.IsDatabaseHealthy()

	assert.True(t, healthDb)
}

func TestDatabaseNotHealthy(t *testing.T) {
	mockHealthDb := NewMockHealthDatabase(t)
	mockHealthDb.EXPECT().IsHealthy().Return(false)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	healthService := NewHealthService(mockHealthDb, broker)
	healthDb := healthService.IsDatabaseHealthy()

	assert.False(t, healthDb)
}

func TestRealtimeHealthy(t *testing.T) {
	mockHealthDb := NewMockHealthDatabase(t)

	mockBroker := realtime.NewMockClient(t)
	mockBroker.EXPECT().Publish("health", "test").Return(nil)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	healthService := NewHealthService(mockHealthDb, broker)
	healthRealTime := healthService.IsRealtimeHealthy()

	assert.True(t, healthRealTime)
}

func TestRealtimeNotHealthy(t *testing.T) {
	mockHealthDb := NewMockHealthDatabase(t)

	mockBroker := realtime.NewMockClient(t)
	mockBroker.EXPECT().Publish("health", "test").Return(errors.New("Failed to publish"))
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	healthService := NewHealthService(mockHealthDb, broker)
	healthRealTime := healthService.IsRealtimeHealthy()

	assert.False(t, healthRealTime)
}
