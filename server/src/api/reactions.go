package api

import (
	"net/http"

	"github.com/go-chi/render"
	"github.com/google/uuid"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/codes"
	"go.opentelemetry.io/otel/trace"
	"scrumlr.io/server/common"
	"scrumlr.io/server/identifiers"
	"scrumlr.io/server/logger"
	"scrumlr.io/server/reactions"
)

var Tracer trace.Tracer = otel.Tracer("scrumlr.io/server/api")

func (s *Server) getReaction(w http.ResponseWriter, r *http.Request) {
	ctx, span := Tracer.Start(r.Context(), "scrumlr.reactions.api.get")
	defer span.End()

	id := ctx.Value(identifiers.ReactionIdentifier).(uuid.UUID)

	reaction, err := s.reactions.Get(ctx, id)
	if err != nil {
		span.SetStatus(codes.Error, "failed to get reaction")
		span.RecordError(err)
		common.Throw(w, r, err)
		return
	}

	render.Status(r, http.StatusOK)
	render.Respond(w, r, reaction)
}

func (s *Server) getReactions(w http.ResponseWriter, r *http.Request) {
	ctx, span := Tracer.Start(r.Context(), "scrumlr.reactions.api.get.all")
	defer span.End()

	board := ctx.Value(identifiers.BoardIdentifier).(uuid.UUID)

	reactions, err := s.reactions.GetAll(ctx, board)
	if err != nil {
		span.SetStatus(codes.Error, "failed to get reactions for board")
		span.RecordError(err)
		common.Throw(w, r, err)
		return
	}

	render.Status(r, http.StatusOK)
	render.Respond(w, r, reactions)
}

func (s *Server) createReaction(w http.ResponseWriter, r *http.Request) {
	ctx, span := Tracer.Start(r.Context(), "scrumlr.reactions.api.create")
	defer span.End()

	log := logger.FromContext(ctx)
	board := ctx.Value(identifiers.BoardIdentifier).(uuid.UUID)
	user := ctx.Value(identifiers.UserIdentifier).(uuid.UUID)

	var body reactions.ReactionCreateRequest
	if err := render.Decode(r, &body); err != nil {
		span.SetStatus(codes.Error, "unable to decode body")
		span.RecordError(err)
		log.Errorw("unable to decode body", "err", err)
		common.Throw(w, r, common.BadRequestError(err))
		return
	}

	// user is filled from context
	body.User = user
	body.Board = board

	reaction, err := s.reactions.Create(ctx, body)
	if err != nil {
		span.SetStatus(codes.Error, "failed to create reaction")
		span.RecordError(err)
		common.Throw(w, r, err)
		return
	}

	render.Status(r, http.StatusCreated)
	render.Respond(w, r, reaction)
}

func (s *Server) removeReaction(w http.ResponseWriter, r *http.Request) {
	ctx, span := Tracer.Start(r.Context(), "scrumlr.reactions.api.remove")
	defer span.End()

	board := ctx.Value(identifiers.BoardIdentifier).(uuid.UUID)
	user := ctx.Value(identifiers.UserIdentifier).(uuid.UUID)
	id := ctx.Value(identifiers.ReactionIdentifier).(uuid.UUID)

	if err := s.reactions.Delete(ctx, board, user, id); err != nil {
		span.SetStatus(codes.Error, "failed to remove reaction")
		span.RecordError(err)
		common.Throw(w, r, err)
		return
	}

	render.Status(r, http.StatusNoContent)
	render.Respond(w, r, nil)
}

func (s *Server) updateReaction(w http.ResponseWriter, r *http.Request) {
	log := logger.FromRequest(r)
	ctx, span := Tracer.Start(r.Context(), "scrumlr.reactions.api.update")
	defer span.End()

	board := ctx.Value(identifiers.BoardIdentifier).(uuid.UUID)
	user := ctx.Value(identifiers.UserIdentifier).(uuid.UUID)
	id := ctx.Value(identifiers.ReactionIdentifier).(uuid.UUID)

	var body reactions.ReactionUpdateTypeRequest
	if err := render.Decode(r, &body); err != nil {
		span.SetStatus(codes.Error, "failed to decode body")
		span.RecordError(err)
		log.Errorw("unable to decode body", "err", err)
		common.Throw(w, r, common.BadRequestError(err))
		return
	}

	reaction, err := s.reactions.Update(ctx, board, user, id, body)
	if err != nil {
		span.SetStatus(codes.Error, "failed to update reaction")
		span.RecordError(err)
		common.Throw(w, r, err)
		return
	}

	render.Status(r, http.StatusOK)
	render.Respond(w, r, reaction)
}
