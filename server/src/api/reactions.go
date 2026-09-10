package api

import (
	"net/http"

	"github.com/go-chi/render"
	"github.com/google/uuid"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/trace"
	"scrumlr.io/server/common"
	"scrumlr.io/server/identifiers"
	"scrumlr.io/server/logger"
	scrumlrOtel "scrumlr.io/server/otel"
	"scrumlr.io/server/reactions"
)

var tracer trace.Tracer = otel.Tracer("scrumlr.io/server/api")

// Get a reaction on a board
//
//	@Summary		Get a reaction on a board
//	@Description	Get a reaction on a board
//	@Tags			reactions
//	@Accept			json
//	@Param			Cookie	header	string	true	"jwt token to authenticate"
//	@Param			boardId	path	string	true	"id of the board"
//	@Param			id		path	string	true	"id of the reaction"
//	@Produce		json
//	@Success		200	{object}	reactions.Reaction
//	@Failure		400	{object}	common.APIError
//	@Failure		403	{object}	common.APIError
//	@Failure		404	{object}	common.APIError
//	@Failure		500	{object}	common.APIError
//	@Router			/boards/{boardId}/reactions/{id} [get]
func (s *Server) getReaction(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "scrumlr.reactions.api.get")
	defer span.End()

	id := ctx.Value(identifiers.ReactionIdentifier).(uuid.UUID)

	reaction, err := s.reactions.Get(ctx, id)
	if err != nil {
		scrumlrOtel.RecordErrorSpan(span, err, new("failed to get reaction"))
		common.Throw(w, r, mapError(err))
		return
	}

	render.Status(r, http.StatusOK)
	render.Respond(w, r, reaction)
}

// Get all reaction on a board
//
//	@Summary		Get all reaction on a board
//	@Description	Get all reaction on a board
//	@Tags			reactions
//	@Accept			json
//	@Param			Cookie	header	string	true	"jwt token to authenticate"
//	@Param			boardId	path	string	true	"id of the board"
//	@Produce		json
//	@Success		200	{object}	[]reactions.Reaction
//	@Failure		400	{object}	common.APIError
//	@Failure		403	{object}	common.APIError
//	@Failure		404	{object}	common.APIError
//	@Failure		500	{object}	common.APIError
//	@Router			/boards/{boardId}/reactions [get]
func (s *Server) getReactions(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "scrumlr.reactions.api.get.all")
	defer span.End()

	board := ctx.Value(identifiers.BoardIdentifier).(uuid.UUID)

	reactions, err := s.reactions.GetAll(ctx, board)
	if err != nil {
		scrumlrOtel.RecordErrorSpan(span, err, new("failed to get reactions for board"))
		common.Throw(w, r, mapError(err))
		return
	}

	render.Status(r, http.StatusOK)
	render.Respond(w, r, reactions)
}

// Create a new reaction on a board
//
//	@Summary		Create a new reaction on a board
//	@Description	Create a new reaction on a board
//	@Tags			reactions
//	@Accept			json
//	@Param			Cookie		header	string							true	"jwt token to authenticate"
//	@Param			boardId		path	string							true	"id of the board"
//	@Param			reaction	body	reactions.ReactionCreateRequest	true	"reaction to create"
//	@Produce		json
//	@Success		201	{object}	reactions.Reaction
//	@Failure		400	{object}	common.APIError
//	@Failure		403	{object}	common.APIError
//	@Failure		404	{object}	common.APIError
//	@Failure		500	{object}	common.APIError
//	@Router			/boards/{boardId}/reactions [post]
func (s *Server) createReaction(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "scrumlr.reactions.api.create")
	defer span.End()
	log := logger.FromContext(ctx)

	board := ctx.Value(identifiers.BoardIdentifier).(uuid.UUID)
	user := ctx.Value(identifiers.UserIdentifier).(uuid.UUID)

	var body reactions.ReactionCreateRequest
	if err := render.Decode(r, &body); err != nil {
		scrumlrOtel.RecordErrorSpan(span, err, new("unable to decode body"))
		log.Errorw("unable to decode body", "err", err)
		common.Throw(w, r, common.BadRequestError(err))
		return
	}

	// user is filled from context
	body.User = user
	body.Board = board

	reaction, err := s.reactions.Create(ctx, body)
	if err != nil {
		scrumlrOtel.RecordErrorSpan(span, err, new("failed to create reaction"))
		common.Throw(w, r, mapError(err))
		return
	}

	render.Status(r, http.StatusCreated)
	render.Respond(w, r, reaction)
}

