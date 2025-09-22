package realtime

import (
	"context"
	"testing"

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
