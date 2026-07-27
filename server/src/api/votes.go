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

// Add a new vote to a board
//
//	@Summary		Add a new vote to a board
//	@Description	Add a new vote to a board
//	@Tags			votes
//	@Accept			json
//	@Param			Cookie	header	string				true	"jwt token to authenticate"
//	@Param			boardId	path	string				true	"id of the board"
//	@Param			vote	body	votings.VoteRequest	true	"vote to add"
//	@Produce		json
//	@Success		201	{object}	votings.Vote
//	@Failure		400	{object}	common.APIError
//	@Failure		403	{object}	common.APIError
//	@Failure		404	{object}	common.APIError
//	@Failure		500	{object}	common.APIError
//	@Router			/boards/{boardId}/votes [post]
func (s *Server) addVote(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "scrumlr.votes.api.add")
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

// Remove a vote from a board
//
//	@Summary		Remove a vote from a board
//	@Description	Remove a vote from a board
//	@Tags			votes
//	@Accept			json
//	@Param			Cookie	header	string				true	"jwt token to authenticate"
//	@Param			boardId	path	string				true	"id of the board"
//	@Param			vote	body	votings.VoteRequest	true	"vote to remove"
//	@Produce		json
//	@Success		204
//	@Failure		400	{object}	common.APIError
//	@Failure		403	{object}	common.APIError
//	@Failure		404	{object}	common.APIError
//	@Failure		500	{object}	common.APIError
//	@Router			/boards/{boardId}/votes [delete]
func (s *Server) removeVote(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "scrumlr.votes.api.remove")
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

// Get all votes from a board
//
//	@Summary		Get all votes from a board
//	@Description	Get all votes from a board
//	@Tags			votes
//	@Accept			json
//	@Param			Cookie	header	string	true	"jwt token to authenticate"
//	@Param			boardId	path	string	true	"id of the board"
//	@Param			voting	query	string	false	"id of a voting to filter the votes"
//	@Param			note	query	string	false	"id of a note to filter the votes"
//	@Produce		json
//	@Success		200	{object}	[]votings.Vote
//	@Failure		400	{object}	common.APIError
//	@Failure		403	{object}	common.APIError
//	@Failure		404	{object}	common.APIError
//	@Failure		500	{object}	common.APIError
//	@Router			/boards/{boardId}/votes [get]
func (s *Server) getVotes(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "scrumlr.votes.api.get")
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
