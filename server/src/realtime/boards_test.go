package realtime

import (
	"context"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"
	"github.com/testcontainers/testcontainers-go/modules/nats"
	"github.com/testcontainers/testcontainers-go/modules/redis"

	"scrumlr.io/server/initialize"
)

type RealtimeBoardTestSuite struct {
	suite.Suite
	natsContainer         *nats.NATSContainer
	redisContainer        *redis.RedisContainer
	natsConnectionString  string
	redisConnectionString string
}

// TODO: The current datastructures doesn't respect the types, because
// an empty interface can be anything.
func TestRealtimeboardTestSuite(t *testing.T) {
	suite.Run(t, new(RealtimeBoardTestSuite))
}

func (suite *RealtimeBoardTestSuite) SetupSuite() {
	natsContainer, natsConnectionString := initialize.StartTestNats()
	redisContainer, redisConnectionString := initialize.StartTestRedis()

	suite.natsContainer = natsContainer
	suite.natsConnectionString = natsConnectionString
	suite.redisContainer = redisContainer
	suite.redisConnectionString = redisConnectionString
}

func (suite *RealtimeBoardTestSuite) TearDownSuite() {
	initialize.StopTestNats(suite.natsContainer)
	initialize.StopTestRedis(suite.redisContainer)
}

func (suite *RealtimeBoardTestSuite) Test_Nats_Board_SendNil() {
	t := suite.T()
	ctx := context.Background()

	boardId := uuid.New()

	broker, err := NewNats(suite.natsConnectionString)
	assert.Nil(t, err)

	eventChannel := broker.GetBoardChannel(ctx, boardId)

	err = broker.BroadcastToBoard(ctx, boardId, BoardEvent{Type: BoardEventInit, Data: nil})
	assert.Nil(t, err)

	event := <-eventChannel
	assert.NotNil(t, event)
	assert.Equal(t, BoardEventInit, event.Type)
	assert.Nil(t, event.Data)
}

func (suite *RealtimeBoardTestSuite) Test_Redis_Board_SendNil() {
	t := suite.T()
	ctx := context.Background()

	boardId := uuid.New()

	broker, err := NewRedis(RedisServer{Addr: suite.redisConnectionString})
	assert.Nil(t, err)

	eventChannel := broker.GetBoardChannel(ctx, boardId)

	err = broker.BroadcastToBoard(ctx, boardId, BoardEvent{Type: BoardEventInit, Data: nil})
	assert.Nil(t, err)

	event := <-eventChannel
	assert.NotNil(t, event)
	assert.Equal(t, BoardEventInit, event.Type)
	assert.Nil(t, event.Data)
}

func (suite *RealtimeBoardTestSuite) Test_Nats_Board_SendData() {
	t := suite.T()
	ctx := context.Background()

	boardId := uuid.New()

	broker, err := NewNats(suite.natsConnectionString)
	assert.Nil(t, err)

	eventChannel := broker.GetBoardChannel(ctx, boardId)

	err = broker.BroadcastToBoard(ctx, boardId, BoardEvent{Type: BoardEventInit, Data: "not nil string data"})
	assert.Nil(t, err)

	event := <-eventChannel
	assert.NotNil(t, event)
	assert.Equal(t, BoardEventInit, event.Type)
	assert.NotNil(t, event.Data)
	assert.Equal(t, "not nil string data", event.Data)
}

func (suite *RealtimeBoardTestSuite) Test_Redis_Board_SendData() {
	t := suite.T()
	ctx := context.Background()

	boardId := uuid.New()

	broker, err := NewRedis(RedisServer{Addr: suite.redisConnectionString})
	assert.Nil(t, err)

	eventChannel := broker.GetBoardChannel(ctx, boardId)

	err = broker.BroadcastToBoard(ctx, boardId, BoardEvent{Type: BoardEventInit, Data: "not nil string data"})
	assert.Nil(t, err)

	event := <-eventChannel
	assert.NotNil(t, event)
	assert.Equal(t, BoardEventInit, event.Type)
	assert.NotNil(t, event.Data)
	assert.Equal(t, "not nil string data", event.Data)
}

