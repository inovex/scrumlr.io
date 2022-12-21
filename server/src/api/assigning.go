package api

import (
	"net/http"

	"github.com/go-chi/render"
	"github.com/google/uuid"
	"scrumlr.io/server/common"
	"scrumlr.io/server/common/dto"
	"scrumlr.io/server/logger"
)

func (s *Server) addAssignee(w http.ResponseWriter, r *http.Request) {
	log := logger.FromRequest(r)

	note := r.Context().Value("Note").(uuid.UUID)
	name := r.Context().Value("Name").(string)
	id := r.Context().Value("Id").(uuid.UUID)

	var body dto.AssignRequest
	if err := render.Decode(r, &body); err != nil {
		common.Throw(w, r, common.BadRequestError(err))
		return
	}

	body.Note = note
	body.Name = name
	body.Id = id

	assign, err := s.assignings.AddAssign(r.Context(), body)
	if err != nil {
		log.Warnw("unable to assign", "err", err)
		common.Throw(w, r, err)
		return
	}

	render.Status(r, http.StatusCreated)
	render.Respond(w, r, assign)
}

func (s *Server) removeAssignee(w http.ResponseWriter, r *http.Request) {
	
}

func (s *Server) getAssignings(w http.ResponseWriter, r *http.Request) {
	
}