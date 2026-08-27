package api

import (
	"net/http"

	"scrumlr.io/server/columntemplates"
	"scrumlr.io/server/logger"
	"scrumlr.io/server/otel"

	"github.com/go-chi/render"
	"github.com/google/uuid"
	"scrumlr.io/server/common"
	"scrumlr.io/server/identifiers"
)

//var tracer trace.Tracer = otel.Tracer("scrumlr.io/server/api")

// Create a new column template for a board template
//
//	@Summary		Create a column template for a board template
//	@Description	Create a column template for an existing board template
//	@Tags			column templates
//	@Accept			json
//	@Param			Cookie			header	string									true	"jwt token to authenticate"
//	@Param			boardid			path	string									true	"id of the board template"
//	@Param			columntemplate	body	columntemplates.ColumnTemplateRequest	true	"column template to create"
//	@Produce		json
//	@Success		201	{object}	columntemplates.ColumnTemplate
//	@Failure		400	{object}	common.APIError
//	@Failure		429
//	@Router			/templates/{boardid}/columns [post]
func (s *Server) createColumnTemplate(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "scrumlr.column_templates.api.create")
	defer span.End()
	log := logger.FromContext(ctx)

	boardTemplateId := ctx.Value(identifiers.BoardTemplateIdentifier).(uuid.UUID)
	user := ctx.Value(identifiers.UserIdentifier).(uuid.UUID)

	var body columntemplates.ColumnTemplateRequest
	if err := render.Decode(r, &body); err != nil {
		otel.RecordErrorSpan(span, err, new("failed to decode body"))
		log.Errorw("Unable to decode body", "err", err)
		http.Error(w, "unable to parse request body", http.StatusBadRequest)
		return
	}

	body.BoardTemplate = boardTemplateId
	body.User = user

	tColumn, err := s.columntemplates.Create(ctx, body)
	if err != nil {
		otel.RecordErrorSpan(span, err, new("failed to create column template"))
		common.Throw(w, r, mapError(err))
		return
	}

	render.Status(r, http.StatusCreated)
	render.Respond(w, r, tColumn)
}

// Get a column template from a board template
//
//	@Summary		Get a column template from a board template
//	@Description	Get a column template from a board template
//	@Tags			column templates
//	@Accept			json
//	@Param			Cookie	header	string	true	"jwt token to authenticate"
//	@Param			boardid	path	string	true	"id of the board template"
//	@Param			id		path	string	true	"id of the column template"
//	@Produce		json
//	@Success		200	{object}	columntemplates.ColumnTemplate
//	@Failure		400	{object}	common.APIError
//	@Failure		404	{object}	common.APIError
//	@Failure		429
//	@Router			/templates/{boardid}/columns/{id} [get]
func (s *Server) getColumnTemplate(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "scrumlr.column_templates.api.get")
	defer span.End()
	log := logger.FromContext(ctx)

	boardTemplateId := ctx.Value(identifiers.BoardTemplateIdentifier).(uuid.UUID)
	columnTemplateId := ctx.Value(identifiers.ColumnTemplateIdentifier).(uuid.UUID)

	columTemplate, err := s.columntemplates.Get(ctx, boardTemplateId, columnTemplateId)
	if err != nil {
		otel.RecordErrorSpan(span, err, new("failed to get column template"))
		log.Errorw("Unable to get column template", "err", err)
		common.Throw(w, r, mapError(err))
		return
	}

	render.Status(r, http.StatusOK)
	render.Respond(w, r, columTemplate)
}

