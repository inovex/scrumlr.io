package api

import (
	"github.com/go-chi/render"
	"github.com/google/uuid"
	"net/http"
	"scrumlr.io/server/common"
	"scrumlr.io/server/common/dto"
	"scrumlr.io/server/identifiers"
	"scrumlr.io/server/logger"
)

// getUser get a user
func (s *Server) getUser(w http.ResponseWriter, r *http.Request) {
	userId := r.Context().Value(identifiers.KeyUserIdentifier).(uuid.UUID)

	user, err := s.users.Get(r.Context(), userId)
	if err != nil {
		common.Throw(w, r, err)
		return
	}

	render.Status(r, http.StatusOK)
	render.Respond(w, r, user)
}

func (s *Server) updateUser(w http.ResponseWriter, r *http.Request) {
	log := logger.FromRequest(r)

	user := r.Context().Value(identifiers.KeyUserIdentifier).(uuid.UUID)

	var body dto.UserUpdateRequest
	if err := render.Decode(r, &body); err != nil {
		common.Throw(w, r, common.BadRequestError(err))
		return
	}

	body.ID = user

	updatedUser, err := s.users.Update(r.Context(), body)
	if err != nil {
		log.Errorw("failed to update user", "err", err)
		common.Throw(w, r, common.InternalServerError)
		return
	}

	render.Status(r, http.StatusOK)
	render.Respond(w, r, updatedUser)
}