func (suite *RealtimeBoardTestSuite) Test_Nats_Board_SendComplexData() {
	t := suite.T()
	ctx := context.Background()

	boardId := uuid.New()

	broker, err := NewNats(suite.natsConnectionString)
	assert.Nil(t, err)

	eventChannel := broker.GetBoardChannel(ctx, boardId)

	err = broker.BroadcastToBoard(ctx, boardId, BoardEvent{
		Type: BoardEventInit,
		Data: struct {
			More    string
			Complex float64
			Data    map[int]bool
		}{
			More:    "foo",
			Complex: 2.0,
			Data:    map[int]bool{1: false, 3: true},
		},
	})
	assert.Nil(t, err)

	event := <-eventChannel
	assert.NotNil(t, event)
	assert.Equal(t, BoardEventInit, event.Type)
	assert.NotNil(t, event.Data)
	assert.Equal(t, map[string]any{
		"Complex": 2.0,
		"More":    "foo",
		"Data": map[string]any{
			// Mapping int to string here, because JSON stuff.
			"1": false,
			"3": true,
		},
	}, event.Data)
}

func (suite *RealtimeBoardTestSuite) Test_Redis_Board_SendComplexData() {
	t := suite.T()
	ctx := context.Background()

	boardId := uuid.New()

	broker, err := NewRedis(RedisServer{Addr: suite.redisConnectionString})
	assert.Nil(t, err)

	eventChannel := broker.GetBoardChannel(ctx, boardId)

	err = broker.BroadcastToBoard(ctx, boardId, BoardEvent{
		Type: BoardEventInit,
		Data: struct {
			More    string
			Complex float64
			Data    map[int]bool
		}{
			More:    "foo",
			Complex: 2.0,
			Data:    map[int]bool{1: false, 3: true},
		},
	})
	assert.Nil(t, err)

	event := <-eventChannel
	assert.NotNil(t, event)
	assert.Equal(t, BoardEventInit, event.Type)
	assert.NotNil(t, event.Data)
	assert.Equal(t, map[string]any{
		"Complex": 2.0,
		"More":    "foo",
		"Data": map[string]any{
			// Mapping int to string here, because JSON stuff.
			"1": false,
			"3": true,
		},
	}, event.Data)
}

// Regression test for a bug where missing `return` statements after close(retChannel)
// in the Redis subscription goroutines caused a panic when a context was cancelled
// (e.g. a user closes their browser tab) and a subsequent event was broadcast
// (e.g. the remaining admin also closes their tab).
//
// Scenario: Two users are on the same board. The first user (subscriber 1) closes
// their tab, which cancels their context. Without the fix, the goroutine continued
// running after closing retChannel and would panic with "send on closed channel"
// when the next board event arrived.
func (suite *RealtimeBoardTestSuite) Test_Redis_Board_FirstSubscriberContextCancelled_SecondSubscriberReceivesEvent() {
	t := suite.T()
	boardId := uuid.New()

	broker, err := NewRedis(RedisServer{Addr: suite.redisConnectionString})
	assert.Nil(t, err)

	// Subscriber 1: user who will close the tab
	ctx1, cancel1 := context.WithCancel(context.Background())
	ch1 := broker.GetBoardChannel(ctx1, boardId)

	// Subscriber 2: admin who stays on the board
	ch2 := broker.GetBoardChannel(context.Background(), boardId)

	// User closes browser tab → context cancelled
	cancel1()

	// Wait until ch1 is closed, which confirms the goroutine processed ctx.Done()
	// and did not continue looping (which would cause a panic on the next send)
	select {
	case _, ok := <-ch1:
		assert.False(t, ok, "ch1 should be closed after context cancellation")
	case <-time.After(5 * time.Second):
		t.Fatal("timeout: ch1 was not closed after context cancellation")
	}

	// Admin is still on the board; a new event is broadcast (e.g. board deleted)
	// Without the fix: goroutine 1 panics with "send on closed channel"
	err = broker.BroadcastToBoard(context.Background(), boardId, BoardEvent{Type: BoardEventBoardDeleted})
	assert.Nil(t, err)

	// Subscriber 2 (admin) should receive the event without any panic
	select {
	case event := <-ch2:
		assert.NotNil(t, event)
		assert.Equal(t, BoardEventBoardDeleted, event.Type)
	case <-time.After(5 * time.Second):
		t.Fatal("timeout: ch2 did not receive the expected event")
	}
}
