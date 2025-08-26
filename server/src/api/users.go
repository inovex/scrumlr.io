package api

import (
	"net/http"

	"github.com/go-chi/render"
	"github.com/google/uuid"
	"go.opentelemetry.io/otel/codes"
	"scrumlr.io/server/common"
	"scrumlr.io/server/identifiers"
	"scrumlr.io/server/logger"
	"scrumlr.io/server/sessions"
)

//var tracer trace.Tracer = otel.Tracer("scrumlr.io/server/api")

// getUser get a user
func (s *Server) getUser(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "scrumlr.users.api.get")
	defer span.End()

	userId := ctx.Value(identifiers.UserIdentifier).(uuid.UUID)

	user, err := s.users.Get(ctx, userId)
	if err != nil {
		span.SetStatus(codes.Error, "failed to get user")
		span.RecordError(err)
		common.Throw(w, r, err)
		return
	}

	render.Status(r, http.StatusOK)
	render.Respond(w, r, user)
}

func (s *Server) updateUser(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "scrumlr.users.api.update")
	defer span.End()
	log := logger.FromContext(ctx)

	user := ctx.Value(identifiers.UserIdentifier).(uuid.UUID)

	var body sessions.UserUpdateRequest
	if err := render.Decode(r, &body); err != nil {
		span.SetStatus(codes.Error, "unable to decode body")
		span.RecordError(err)
		log.Errorw("unable to decode body", "err", err)
		common.Throw(w, r, common.BadRequestError(err))
		return
	}

	body.ID = user

	updatedUser, err := s.users.Update(ctx, body)
	if err != nil {
		span.SetStatus(codes.Error, "failed to update user")
		span.RecordError(err)
		common.Throw(w, r, common.InternalServerError)
		return
	}

	// because of a import cycle the boards are updated through the session service
	// after a user update.
	updateBoards := sessions.BoardSessionUpdateRequest{
		User: user,
	}

	_, err = s.sessions.UpdateUserBoards(ctx, updateBoards)
	if err != nil {
		span.SetStatus(codes.Error, "failed to update user board")
		span.RecordError(err)
		log.Errorw("Unable to update user boards")
	}

	render.Status(r, http.StatusOK)
	render.Respond(w, r, updatedUser)
}
