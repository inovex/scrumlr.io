package api

import (
	"fmt"
	"net/http"

	"github.com/go-chi/render"
	"github.com/google/uuid"
	"go.opentelemetry.io/otel/codes"
	"scrumlr.io/server/columns"
	"scrumlr.io/server/common"
	"scrumlr.io/server/identifiers"
	"scrumlr.io/server/logger"
)

//var tracer trace.Tracer = otel.Tracer("scrumlr.io/server/api")

// Create a new column for a board
//
//	@Summary		Create a new column for a board
//	@Description	Create a new column for a board
//	@Tags			columns
//	@Accept			json
//	@Param			Cookie	header	string					true	"jwt token to authenticate"
//	@Param			boardId	path	string					true	"id of the board"
//	@Param			column	body	columns.ColumnRequest	true	"column to create"
//	@Produce		json
//	@Header			201	{string}	Location	"Path to the created column"
//	@Success		201	{object}	columns.Column
//	@Failure		400	{object}	common.APIError
//	@Failure		403	{object}	common.APIError
//	@Failure		404	{object}	common.APIError
//	@Failure		500	{object}	common.APIError
//	@Router			/boards/{boardId}/columns [post]
func (s *Server) createColumn(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "scrumlr.columns.api.create")
	defer span.End()
	log := logger.FromContext(ctx)

	board := ctx.Value(identifiers.BoardIdentifier).(uuid.UUID)
	user := ctx.Value(identifiers.UserIdentifier).(uuid.UUID)

	var body columns.ColumnRequest
	if err := render.Decode(r, &body); err != nil {
		span.SetStatus(codes.Error, "failed to decode body")
		span.RecordError(err)
		log.Errorw("Unable to decode body", "err", err)
		http.Error(w, "unable to parse request body", http.StatusBadRequest)
		return
	}

	body.Board = board
	body.User = user
	column, err := s.columns.Create(ctx, body)
	if err != nil {
		span.SetStatus(codes.Error, "failed to create column")
		span.RecordError(err)
		log.Errorw("Unable to create column", "err", err)
		common.Throw(w, r, common.InternalServerError)
		return
	}
	w.Header().Set("Location", s.buildRelativeURL(fmt.Sprintf("/boards/%s/columns/%s", board, column.ID)))
	render.Status(r, http.StatusCreated)
	render.Respond(w, r, column)
}

// Delete a column for a board
//
//	@Summary		Delete a column for a board
//	@Description	Delete a column for a board
//	@Tags			columns
//	@Accept			json
//	@Param			Cookie	header	string	true	"jwt token to authenticate"
//	@Param			boardId	path	string	true	"id of the board"
//	@Param			id		path	string	true	"id of the column to delete"
//	@Produce		json
//	@Success		204
//	@Failure		400	{object}	common.APIError
//	@Failure		403	{object}	common.APIError
//	@Failure		500	{object}	common.APIError
//	@Router			/boards/{boardId}/columns/{id} [delete]
func (s *Server) deleteColumn(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "scrumlr.columns.api.delete")
	defer span.End()
	log := logger.FromContext(ctx)

	board := ctx.Value(identifiers.BoardIdentifier).(uuid.UUID)
	column := ctx.Value(identifiers.ColumnIdentifier).(uuid.UUID)
	user := ctx.Value(identifiers.UserIdentifier).(uuid.UUID)

	if err := s.columns.Delete(ctx, board, column, user); err != nil {
		span.SetStatus(codes.Error, "failed to delete column")
		span.RecordError(err)
		log.Errorw("Unable to delete column", "err", err)
		http.Error(w, "unable to delete column", http.StatusInternalServerError)
		return
	}

	render.Status(r, http.StatusNoContent)
	render.Respond(w, r, nil)
}

