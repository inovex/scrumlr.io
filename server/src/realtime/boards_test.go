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
	assert.Equal(t, map[string]interface{}{
		"Complex": 2.0,
		"More":    "foo",
		"Data": map[string]interface{}{
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
	assert.Equal(t, map[string]interface{}{
		"Complex": 2.0,
		"More":    "foo",
		"Data": map[string]interface{}{
			// Mapping int to string here, because JSON stuff.
			"1": false,
			"3": true,
		},
	}, event.Data)
}
