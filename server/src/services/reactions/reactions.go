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
	CreateReaction(board uuid.UUID, insert database.ReactionInsert) (database.Reaction, error)
	RemoveReaction(board, user, id uuid.UUID) error
	UpdateReaction(board, user, id uuid.UUID, update database.ReactionUpdate) (database.Reaction, error)
}

func NewReactionService(db DB, rt *realtime.Broker) services.Reactions {
	b := new(ReactionService)
	b.database = db
	b.realtime = rt

	return b
}

func (s *ReactionService) List(ctx context.Context, boardID uuid.UUID) ([]*dto.Reaction, error) {
	log := logger.FromContext(ctx)
	reactions, err := s.database.GetReactions(boardID)
	if err != nil {
		log.Errorw("unable to get reactions", "boardID", boardID, "err", err)
		return nil, err
	}
	return dto.Reactions(reactions), err
}

func (s *ReactionService) Get(ctx context.Context, id uuid.UUID) (*dto.Reaction, error) {
	log := logger.FromContext(ctx)
	reaction, err := s.database.GetReaction(id)
	if err != nil {
		log.Errorw("unable to get reaction", "userID", id, "err", err)
		return nil, err
	}
	return new(dto.Reaction).From(reaction), err
}

func (s *ReactionService) Create(ctx context.Context, board uuid.UUID, body dto.ReactionCreateRequest) (*dto.Reaction, error) {
	log := logger.FromContext(ctx)
	reaction, err := s.database.CreateReaction(
		board,
		database.ReactionInsert{
			Note:         body.Note,
			User:         body.User,
			ReactionType: body.ReactionType,
		})

	if err != nil {
		log.Errorw("unable to create reaction", "note", body.Note, "user", body.User, "type", body.ReactionType, "error", err)
		return nil, common.InternalServerError
	}

	// notify
	s.AddedReaction(board, reaction)

	return new(dto.Reaction).From(reaction), err
}

func (s *ReactionService) Delete(ctx context.Context, board, user, id uuid.UUID) error {
	log := logger.FromContext(ctx)
	err := s.database.RemoveReaction(board, user, id)
	if err != nil {
		log.Errorw("unable to remove reaction", "board", board, "user", user, "reaction", id)
		return err
	}

	// notify
	s.DeletedReaction(board, id)

	return nil
}

func (s *ReactionService) Update(ctx context.Context, board, user, id uuid.UUID, body dto.ReactionUpdateTypeRequest) (*dto.Reaction, error) {
	log := logger.FromContext(ctx)
	reaction, err := s.database.UpdateReaction(board, user, id, database.ReactionUpdate{
		ReactionType: body.ReactionType,
	})

	if err != nil {
		log.Errorw("unable to update reaction", "id", id, "type", body.ReactionType, "error", err)
		return nil, common.InternalServerError
	}

	// notify
	s.UpdatedReaction(board, reaction)

	return new(dto.Reaction).From(reaction), err
}

func (s *ReactionService) AddedReaction(board uuid.UUID, reaction database.Reaction) {
	eventReaction := *new(dto.Reaction).From(reaction)

	_ = s.realtime.BroadcastToBoard(board, realtime.BoardEvent{
		Type: realtime.BoardEventReactionAdded,
		Data: eventReaction,
	})
}

func (s *ReactionService) DeletedReaction(board, reaction uuid.UUID) {
	_ = s.realtime.BroadcastToBoard(board, realtime.BoardEvent{
		Type: realtime.BoardEventReactionDeleted,
		Data: reaction,
	})
}

func (s *ReactionService) UpdatedReaction(board uuid.UUID, reaction database.Reaction) {
	eventReaction := *new(dto.Reaction).From(reaction)

	_ = s.realtime.BroadcastToBoard(board, realtime.BoardEvent{
		Type: realtime.BoardEventReactionUpdated,
		Data: eventReaction,
	})
}
