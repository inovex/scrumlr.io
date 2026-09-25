package boardtemplates

import (
	"context"
	"errors"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"github.com/google/uuid"
	"scrumlr.io/server/common"
	"scrumlr.io/server/identifiers"
	"scrumlr.io/server/logger"
	"scrumlr.io/server/otel"
)

type BoardTemplateService interface {
	Create(ctx context.Context, body CreateBoardTemplateRequest) (*BoardTemplate, error)
	Get(ctx context.Context, id uuid.UUID) (*BoardTemplate, error)
	GetAll(ctx context.Context, user uuid.UUID) ([]*BoardTemplateFull, error)
	Update(ctx context.Context, body BoardTemplateUpdateRequest) (*BoardTemplate, error)
	Delete(ctx context.Context, id uuid.UUID) error
}

type API struct {
	service BoardTemplateService
}

func NewBoardTemplateApi(service BoardTemplateService) BoardTemplateApi {
	api := new(API)
	api.service = service
	return api
}

// Create a new board template
//
//	@Summary		Create a board template
//	@Description	Create a board template
//	@Tags			board templates
//	@Accept			json
//	@Param			Cookie			header	string										true	"jwt token to authenticate"
//	@Param			boardtemplate	body	CreateBoardTemplateRequest	true	"Board template to create"
//	@Produce		json
//	@Success		201	{object}	BoardTemplate
//	@Failure		400	{object}	common.APIError
//	@Failure		429
//	@Router			/templates [post]
func (api *API) CreateBoardTemplate(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "scrumlr.board_templates.api.create")
	defer span.End()
	log := logger.FromContext(ctx)

	creator := ctx.Value(identifiers.UserIdentifier).(uuid.UUID)

	// parse request
	var body CreateBoardTemplateRequest
	if err := render.Decode(r, &body); err != nil {
		otel.RecordErrorSpan(span, err, new("failed to decode body"))
		log.Errorw("Unable to decode body", "err", err)
		common.Throw(w, r, common.BadRequestError(err))
		return
	}

	body.Creator = creator

	b, err := api.service.Create(r.Context(), body)
	if err != nil {
		otel.RecordErrorSpan(span, err, new("failed to create board template"))
		log.Errorw("Unable to create board template", "err", err)
		common.Throw(w, r, MapBoardTemplateError(err))
		return
	}

	render.Status(r, http.StatusCreated)
	render.Respond(w, r, b)
}

// Get a board template by id
//
//	@Summary		Get a board template
//	@Description	Get a board template by its id
//	@Tags			board templates
//	@Accept			json
//	@Param			Cookie	header	string	true	"jwt token to authenticate"
//	@Param			id		path	string	true	"Id of the template to get"
//	@Produce		json
//	@Success		200	{object}	BoardTemplate
//	@Failure		400
//	@Failure		404	{object}	common.APIError
//	@Failure		429
//	@Failure		500	{object}	common.APIError
//	@Router			/templates/{id} [get]
func (api *API) GetBoardTemplate(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "scrumlr.board_templates.api.get")
	defer span.End()
	log := logger.FromContext(ctx)

	templateId := ctx.Value(identifiers.BoardTemplateIdentifier).(uuid.UUID)
	template, err := api.service.Get(ctx, templateId)
	if err != nil {
		otel.RecordErrorSpan(span, err, new("failed to get board template"))
		log.Errorw("unable to get board template", err)
		common.Throw(w, r, MapBoardTemplateError(err))
		return
	}

	render.Status(r, http.StatusOK)
	render.Respond(w, r, template)
}

