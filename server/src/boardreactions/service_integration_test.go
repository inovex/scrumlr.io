package boardreactions

import (
	"context"
	"log"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"
	"github.com/testcontainers/testcontainers-go/modules/nats"
	"scrumlr.io/server/initialize"
	"scrumlr.io/server/realtime"
	"scrumlr.io/server/technical_helper"
)

type BoardReactionServiceIntegrationTestSuite struct {
	suite.Suite
	natsContainer        *nats.NATSContainer
	natsConnectionString string
}

func TestBoardReactionServiceIntegrationTestsuite(t *testing.T) {
	suite.Run(t, new(BoardReactionServiceIntegrationTestSuite))
}

func (suite *BoardReactionServiceIntegrationTestSuite) SetupSuite() {
	natsContainer, connectionString := initialize.StartTestNats()

	suite.natsContainer = natsContainer
	suite.natsConnectionString = connectionString
}

func (suite *BoardReactionServiceIntegrationTestSuite) TearDownSuite() {
	initialize.StopTestNats(suite.natsContainer)
}

func (suite *BoardReactionServiceIntegrationTestSuite) Test_Create() {
	t := suite.T()
	ctx := context.Background()

	boardId := uuid.New()
	userId := uuid.New()
	reaction := Applause

	broker, err := realtime.NewNats(suite.natsConnectionString)
	if err != nil {
		log.Fatalf("Failed to connect to nats server %s", err)
	}

	events := broker.GetBoardChannel(boardId)

	service := NewBoardReactionService(broker)

	service.Create(ctx, boardId, BoardReactionCreateRequest{User: userId, ReactionType: reaction})

	msg := <-events
	assert.Equal(t, realtime.BoardEventBoardReactionAdded, msg.Type)
	boardReaction, err := technical_helper.Unmarshal[BoardReaction](msg.Data)
	assert.Nil(t, err)
	assert.Equal(t, Applause, boardReaction.ReactionType)
}
