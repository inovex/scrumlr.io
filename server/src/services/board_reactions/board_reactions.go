package board_reactions

import (
	"context"
	"github.com/google/uuid"
	"scrumlr.io/server/common/dto"
	_ "scrumlr.io/server/database"
	"scrumlr.io/server/logger"
	"scrumlr.io/server/realtime"
	"scrumlr.io/server/services"
	_ "scrumlr.io/server/services"
)

type BoardReactionService struct {
	db       DB
	realtime *realtime.Broker
}

type DB interface {
}

func NewReactionService(db DB, rt *realtime.Broker) services.BoardReactions {
	b := new(BoardReactionService)
	b.realtime = rt
	b.db = db

	return b
}

// Create creates a new BoardReaction and notifies all connected clients for the respective boards.
// no database query is required for this
func (s *BoardReactionService) Create(_ context.Context, board uuid.UUID, body dto.BoardReactionCreateRequest) {
	boardReaction := dto.BoardReaction{
		ID:           uuid.New(),
		User:         body.User,
		ReactionType: body.ReactionType,
	}

	// notify
	s.AddedReaction(board, boardReaction)
}

// AddedReaction creates a broadcast for all connected boards with the added reaction as payload
func (s *BoardReactionService) AddedReaction(board uuid.UUID, reaction dto.BoardReaction) {
	err := s.realtime.BroadcastToBoard(board, realtime.BoardEvent{
		Type: realtime.BoardEventBoardReactionAdded,
		Data: reaction,
	})

	if err != nil {
		logger.Get().Errorw("unable to broadcast updated reactions", "err", err)
	}
}
