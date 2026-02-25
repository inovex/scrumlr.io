package cache

import (
	"context"
	"fmt"
	"math/rand/v2"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"
	"github.com/testcontainers/testcontainers-go/modules/nats"
	"github.com/testcontainers/testcontainers-go/modules/redis"
	"scrumlr.io/server/initialize"
)

type CacheHealthTestSuite struct {
	suite.Suite
	natsContainer         *nats.NATSContainer
	redisContainer        *redis.RedisContainer
	natsConnectionString  string
	redisConnectionString string
}

func TestCacheHealthTestSuite(t *testing.T) {
	suite.Run(t, new(CacheHealthTestSuite))
}

func (suite *CacheHealthTestSuite) SetupSuite() {
	natsContainer, natsConnectionString := initialize.StartTestNats()
	redisContainer, redisConnectionString := initialize.StartTestRedis()

	suite.natsContainer = natsContainer
	suite.natsConnectionString = natsConnectionString
	suite.redisContainer = redisContainer
	suite.redisConnectionString = redisConnectionString
}

func (suite *CacheHealthTestSuite) TearDownSuite() {
	initialize.StopTestNats(suite.natsContainer)
	initialize.StopTestRedis(suite.redisContainer)
}

func (suite *CacheHealthTestSuite) Test_Nats_Healthy() {
	t := suite.T()
	ctx := context.Background()

	cache, err := NewNats(suite.natsConnectionString, fmt.Sprintf("scrumlr-%d", rand.Int()))
	assert.Nil(t, err)

	healthy := cache.IsHealthy(ctx)

	assert.True(t, healthy)
}

func (suite *CacheHealthTestSuite) Test_Redis_Healthy() {
	t := suite.T()
	ctx := context.Background()

	cache, err := NewRedis(RedisServer{Addr: suite.redisConnectionString})
	assert.Nil(t, err)

	healthy := cache.IsHealthy(ctx)

	assert.True(t, healthy)
}

func (suite *CacheHealthTestSuite) Test_Nats_WrongUrl() {
	t := suite.T()

	cache, err := NewNats("foo", fmt.Sprintf("scrumlr-%d", rand.Int()))

	assert.Nil(t, cache)
	assert.NotNil(t, err)
}

func (suite *CacheHealthTestSuite) Test_Redis_WrongUrl() {
	t := suite.T()
	ctx := context.Background()

	cache, err := NewRedis(RedisServer{Addr: "foo"})

	assert.Nil(t, err)
	assert.NotNil(t, cache)

	healthy := cache.IsHealthy(ctx)

	assert.False(t, healthy)
}
