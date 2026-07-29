package cache

import (
	"context"
	"encoding/json"
	"time"

	"testing"

	"github.com/google/uuid"
	"github.com/redis/go-redis/v9"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"
	testcontainer "github.com/testcontainers/testcontainers-go/modules/redis"
	"scrumlr.io/server/initialize"
)

type CacheRedisTestSuite struct {
	suite.Suite
	redisContainer        *testcontainer.RedisContainer
	redisConnectionString string
	cache                 *Cache
	key                   string
}

func TestCacheRedisTestSuite(t *testing.T) {
	suite.Run(t, new(CacheRedisTestSuite))
}

func (suite *CacheRedisTestSuite) SetupSuite() {
	redisContainer, redisConnectionString := initialize.StartTestRedis()

	suite.redisContainer = redisContainer
	suite.redisConnectionString = redisConnectionString
}

func (suite *CacheRedisTestSuite) TearDownSuite() {
	initialize.StopTestRedis(suite.redisContainer)
}

func (suite *CacheRedisTestSuite) SetupTest() {
	suite.key = uuid.New().String()

	cache, err := NewRedis(RedisServer{Addr: suite.redisConnectionString})
	suite.Require().NoError(err)
	suite.cache = cache
}

func (suite *CacheRedisTestSuite) TestRedisCreate() {
	ctx := context.Background()
	value := "test"

	err := suite.cache.Con.Create(ctx, suite.key, value, time.Second)
	assert.Nil(suite.T(), err)

	ret, err := suite.cache.Con.Get(ctx, suite.key)
	assert.Nil(suite.T(), err)

	var retVal string
	err = json.Unmarshal(ret, &retVal)
	assert.Nil(suite.T(), err)

	assert.Equal(suite.T(), value, retVal)
}

func (suite *CacheRedisTestSuite) TestRedisCreateAlreadyExists() {
	ctx := context.Background()

	err := suite.cache.Con.Create(ctx, suite.key, "test", 0)
	assert.Nil(suite.T(), err)

	err = suite.cache.Con.Create(ctx, suite.key, "this should not work", 0)
	assert.NotNil(suite.T(), err)
	assert.Equal(suite.T(), &KeyAlreadyExists{redis.Nil}, err)
}

func (suite *CacheRedisTestSuite) TestRedisPut() {
	ctx := context.Background()
	value := "put"

	err := suite.cache.Con.Put(ctx, suite.key, value)
	assert.Nil(suite.T(), err)

	ret, err := suite.cache.Con.Get(ctx, suite.key)
	assert.Nil(suite.T(), err)

	var retVal string
	err = json.Unmarshal(ret, &retVal)
	assert.Nil(suite.T(), err)

	assert.Equal(suite.T(), value, retVal)
}

func (suite *CacheRedisTestSuite) TestRedisPutOverride() {
	ctx := context.Background()
	value := "this should work"

	err := suite.cache.Con.Put(ctx, suite.key, "put")
	assert.Nil(suite.T(), err)

	err = suite.cache.Con.Put(ctx, suite.key, value)
	assert.Nil(suite.T(), err)

	ret, err := suite.cache.Con.Get(ctx, suite.key)
	assert.Nil(suite.T(), err)

	var retVal string
	err = json.Unmarshal(ret, &retVal)
	assert.Nil(suite.T(), err)

	assert.Equal(suite.T(), value, retVal)
}

func (suite *CacheRedisTestSuite) TestRedisGet() {
	ctx := context.Background()
	value := "test"

	err := suite.cache.Con.Create(ctx, suite.key, value, 0)
	assert.Nil(suite.T(), err)

	ret, err := suite.cache.Con.Get(ctx, suite.key)
	assert.Nil(suite.T(), err)

	var retVal string
	err = json.Unmarshal(ret, &retVal)
	assert.Nil(suite.T(), err)

	assert.Equal(suite.T(), value, retVal)
}

func (suite *CacheRedisTestSuite) TestRedisGetNotFound() {
	ctx := context.Background()

	val, err := suite.cache.Con.Get(ctx, suite.key)

	assert.Nil(suite.T(), val)
	assert.NotNil(suite.T(), err)
	assert.Equal(suite.T(), &KeyNotFound{redis.Nil}, err)
}

func (suite *CacheRedisTestSuite) TestRedisDelete() {
	ctx := context.Background()

	err := suite.cache.Con.Create(ctx, suite.key, "test", 0)
	assert.Nil(suite.T(), err)

	err = suite.cache.Con.Delete(ctx, suite.key)
	assert.Nil(suite.T(), err)

	ret, err := suite.cache.Con.Get(ctx, suite.key)
	assert.Nil(suite.T(), ret)
	assert.NotNil(suite.T(), err)
}

func (suite *CacheRedisTestSuite) TestRedisDeleteNotFound() {
	ctx := context.Background()

	err := suite.cache.Con.Delete(ctx, suite.key)
	assert.Nil(suite.T(), err)
}
