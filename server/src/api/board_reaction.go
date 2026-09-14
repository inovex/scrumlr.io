package api

import (
	"net/http"

	"github.com/go-chi/render"
	"github.com/google/uuid"
	"scrumlr.io/server/boardreactions"
	"scrumlr.io/server/common"
	"scrumlr.io/server/identifiers"
	"scrumlr.io/server/logger"
	"scrumlr.io/server/otel"
)

//var tracer trace.Tracer = otel.Tracer("scrumlr.io/server/api")

// Create a new board reaction
//
//	@Summary		Create a board reaction
//	@Description	Create a board reaction
//	@Tags			board reactions
//	@Accept			json
//	@Param			Cookie			header	string										true	"jwt token to authenticate"
//	@Param			boardreaction	body	boardreactions.BoardReactionCreateRequest	true	"Board reaction to create"
//	@Produce		json
//	@Success		201
//	@Router			/boards/{id}/board-reactions [post]
func (s *Server) createBoardReaction(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "scrumlr.board_reactions.api.create")
	defer span.End()
	log := logger.FromContext(ctx)

	board := ctx.Value(identifiers.BoardIdentifier).(uuid.UUID)
	user := ctx.Value(identifiers.UserIdentifier).(uuid.UUID)

	var body boardreactions.BoardReactionCreateRequest
	if err := render.Decode(r, &body); err != nil {
		otel.RecordErrorSpan(span, err, new("unable to decode body"))
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
