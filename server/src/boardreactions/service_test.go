package boardreactions

import (
	"context"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/mock"
	"scrumlr.io/server/realtime"
)

func TestCreateBoardReaction(t *testing.T) {
	mockBroker := realtime.NewMockClient(t)
	mockBroker.EXPECT().Publish(mock.Anything, mock.AnythingOfType("string"), mock.Anything).Return(nil)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	boardReactionService := NewBoardReactionService(broker)
	boardReactionService.Create(context.Background(), uuid.New(), BoardReactionCreateRequest{User: uuid.New(), ReactionType: Heart})
}
