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

type RealtimeBoardSessionRequestTestSuite struct {
	suite.Suite
	natsContainer         *nats.NATSContainer
	redisContainer        *redis.RedisContainer
	natsConnectionString  string
	redisConnectionString string
}

func TestRealtimeBoardSessionRequestTestSuite(t *testing.T) {
	suite.Run(t, new(RealtimeBoardSessionRequestTestSuite))
}

func (suite *RealtimeBoardSessionRequestTestSuite) SetupSuite() {
	natsContainer, natsConnectionString := initialize.StartTestNats()
	redisContainer, redisConnectionString := initialize.StartTestRedis()

	suite.natsContainer = natsContainer
	suite.natsConnectionString = natsConnectionString
	suite.redisContainer = redisContainer
	suite.redisConnectionString = redisConnectionString
}

func (suite *RealtimeBoardSessionRequestTestSuite) TearDownSuite() {
	initialize.StopTestNats(suite.natsContainer)
	initialize.StopTestRedis(suite.redisContainer)
}

func (suite *RealtimeBoardSessionRequestTestSuite) Test_Nats_BoardSessionRequest_Accepted() {
	t := suite.T()
	ctx := context.Background()

	boardId := uuid.New()
	userId := uuid.New()
	eventType := RequestAccepted

	broker, err := NewNats(suite.natsConnectionString)
	assert.Nil(t, err)

	eventChannel := broker.GetBoardSessionRequestChannel(ctx, boardId, userId)

	err = broker.BroadcastUpdateOnBoardSessionRequest(ctx, boardId, userId, eventType)
	assert.Nil(t, err)

	event := <-eventChannel
	assert.NotNil(t, event)
	assert.Equal(t, &eventType, event)
}

func (suite *RealtimeBoardSessionRequestTestSuite) Test_Redis_BoardSessionRequest_Accepted() {
	t := suite.T()
	ctx := context.Background()

	boardId := uuid.New()
	userId := uuid.New()
	eventType := RequestAccepted

	broker, err := NewRedis(RedisServer{Addr: suite.redisConnectionString})
	assert.Nil(t, err)

	eventChannel := broker.GetBoardSessionRequestChannel(ctx, boardId, userId)

	err = broker.BroadcastUpdateOnBoardSessionRequest(ctx, boardId, userId, eventType)
	assert.Nil(t, err)

	event := <-eventChannel
	assert.NotNil(t, event)
	assert.Equal(t, &eventType, event)
}

func (suite *RealtimeBoardSessionRequestTestSuite) Test_Nats_BoardSessionRequest_Rejected() {
	t := suite.T()
	ctx := context.Background()

	boardId := uuid.New()
	userId := uuid.New()
	eventType := RequestRejected

	broker, err := NewNats(suite.natsConnectionString)
	assert.Nil(t, err)

	eventChannel := broker.GetBoardSessionRequestChannel(ctx, boardId, userId)

	err = broker.BroadcastUpdateOnBoardSessionRequest(ctx, boardId, userId, eventType)
	assert.Nil(t, err)

	event := <-eventChannel
	assert.NotNil(t, event)
	assert.Equal(t, &eventType, event)
}

func (suite *RealtimeBoardSessionRequestTestSuite) Test_Redis_BoardSessionRequest_Rejected() {
	t := suite.T()
	ctx := context.Background()

	boardId := uuid.New()
	userId := uuid.New()
	eventType := RequestRejected

	broker, err := NewRedis(RedisServer{Addr: suite.redisConnectionString})
	assert.Nil(t, err)

	eventChannel := broker.GetBoardSessionRequestChannel(ctx, boardId, userId)

	err = broker.BroadcastUpdateOnBoardSessionRequest(ctx, boardId, userId, eventType)
	assert.Nil(t, err)

	event := <-eventChannel
	assert.NotNil(t, event)
	assert.Equal(t, &eventType, event)
}

func (suite *RealtimeBoardSessionRequestTestSuite) Test_Nats_BoardSessionRequest_Undefined() {
	t := suite.T()
	ctx := context.Background()

	boardId := uuid.New()
	userId := uuid.New()
	eventType := BoardSessionRequestEventType("undefined event")

	broker, err := NewNats(suite.natsConnectionString)
	assert.Nil(t, err)

	eventChannel := broker.GetBoardSessionRequestChannel(ctx, boardId, userId)

	err = broker.BroadcastUpdateOnBoardSessionRequest(ctx, boardId, userId, eventType)
	assert.Nil(t, err)

	event := <-eventChannel
	assert.NotNil(t, event)
	assert.Equal(t, &eventType, event)
}

func (suite *RealtimeBoardSessionRequestTestSuite) Test_Redis_BoardSessionRequest_Undefined() {
	t := suite.T()
	ctx := context.Background()

	boardId := uuid.New()
	userId := uuid.New()
	eventType := BoardSessionRequestEventType("undefined event")

	broker, err := NewRedis(RedisServer{Addr: suite.redisConnectionString})
	assert.Nil(t, err)

	eventChannel := broker.GetBoardSessionRequestChannel(ctx, boardId, userId)

	err = broker.BroadcastUpdateOnBoardSessionRequest(ctx, boardId, userId, eventType)
	assert.Nil(t, err)

	event := <-eventChannel
	assert.NotNil(t, event)
	assert.Equal(t, &eventType, event)
}

// Regression test for the same missing-return bug, applied to session request subscriptions.
// Scenario: user and admin are both waiting on a board session request channel;
// the user's context is cancelled, then a new request event is broadcast.
func (suite *RealtimeBoardSessionRequestTestSuite) Test_Redis_BoardSessionRequest_FirstSubscriberContextCancelled_SecondSubscriberReceivesEvent() {
	t := suite.T()
	boardId := uuid.New()
	userId1 := uuid.New()
	userId2 := uuid.New()
	eventType := RequestAccepted

	broker, err := NewRedis(RedisServer{Addr: suite.redisConnectionString})
	assert.Nil(t, err)

	// Subscriber 1: user who will close the tab
	ctx1, cancel1 := context.WithCancel(context.Background())
	ch1 := broker.GetBoardSessionRequestChannel(ctx1, boardId, userId1)

	// Subscriber 2: another user still waiting
	ch2 := broker.GetBoardSessionRequestChannel(context.Background(), boardId, userId2)

	// Subscriber 1 closes browser tab → context cancelled
	cancel1()

	// Wait until ch1 is closed to confirm the goroutine processed ctx.Done()
	select {
	case _, ok := <-ch1:
		assert.False(t, ok, "ch1 should be closed after context cancellation")
	case <-time.After(5 * time.Second):
		t.Fatal("timeout: ch1 was not closed after context cancellation")
	}

	// A new session request event is broadcast for subscriber 2
	// Without the fix: goroutine 1 panics with "send on closed channel"
	err = broker.BroadcastUpdateOnBoardSessionRequest(context.Background(), boardId, userId2, eventType)
	assert.Nil(t, err)

	select {
	case event := <-ch2:
		assert.NotNil(t, event)
		assert.Equal(t, &eventType, event)
	case <-time.After(5 * time.Second):
		t.Fatal("timeout: ch2 did not receive the expected event")
	}
}
