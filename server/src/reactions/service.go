package reactions

import (
	"context"

	"github.com/google/uuid"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/codes"
	"go.opentelemetry.io/otel/metric"
	"go.opentelemetry.io/otel/trace"
	"scrumlr.io/server/common"
	"scrumlr.io/server/logger"
	"scrumlr.io/server/realtime"
)

var tracer trace.Tracer = otel.Tracer("scrumlr.io/server/reactions")
var meter metric.Meter = otel.Meter("scrumlr.io/server/reactions")
var reactionCounter, _ = meter.Int64Counter(
	"reactions.counter",
	metric.WithDescription("Number of created reactions"),
	metric.WithUnit("reactions"),
)

type ReactionDatabase interface {
	Get(ctx context.Context, id uuid.UUID) (DatabaseReaction, error)
	GetAll(ctx context.Context, board uuid.UUID) ([]DatabaseReaction, error)
	GetAllForNote(ctx context.Context, note uuid.UUID) ([]DatabaseReaction, error)
	Create(ctx context.Context, board uuid.UUID, insert DatabaseReactionInsert) (DatabaseReaction, error)
	Delete(ctx context.Context, board, user, id uuid.UUID) error
	Update(ctx context.Context, board, user, id uuid.UUID, update DatabaseReactionUpdate) (DatabaseReaction, error)
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
	ctx, span := tracer.Start(ctx, "reaction-get")
	defer span.End()

	span.SetAttributes(attribute.String("id", id.String()))
	reaction, err := service.database.Get(ctx, id)
	if err != nil {
		span.SetStatus(codes.Error, "failed to get reaction")
		span.RecordError(err)
		log.Errorw("Unable to get reaction", "userId", id, "err", err)
		return nil, err
	}

	return new(Reaction).From(reaction), err
}

func (service *Service) GetAll(ctx context.Context, boardId uuid.UUID) ([]*Reaction, error) {
	log := logger.FromContext(ctx)
	ctx, span := tracer.Start(ctx, "reaction-get-all")
	defer span.End()

	span.SetAttributes(attribute.String("board", boardId.String()))
	reactions, err := service.database.GetAll(ctx, boardId)
	if err != nil {
		span.SetStatus(codes.Error, "failed to get reactions for board")
		span.RecordError(err)
		log.Errorw("Unable to get reactions", "boardId", boardId, "err", err)
		return nil, err
	}

	return Reactions(reactions), err
}

func (service *Service) Create(ctx context.Context, board uuid.UUID, body ReactionCreateRequest) (*Reaction, error) {
	log := logger.FromContext(ctx)
	ctx, span := tracer.Start(ctx, "reaction-create", trace.WithAttributes(attribute.String("reaction", "service-create")))
	defer span.End()

	span.SetAttributes(attribute.String("user", body.User.String()), attribute.String("board", board.String()), attribute.String("reaction", string(body.ReactionType)))
	reaction, err := service.database.Create(
		ctx,
		board,
		DatabaseReactionInsert{Note: body.Note, User: body.User, ReactionType: body.ReactionType},
	)

	if err != nil {
		span.SetStatus(codes.Error, "failed to create reaction")
		span.RecordError(err)
		log.Errorw("Unable to create reaction", "note", body.Note, "user", body.User, "type", body.ReactionType, "error", err)
		return nil, common.InternalServerError
	}

	service.addReaction(board, reaction)
	reactionCounter.Add(ctx, 1)
	return new(Reaction).From(reaction), err
}

func (service *Service) Delete(ctx context.Context, board, user, id uuid.UUID) error {
	log := logger.FromContext(ctx)
	ctx, span := tracer.Start(ctx, "reaction-delete")
	defer span.End()

	span.SetAttributes(attribute.String("user", user.String()), attribute.String("board", board.String()), attribute.String("id", id.String()))
	err := service.database.Delete(ctx, board, user, id)
	if err != nil {
		span.SetStatus(codes.Error, "failed to delete reaction")
		span.RecordError(err)
		log.Errorw("Unable to remove reaction", "board", board, "user", user, "reaction", id)
		return err
	}

	service.deleteReaction(board, id)

	return err
}

func (service *Service) Update(ctx context.Context, board, user, id uuid.UUID, body ReactionUpdateTypeRequest) (*Reaction, error) {
	log := logger.FromContext(ctx)
	ctx, span := tracer.Start(ctx, "reaction-update")
	defer span.End()

	span.SetAttributes(attribute.String("user", user.String()), attribute.String("board", board.String()), attribute.String("id", id.String()), attribute.String("reaction", string(body.ReactionType)))
	reaction, err := service.database.Update(
		ctx,
		board, user, id,
		DatabaseReactionUpdate{ReactionType: body.ReactionType},
	)

	if err != nil {
		span.SetStatus(codes.Error, "failed to update reaction")
		span.RecordError(err)
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
