package api

import (
	"fmt"
	"github.com/go-chi/render"
	"github.com/google/uuid"
	"net/http"
	"scrumlr.io/server/common"
	"scrumlr.io/server/common/dto"
)

// createNote creates a new note
func (s *Server) createNote(w http.ResponseWriter, r *http.Request) {
	board := r.Context().Value("Board").(uuid.UUID)
	user := r.Context().Value("User").(uuid.UUID)

	var body dto.NoteCreateRequest
	if err := render.Decode(r, &body); err != nil {
		common.Throw(w, r, common.BadRequestError(err))
		return
	}

	body.Board = board
	body.User = user

	note, err := s.notes.Create(r.Context(), body)
	if err != nil {
		common.Throw(w, r, err)
		return
	}

	w.Header().Set("Location", fmt.Sprintf("%s/boards/%s/notes/%s", s.baseURL, board, note.ID))
	render.Status(r, http.StatusCreated)
	render.Respond(w, r, note)
}

// getNote get a note
func (s *Server) getNote(w http.ResponseWriter, r *http.Request) {
	id := r.Context().Value("Note").(uuid.UUID)

	note, err := s.notes.Get(r.Context(), id)
	if err != nil {
		common.Throw(w, r, err)
		return
	}

	render.Status(r, http.StatusOK)
	render.Respond(w, r, note)
}

// getNotes get all notes
func (s *Server) getNotes(w http.ResponseWriter, r *http.Request) {
	board := r.Context().Value("Board").(uuid.UUID)

	notes, err := s.notes.List(r.Context(), board)
	if err != nil {
		common.Throw(w, r, err)
		return
	}

	render.Status(r, http.StatusOK)
	render.Respond(w, r, notes)
}

// updateNote updates a note
func (s *Server) updateNote(w http.ResponseWriter, r *http.Request) {
	board := r.Context().Value("Board").(uuid.UUID)
	noteId := r.Context().Value("Note").(uuid.UUID)

	var body dto.NoteUpdateRequest
	if err := render.Decode(r, &body); err != nil {
		common.Throw(w, r, common.BadRequestError(err))
		return
	}

	body.ID = noteId
	body.Board = board

	note, err := s.notes.Update(r.Context(), body)
	if err != nil {
		common.Throw(w, r, err)
		return
	}

	render.Status(r, http.StatusOK)
	render.Respond(w, r, note)
}

// deleteNote deletes a note
func (s *Server) deleteNote(w http.ResponseWriter, r *http.Request) {
	note := r.Context().Value("Note").(uuid.UUID)

	if err := s.notes.Delete(r.Context(), note); err != nil {
		common.Throw(w, r, err)
		return
	}

	render.Status(r, http.StatusNoContent)
	render.Respond(w, r, nil)
}
