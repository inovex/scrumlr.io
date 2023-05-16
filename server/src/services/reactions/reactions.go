package reactions

import (
	"context"
	"github.com/google/uuid"
	"scrumlr.io/server/common"
	"scrumlr.io/server/common/dto"
	"scrumlr.io/server/database"
	"scrumlr.io/server/logger"
	"scrumlr.io/server/realtime"
	"scrumlr.io/server/services"
)

type ReactionService struct {
	database DB
	realtime *realtime.Broker
}

type DB interface {
	GetReaction(id uuid.UUID) (database.Reaction, error)
	GetReactions(board uuid.UUID) ([]database.Reaction, error)
	CreateReaction(insert database.ReactionInsert) (database.Reaction, error)
	RemoveReaction(id uuid.UUID) error
}

func NewReactionService(db DB, rt *realtime.Broker) services.Reactions {
	b := new(ReactionService)
	b.database = db
	b.realtime = rt

	return b
}

func (s *ReactionService) List(_ context.Context, boardID uuid.UUID) ([]*dto.Reaction, error) {
	reactions, err := s.database.GetReactions(boardID)

	return dto.Reactions(reactions), err
}

func (s *ReactionService) Get(_ context.Context, id uuid.UUID) (*dto.Reaction, error) {
	reaction, err := s.database.GetReaction(id)
	return new(dto.Reaction).From(reaction), err
}

func (s *ReactionService) Create(ctx context.Context, body dto.ReactionCreateRequest) (*dto.Reaction, error) {
	log := logger.FromContext(ctx)
	reaction, err := s.database.CreateReaction(database.ReactionInsert{
		Board:        body.Board,
		Note:         body.Note,
		User:         body.User,
		ReactionType: body.ReactionType,
	})

	if err != nil {
		log.Errorw("unable to create reaction", "note", body.Note, "user", body.User, "type", body.ReactionType, "error", err)
		return nil, common.InternalServerError
	}
	return new(dto.Reaction).From(reaction), err
}

func (s *ReactionService) Delete(_ context.Context, id uuid.UUID) error {
	return s.database.RemoveReaction(id)
}
