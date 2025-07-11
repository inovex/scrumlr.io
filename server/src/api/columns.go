package api

import (
	"fmt"
	"net/http"

	"github.com/go-chi/render"
	"github.com/google/uuid"
	"scrumlr.io/server/columns"
	"scrumlr.io/server/common"
	"scrumlr.io/server/identifiers"
	"scrumlr.io/server/logger"
)

// createColumn creates a new column
func (s *Server) createColumn(w http.ResponseWriter, r *http.Request) {
	log := logger.FromRequest(r)

	board := r.Context().Value(identifiers.BoardIdentifier).(uuid.UUID)
	user := r.Context().Value(identifiers.UserIdentifier).(uuid.UUID)

	var body columns.ColumnRequest
	if err := render.Decode(r, &body); err != nil {
		log.Errorw("Unable to decode body", "err", err)
		http.Error(w, "unable to parse request body", http.StatusBadRequest)
		return
	}

	body.Board = board
	body.User = user
	column, err := s.columns.Create(r.Context(), body)
	if err != nil {
		common.Throw(w, r, common.InternalServerError)
		return
	}
	if s.basePath == "/" {
		w.Header().Set("Location", fmt.Sprintf("%s://%s/boards/%s/columns/%s", common.GetProtocol(r), r.Host, board, column.ID))
	} else {
		w.Header().Set("Location", fmt.Sprintf("%s://%s%s/boards/%s/columns/%s", common.GetProtocol(r), r.Host, s.basePath, board, column.ID))
	}
	render.Status(r, http.StatusCreated)
	render.Respond(w, r, column)
}

// deleteColumn deletes a column
func (s *Server) deleteColumn(w http.ResponseWriter, r *http.Request) {
	board := r.Context().Value(identifiers.BoardIdentifier).(uuid.UUID)
	column := r.Context().Value(identifiers.ColumnIdentifier).(uuid.UUID)
	user := r.Context().Value(identifiers.UserIdentifier).(uuid.UUID)

	if err := s.columns.Delete(r.Context(), board, column, user); err != nil {
		http.Error(w, "unable to delete column", http.StatusInternalServerError)
		return
	}

	render.Status(r, http.StatusNoContent)
	render.Respond(w, r, nil)
}

// updateColumn updates a column
func (s *Server) updateColumn(w http.ResponseWriter, r *http.Request) {
	log := logger.FromRequest(r)
	board := r.Context().Value(identifiers.BoardIdentifier).(uuid.UUID)
	columnId := r.Context().Value(identifiers.ColumnIdentifier).(uuid.UUID)

	var body columns.ColumnUpdateRequest
	if err := render.Decode(r, &body); err != nil {
		log.Errorw("Unable to decode body", "err", err)
		http.Error(w, "unable to parse request body", http.StatusBadRequest)
		return
	}

	body.ID = columnId
	body.Board = board

	column, err := s.columns.Update(r.Context(), body)
	if err != nil {
		http.Error(w, "unable to update column", http.StatusInternalServerError)
		return
	}

	render.Status(r, http.StatusOK)
	render.Respond(w, r, column)
}

// getColumn get a column
func (s *Server) getColumn(w http.ResponseWriter, r *http.Request) {
	board := r.Context().Value(identifiers.BoardIdentifier).(uuid.UUID)
	id := r.Context().Value(identifiers.ColumnIdentifier).(uuid.UUID)

	column, err := s.columns.Get(r.Context(), board, id)
	if err != nil {
		common.Throw(w, r, err)
		return
	}

	render.Status(r, http.StatusOK)
	render.Respond(w, r, column)
}

// getColumns get all columns
func (s *Server) getColumns(w http.ResponseWriter, r *http.Request) {
	board := r.Context().Value(identifiers.BoardIdentifier).(uuid.UUID)

	columns, err := s.columns.GetAll(r.Context(), board)
	if err != nil {
		common.Throw(w, r, common.InternalServerError)
		return
	}

	render.Status(r, http.StatusOK)
	render.Respond(w, r, columns)
}
