package api

import (
	"net/http"

	"github.com/go-chi/render"
	"github.com/google/uuid"
	"scrumlr.io/server/common"
	"scrumlr.io/server/common/dto"
	"scrumlr.io/server/identifiers"
)

func (s *Server) createColumnTemplate(w http.ResponseWriter, r *http.Request) {
	boardTemplateId := r.Context().Value(identifiers.BoardTemplateIdentifier).(uuid.UUID)
	user := r.Context().Value(identifiers.UserIdentifier).(uuid.UUID)

	var body dto.ColumnTemplateRequest
	if err := render.Decode(r, &body); err != nil {
		http.Error(w, "unable to parse request body", http.StatusBadRequest)
		return
	}

	body.BoardTemplate = boardTemplateId
	body.User = user

	tColumn, err := s.boardTemplates.CreateColumnTemplate(r.Context(), body)
	if err != nil {
		common.Throw(w, r, common.InternalServerError)
		return
	}

	render.Status(r, http.StatusCreated)
	render.Respond(w, r, tColumn)
}

func (s *Server) getColumnTemplate(w http.ResponseWriter, r *http.Request) {
	boardTemplateId := r.Context().Value(identifiers.BoardTemplateIdentifier).(uuid.UUID)
	columnTemplateId := r.Context().Value(identifiers.ColumnTemplateIdentifier).(uuid.UUID)

	columTemplate, err := s.boardTemplates.GetColumnTemplate(r.Context(), boardTemplateId, columnTemplateId)
	if err != nil {
		common.Throw(w, r, common.InternalServerError)
		return
	}

	render.Status(r, http.StatusOK)
	render.Respond(w, r, columTemplate)
}

func (s *Server) getColumnTemplates(w http.ResponseWriter, r *http.Request) {
	boardTemplateId := r.Context().Value(identifiers.BoardTemplateIdentifier).(uuid.UUID)

	columTemplates, err := s.boardTemplates.ListColumnTemplates(r.Context(), boardTemplateId)
	if err != nil {
		common.Throw(w, r, common.InternalServerError)
		return
	}

	render.Status(r, http.StatusOK)
	render.Respond(w, r, columTemplates)
}

func (s *Server) updateColumnTemplate(w http.ResponseWriter, r *http.Request) {
	boardTemplateId := r.Context().Value(identifiers.BoardTemplateIdentifier).(uuid.UUID)
	columnTemplateId := r.Context().Value(identifiers.ColumnTemplateIdentifier).(uuid.UUID)

	var body dto.ColumnTemplateUpdateRequest
	if err := render.Decode(r, &body); err != nil {
		http.Error(w, "unable to parse request body", http.StatusBadRequest)
		return
	}

	body.BoardTemplate = boardTemplateId
	body.ID = columnTemplateId

	tColumn, err := s.boardTemplates.UpdateColumnTemplate(r.Context(), body)
	if err != nil {
		http.Error(w, "unable to update template column", http.StatusInternalServerError)
		return
	}

	render.Status(r, http.StatusOK)
	render.Respond(w, r, tColumn)
}

func (s *Server) deleteColumnTemplate(w http.ResponseWriter, r *http.Request) {
	boardTemplateId := r.Context().Value(identifiers.BoardTemplateIdentifier).(uuid.UUID)
	columnTemplateId := r.Context().Value(identifiers.ColumnTemplateIdentifier).(uuid.UUID)
	user := r.Context().Value(identifiers.UserIdentifier).(uuid.UUID)

	if err := s.boardTemplates.DeleteColumnTemplate(r.Context(), boardTemplateId, columnTemplateId, user); err != nil {
		http.Error(w, "unable to delete column template", http.StatusInternalServerError)
		return
	}

	render.Status(r, http.StatusNoContent)
	render.Respond(w, r, nil)
}