// Get all board templates for a user
//
//	@Summary		Get all board templates
//	@Description	Get all board templates for a user
//	@Tags			board templates
//	@Accept			json
//	@Param			Cookie	header	string	true	"jwt token to authenticate"
//	@Produce		json
//	@Success		200	{object}	[]BoardTemplateFull
//	@Failure		400	{object}	common.APIError
//	@Failure		429
//	@Router			/templates [get]
func (api *API) GetBoardTemplates(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "scrumlr.board_templates.api.get.all")
	defer span.End()
	log := logger.FromContext(ctx)

	user := ctx.Value(identifiers.UserIdentifier).(uuid.UUID)

	templates, err := api.service.GetAll(ctx, user)
	if err != nil {
		otel.RecordErrorSpan(span, err, new("failed to get board templates"))
		log.Errorw("unable to get board templates for that user", "user", user, "err", err)
		common.Throw(w, r, MapBoardTemplateError(err))
		return
	}

	render.Status(r, http.StatusOK)
	render.Respond(w, r, templates)
}

// Update a board template for a user
//
//	@Summary		Update a board template
//	@Description	Update a board template for a user
//	@Tags			board templates
//	@Accept			json
//	@Param			Cookie			header	string										true	"jwt token to authenticate"
//	@Param			id				path	string										true	"Id of the template to update"
//	@Param			boardtemplate	body	BoardTemplateUpdateRequest	true	"Board template to update"
//	@Produce		json
//	@Success		200	{object}	BoardTemplate
//	@Failure		400	{object}	common.APIError
//	@Failure		404	{object}	common.APIError
//	@Failure		429
//	@Router			/templates/{id} [put]
func (api *API) UpdateBoardTemplate(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "scrumlr.board_templates.api.update")
	defer span.End()
	log := logger.FromContext(ctx)

	templateId := ctx.Value(identifiers.BoardTemplateIdentifier).(uuid.UUID)

	var body BoardTemplateUpdateRequest
	if err := render.Decode(r, &body); err != nil {
		otel.RecordErrorSpan(span, err, new("failed to decode body"))
		log.Errorw("Unable to decode body", "err", err)
		http.Error(w, "unable to parse request body", http.StatusBadRequest)
		return
	}
	body.ID = templateId
	updatedTemplate, err := api.service.Update(ctx, body)
	if err != nil {
		otel.RecordErrorSpan(span, err, new("failed to update board template"))
		log.Errorw("Unable to update board template", "err", err)
		common.Throw(w, r, MapBoardTemplateError(err))
		return
	}

	render.Status(r, http.StatusOK)
	render.Respond(w, r, updatedTemplate)
}

// Delete a board template for a user
//
//	@Summary		Delete a board template
//	@Description	Delete a board template for a user
//	@Tags			board templates
//	@Accept			json
//	@Param			Cookie	header	string	true	"jwt token to authenticate"
//	@Param			id		path	string	true	"Id of the template to update"
//	@Produce		json
//	@Success		204
//	@Failure		400	{object}	common.APIError
//	@Failure		429
//	@Failure		500
//	@Router			/templates/{id} [delete]
func (api *API) DeleteBoardTemplate(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "scrumlr.board_templates.api.delete")
	defer span.End()
	log := logger.FromContext(ctx)

	templateId := ctx.Value(identifiers.BoardTemplateIdentifier).(uuid.UUID)

	err := api.service.Delete(ctx, templateId)
	if err != nil {
		otel.RecordErrorSpan(span, err, new("failed to delete board template"))
		log.Errorw("Unable to delete board template", "err", err)
		http.Error(w, "failed to delete board template", http.StatusInternalServerError)
		return
	}

	render.Status(r, http.StatusNoContent)
	render.Respond(w, r, nil)
}

func (api *API) BoardTemplateContext(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		boardTemplateParam := chi.URLParam(r, "id")
		boardTemplate, err := uuid.Parse(boardTemplateParam)
		if err != nil {
			common.Throw(w, r, common.BadRequestError(errors.New("invalid board template id")))
			return
		}
		boardTemplateContext := context.WithValue(r.Context(), identifiers.BoardTemplateIdentifier, boardTemplate)
		next.ServeHTTP(w, r.WithContext(boardTemplateContext))
	})
}