// Update a column for a board
//
//	@Summary		Update a column for a board
//	@Description	Update a column for a board
//	@Tags			columns
//	@Accept			json
//	@Param			Cookie	header	string						true	"jwt token to authenticate"
//	@Param			boardId	path	string						true	"id of the board"
//	@Param			id		path	string						true	"id of the column to update"
//	@Param			column	body	columns.ColumnUpdateRequest	true	"values to update the column"
//	@Produce		json
//	@Success		200	{object}	columns.Column
//	@Failure		400	{object}	common.APIError
//	@Failure		403	{object}	common.APIError
//	@Failure		404	{object}	common.APIError
//	@Failure		500	{object}	common.APIError
//	@Router			/boards/{boardId}/columns/{id} [put]
func (s *Server) updateColumn(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "scrumlr.columns.api.update")
	defer span.End()
	log := logger.FromContext(ctx)

	board := ctx.Value(identifiers.BoardIdentifier).(uuid.UUID)
	columnId := ctx.Value(identifiers.ColumnIdentifier).(uuid.UUID)

	var body columns.ColumnUpdateRequest
	if err := render.Decode(r, &body); err != nil {
		span.SetStatus(codes.Error, "failed to decode body")
		span.RecordError(err)
		log.Errorw("Unable to decode body", "err", err)
		http.Error(w, "unable to parse request body", http.StatusBadRequest)
		return
	}

	body.ID = columnId
	body.Board = board

	column, err := s.columns.Update(ctx, body)
	if err != nil {
		span.SetStatus(codes.Error, "failed to update column")
		span.RecordError(err)
		log.Errorw("Unable to update column", "err", err)
		http.Error(w, "unable to update column", http.StatusInternalServerError)
		return
	}

	render.Status(r, http.StatusOK)
	render.Respond(w, r, column)
}

// Get a column for a board
//
//	@Summary		Get a column for a board
//	@Description	Get a column for a board
//	@Tags			columns
//	@Accept			json
//	@Param			Cookie	header	string	true	"jwt token to authenticate"
//	@Param			boardId	path	string	true	"id of the board"
//	@Param			id		path	string	true	"id of the column"
//	@Produce		json
//	@Success		200	{object}	columns.Column
//	@Failure		400	{object}	common.APIError
//	@Failure		403	{object}	common.APIError
//	@Failure		404	{object}	common.APIError
//	@Failure		500	{object}	common.APIError
//	@Router			/boards/{boardId}/columns/{id} [get]
func (s *Server) getColumn(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "scrumlr.columns.api.get")
	defer span.End()
	log := logger.FromContext(ctx)

	board := ctx.Value(identifiers.BoardIdentifier).(uuid.UUID)
	id := ctx.Value(identifiers.ColumnIdentifier).(uuid.UUID)

	column, err := s.columns.Get(ctx, board, id)
	if err != nil {
		span.SetStatus(codes.Error, "failed to get column")
		span.RecordError(err)
		log.Errorw("Unable to get column", "err", err)
		common.Throw(w, r, err)
		return
	}

	render.Status(r, http.StatusOK)
	render.Respond(w, r, column)
}

// Get all columns for a board
//
//	@Summary		Get all columns for a board
//	@Description	Get all columns for a board
//	@Tags			columns
//	@Accept			json
//	@Param			Cookie	header	string	true	"jwt token to authenticate"
//	@Param			boardId	path	string	true	"id of the board"
//	@Produce		json
//	@Success		200	{object}	[]columns.Column
//	@Failure		400	{object}	common.APIError
//	@Failure		403	{object}	common.APIError
//	@Failure		404	{object}	common.APIError
//	@Failure		500	{object}	common.APIError
//	@Router			/boards/{boardId}/columns [get]
func (s *Server) getColumns(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "scrumlr.columns.api.get.all")
	defer span.End()
	log := logger.FromContext(ctx)

	board := ctx.Value(identifiers.BoardIdentifier).(uuid.UUID)

	columns, err := s.columns.GetAll(ctx, board)
	if err != nil {
		span.SetStatus(codes.Error, "failed to get columns")
		span.RecordError(err)
		log.Errorw("Unable to create columns", "err", err)
		common.Throw(w, r, common.InternalServerError)
		return
	}

	render.Status(r, http.StatusOK)
	render.Respond(w, r, columns)
}
