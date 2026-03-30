package api

import (
	"net/http"

	"go.opentelemetry.io/otel/codes"
	"scrumlr.io/server/columntemplates"
	"scrumlr.io/server/logger"

	"github.com/go-chi/render"
	"github.com/google/uuid"
	"scrumlr.io/server/common"
	"scrumlr.io/server/identifiers"
)

//var tracer trace.Tracer = otel.Tracer("scrumlr.io/server/api")

func (s *Server) createColumnTemplate(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "scrumlr.column_templates.api.create")
	defer span.End()
	log := logger.FromContext(ctx)

	boardTemplateId := ctx.Value(identifiers.BoardTemplateIdentifier).(uuid.UUID)
	user := ctx.Value(identifiers.UserIdentifier).(uuid.UUID)

	var body columntemplates.ColumnTemplateRequest
	if err := render.Decode(r, &body); err != nil {
		span.SetStatus(codes.Error, "failed to decode body")
		span.RecordError(err)
		log.Errorw("Unable to decode body", "err", err)
		http.Error(w, "unable to parse request body", http.StatusBadRequest)
		return
	}

	body.BoardTemplate = boardTemplateId
	body.User = user

	tColumn, err := s.columntemplates.Create(ctx, body)
	if err != nil {
		span.SetStatus(codes.Error, "failed to create column template")
		span.RecordError(err)
		common.Throw(w, r, common.InternalServerError)
		return
	}

	render.Status(r, http.StatusCreated)
	render.Respond(w, r, tColumn)
}

func (s *Server) getColumnTemplate(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "scrumlr.column_templates.api.get")
	defer span.End()
	log := logger.FromContext(ctx)

	boardTemplateId := ctx.Value(identifiers.BoardTemplateIdentifier).(uuid.UUID)
	columnTemplateId := ctx.Value(identifiers.ColumnTemplateIdentifier).(uuid.UUID)

	columTemplate, err := s.columntemplates.Get(ctx, boardTemplateId, columnTemplateId)
	if err != nil {
		span.SetStatus(codes.Error, "failed to get column template")
		span.RecordError(err)
		log.Errorw("Unable to get column template", "err", err)
		common.Throw(w, r, common.InternalServerError)
		return
	}

	render.Status(r, http.StatusOK)
	render.Respond(w, r, columTemplate)
}

func (s *Server) getColumnTemplates(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "scrumlr.column_templates.api.get.all")
	defer span.End()
	log := logger.FromContext(ctx)

	boardTemplateId := ctx.Value(identifiers.BoardTemplateIdentifier).(uuid.UUID)

	columTemplates, err := s.columntemplates.GetAll(ctx, boardTemplateId)
	if err != nil {
		span.SetStatus(codes.Error, "failed to get column templates")
		span.RecordError(err)
		log.Errorw("Unable to get column templates", "err", err)
		common.Throw(w, r, common.InternalServerError)
		return
	}

	render.Status(r, http.StatusOK)
	render.Respond(w, r, columTemplates)
}

func (s *Server) updateColumnTemplate(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "scrumlr.column_templates.api.update")
	defer span.End()
	log := logger.FromContext(ctx)

	boardTemplateId := ctx.Value(identifiers.BoardTemplateIdentifier).(uuid.UUID)
	columnTemplateId := ctx.Value(identifiers.ColumnTemplateIdentifier).(uuid.UUID)

	var body columntemplates.ColumnTemplateUpdateRequest
	if err := render.Decode(r, &body); err != nil {
		span.SetStatus(codes.Error, "failed to decode body")
		span.RecordError(err)
		log.Errorw("Unable to decode body", "err", err)
		http.Error(w, "unable to parse request body", http.StatusBadRequest)
		return
	}

	body.BoardTemplate = boardTemplateId
	body.ID = columnTemplateId

	tColumn, err := s.columntemplates.Update(ctx, body)
	if err != nil {
		span.SetStatus(codes.Error, "failed to update column template")
		span.RecordError(err)
		log.Errorw("Unable to update column template", "err", err)
		http.Error(w, "unable to update template column", http.StatusInternalServerError)
		return
	}

	render.Status(r, http.StatusOK)
	render.Respond(w, r, tColumn)
}

func (s *Server) deleteColumnTemplate(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "scrumlr.column_templates.api.delete")
	defer span.End()
	log := logger.FromContext(ctx)

	boardTemplateId := ctx.Value(identifiers.BoardTemplateIdentifier).(uuid.UUID)
	columnTemplateId := ctx.Value(identifiers.ColumnTemplateIdentifier).(uuid.UUID)

	if err := s.columntemplates.Delete(ctx, boardTemplateId, columnTemplateId); err != nil {
		span.SetStatus(codes.Error, "failed to delete column template")
		span.RecordError(err)
		log.Errorw("Unable to delete column template", "err", err)
		http.Error(w, "unable to delete column template", http.StatusInternalServerError)
		return
	}

	render.Status(r, http.StatusNoContent)
	render.Respond(w, r, nil)
}
