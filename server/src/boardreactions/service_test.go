package boardreactions

import (
	"context"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/mock"
	brokerMock "scrumlr.io/server/mocks/realtime"
	"scrumlr.io/server/realtime"
)

func TestCreateBoardReaction(t *testing.T) {
	mockBroker := brokerMock.NewMockClient(t)
	mockBroker.EXPECT().Publish(mock.AnythingOfType("string"), mock.Anything).Return(nil)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	boardReactionService := NewBoardReactionService(broker)
	boardReactionService.Create(context.Background(), uuid.New(), BoardReactionCreateRequest{User: uuid.New(), ReactionType: Heart})
}
