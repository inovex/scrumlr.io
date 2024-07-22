package api

import (
	"net/http"

	"github.com/go-chi/render"
	"github.com/google/uuid"
	"scrumlr.io/server/common"
	"scrumlr.io/server/common/dto"
	"scrumlr.io/server/identifiers"
	"scrumlr.io/server/logger"
)

func (s *Server) createColumnTemplate(w http.ResponseWriter, r *http.Request) {
	log := logger.FromRequest(r)

	boardTemplate := r.Context().Value(identifiers.BoardTemplateIdentifier).(uuid.UUID)
	user := r.Context().Value(identifiers.UserIdentifier).(uuid.UUID)

	var body dto.ColumnTemplateRequest
	if err := render.Decode(r, &body); err != nil {
		http.Error(w, "unable to parse request body", http.StatusBadRequest)
		return
	}

	body.BoardTemplate = boardTemplate
	body.User = user

	tColumn, err := s.boardTemplates.CreateColumnTemplate(r.Context(), body)
	if err != nil {
		log.Errorw("unable to create column template", "err", err)
		common.Throw(w, r, common.InternalServerError)
		return
	}

	render.Status(r, http.StatusCreated)
	render.Respond(w, r, tColumn)
}

func (s *Server) getColumnTemplate(w http.ResponseWriter, r *http.Request) {
	log := logger.FromRequest(r)

	boardTemplateId := r.Context().Value(identifiers.BoardTemplateIdentifier).(uuid.UUID)
	columnTemplateId := r.Context().Value(identifiers.ColumnTemplateIdentifier).(uuid.UUID)

	columTemplate, err := s.boardTemplates.GetColumnTemplate(r.Context(), boardTemplateId, columnTemplateId)
	if err != nil {
		log.Errorw("unable to get column template", "err", err)
		common.Throw(w, r, common.InternalServerError)
		return
	}

	render.Status(r, http.StatusOK)
	render.Respond(w, r, columTemplate)
}

func (s *Server) getColumnTemplates(w http.ResponseWriter, r *http.Request) {
	log := logger.FromRequest(r)

	templateId := r.Context().Value(identifiers.BoardTemplateIdentifier).(uuid.UUID)

	columTemplates, err := s.boardTemplates.ListColumnTemplates(r.Context(), templateId)
	if err != nil {
		log.Errorw("unable to get column templates", "err", err)
		common.Throw(w, r, common.InternalServerError)
		return
	}

	render.Status(r, http.StatusOK)
	render.Respond(w, r, columTemplates)
}

// updateColumn updates a column
func (s *Server) updateColumnTemplate(w http.ResponseWriter, r *http.Request) {
	templateBoardId := r.Context().Value(identifiers.BoardTemplateIdentifier).(uuid.UUID)
	templateColumnId := r.Context().Value(identifiers.ColumnTemplateIdentifier).(uuid.UUID)

	var body dto.ColumnTemplateUpdateRequest
	if err := render.Decode(r, &body); err != nil {
		http.Error(w, "unable to parse request body", http.StatusBadRequest)
		return
	}

	body.BoardTemplate = templateBoardId
	body.ID = templateColumnId

	tColumn, err := s.boardTemplates.UpdateColumnTemplate(r.Context(), body)
	if err != nil {
		http.Error(w, "unable to update template column", http.StatusInternalServerError)
		return
	}

	render.Status(r, http.StatusOK)
	render.Respond(w, r, tColumn)
}

// deleteColumnTemplate deletes a column
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
