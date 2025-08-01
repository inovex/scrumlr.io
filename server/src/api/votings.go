package api

import (
	"fmt"
	"net/http"

	"scrumlr.io/server/common"
	"scrumlr.io/server/identifiers"
	"scrumlr.io/server/logger"
	"scrumlr.io/server/votings"

	"github.com/go-chi/render"
	"github.com/google/uuid"
)

// createVoting creates a new voting session
func (s *Server) createVoting(w http.ResponseWriter, r *http.Request) {
	log := logger.FromRequest(r)
	board := r.Context().Value(identifiers.BoardIdentifier).(uuid.UUID)

	var body votings.VotingCreateRequest
	if err := render.Decode(r, &body); err != nil {
		log.Errorw("Unable to decode body", "err", err)
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
	log := logger.FromRequest(r)
	board := r.Context().Value(identifiers.BoardIdentifier).(uuid.UUID)
	id := r.Context().Value(identifiers.VotingIdentifier).(uuid.UUID)

	var body votings.VotingUpdateRequest
	if err := render.Decode(r, &body); err != nil {
		log.Errorw("Unable to decode body", "err", err)
		common.Throw(w, r, common.BadRequestError(err))
		return
	}

	body.Board = board
	body.ID = id
	notes, err := s.notes.GetAll(r.Context(), board)
	if err != nil {
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

	voting, err := s.votings.Update(r.Context(), body, affectedNotes)
	if err != nil {

		common.Throw(w, r, err)
		return
	}

	render.Status(r, http.StatusOK)
	render.Respond(w, r, voting)
}

// getVoting get a voting session
func (s *Server) getVoting(w http.ResponseWriter, r *http.Request) {
	board := r.Context().Value(identifiers.BoardIdentifier).(uuid.UUID)
	id := r.Context().Value(identifiers.VotingIdentifier).(uuid.UUID)

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
	board := r.Context().Value(identifiers.BoardIdentifier).(uuid.UUID)

	votings, err := s.votings.GetAll(r.Context(), board)
	if err != nil {
		common.Throw(w, r, err)
		return
	}

	render.Status(r, http.StatusOK)
	render.Respond(w, r, votings)
}
