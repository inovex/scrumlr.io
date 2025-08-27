package boardreactions

import (
	"context"

	"github.com/google/uuid"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/metric"
	"go.opentelemetry.io/otel/trace"
	"scrumlr.io/server/realtime"
)

var tracer trace.Tracer = otel.Tracer("scrumlr.io/server/boards")
var meter metric.Meter = otel.Meter("scrumlr.io/server/boards")

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
func (service *Service) Create(ctx context.Context, board uuid.UUID, body BoardReactionCreateRequest) {
	_, span := tracer.Start(ctx, "scrumlr.board_reactions.service.create")
	defer span.End()

	boardReaction := BoardReaction{
		ID:           uuid.New(),
		User:         body.User,
		ReactionType: body.ReactionType,
	}

	span.SetAttributes(
		attribute.String("scrumlr.board_reactions.service.create.board", board.String()),
		attribute.String("scrumlr.board_reactions.service.create.user", body.User.String()),
		attribute.String("scrumlr.board_reactions.service.create.reaction", string(body.ReactionType)),
	)

	boardReactionsCreatedCounter.Add(ctx, 1)
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
