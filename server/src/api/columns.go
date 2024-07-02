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

// createColumn creates a new column
func (s *Server) createColumn(w http.ResponseWriter, r *http.Request) {
	log := logger.FromRequest(r)

	board := r.Context().Value(identifiers.BoardIdentifier).(uuid.UUID)
	user := r.Context().Value(identifiers.UserIdentifier).(uuid.UUID)

	var body dto.ColumnRequest
	if err := render.Decode(r, &body); err != nil {
		common.Throw(w, r, common.BadRequestError(err))
		return
	}

	body.Board = board
	body.User = user
	column, err := s.boards.CreateColumn(r.Context(), body)
	if err != nil {
		log.Errorw("unable to create column", "err", err)
		common.Throw(w, r, err)
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
	log := logger.FromRequest(r)
	board := r.Context().Value(identifiers.BoardIdentifier).(uuid.UUID)
	column := r.Context().Value(identifiers.ColumnIdentifier).(uuid.UUID)
	user := r.Context().Value(identifiers.UserIdentifier).(uuid.UUID)

	if err := s.boards.DeleteColumn(r.Context(), board, column, user); err != nil {
		log.Errorw("unable to delete column", "error", err)
		common.Throw(w, r, err)
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

	var body dto.ColumnUpdateRequest
	if err := render.Decode(r, &body); err != nil {
		common.Throw(w, r, common.BadRequestError(err))
		return
	}

	body.ID = columnId
	body.Board = board

	column, err := s.boards.UpdateColumn(r.Context(), body)
	if err != nil {
		log.Errorw("unable to update column", "error", err)
		common.Throw(w, r, err)
		return
	}

	render.Status(r, http.StatusOK)
	render.Respond(w, r, column)
}

// getColumn get a column
func (s *Server) getColumn(w http.ResponseWriter, r *http.Request) {
	log := logger.FromRequest(r)
	board := r.Context().Value(identifiers.BoardIdentifier).(uuid.UUID)
	id := r.Context().Value(identifiers.ColumnIdentifier).(uuid.UUID)

	column, err := s.boards.GetColumn(r.Context(), board, id)
	if err != nil {
		log.Errorw("unable to get column", "error", err)
		common.Throw(w, r, err)
		return
	}

	render.Status(r, http.StatusOK)
	render.Respond(w, r, column)
}

// getColumns get all columns
func (s *Server) getColumns(w http.ResponseWriter, r *http.Request) {
	log := logger.FromRequest(r)

	board := r.Context().Value(identifiers.BoardIdentifier).(uuid.UUID)

	columns, err := s.boards.ListColumns(r.Context(), board)
	if err != nil {
		log.Errorw("unable to get columns", "err", err)
		common.Throw(w, r, err)
		return
	}

	render.Status(r, http.StatusOK)
	render.Respond(w, r, columns)
}