// Get all column templates from a board template
//
//	@Summary		Get all column templates from a board template
//	@Description	Get all column templates from a board template
//	@Tags			column templates
//	@Accept			json
//	@Param			Cookie	header	string	true	"jwt token to authenticate"
//	@Param			boardid	path	string	true	"id of the board template"
//	@Produce		json
//	@Success		200	{object}	[]columntemplates.ColumnTemplate
//	@Failure		400	{object}	common.APIError
//	@Failure		404	{object}	common.APIError
//	@Failure		429
//	@Router			/templates/{boardid}/columns [get]
func (s *Server) getColumnTemplates(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "scrumlr.column_templates.api.get.all")
	defer span.End()
	log := logger.FromContext(ctx)

	boardTemplateId := ctx.Value(identifiers.BoardTemplateIdentifier).(uuid.UUID)

	columTemplates, err := s.columntemplates.GetAll(ctx, boardTemplateId)
	if err != nil {
		otel.RecordErrorSpan(span, err, new("failed to get column templates"))
		log.Errorw("Unable to get column templates", "err", err)
		common.Throw(w, r, mapError(err))
		return
	}

	render.Status(r, http.StatusOK)
	render.Respond(w, r, columTemplates)
}

// Update a column template from a board template
//
//	@Summary		Update a column template from a board template
//	@Description	Update a column template from a board template
//	@Tags			column templates
//	@Accept			json
//	@Param			Cookie	header	string	true	"jwt token to authenticate"
//	@Param			boardid	path	string	true	"id of the board template"
//	@Param			id		path	string	true	"id of the column template to update"
//	@Produce		json
//	@Success		200	{object}	columntemplates.ColumnTemplate
//	@Failure		400	{object}	common.APIError
//	@Failure		404	{object}	common.APIError
//	@Failure		429
//	@Router			/templates/{boardid}/columns/{id} [put]
func (s *Server) updateColumnTemplate(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "scrumlr.column_templates.api.update")
	defer span.End()
	log := logger.FromContext(ctx)

	boardTemplateId := ctx.Value(identifiers.BoardTemplateIdentifier).(uuid.UUID)
	columnTemplateId := ctx.Value(identifiers.ColumnTemplateIdentifier).(uuid.UUID)

	var body columntemplates.ColumnTemplateUpdateRequest
	if err := render.Decode(r, &body); err != nil {
		otel.RecordErrorSpan(span, err, new("failed to decode body"))
		log.Errorw("Unable to decode body", "err", err)
		http.Error(w, "unable to parse request body", http.StatusBadRequest)
		return
	}

	body.BoardTemplate = boardTemplateId
	body.ID = columnTemplateId

	tColumn, err := s.columntemplates.Update(ctx, body)
	if err != nil {
		otel.RecordErrorSpan(span, err, new("failed to update column template"))
		log.Errorw("Unable to update column template", "err", err)
		http.Error(w, "unable to update template column", http.StatusInternalServerError)
		return
	}

	render.Status(r, http.StatusOK)
	render.Respond(w, r, tColumn)
}

// Delete a column template from a board template
//
//	@Summary		Delete a column template from a board template
//	@Description	Delete a column template from a board template
//	@Tags			column templates
//	@Accept			json
//	@Param			Cookie	header	string	true	"jwt token to authenticate"
//	@Param			boardid	path	string	true	"id of the board template"
//	@Param			id		path	string	true	"id of the column template to delete"
//	@Produce		json
//	@Success		204
//	@Failure		400	{object}	common.APIError
//	@Failure		404	{object}	common.APIError
//	@Failure		429
//	@Router			/templates/{boardid}/columns/{id} [delete]
func (s *Server) deleteColumnTemplate(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "scrumlr.column_templates.api.delete")
	defer span.End()
	log := logger.FromContext(ctx)

	boardTemplateId := ctx.Value(identifiers.BoardTemplateIdentifier).(uuid.UUID)
	columnTemplateId := ctx.Value(identifiers.ColumnTemplateIdentifier).(uuid.UUID)

	err := s.columntemplates.Delete(ctx, boardTemplateId, columnTemplateId)
	if err != nil {
		otel.RecordErrorSpan(span, err, new("failed to delete column template"))
		log.Errorw("Unable to delete column template", "err", err)
		http.Error(w, "unable to delete column template", http.StatusInternalServerError)
		return
	}

	render.Status(r, http.StatusNoContent)
	render.Respond(w, r, nil)
}
