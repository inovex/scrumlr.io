package boardreactions

import (
	"context"

	"github.com/google/uuid"
	"scrumlr.io/server/realtime"
)

type Service struct {
	realtime *realtime.Broker
}

func NewBoardReactionService(rt *realtime.Broker) BoardReactionService {
	service := new(Service)
	service.realtime = rt

	return service
}

// Create creates a new BoardReaction and notifies all connected clients for the respective boards.
// no database query is required for this
func (service *Service) Create(_ context.Context, board uuid.UUID, body BoardReactionCreateRequest) {
	boardReaction := BoardReaction{
		ID:           uuid.New(),
		User:         body.User,
		ReactionType: body.ReactionType,
	}

	// notify
	service.addedReaction(board, boardReaction)
}

// AddedReaction creates a broadcast for all connected boards with the added reaction as payload
func (service *Service) addedReaction(board uuid.UUID, reaction BoardReaction) {
	_ = service.realtime.BroadcastToBoard(board, realtime.BoardEvent{
		Type: realtime.BoardEventBoardReactionAdded,
		Data: reaction,
	})
}
