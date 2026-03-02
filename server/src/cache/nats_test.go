package cache

import (
	"context"
	"encoding/json"
	"fmt"
	"math/rand/v2"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/nats-io/nats.go/jetstream"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"
	"github.com/testcontainers/testcontainers-go/modules/nats"
	"scrumlr.io/server/initialize"
)

type CacheNatsTestSuite struct {
	suite.Suite
	natsContainer        *nats.NATSContainer
	natsConnectionString string
}

func TestCacheNatsTestSuite(t *testing.T) {
	suite.Run(t, new(CacheNatsTestSuite))
}

func (suite *CacheNatsTestSuite) SetupSuite() {
	natsContainer, natsConnectionString := initialize.StartTestNats()

	suite.natsContainer = natsContainer
	suite.natsConnectionString = natsConnectionString
}

func (suite *CacheNatsTestSuite) TearDownSuite() {
	initialize.StopTestNats(suite.natsContainer)
}

func (suite *CacheNatsTestSuite) TestNatsCreate() {
	t := suite.T()
	ctx := context.Background()
	key := uuid.New()
	value := "test"

	cache, err := NewNats(suite.natsConnectionString, fmt.Sprintf("scrumlr-%d", rand.Int()))
	assert.Nil(t, err)

	err = cache.Con.Create(ctx, key.String(), value, time.Second*10)
	assert.Nil(t, err)

	ret, err := cache.Con.Get(ctx, key.String())
	assert.Nil(t, err)

	var retVal string
	err = json.Unmarshal(ret, &retVal)
	assert.Nil(t, err)

	assert.Equal(t, value, retVal)
}

func (suite *CacheNatsTestSuite) TestNatsCreateAlreadyExists() {
	t := suite.T()
	ctx := context.Background()
	key := uuid.New()

	cache, err := NewNats(suite.natsConnectionString, fmt.Sprintf("scrumlr-%d", rand.Int()))
	assert.Nil(t, err)

	err = cache.Con.Create(ctx, key.String(), "test", 10)
	assert.Nil(t, err)

	err = cache.Con.Create(ctx, key.String(), "this should not work", 10)
	assert.NotNil(t, err)
	// Jetstream throws an error but not the jetstream.ErrKeyExists error
	// The jetstream.ErrKeyExists is wrapped within another error
	// assert.Equal(t, &KeyAlreadyExists{jetstream.ErrKeyExists}, err)
}

func (suite *CacheNatsTestSuite) TestNatsPut() {
	t := suite.T()
	ctx := context.Background()
	key := uuid.New()
	value := "put"

	cache, err := NewNats(suite.natsConnectionString, fmt.Sprintf("scrumlr-%d", rand.Int()))
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

func (suite *CacheNatsTestSuite) TestNatsPutOverride() {
	t := suite.T()
	ctx := context.Background()
	key := uuid.New()
	value := "this should work"

	cache, err := NewNats(suite.natsConnectionString, fmt.Sprintf("scrumlr-%d", rand.Int()))
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

func (suite *CacheNatsTestSuite) TestNatsGet() {
	t := suite.T()
	ctx := context.Background()
	key := uuid.New()
	value := "test"

	cache, err := NewNats(suite.natsConnectionString, fmt.Sprintf("scrumlr-%d", rand.Int()))
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

func (suite *CacheNatsTestSuite) TestNatsGetNotFound() {
	t := suite.T()
	ctx := context.Background()
	key := uuid.New()

	cache, err := NewNats(suite.natsConnectionString, fmt.Sprintf("scrumlr-%d", rand.Int()))
	assert.Nil(t, err)

	val, err := cache.Con.Get(ctx, key.String())

	assert.Nil(t, val)
	assert.NotNil(t, err)
	assert.Equal(t, &KeyNotFound{jetstream.ErrKeyNotFound}, err)
}

func (suite *CacheNatsTestSuite) TestNatsDelete() {
	t := suite.T()
	ctx := context.Background()
	key := uuid.New()

	cache, err := NewNats(suite.natsConnectionString, fmt.Sprintf("scrumlr-%d", rand.Int()))
	assert.Nil(t, err)

	err = cache.Con.Create(ctx, key.String(), "test", 0)
	assert.Nil(t, err)

	err = cache.Con.Delete(ctx, key.String())
	assert.Nil(t, err)

	ret, err := cache.Con.Get(ctx, key.String())
	assert.Nil(t, ret)
	assert.NotNil(t, err)
	assert.Equal(t, &KeyNotFound{jetstream.ErrKeyNotFound}, err)
}

func (suite *CacheNatsTestSuite) TestNatsDeleteNotFound() {
	t := suite.T()
	ctx := context.Background()
	key := uuid.New()

	cache, err := NewNats(suite.natsConnectionString, fmt.Sprintf("scrumlr-%d", rand.Int()))
	assert.Nil(t, err)

	err = cache.Con.Delete(ctx, key.String())
	assert.Nil(t, err)
}
