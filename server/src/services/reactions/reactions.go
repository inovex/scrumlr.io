package reactions

import (
	"context"
	"github.com/google/uuid"
	"scrumlr.io/server/common/dto"
	"scrumlr.io/server/database"
	"scrumlr.io/server/realtime"
	"scrumlr.io/server/services"
)

type ReactionService struct {
	database DB
	realtime *realtime.Broker
}

type DB interface {
	GetReaction(id uuid.UUID) (database.Reaction, error)
	GetReactions(note uuid.UUID) ([]database.Reaction, error)
}

func NewReactionService(db DB, rt *realtime.Broker) services.Reactions {
	b := new(ReactionService)
	b.database = db
	b.realtime = rt

	return b
}

func (s *ReactionService) List(_ context.Context, noteID uuid.UUID) ([]*dto.Reaction, error) {
	reactions, err := s.database.GetReactions(noteID)
	return dto.Reactions(reactions), err
}

func (s *ReactionService) Get(_ context.Context, id uuid.UUID) (*dto.Reaction, error) {
	reaction, err := s.database.GetReaction(id)
	return new(dto.Reaction).From(reaction), err
}
