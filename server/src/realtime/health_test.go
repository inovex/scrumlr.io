package realtime

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"
	"github.com/testcontainers/testcontainers-go/modules/nats"
	"github.com/testcontainers/testcontainers-go/modules/redis"

	"scrumlr.io/server/initialize"
)

type RealtimeHealthTestSuite struct {
	suite.Suite
	natsContainer         *nats.NATSContainer
	redisContainer        *redis.RedisContainer
	natsConnectionString  string
	redisConnectionString string
}

func TestRealtimeHealthTestSuite(t *testing.T) {
	suite.Run(t, new(RealtimeHealthTestSuite))
}

func (suite *RealtimeHealthTestSuite) SetupSuite() {
	natsContainer, natsConnectionString := initialize.StartTestNats()
	redisContainer, redisConnectionString := initialize.StartTestRedis()

	suite.natsContainer = natsContainer
	suite.natsConnectionString = natsConnectionString
	suite.redisContainer = redisContainer
	suite.redisConnectionString = redisConnectionString
}

func (suite *RealtimeHealthTestSuite) TearDownSuite() {
	initialize.StopTestNats(suite.natsContainer)
	initialize.StopTestRedis(suite.redisContainer)
}

func (suite *RealtimeHealthTestSuite) Test_Nats_Healthy() {
	t := suite.T()
	ctx := context.Background()

	broker, err := NewNats(suite.natsConnectionString)
	assert.Nil(t, err)

	healthy := broker.IsHealthy(ctx)

	assert.True(t, healthy)
}

func (suite *RealtimeHealthTestSuite) Test_Redis_Healthy() {
	t := suite.T()
	ctx := context.Background()

	broker, err := NewRedis(RedisServer{Addr: suite.redisConnectionString})
	assert.Nil(t, err)

	healthy := broker.IsHealthy(ctx)

	assert.True(t, healthy)
}

func (suite *RealtimeHealthTestSuite) Test_Nats_WrongUrl() {
	t := suite.T()

	broker, err := NewNats("foo")

	assert.Nil(t, broker)
	assert.NotNil(t, err)
}

func (suite *RealtimeHealthTestSuite) Test_Redis_WrongUrl() {
	t := suite.T()
	ctx := context.Background()

	broker, err := NewRedis(RedisServer{Addr: "foo"})

	assert.Nil(t, err)
	assert.NotNil(t, broker)

	healthy := broker.IsHealthy(ctx)

	assert.False(t, healthy)
}
