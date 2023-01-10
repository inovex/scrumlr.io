package api

import (
	"net/http"
	"github.com/go-chi/render"
	"github.com/google/uuid"
	"scrumlr.io/server/common"
	"scrumlr.io/server/common/dto"
)

func (s *Server) createAssignment(w http.ResponseWriter, r *http.Request) () {
  board := r.Context().Value("Board").(uuid.UUID)

  var body dto.AssignmentCreateRequest
  if err := render.Decode(r, &body); err != nil {
    common.Throw(w, r, common.BadRequestError(err))
    return
  }

  body.Board = board

  assignment, err := s.assignments.Create(r.Context(), body)
  if err != nil {
    common.Throw(w, r, err)
    return
  }

  render.Status(r, http.StatusCreated)
  render.Respond(w, r, assignment)
}

func (s *Server) deleteAssignment(w http.ResponseWriter, r *http.Request) () {
  assignment := r.Context().Value("Assignment").(uuid.UUID)

  if err := s.assignments.Delete(r.Context(), assignment); err != nil {
    common.Throw(w, r, err)
    return
  }

  render.Status(r, http.StatusNoContent)
  render.Respond(w, r, nil)
}
