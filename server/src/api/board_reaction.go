package api

import (
	"net/http"

	"github.com/go-chi/render"
	"github.com/google/uuid"
	"go.opentelemetry.io/otel/codes"
	"scrumlr.io/server/boardreactions"
	"scrumlr.io/server/common"
	"scrumlr.io/server/identifiers"
	"scrumlr.io/server/logger"
)

//var tracer trace.Tracer = otel.Tracer("scrumlr.io/server/api")

// createBoardReaction creates a new board reaction
func (s *Server) createBoardReaction(w http.ResponseWriter, r *http.Request) {
	ctx, span := Tracer.Start(r.Context(), "scrumlr.board_reactions.api.create")
	defer span.End()
	log := logger.FromContext(ctx)

	board := ctx.Value(identifiers.BoardIdentifier).(uuid.UUID)
	user := ctx.Value(identifiers.UserIdentifier).(uuid.UUID)

	var body boardreactions.BoardReactionCreateRequest
	if err := render.Decode(r, &body); err != nil {
		span.SetStatus(codes.Error, "unable to decode body")
		span.RecordError(err)
		log.Errorw("unable to create board reaction", "err", err)
		common.Throw(w, r, common.BadRequestError(err))
		return
	}

	// user is filled from context
	body.User = user

	s.boardReactions.Create(ctx, board, body)

	render.Status(r, http.StatusCreated)
	render.Respond(w, r, nil)
}
