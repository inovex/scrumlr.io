package cache

import (
	"context"
	"encoding/json"
	"testing"
	"time"

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

func (suite *CacheRedisTestSuite) TestRedisCreate() {
	t := suite.T()
	ctx := context.Background()
	key := uuid.New()
	value := "test"

	cache, err := NewRedis(RedisServer{Addr: suite.redisConnectionString})
	assert.Nil(t, err)

	err = cache.Con.Create(ctx, key.String(), value, time.Second)
	assert.Nil(t, err)

	ret, err := cache.Con.Get(ctx, key.String())
	assert.Nil(t, err)

	var retVal string
	err = json.Unmarshal(ret, &retVal)
	assert.Nil(t, err)

	assert.Equal(t, value, retVal)
}

func (suite *CacheRedisTestSuite) TestRedisCreateAlreadyExists() {
	t := suite.T()
	ctx := context.Background()
	key := uuid.New()

	cache, err := NewRedis(RedisServer{Addr: suite.redisConnectionString})
	assert.Nil(t, err)

	err = cache.Con.Create(ctx, key.String(), "test", 0)
	assert.Nil(t, err)

	err = cache.Con.Create(ctx, key.String(), "this should not work", 0)
	assert.NotNil(t, err)
	assert.Equal(t, &KeyAlreadyExists{redis.Nil}, err)
}

func (suite *CacheRedisTestSuite) TestRedisPut() {
	t := suite.T()
	ctx := context.Background()
	key := uuid.New()
	value := "put"

	cache, err := NewRedis(RedisServer{Addr: suite.redisConnectionString})
	assert.Nil(t, err)

	err = cache.Con.Put(ctx, key.String(), value)
	assert.Nil(t, err)

	ret, err := cache.Con.Get(ctx, key.String())
	assert.Nil(t, err)

	var retVal string
	err = json.Unmarshal(ret, &retVal)
	assert.Nil(t, err)

	assert.Equal(t, value, retVal)
}

func (suite *CacheRedisTestSuite) TestRedisPutOverride() {
	t := suite.T()
	ctx := context.Background()
	key := uuid.New()
	value := "this should work"

	cache, err := NewRedis(RedisServer{Addr: suite.redisConnectionString})
	assert.Nil(t, err)

	err = cache.Con.Put(ctx, key.String(), "put")
	assert.Nil(t, err)

	err = cache.Con.Put(ctx, key.String(), value)
	assert.Nil(t, err)

	ret, err := cache.Con.Get(ctx, key.String())
	assert.Nil(t, err)

	var retVal string
	err = json.Unmarshal(ret, &retVal)
	assert.Nil(t, err)

	assert.Equal(t, value, retVal)
}

func (suite *CacheRedisTestSuite) TestRedisGet() {
	t := suite.T()
	ctx := context.Background()
	key := uuid.New()
	value := "test"

	cache, err := NewRedis(RedisServer{Addr: suite.redisConnectionString})
	assert.Nil(t, err)

	err = cache.Con.Create(ctx, key.String(), value, 0)
	assert.Nil(t, err)

	ret, err := cache.Con.Get(ctx, key.String())
	assert.Nil(t, err)

	var retVal string
	err = json.Unmarshal(ret, &retVal)
	assert.Nil(t, err)

	assert.Equal(t, value, retVal)
}

func (suite *CacheRedisTestSuite) TestRedisGetNotFound() {
	t := suite.T()
	ctx := context.Background()
	key := uuid.New()

	cache, err := NewRedis(RedisServer{Addr: suite.redisConnectionString})
	assert.Nil(t, err)

	val, err := cache.Con.Get(ctx, key.String())

	assert.Nil(t, val)
	assert.NotNil(t, err)
	assert.Equal(t, &KeyNotFound{redis.Nil}, err)
}

func (suite *CacheRedisTestSuite) TestRedisDelete() {
	t := suite.T()
	ctx := context.Background()
	key := uuid.New()

	cache, err := NewRedis(RedisServer{Addr: suite.redisConnectionString})
	assert.Nil(t, err)

	err = cache.Con.Create(ctx, key.String(), "test", 0)
	assert.Nil(t, err)

	err = cache.Con.Delete(ctx, key.String())
	assert.Nil(t, err)

	ret, err := cache.Con.Get(ctx, key.String())
	assert.Nil(t, ret)
	assert.NotNil(t, err)
}

func (suite *CacheRedisTestSuite) TestRedisDeleteNotFound() {
	t := suite.T()
	ctx := context.Background()
	key := uuid.New()

	cache, err := NewRedis(RedisServer{Addr: suite.redisConnectionString})
	assert.Nil(t, err)

	err = cache.Con.Delete(ctx, key.String())
	assert.Nil(t, err)
}
