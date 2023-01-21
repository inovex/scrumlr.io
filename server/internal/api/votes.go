package api

import (
	"net/http"
	"scrumlr.io/server/internal/common"
	"scrumlr.io/server/internal/common/dto"
	"scrumlr.io/server/internal/common/filter"
	"scrumlr.io/server/internal/logger"

	"github.com/go-chi/render"
	"github.com/google/uuid"
)

// addVote adds a vote to the currently open voting session
func (s *Server) addVote(w http.ResponseWriter, r *http.Request) {
	log := logger.FromRequest(r)

	board := r.Context().Value("Board").(uuid.UUID)
	user := r.Context().Value("User").(uuid.UUID)

	var body dto.VoteRequest
	if err := render.Decode(r, &body); err != nil {
		common.Throw(w, r, common.BadRequestError(err))
		return
	}

	body.Board = board
	body.User = user

	vote, err := s.votings.AddVote(r.Context(), body)
	if err != nil {
		log.Warnw("unable to add vote", "err", err)
		common.Throw(w, r, err)
		return
	}

	render.Status(r, http.StatusCreated)
	render.Respond(w, r, vote)
}

// removeVote removes a vote
func (s *Server) removeVote(w http.ResponseWriter, r *http.Request) {
	log := logger.FromRequest(r)

	board := r.Context().Value("Board").(uuid.UUID)
	user := r.Context().Value("User").(uuid.UUID)

	var body dto.VoteRequest
	if err := render.Decode(r, &body); err != nil {
		common.Throw(w, r, common.BadRequestError(err))
		return
	}

	body.Board = board
	body.User = user

	err := s.votings.RemoveVote(r.Context(), body)
	if err != nil {
		log.Warnw("unable to remove vote", "err", err)
		common.Throw(w, r, err)
		return
	}

	render.Status(r, http.StatusNoContent)
	render.Respond(w, r, nil)
}

func (s *Server) getVotes(w http.ResponseWriter, r *http.Request) {
	board := r.Context().Value("Board").(uuid.UUID)
	user := r.Context().Value("User").(uuid.UUID)

	requestFilter := filter.VoteFilter{
		Board: board,
		User:  &user,
	}

	votingQuery := r.URL.Query().Get("voting")
	if votingQuery != "" {
		voting, err := uuid.Parse(votingQuery)
		if err != nil {
			common.Throw(w, r, common.BadRequestError(err))
			return
		}
		requestFilter.Voting = &voting
	}

	noteQuery := r.URL.Query().Get("note")
	if noteQuery != "" {
		note, err := uuid.Parse(noteQuery)
		if err != nil {
			common.Throw(w, r, common.BadRequestError(err))
			return
		}
		requestFilter.Note = &note
	}

	votes, err := s.votings.GetVotes(r.Context(), requestFilter)
	if err != nil {
		common.Throw(w, r, err)
		return
	}

	render.Status(r, http.StatusOK)
	render.Respond(w, r, votes)
}
