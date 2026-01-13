package api

import (
	"database/sql"
	"net/http"

	"github.com/go-chi/render"
	"github.com/google/uuid"
	"go.opentelemetry.io/otel/codes"
	"scrumlr.io/server/boardtemplates"
	"scrumlr.io/server/common"
	"scrumlr.io/server/identifiers"
	"scrumlr.io/server/logger"
)

//var tracer trace.Tracer = otel.Tracer("scrumlr.io/server/api")

func (s *Server) createBoardTemplate(w http.ResponseWriter, r *http.Request) {
	ctx, span := Tracer.Start(r.Context(), "scrumlr.board_templates.api.create")
	defer span.End()
	log := logger.FromContext(ctx)

	creator := ctx.Value(identifiers.UserIdentifier).(uuid.UUID)

	// parse request
	var body boardtemplates.CreateBoardTemplateRequest
	if err := render.Decode(r, &body); err != nil {
		span.SetStatus(codes.Error, "failed to decode body")
		span.RecordError(err)
		log.Errorw("Unable to decode body", "err", err)
		common.Throw(w, r, common.BadRequestError(err))
		return
	}

	body.Creator = creator

	b, err := s.boardTemplates.Create(r.Context(), body)
	if err != nil {
		span.SetStatus(codes.Error, "failed to create board template")
		span.RecordError(err)
		log.Errorw("Unable to create board template", "err", err)
		common.Throw(w, r, common.BadRequestError(err))
		return
	}

	render.Status(r, http.StatusCreated)
	render.Respond(w, r, b)
}

func (s *Server) getBoardTemplate(w http.ResponseWriter, r *http.Request) {
	ctx, span := Tracer.Start(r.Context(), "scrumlr.board_templates.api.get")
	defer span.End()
	log := logger.FromContext(ctx)

	templateId := ctx.Value(identifiers.BoardTemplateIdentifier).(uuid.UUID)
	template, err := s.boardTemplates.Get(ctx, templateId)
	if err != nil {
		if err == sql.ErrNoRows {
			span.SetStatus(codes.Error, "no board template found")
			span.RecordError(err)
			common.Throw(w, r, common.NotFoundError)
			return
		}

		span.SetStatus(codes.Error, "failed to get board template")
		span.RecordError(err)
		log.Errorw("unable to get board template", err)
		common.Throw(w, r, common.InternalServerError)
	}

	render.Status(r, http.StatusOK)
	render.Respond(w, r, template)
}

func (s *Server) getBoardTemplates(w http.ResponseWriter, r *http.Request) {
	ctx, span := Tracer.Start(r.Context(), "scrumlr.board_templates.api.get.all")
	defer span.End()
	log := logger.FromContext(ctx)

	user := ctx.Value(identifiers.UserIdentifier).(uuid.UUID)

	templates, err := s.boardTemplates.GetAll(ctx, user)
	if err != nil {
		if err == sql.ErrNoRows {
			span.SetStatus(codes.Error, "no board templates found")
			span.RecordError(err)
			common.Throw(w, r, common.NotFoundError)
			return
		}

		span.SetStatus(codes.Error, "failed to get board templates")
		span.RecordError(err)
		log.Errorw("unable to get board templates for that user", "user", user, "err", err)
		common.Throw(w, r, err)
		return
	}

	render.Status(r, http.StatusOK)
	render.Respond(w, r, templates)
}

func (s *Server) updateBoardTemplate(w http.ResponseWriter, r *http.Request) {
	ctx, span := Tracer.Start(r.Context(), "scrumlr.board_templates.api.update")
	defer span.End()
	log := logger.FromContext(ctx)

	templateId := ctx.Value(identifiers.BoardTemplateIdentifier).(uuid.UUID)

	var body boardtemplates.BoardTemplateUpdateRequest
	if err := render.Decode(r, &body); err != nil {
		span.SetStatus(codes.Error, "failed to decode body")
		span.RecordError(err)
		log.Errorw("Unable to decode body", "err", err)
		http.Error(w, "unable to parse request body", http.StatusBadRequest)
		return
	}
	body.ID = templateId
	updatedTemplate, err := s.boardTemplates.Update(ctx, body)
	if err != nil {
		span.SetStatus(codes.Error, "failed to update board template")
		span.RecordError(err)
		log.Errorw("Unable to update board template", "err", err)
		common.Throw(w, r, err)
		return
	}

	render.Status(r, http.StatusOK)
	render.Respond(w, r, updatedTemplate)
}

func (s *Server) deleteBoardTemplate(w http.ResponseWriter, r *http.Request) {
	ctx, span := Tracer.Start(r.Context(), "scrumlr.board_templates.api.delete")
	defer span.End()
	log := logger.FromContext(ctx)

	templateId := ctx.Value(identifiers.BoardTemplateIdentifier).(uuid.UUID)

	err := s.boardTemplates.Delete(ctx, templateId)
	if err != nil {
		span.SetStatus(codes.Error, "failed to delete board template")
		span.RecordError(err)
		log.Errorw("Unable to delete board template", "err", err)
		http.Error(w, "failed to delete board template", http.StatusInternalServerError)
		return
	}

	render.Status(r, http.StatusNoContent)
	render.Respond(w, r, nil)
}
