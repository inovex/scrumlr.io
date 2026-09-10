package reactions

import (
	"context"
	"database/sql"
	"errors"

	"github.com/google/uuid"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/codes"
	"scrumlr.io/server/logger"
	"scrumlr.io/server/otel"
	"scrumlr.io/server/realtime"
)

type ReactionDatabase interface {
	Get(ctx context.Context, id uuid.UUID) (DatabaseReaction, error)
	GetAll(ctx context.Context, board uuid.UUID) ([]DatabaseReaction, error)
	GetAllForNote(ctx context.Context, note uuid.UUID) ([]DatabaseReaction, error)
	Create(ctx context.Context, board uuid.UUID, insert DatabaseReactionInsert) (DatabaseReaction, error)
	Delete(ctx context.Context, id uuid.UUID) error
	Update(ctx context.Context, id uuid.UUID, update DatabaseReactionUpdate) (DatabaseReaction, error)
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

func (service *Service) Create(ctx context.Context, body ReactionCreateRequest) (*Reaction, error) {
	log := logger.FromContext(ctx)
	ctx, span := tracer.Start(ctx, "scrumlr.reactions.service.create")
	defer span.End()

	span.SetAttributes(
		attribute.String("scrumlr.reactions.service.create.user", body.User.String()),
		attribute.String("scrumlr.reactions.service.create.board", body.Board.String()),
		attribute.String("scrumlr.reactions.service.create.reaction.type", string(body.ReactionType)),
	)

	currentReactions, err := service.database.GetAllForNote(ctx, body.Note)
	if err != nil {
		otel.RecordErrorSpan(span, err, new("failed to get current reactions"))
		log.Errorw("Unable to get current reactions for note", body.Note, "boardId", body.Board)
		return nil, CreateReactionError(Internal, "failed to get current reactions", err)
	}

	for _, currentReaction := range currentReactions {
		if currentReaction.User == body.User {
			err := errors.New("cannot make multiple reactions on the same note by the same user")
			otel.RecordErrorSpan(span, err, new("multiple reactions not allowed"))
			log.Errorw("Cannot make multiple reactions on the same note by the same user", "user", body.User, "note", body.Note)
			return nil, CreateReactionError(Conflict, "cannot make multiple reactions on the same note by the same user", err)
		}
	}

	reaction, err := service.database.Create(
		ctx,
		body.Board,
		DatabaseReactionInsert{Note: body.Note, User: body.User, ReactionType: body.ReactionType},
	)

	if err != nil {
		otel.RecordErrorSpan(span, err, new("failed to create reaction"))
		log.Errorw("Unable to create reaction", "note", body.Note, "user", body.User, "type", body.ReactionType, "error", err)
		return nil, CreateReactionError(Internal, "failed to create reaction", err)
	}

	service.addReaction(ctx, body.Board, reaction)
	reactionCreatedCounter.Add(ctx, 1)
	return new(Reaction).From(reaction), err
}

func (service *Service) Get(ctx context.Context, id uuid.UUID) (*Reaction, error) {
	log := logger.FromContext(ctx)
	ctx, span := tracer.Start(ctx, "scrumlr.reactions.service.get")
	defer span.End()

	span.SetAttributes(
		attribute.String("scrumlr.reactions.service.get.reaction", id.String()),
	)

	reaction, err := service.database.Get(ctx, id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			otel.RecordErrorSpan(span, err, new("reaction not found"))
			return nil, CreateReactionError(NotFound, "reaction not found", err)
		}

		otel.RecordErrorSpan(span, err, new("failed to get reaction"))
		log.Errorw("Unable to get reaction", "userId", id, "err", err)
		return nil, CreateReactionError(Internal, "unable to get reaction", err)
	}

	return new(Reaction).From(reaction), err
}

func (service *Service) GetAll(ctx context.Context, boardId uuid.UUID) ([]*Reaction, error) {
	log := logger.FromContext(ctx)
	ctx, span := tracer.Start(ctx, "scrumlr.reactions.service.get.all")
	defer span.End()

	span.SetAttributes(
		attribute.String("scrumlr.reactions.service.get.all.board", boardId.String()),
	)

	reactions, err := service.database.GetAll(ctx, boardId)
	if err != nil {
		otel.RecordErrorSpan(span, err, new("failed to get reactions for board"))
		log.Errorw("Unable to get reactions", "boardId", boardId, "err", err)
		return nil, CreateReactionError(Internal, "unable to get reaction", err)
	}

	return Reactions(reactions), err
}