// Remove a reaction from a board
//
//	@Summary		Remove a reaction from a board
//	@Description	Remove a reaction from a board
//	@Tags			reactions
//	@Accept			json
//	@Param			Cookie	header	string	true	"jwt token to authenticate"
//	@Param			boardId	path	string	true	"id of the board"
//	@Param			id		path	string	true	"id of the reaction"
//	@Produce		json
//	@Success		204
//	@Failure		400	{object}	common.APIError
//	@Failure		403	{object}	common.APIError
//	@Failure		404	{object}	common.APIError
//	@Failure		500	{object}	common.APIError
//	@Router			/boards/{boardId}/reactions/{id} [delete]
func (s *Server) removeReaction(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "scrumlr.reactions.api.remove")
	defer span.End()

	board := ctx.Value(identifiers.BoardIdentifier).(uuid.UUID)
	user := ctx.Value(identifiers.UserIdentifier).(uuid.UUID)
	id := ctx.Value(identifiers.ReactionIdentifier).(uuid.UUID)

	if err := s.reactions.Delete(ctx, board, user, id); err != nil {
		scrumlrOtel.RecordErrorSpan(span, err, new("failed to remove reaction"))
		common.Throw(w, r, mapError(err))
		return
	}

	render.Status(r, http.StatusNoContent)
	render.Respond(w, r, nil)
}

// Update a reaction on a board
//
//	@Summary		Update a reaction on a board
//	@Description	Update a reaction on a board
//	@Tags			reactions
//	@Accept			json
//	@Param			Cookie		header	string								true	"jwt token to authenticate"
//	@Param			boardId		path	string								true	"id of the board"
//	@Param			id			path	string								true	"id of the reaction"
//	@Param			reaction	body	reactions.ReactionUpdateTypeRequest	true	"values to update the reaction"
//	@Produce		json
//	@Success		204
//	@Failure		400	{object}	common.APIError
//	@Failure		403	{object}	common.APIError
//	@Failure		404	{object}	common.APIError
//	@Failure		500	{object}	common.APIError
//	@Router			/boards/{boardId}/reactions/{id} [put]
func (s *Server) updateReaction(w http.ResponseWriter, r *http.Request) {
	log := logger.FromRequest(r)
	ctx, span := tracer.Start(r.Context(), "scrumlr.reactions.api.update")
	defer span.End()

	board := ctx.Value(identifiers.BoardIdentifier).(uuid.UUID)
	user := ctx.Value(identifiers.UserIdentifier).(uuid.UUID)
	id := ctx.Value(identifiers.ReactionIdentifier).(uuid.UUID)

	var body reactions.ReactionUpdateTypeRequest
	if err := render.Decode(r, &body); err != nil {
		scrumlrOtel.RecordErrorSpan(span, err, new("failed to decode body"))
		log.Errorw("unable to decode body", "err", err)
		common.Throw(w, r, common.BadRequestError(err))
		return
	}

	reaction, err := s.reactions.Update(ctx, board, user, id, body)
	if err != nil {
		scrumlrOtel.RecordErrorSpan(span, err, new("failed to update reaction"))
		common.Throw(w, r, mapError(err))
		return
	}

	render.Status(r, http.StatusOK)
	render.Respond(w, r, reaction)
}
