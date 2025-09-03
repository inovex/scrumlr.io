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

// createColumn creates a new column
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

// updateColumn updates a column
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

// getColumn get a column
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

// getColumns get all columns
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
