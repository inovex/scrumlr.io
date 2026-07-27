package api

import (
	"fmt"
	"net/http"

	"go.opentelemetry.io/otel/codes"
	"scrumlr.io/server/common"
	"scrumlr.io/server/identifiers"
	"scrumlr.io/server/logger"
	"scrumlr.io/server/votings"

	"github.com/go-chi/render"
	"github.com/google/uuid"
)

//var tracer trace.Tracer = otel.Tracer("scrumlr.io/server/api")

// Create a new voting on a board
//
//	@Summary		Create a new voting on a board
//	@Description	Create a new voting on a board
//	@Tags			votings
//	@Accept			json
//	@Param			Cookie	header	string						true	"jwt token to authenticate"
//	@Param			boardId	path	string						true	"id of the board"
//	@Param			voting	body	votings.VotingCreateRequest	true	"voting to create"
//	@Produce		json
//	@Header			201	{string}	Location	"Path to the created voting"
//	@Success		201	{object}	votings.Voting
//	@Failure		400	{object}	common.APIError
//	@Failure		403	{object}	common.APIError
//	@Failure		404	{object}	common.APIError
//	@Failure		500	{object}	common.APIError
//	@Router			/boards/{boardId}/votings [post]
func (s *Server) createVoting(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "scrumlr.votings.api.create")
	defer span.End()

	log := logger.FromContext(ctx)
	board := ctx.Value(identifiers.BoardIdentifier).(uuid.UUID)

	var body votings.VotingCreateRequest
	if err := render.Decode(r, &body); err != nil {
		span.SetStatus(codes.Error, "unable to decode body")
		span.RecordError(err)
		log.Errorw("Unable to decode body", "err", err)
		common.Throw(w, r, common.BadRequestError(err))
		return
	}

	body.Board = board

	voting, err := s.votings.Create(ctx, body)
	if err != nil {
		span.SetStatus(codes.Error, "failed to create voting")
		span.RecordError(err)
		common.Throw(w, r, err)
		return
	}
	w.Header().Set("Location", s.buildRelativeURL(fmt.Sprintf("/boards/%s/votings/%s", board, voting.ID)))

	render.Status(r, http.StatusCreated)
	render.Respond(w, r, voting)
}

// Update a voting on a board to closed
//
//	@Summary		Update a voting on a board to closed
//	@Description	Update a voting on a board to closed
//	@Tags			votings
//	@Accept			json
//	@Param			Cookie	header	string	true	"jwt token to authenticate"
//	@Param			boardId	path	string	true	"id of the board"
//	@Param			id		path	string	true	"id of the voting"
//	@Produce		json
//	@Success		200	{object}	votings.Voting
//	@Failure		400	{object}	common.APIError
//	@Failure		403	{object}	common.APIError
//	@Failure		404	{object}	common.APIError
//	@Failure		500	{object}	common.APIError
//	@Router			/boards/{boardId}/votings/{id} [put]
func (s *Server) updateVoting(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "scrumlr.votings.api.update")
	defer span.End()

	board := ctx.Value(identifiers.BoardIdentifier).(uuid.UUID)
	id := ctx.Value(identifiers.VotingIdentifier).(uuid.UUID)

	notes, err := s.notes.GetAll(ctx, board)
	if err != nil {
		span.SetStatus(codes.Error, "failed to get notes")
		span.RecordError(err)
		common.Throw(w, r, err)
		return
	}
	var affectedNotes []votings.Note

	for _, note := range notes {
		affectedNotes = append(affectedNotes, votings.Note{
			ID:     note.ID,
			Author: note.Author,
			Text:   note.Text,
			Edited: note.Edited,
			Position: votings.NotePosition{
				Column: note.Position.Column,
				Stack:  note.Position.Stack,
				Rank:   note.Position.Rank,
			},
		})
	}

	voting, err := s.votings.Close(ctx, id, board, affectedNotes)
	if err != nil {
		span.SetStatus(codes.Error, "failed to update voting")
		span.RecordError(err)
		common.Throw(w, r, err)
		return
	}

	render.Status(r, http.StatusOK)
	render.Respond(w, r, voting)
}

// Get a voting on a board
//
//	@Summary		Get a voting on a board
//	@Description	Get a voting on a board
//	@Tags			votings
//	@Accept			json
//	@Param			Cookie	header	string	true	"jwt token to authenticate"
//	@Param			boardId	path	string	true	"id of the board"
//	@Param			id		path	string	true	"id of the voting"
//	@Produce		json
//	@Success		200	{object}	votings.Voting
//	@Failure		400	{object}	common.APIError
//	@Failure		403	{object}	common.APIError
//	@Failure		404	{object}	common.APIError
//	@Failure		500	{object}	common.APIError
//	@Router			/boards/{boardId}/votings/{id} [get]
func (s *Server) getVoting(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "scrumlr.votings.api.get")
	defer span.End()

	board := ctx.Value(identifiers.BoardIdentifier).(uuid.UUID)
	id := ctx.Value(identifiers.VotingIdentifier).(uuid.UUID)

	voting, err := s.votings.Get(ctx, board, id)
	if err != nil {
		span.SetStatus(codes.Error, "failed to get voting")
		span.RecordError(err)
		common.Throw(w, r, err)
		return
	}

	render.Status(r, http.StatusOK)
	render.Respond(w, r, voting)
}

// Get all votings on a board
//
//	@Summary		Get all votings on a board
//	@Description	Get all votings on a board
//	@Tags			votings
//	@Accept			json
//	@Param			Cookie	header	string	true	"jwt token to authenticate"
//	@Param			boardId	path	string	true	"id of the board"
//	@Produce		json
//	@Success		200	{object}	[]votings.Voting
//	@Failure		400	{object}	common.APIError
//	@Failure		403	{object}	common.APIError
//	@Failure		404	{object}	common.APIError
//	@Failure		500	{object}	common.APIError
//	@Router			/boards/{boardId}/votings [get]
func (s *Server) getVotings(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "scrumlr.votings.api.update")
	defer span.End()

	board := ctx.Value(identifiers.BoardIdentifier).(uuid.UUID)

	votings, err := s.votings.GetAll(ctx, board)
	if err != nil {
		span.SetStatus(codes.Error, "failed to get votings")
		span.RecordError(err)
		common.Throw(w, r, err)
		return
	}

	render.Status(r, http.StatusOK)
	render.Respond(w, r, votings)
}
