package api

import (
	"fmt"
	"github.com/go-chi/render"
	"github.com/google/uuid"
	"net/http"
	"scrumlr.io/server/common"
	"scrumlr.io/server/common/dto"
	"scrumlr.io/server/identifiers"
	"scrumlr.io/server/logger"
)

// createNote creates a new note
func (s *Server) createNote(w http.ResponseWriter, r *http.Request) {
	log := logger.FromRequest(r)
	board := r.Context().Value(identifiers.BoardIdentifier).(uuid.UUID)
	user := r.Context().Value(identifiers.UserIdentifier).(uuid.UUID)

	var body dto.NoteCreateRequest
	if err := render.Decode(r, &body); err != nil {
		common.Throw(w, r, common.BadRequestError(err))
		return
	}

	body.Board = board
	body.User = user

	note, err := s.notes.Create(r.Context(), body)
	if err != nil {
		log.Errorw("unable to create note", "error", err)
		common.Throw(w, r, err)
		return
	}
	if s.basePath == "/" {
		w.Header().Set("Location", fmt.Sprintf("%s://%s/boards/%s/notes/%s", common.GetProtocol(r), r.Host, board, note.ID))
	} else {
		w.Header().Set("Location", fmt.Sprintf("%s://%s%s/boards/%s/notes/%s", common.GetProtocol(r), r.Host, s.basePath, board, note.ID))
	}
	render.Status(r, http.StatusCreated)
	render.Respond(w, r, note)
}

// getNote get a note
func (s *Server) getNote(w http.ResponseWriter, r *http.Request) {
	log := logger.FromRequest(r)
	id := r.Context().Value(identifiers.NoteIdentifier).(uuid.UUID)

	note, err := s.notes.Get(r.Context(), id)
	if err != nil {
		log.Errorw("unable to get note", "error", err)
		common.Throw(w, r, err)
		return
	}

	render.Status(r, http.StatusOK)
	render.Respond(w, r, note)
}

// getNotes get all notes
func (s *Server) getNotes(w http.ResponseWriter, r *http.Request) {
	log := logger.FromRequest(r)
	board := r.Context().Value(identifiers.BoardIdentifier).(uuid.UUID)

	notes, err := s.notes.List(r.Context(), board)
	if err != nil {
		log.Errorw("unable to get notes", "error", err)
		common.Throw(w, r, err)
		return
	}

	render.Status(r, http.StatusOK)
	render.Respond(w, r, notes)
}

// updateNote updates a note
func (s *Server) updateNote(w http.ResponseWriter, r *http.Request) {
	log := logger.FromRequest(r)
	board := r.Context().Value(identifiers.BoardIdentifier).(uuid.UUID)
	noteId := r.Context().Value(identifiers.NoteIdentifier).(uuid.UUID)

	var body dto.NoteUpdateRequest
	if err := render.Decode(r, &body); err != nil {
		common.Throw(w, r, common.BadRequestError(err))
		return
	}

	body.ID = noteId
	body.Board = board

	note, err := s.notes.Update(r.Context(), body)
	if err != nil {
		log.Errorw("unable to update note", "error", err)
		common.Throw(w, r, err)
		return
	}

	render.Status(r, http.StatusOK)
	render.Respond(w, r, note)
}

// deleteNote deletes a note
func (s *Server) deleteNote(w http.ResponseWriter, r *http.Request) {
	log := logger.FromRequest(r)
	note := r.Context().Value(identifiers.NoteIdentifier).(uuid.UUID)

	var body dto.NoteDeleteRequest
	if err := render.Decode(r, &body); err != nil {
		common.Throw(w, r, common.BadRequestError(err))
		return
	}

	if err := s.notes.Delete(r.Context(), body, note); err != nil {
		log.Errorw("unable to delete note", "error", err)
		common.Throw(w, r, err)
		return
	}

	render.Status(r, http.StatusNoContent)
	render.Respond(w, r, nil)
}
