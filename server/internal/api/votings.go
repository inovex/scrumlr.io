package api

import (
	"fmt"
	"net/http"
	"scrumlr.io/server/internal/common"
	"scrumlr.io/server/internal/common/dto"

	"github.com/go-chi/render"
	"github.com/google/uuid"
)

// createVoting creates a new voting session
func (s *Server) createVoting(w http.ResponseWriter, r *http.Request) {
	board := r.Context().Value("Board").(uuid.UUID)

	var body dto.VotingCreateRequest
	if err := render.Decode(r, &body); err != nil {
		common.Throw(w, r, common.BadRequestError(err))
		return
	}

	body.Board = board
	voting, err := s.votings.Create(r.Context(), body)
	if err != nil {
		common.Throw(w, r, err)
		return
	}
	if s.basePath == "/" {
		w.Header().Set("Location", fmt.Sprintf("%s://%s/boards/%s/votings/%s", common.GetProtocol(r), r.Host, board, voting.ID))
	} else {
		w.Header().Set("Location", fmt.Sprintf("%s://%s%s/boards/%s/votings/%s", common.GetProtocol(r), r.Host, s.basePath, board, voting.ID))
	}

	render.Status(r, http.StatusCreated)
	render.Respond(w, r, voting)
}

// updateVoting updates a voting session
func (s *Server) updateVoting(w http.ResponseWriter, r *http.Request) {
	board := r.Context().Value("Board").(uuid.UUID)
	id := r.Context().Value("Voting").(uuid.UUID)

	var body dto.VotingUpdateRequest
	if err := render.Decode(r, &body); err != nil {
		common.Throw(w, r, common.BadRequestError(err))
		return
	}

	body.Board = board
	body.ID = id

	voting, err := s.votings.Update(r.Context(), body)
	if err != nil {
		common.Throw(w, r, err)
		return
	}

	render.Status(r, http.StatusOK)
	render.Respond(w, r, voting)
}

// getVoting get a voting session
func (s *Server) getVoting(w http.ResponseWriter, r *http.Request) {
	board := r.Context().Value("Board").(uuid.UUID)
	id := r.Context().Value("Voting").(uuid.UUID)

	voting, err := s.votings.Get(r.Context(), board, id)
	if err != nil {
		common.Throw(w, r, err)
		return
	}

	render.Status(r, http.StatusOK)
	render.Respond(w, r, voting)
}

// getVotings get all voting sessions
func (s *Server) getVotings(w http.ResponseWriter, r *http.Request) {
	board := r.Context().Value("Board").(uuid.UUID)

	votings, err := s.votings.List(r.Context(), board)
	if err != nil {
		common.Throw(w, r, err)
		return
	}

	render.Status(r, http.StatusOK)
	render.Respond(w, r, votings)
}
