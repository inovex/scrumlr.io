package reactions

import (
	"context"
	"database/sql"
	"errors"

	"github.com/google/uuid"
	"scrumlr.io/server/common"
	"scrumlr.io/server/logger"
	"scrumlr.io/server/realtime"
)

type ReactionDatabase interface {
	Get(id uuid.UUID) (DatabaseReaction, error)
	GetAll(board uuid.UUID) ([]DatabaseReaction, error)
	GetAllForNote(note uuid.UUID) ([]DatabaseReaction, error)
	Create(board uuid.UUID, insert DatabaseReactionInsert) (DatabaseReaction, error)
	Delete(id uuid.UUID) error
	Update(id uuid.UUID, update DatabaseReactionUpdate) (DatabaseReaction, error)
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
	reaction, err := service.database.Get(id)
	if err != nil {
		if err == sql.ErrNoRows {
			log.Errorw("Unable to get reaction", "userId", id, "err", err)
			return nil, common.NotFoundError
		}

		log.Errorw("Unable to get reaction", "userId", id, "err", err)
		return nil, common.InternalServerError
	}

	return new(Reaction).From(reaction), err
}

func (service *Service) GetAll(ctx context.Context, boardId uuid.UUID) ([]*Reaction, error) {
	log := logger.FromContext(ctx)
	reactions, err := service.database.GetAll(boardId)
	if err != nil {
		log.Errorw("Unable to get reactions", "boardId", boardId, "err", err)
		return nil, common.InternalServerError
	}

	return Reactions(reactions), err
}

func (service *Service) Create(ctx context.Context, body ReactionCreateRequest) (*Reaction, error) {
	log := logger.FromContext(ctx)

	currentReactions, err := service.database.GetAllForNote(body.Note)
	if err != nil {
		log.Errorw("Unable to get current reactions for note", body.Note, "boardId", body.Board)
		return nil, common.InternalServerError
	}

	for _, currentReaction := range currentReactions {
		if currentReaction.User == body.User {
			log.Errorw("Cannot make multiple reactions on the same note by the same user", "user", body.User, "note", body.Note)
			return nil, common.ConflictError(errors.New("cannot make multiple reactions on the same note by the same user"))
		}
	}

	reaction, err := service.database.Create(
		body.Board,
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

	service.addReaction(body.Board, reaction)

	return new(Reaction).From(reaction), err
}

func (service *Service) Delete(ctx context.Context, board, user, id uuid.UUID) error {
	log := logger.FromContext(ctx)
	reaction, err := service.Get(ctx, id)
	if err != nil {
		return err
	}

	if reaction.User != user {
		log.Errorw("Unable to remove reaction from other users", "reactionUserId", reaction.User, "user", user)
		return common.ForbiddenError(errors.New("forbidden"))
	}

	err = service.database.Delete(id)
	if err != nil {
		log.Errorw("Unable to remove reaction", "board", board, "user", user, "reaction", id)
		return common.InternalServerError
	}

	service.deleteReaction(board, id)

	return err
}

func (service *Service) Update(ctx context.Context, board, user, id uuid.UUID, body ReactionUpdateTypeRequest) (*Reaction, error) {
	log := logger.FromContext(ctx)
	currentReaction, err := service.Get(ctx, id)
	if err != nil {
		return nil, err
	}

	if currentReaction.User != user {
		log.Errorw("Unable to update reaction from other users", "reactionUserId", currentReaction.User, "user", user)
		return nil, common.ForbiddenError(errors.New("forbidden"))
	}

	reaction, err := service.database.Update(id, DatabaseReactionUpdate{ReactionType: body.ReactionType})
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
