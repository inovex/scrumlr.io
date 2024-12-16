package api

import (
	"database/sql"
	"net/http"

	"github.com/go-chi/render"
	"github.com/google/uuid"
	"scrumlr.io/server/common"
	"scrumlr.io/server/common/dto"
	"scrumlr.io/server/identifiers"
	"scrumlr.io/server/logger"
)

func (s *Server) createBoardTemplate(w http.ResponseWriter, r *http.Request) {
	creator := r.Context().Value(identifiers.UserIdentifier).(uuid.UUID)

	// parse request
	var body dto.CreateBoardTemplateRequest
	if err := render.Decode(r, &body); err != nil {
		common.Throw(w, r, common.BadRequestError(err))
		return
	}

	body.Creator = creator

	b, err := s.boardTemplates.Create(r.Context(), body)
	if err != nil {
		common.Throw(w, r, common.BadRequestError(err))
		return
	}

	render.Status(r, http.StatusCreated)
	render.Respond(w, r, b)
}

func (s *Server) getBoardTemplate(w http.ResponseWriter, r *http.Request) {
	log := logger.FromRequest(r)

	templateId := r.Context().Value(identifiers.BoardTemplateIdentifier).(uuid.UUID)
	template, err := s.boardTemplates.Get(r.Context(), templateId)
	if err != nil {
		if err == sql.ErrNoRows {
			common.Throw(w, r, common.NotFoundError)
			return
		}
		log.Errorw("unable to get board template", err)
		common.Throw(w, r, common.InternalServerError)
	}

	render.Status(r, http.StatusOK)
	render.Respond(w, r, template)
}

func (s *Server) getBoardTemplates(w http.ResponseWriter, r *http.Request) {
	log := logger.FromRequest(r)
	user := r.Context().Value(identifiers.UserIdentifier).(uuid.UUID)

	templates, err := s.boardTemplates.List(r.Context(), user)
	if err != nil {
		if err == sql.ErrNoRows {
			common.Throw(w, r, common.NotFoundError)
			return
		}
		log.Errorw("unable to get board templates for that user", "user", user, "err", err)
		common.Throw(w, r, err)
		return
	}

	render.Status(r, http.StatusOK)
	render.Respond(w, r, templates)
}

func (s *Server) updateBoardTemplate(w http.ResponseWriter, r *http.Request) {
	templateId := r.Context().Value(identifiers.BoardTemplateIdentifier).(uuid.UUID)

	var body dto.BoardTemplateUpdateRequest
	if err := render.Decode(r, &body); err != nil {
		http.Error(w, "unable to parse request body", http.StatusBadRequest)
		return
	}
	body.ID = templateId
	updatedTemplate, err := s.boardTemplates.Update(r.Context(), body)
	if err != nil {
		common.Throw(w, r, err)
		return
	}

	render.Status(r, http.StatusOK)
	render.Respond(w, r, updatedTemplate)
}

func (s *Server) deleteBoardTemplate(w http.ResponseWriter, r *http.Request) {
	templateId := r.Context().Value(identifiers.BoardTemplateIdentifier).(uuid.UUID)

	err := s.boardTemplates.Delete(r.Context(), templateId)
	if err != nil {
		http.Error(w, "failed to delete board template", http.StatusInternalServerError)
		return
	}

	render.Status(r, http.StatusNoContent)
	render.Respond(w, r, nil)
}