func (service *Service) Update(ctx context.Context, board, user, id uuid.UUID, body ReactionUpdateTypeRequest) (*Reaction, error) {
	log := logger.FromContext(ctx)
	ctx, span := tracer.Start(ctx, "scrumlr.reactions.service.update")
	defer span.End()

	span.SetAttributes(
		attribute.String("scrumlr.reactions.service.update.user", user.String()),
		attribute.String("scrumlr.reactions.service.update.board", board.String()),
		attribute.String("scrumlr.reactions.service.update.reaction", id.String()),
		attribute.String("scrumlr.reactions.service.update.reaction.type", string(body.ReactionType)),
	)

	currentReaction, err := service.Get(ctx, id)
	if err != nil {
		otel.RecordErrorSpan(span, err, new("failed to get reaction"))
		return nil, err
	}

	if currentReaction.User != user {
		err := errors.New("forbidden to update other user's reaction")
		otel.RecordErrorSpan(span, err, new("cannot update reaction from other user"))
		log.Errorw("Unable to update reaction from other users", "reactionUserId", currentReaction.User, "user", user)
		return nil, CreateReactionError(Forbidden, "forbidden to update other user's reaction", err)
	}

	reaction, err := service.database.Update(ctx, id, DatabaseReactionUpdate{ReactionType: body.ReactionType})
	if err != nil {
		otel.RecordErrorSpan(span, err, new("failed to update reaction"))
		log.Errorw("Unable to update reaction", "id", id, "type", body.ReactionType, "error", err)
		return nil, CreateReactionError(Internal, "failed to update reaction", err)
	}

	service.updateReaction(ctx, board, reaction)
	reactionUpdatedCounter.Add(ctx, 1)
	return new(Reaction).From(reaction), err
}

func (service *Service) Delete(ctx context.Context, board, user, id uuid.UUID) error {
	log := logger.FromContext(ctx)
	ctx, span := tracer.Start(ctx, "scrumlr.reactions.service.delete")
	defer span.End()

	span.SetAttributes(
		attribute.String("scrumlr.reactions.service.delete.user", user.String()),
		attribute.String("scrumlr.reactions.service.deleteboard", board.String()),
		attribute.String("scrumlr.reactions.service.delete.reaction", id.String()),
	)

	reaction, err := service.Get(ctx, id)
	if err != nil {
		otel.RecordErrorSpan(span, err, new("failed to get reaction"))
		return err
	}

	if reaction.User != user {
		err := CreateReactionError(Forbidden, "forbidden to delete other user's reaction", errors.New("forbidden to delete other user's reaction"))
		span.SetStatus(codes.Error, "cannot remove reaction from other user")
		span.RecordError(err)
		log.Errorw("Unable to remove reaction from other users", "reactionUserId", reaction.User, "user", user)
		return err
	}

	err = service.database.Delete(ctx, id)
	if err != nil {
		otel.RecordErrorSpan(span, err, new("failed to delete reaction"))
		log.Errorw("Unable to remove reaction", "board", board, "user", user, "reaction", id)
		return CreateReactionError(Internal, "failed to delete reaction", err)
	}

	service.deleteReaction(ctx, board, id)
	reactionRemovedCounter.Add(ctx, 1)
	return err
}

func (service *Service) addReaction(ctx context.Context, board uuid.UUID, reaction DatabaseReaction) {
	ctx, span := tracer.Start(ctx, "scrumlr.reactions.service.add")
	defer span.End()

	eventReaction := *new(Reaction).From(reaction)

	err := service.realtime.BroadcastToBoard(
		ctx,
		board,
		realtime.BoardEvent{
			Type: realtime.BoardEventReactionAdded,
			Data: eventReaction,
		},
	)

	if err != nil {
		otel.RecordErrorSpan(span, err, new("failed to send add reaction message"))
	}
}

func (service *Service) updateReaction(ctx context.Context, board uuid.UUID, reaction DatabaseReaction) {
	ctx, span := tracer.Start(ctx, "scrumlr.reactions.service.update")
	defer span.End()

	eventReaction := *new(Reaction).From(reaction)

	err := service.realtime.BroadcastToBoard(
		ctx,
		board,
		realtime.BoardEvent{
			Type: realtime.BoardEventReactionUpdated,
			Data: eventReaction,
		},
	)

	if err != nil {
		otel.RecordErrorSpan(span, err, new("failed to send update reaction message"))
	}
}

func (service *Service) deleteReaction(ctx context.Context, board, reaction uuid.UUID) {
	ctx, span := tracer.Start(ctx, "scrumlr.reactions.service.delete")
	defer span.End()

	err := service.realtime.BroadcastToBoard(
		ctx,
		board,
		realtime.BoardEvent{
			Type: realtime.BoardEventReactionDeleted,
			Data: reaction,
		},
	)

	if err != nil {
		otel.RecordErrorSpan(span, err, new("failed to send delete reaction message"))
	}
}
