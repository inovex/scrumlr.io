package columntemplates

import (
	"context"
	"net/http"

	"scrumlr.io/server/logger"
	"scrumlr.io/server/otel"

	"github.com/go-chi/render"
	"github.com/google/uuid"
	"scrumlr.io/server/common"
	"scrumlr.io/server/identifiers"
)

type ColumnTemplateService interface {
	Create(ctx context.Context, body ColumnTemplateRequest) (*ColumnTemplate, error)
	Get(ctx context.Context, boardID, columnID uuid.UUID) (*ColumnTemplate, error)
	GetAll(ctx context.Context, board uuid.UUID) ([]*ColumnTemplate, error)
	Update(ctx context.Context, body ColumnTemplateUpdateRequest) (*ColumnTemplate, error)
	Delete(ctx context.Context, board, column uuid.UUID) error
}

type API struct {
	service ColumnTemplateService
}

func NewColumnTemplateApi(service ColumnTemplateService) ColumnTemplateApi {
	api := new(API)
	api.service = service
	return api
}

//var tracer trace.Tracer = otel.Tracer("scrumlr.io/server/api")

// Create a new column template for a board template
//
//	@Summary		Create a column template for a board template
//	@Description	Create a column template for an existing board template
//	@Tags			column templates
//	@Accept			json
//	@Param			Cookie			header	string									true	"jwt token to authenticate"
//	@Param			boardid			path	string									true	"id of the board template"
//	@Param			columntemplate	body	ColumnTemplateRequest	true	"column template to create"
//	@Produce		json
//	@Success		201	{object}	ColumnTemplate
//	@Failure		400	{object}	common.APIError
//	@Failure		429
//	@Router			/templates/{boardid}/columns [post]
func (api *API) CreateColumnTemplate(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "scrumlr.column_templates.api.create")
	defer span.End()
	log := logger.FromContext(ctx)

	boardTemplateId := ctx.Value(identifiers.BoardTemplateIdentifier).(uuid.UUID)
	user := ctx.Value(identifiers.UserIdentifier).(uuid.UUID)

	var body ColumnTemplateRequest
	if err := render.Decode(r, &body); err != nil {
		otel.RecordErrorSpan(span, err, new("failed to decode body"))
		log.Errorw("Unable to decode body", "err", err)
		http.Error(w, "unable to parse request body", http.StatusBadRequest)
		return
	}

	body.BoardTemplate = boardTemplateId
	body.User = user

	tColumn, err := api.service.Create(ctx, body)
	if err != nil {
		otel.RecordErrorSpan(span, err, new("failed to create column template"))
		common.Throw(w, r, common.MapError(err))
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
//	@Success		200	{object}	ColumnTemplate
//	@Failure		400	{object}	common.APIError
//	@Failure		404	{object}	common.APIError
//	@Failure		429
//	@Router			/templates/{boardid}/columns/{id} [get]
func (api *API) GetColumnTemplate(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "scrumlr.column_templates.api.get")
	defer span.End()
	log := logger.FromContext(ctx)

	boardTemplateId := ctx.Value(identifiers.BoardTemplateIdentifier).(uuid.UUID)
	columnTemplateId := ctx.Value(identifiers.ColumnTemplateIdentifier).(uuid.UUID)

	columTemplate, err := api.service.Get(ctx, boardTemplateId, columnTemplateId)
	if err != nil {
		otel.RecordErrorSpan(span, err, new("failed to get column template"))
		log.Errorw("Unable to get column template", "err", err)
		common.Throw(w, r, common.MapError(err))
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
//	@Success		200	{object}	[]ColumnTemplate
//	@Failure		400	{object}	common.APIError
//	@Failure		404	{object}	common.APIError
//	@Failure		429
//	@Router			/templates/{boardid}/columns [get]
func (api *API) GetColumnTemplates(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "scrumlr.column_templates.api.get.all")
	defer span.End()
	log := logger.FromContext(ctx)

	boardTemplateId := ctx.Value(identifiers.BoardTemplateIdentifier).(uuid.UUID)

	columTemplates, err := api.service.GetAll(ctx, boardTemplateId)
	if err != nil {
		otel.RecordErrorSpan(span, err, new("failed to get column templates"))
		log.Errorw("Unable to get column templates", "err", err)
		common.Throw(w, r, common.MapError(err))
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
//	@Success		200	{object}	ColumnTemplate
//	@Failure		400	{object}	common.APIError
//	@Failure		404	{object}	common.APIError
//	@Failure		429
//	@Router			/templates/{boardid}/columns/{id} [put]
func (api *API) UpdateColumnTemplate(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "scrumlr.column_templates.api.update")
	defer span.End()
	log := logger.FromContext(ctx)

	boardTemplateId := ctx.Value(identifiers.BoardTemplateIdentifier).(uuid.UUID)
	columnTemplateId := ctx.Value(identifiers.ColumnTemplateIdentifier).(uuid.UUID)

	var body ColumnTemplateUpdateRequest
	if err := render.Decode(r, &body); err != nil {
		otel.RecordErrorSpan(span, err, new("failed to decode body"))
		log.Errorw("Unable to decode body", "err", err)
		http.Error(w, "unable to parse request body", http.StatusBadRequest)
		return
	}

	body.BoardTemplate = boardTemplateId
	body.ID = columnTemplateId

	tColumn, err := api.service.Update(ctx, body)
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
func (api *API) DeleteColumnTemplate(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "scrumlr.column_templates.api.delete")
	defer span.End()
	log := logger.FromContext(ctx)

	boardTemplateId := ctx.Value(identifiers.BoardTemplateIdentifier).(uuid.UUID)
	columnTemplateId := ctx.Value(identifiers.ColumnTemplateIdentifier).(uuid.UUID)

	err := api.service.Delete(ctx, boardTemplateId, columnTemplateId)
	if err != nil {
		otel.RecordErrorSpan(span, err, new("failed to delete column template"))
		log.Errorw("Unable to delete column template", "err", err)
		http.Error(w, "unable to delete column template", http.StatusInternalServerError)
		return
	}

	render.Status(r, http.StatusNoContent)
	render.Respond(w, r, nil)
}
