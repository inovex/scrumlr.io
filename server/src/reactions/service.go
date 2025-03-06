package reactions

import (
	"context"

	"github.com/google/uuid"
	"scrumlr.io/server/common"
	"scrumlr.io/server/logger"
	"scrumlr.io/server/realtime"
)

type ReactionDatabase interface {
	GetReaction(id uuid.UUID) (DatabaseReaction, error)
	GetReactions(board uuid.UUID) ([]DatabaseReaction, error)
	GetReactionsForNote(note uuid.UUID) ([]DatabaseReaction, error)
	CreateReaction(board uuid.UUID, insert DatabaseReactionInsert) (DatabaseReaction, error)
	RemoveReaction(board, user, id uuid.UUID) error
	UpdateReaction(board, user, id uuid.UUID, update DatabaseReactionUpdate) (DatabaseReaction, error)
}

type Service struct {
	database ReactionDatabase
	realtime *realtime.Broker
}

func NewReactionService(db ReactionDatabase, rt *realtime.Broker) ReactionService {
	service := new(Service)
	service.database = db
	service.realtime = rt

	return service
}

func (service *Service) Get(ctx context.Context, id uuid.UUID) (*Reaction, error) {
	log := logger.FromContext(ctx)
	reaction, err := service.database.GetReaction(id)
	if err != nil {
		log.Errorw("Unable to get reaction", "userId", id, "err", err)
		return nil, err
	}

	return new(Reaction).From(reaction), err
}

func (service *Service) List(ctx context.Context, boardId uuid.UUID) ([]*Reaction, error) {
	log := logger.FromContext(ctx)
	reactions, err := service.database.GetReactions(boardId)
	if err != nil {
		log.Errorw("Unable to get reactions", "boardId", boardId, "err", err)
		return nil, err
	}

	return Reactions(reactions), err
}

func (service *Service) Create(ctx context.Context, board uuid.UUID, body ReactionCreateRequest) (*Reaction, error) {
	log := logger.FromContext(ctx)
	reaction, err := service.database.CreateReaction(
		board,
		DatabaseReactionInsert{
			Note:         body.Note,
			User:         body.User,
			ReactionType: body.ReactionType,
		},
	)

	if err != nil {
		log.Errorw("Unable to create reaction", "note", body.Note, "user", body.User, "type", body.ReactionType, "error", err)
		return nil, common.InternalServerError
	}

	service.addReaction(board, reaction)

	return new(Reaction).From(reaction), err
}

func (service *Service) Delete(ctx context.Context, board, user, id uuid.UUID) error {
	log := logger.FromContext(ctx)
	err := service.database.RemoveReaction(board, user, id)
	if err != nil {
		log.Errorw("Unable to remove reaction", "board", board, "user", user, "reaction", id)
		return err
	}

	service.deleteReaction(board, id)

	return err
}

func (service *Service) Update(ctx context.Context, board, user, id uuid.UUID, body ReactionUpdateTypeRequest) (*Reaction, error) {
	log := logger.FromContext(ctx)
	reaction, err := service.database.UpdateReaction(
		board,
		user,
		id,
		DatabaseReactionUpdate{
			ReactionType: body.ReactionType,
		},
	)

	if err != nil {
		log.Errorw("Unable to update reaction", "id", id, "type", body.ReactionType, "error", err)
		return nil, common.InternalServerError
	}

	service.updateReaction(board, reaction)

	return new(Reaction).From(reaction), err
}

func (service *Service) addReaction(board uuid.UUID, reaction DatabaseReaction) {
	eventReaction := *new(Reaction).From(reaction)

	_ = service.realtime.BroadcastToBoard(
		board,
		realtime.BoardEvent{
			Type: realtime.BoardEventReactionAdded,
			Data: eventReaction,
		},
	)
}

func (service *Service) deleteReaction(board, reaction uuid.UUID) {
	_ = service.realtime.BroadcastToBoard(
		board,
		realtime.BoardEvent{
			Type: realtime.BoardEventReactionDeleted,
			Data: reaction,
		},
	)
}

func (service *Service) updateReaction(board uuid.UUID, reaction DatabaseReaction) {
	eventReaction := *new(Reaction).From(reaction)

	_ = service.realtime.BroadcastToBoard(
		board,
		realtime.BoardEvent{
			Type: realtime.BoardEventReactionUpdated,
			Data: eventReaction,
		},
	)
}
