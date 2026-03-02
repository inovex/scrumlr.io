package api

import (
	"net/http"

	"go.opentelemetry.io/otel/codes"
	"scrumlr.io/server/common"
	"scrumlr.io/server/identifiers"
	"scrumlr.io/server/logger"
	"scrumlr.io/server/votings"

	"github.com/go-chi/render"
	"github.com/google/uuid"
)

// addVote adds a vote to the currently open voting session
func (s *Server) addVote(w http.ResponseWriter, r *http.Request) {
	ctx, span := Tracer.Start(r.Context(), "scrumlr.votes.api.add")
	defer span.End()
	log := logger.FromContext(ctx)

	board := ctx.Value(identifiers.BoardIdentifier).(uuid.UUID)
	user := ctx.Value(identifiers.UserIdentifier).(uuid.UUID)

	var body votings.VoteRequest
	if err := render.Decode(r, &body); err != nil {
		span.SetStatus(codes.Error, "failed to decode body")
		span.RecordError(err)
		log.Errorw("unable to decode body", "err", err)
		common.Throw(w, r, common.BadRequestError(err))
		return
	}

	body.Board = board
	body.User = user

	vote, err := s.votings.AddVote(ctx, body)
	if err != nil {
		span.SetStatus(codes.Error, "failed to add vote")
		span.RecordError(err)
		log.Warnw("unable to add vote", "err", err)
		common.Throw(w, r, err)
		return
	}

	render.Status(r, http.StatusCreated)
	render.Respond(w, r, vote)
}

// removeVote removes a vote
func (s *Server) removeVote(w http.ResponseWriter, r *http.Request) {
	ctx, span := Tracer.Start(r.Context(), "scrumlr.votes.api.remove")
	defer span.End()
	log := logger.FromContext(ctx)

	board := ctx.Value(identifiers.BoardIdentifier).(uuid.UUID)
	user := ctx.Value(identifiers.UserIdentifier).(uuid.UUID)

	var body votings.VoteRequest
	if err := render.Decode(r, &body); err != nil {
		span.SetStatus(codes.Error, "failed to decode body")
		span.RecordError(err)
		log.Errorw("unable to decode body", "err", err)
		common.Throw(w, r, common.BadRequestError(err))
		return
	}

	body.Board = board
	body.User = user

	err := s.votings.RemoveVote(ctx, body)
	if err != nil {
		span.SetStatus(codes.Error, "failed to remove vote")
		span.RecordError(err)
		log.Warnw("unable to remove vote", "err", err)
		common.Throw(w, r, err)
		return
	}

	render.Status(r, http.StatusNoContent)
	render.Respond(w, r, nil)
}

func (s *Server) getVotes(w http.ResponseWriter, r *http.Request) {
	ctx, span := Tracer.Start(r.Context(), "scrumlr.votes.api.get")
	defer span.End()
	log := logger.FromContext(ctx)

	board := ctx.Value(identifiers.BoardIdentifier).(uuid.UUID)
	user := ctx.Value(identifiers.UserIdentifier).(uuid.UUID)

	requestFilter := votings.VoteFilter{
		User: &user,
	}

	votingQuery := r.URL.Query().Get("voting")
	if votingQuery != "" {
		voting, err := uuid.Parse(votingQuery)
		if err != nil {
			span.SetStatus(codes.Error, "failed to decode body")
			span.RecordError(err)
			log.Errorw("unable to decode body", "err", err)
			common.Throw(w, r, common.BadRequestError(err))
			return
		}
		requestFilter.Voting = &voting
	}

	noteQuery := r.URL.Query().Get("note")
	if noteQuery != "" {
		note, err := uuid.Parse(noteQuery)
		if err != nil {
			span.SetStatus(codes.Error, "failed to decode body")
			span.RecordError(err)
			log.Errorw("unable to decode body", "err", err)
			common.Throw(w, r, common.BadRequestError(err))
			return
		}
		requestFilter.Note = &note
	}

	votes, err := s.votings.GetVotes(ctx, board, requestFilter)
	if err != nil {
		span.SetStatus(codes.Error, "failed to get votes")
		span.RecordError(err)
		common.Throw(w, r, err)
		return
	}

	render.Status(r, http.StatusOK)
	render.Respond(w, r, votes)
}
