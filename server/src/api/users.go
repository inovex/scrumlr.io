package api

import (
	"net/http"

	"github.com/go-chi/render"
	"github.com/google/uuid"
	"scrumlr.io/server/common"
	"scrumlr.io/server/identifiers"
	"scrumlr.io/server/logger"
	"scrumlr.io/server/sessions"
)

// getUser get a user
func (s *Server) getUser(w http.ResponseWriter, r *http.Request) {
	userId := r.Context().Value(identifiers.UserIdentifier).(uuid.UUID)

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
	user := r.Context().Value(identifiers.UserIdentifier).(uuid.UUID)

	var body sessions.UserUpdateRequest
	if err := render.Decode(r, &body); err != nil {
		log.Errorw("unable to decode body", "err", err)
		common.Throw(w, r, common.BadRequestError(err))
		return
	}

	body.ID = user

	updatedUser, err := s.users.Update(r.Context(), body)
	if err != nil {
		common.Throw(w, r, common.InternalServerError)
		return
	}

	// because of a import cycle the boards are updated through the session service
	// after a user update.
	updateBoards := sessions.BoardSessionUpdateRequest{
		User: user,
	}
	_, err = s.sessions.UpdateUserBoards(r.Context(), updateBoards)
	if err != nil {
		log.Errorw("Unable to update user boards")
	}

	render.Status(r, http.StatusOK)
	render.Respond(w, r, updatedUser)
}
