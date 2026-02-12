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
  ctx                   context.Context
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
  suite.ctx = context.Background()
  suite.key = uuid.New().String()

  cache, err := NewRedis(RedisServer{Addr: suite.redisConnectionString})
  suite.Require().NoError(err)
  suite.cache = cache
}

func (suite *CacheRedisTestSuite) TestRedisCreate() {
  value := "test"

  err := suite.cache.Con.Create(suite.ctx, suite.key, value, time.Second)
  assert.Nil(suite.T(), err)

  ret, err := suite.cache.Con.Get(suite.ctx, suite.key)
  assert.Nil(suite.T(), err)

  var retVal string
  err = json.Unmarshal(ret, &retVal)
  assert.Nil(suite.T(), err)

  assert.Equal(suite.T(), value, retVal)
}

func (suite *CacheRedisTestSuite) TestRedisCreateAlreadyExists() {
  err := suite.cache.Con.Create(suite.ctx, suite.key, "test", 0)
  assert.Nil(suite.T(), err)

  err = suite.cache.Con.Create(suite.ctx, suite.key, "this should not work", 0)
  assert.NotNil(suite.T(), err)
  assert.Equal(suite.T(), &KeyAlreadyExists{redis.Nil}, err)
}

func (suite *CacheRedisTestSuite) TestRedisPut() {
  value := "put"

  err := suite.cache.Con.Put(suite.ctx, suite.key, value)
  assert.Nil(suite.T(), err)

  ret, err := suite.cache.Con.Get(suite.ctx, suite.key)
  assert.Nil(suite.T(), err)

  var retVal string
  err = json.Unmarshal(ret, &retVal)
  assert.Nil(suite.T(), err)

  assert.Equal(suite.T(), value, retVal)
}

func (suite *CacheRedisTestSuite) TestRedisPutOverride() {
  value := "this should work"

  err := suite.cache.Con.Put(suite.ctx, suite.key, "put")
  assert.Nil(suite.T(), err)

  err = suite.cache.Con.Put(suite.ctx, suite.key, value)
  assert.Nil(suite.T(), err)

  ret, err := suite.cache.Con.Get(suite.ctx, suite.key)
  assert.Nil(suite.T(), err)

  var retVal string
  err = json.Unmarshal(ret, &retVal)
  assert.Nil(suite.T(), err)

  assert.Equal(suite.T(), value, retVal)
}

func (suite *CacheRedisTestSuite) TestRedisGet() {
  value := "test"

  err := suite.cache.Con.Create(suite.ctx, suite.key, value, 0)
  assert.Nil(suite.T(), err)

  ret, err := suite.cache.Con.Get(suite.ctx, suite.key)
  assert.Nil(suite.T(), err)

  var retVal string
  err = json.Unmarshal(ret, &retVal)
  assert.Nil(suite.T(), err)

  assert.Equal(suite.T(), value, retVal)
}

func (suite *CacheRedisTestSuite) TestRedisGetNotFound() {
  val, err := suite.cache.Con.Get(suite.ctx, suite.key)

  assert.Nil(suite.T(), val)
  assert.NotNil(suite.T(), err)
  assert.Equal(suite.T(), &KeyNotFound{redis.Nil}, err)
}

func (suite *CacheRedisTestSuite) TestRedisDelete() {
  err := suite.cache.Con.Create(suite.ctx, suite.key, "test", 0)
  assert.Nil(suite.T(), err)

  err = suite.cache.Con.Delete(suite.ctx, suite.key)
  assert.Nil(suite.T(), err)

  ret, err := suite.cache.Con.Get(suite.ctx, suite.key)
  assert.Nil(suite.T(), ret)
  assert.NotNil(suite.T(), err)
}

func (suite *CacheRedisTestSuite) TestRedisDeleteNotFound() {
  err := suite.cache.Con.Delete(suite.ctx, suite.key)
  assert.Nil(suite.T(), err)
}
