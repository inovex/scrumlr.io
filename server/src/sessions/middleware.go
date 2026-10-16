package sessions

import (
	"context"
	"errors"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"go.opentelemetry.io/otel/attribute"
	"scrumlr.io/server/common"
	"scrumlr.io/server/identifiers"
	"scrumlr.io/server/logger"
	"scrumlr.io/server/otel"
)

func (api *API) BoardParticipantContext(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ctx, span := tracer.Start(r.Context(), "scrumlr.sessions.api.context.participant")
		defer span.End()
		log := logger.FromContext(ctx)

		boardParam := chi.URLParam(r, "id")
		board, err := uuid.Parse(boardParam)
		if err != nil {
			otel.RecordErrorSpan(span, err, new("failed to parse board id"))
			common.Throw(w, r, common.BadRequestError(errors.New("invalid board id")))
			return
		}

		user := ctx.Value(identifiers.UserIdentifier).(uuid.UUID)
		span.SetAttributes(
			attribute.String("scrumlr.sessions.api.context.participant.board", board.String()),
			attribute.String("scrumlr.sessions.api.context.participant.user", user.String()),
		)

		exists, err := api.service.Exists(ctx, board, user)
		if err != nil {
			otel.RecordErrorSpan(span, err, new(checkBoardSessionFailureMessage))
			log.Errorw(checkBoardSessionFailureMessage, "err", err)
			common.Throw(w, r, common.InternalServerError)
			return
		}

		if !exists {
			err := errors.New("user board session not found")
			otel.RecordErrorSpan(span, err, nil)
			common.Throw(w, r, common.ForbiddenError(err))
			return
		}

		banned, err := api.service.IsParticipantBanned(ctx, board, user)
		if err != nil {
			otel.RecordErrorSpan(span, err, new("unable to check if participant is banned"))
			log.Errorw("unable to check if participant is banned", "err", err)
			common.Throw(w, r, common.InternalServerError)
			return
		}

		if banned {
			err := errors.New("participant is currently banned from this session")
			otel.RecordErrorSpan(span, err, nil)
			common.Throw(w, r, common.ForbiddenError(err))
			return
		}

		boardContext := context.WithValue(ctx, identifiers.BoardIdentifier, board)
		next.ServeHTTP(w, r.WithContext(boardContext))
	})
}

func (api *API) BoardModeratorContext(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ctx, span := tracer.Start(r.Context(), "scrumlr.sessions.api.context.moderator")
		defer span.End()
		log := logger.FromContext(ctx)

		boardParam := chi.URLParam(r, "id")
		board, err := uuid.Parse(boardParam)
		if err != nil {
			otel.RecordErrorSpan(span, err, new("unable to parse board id"))
			common.Throw(w, r, common.BadRequestError(errors.New("invalid board id")))
			return
		}
		user := ctx.Value(identifiers.UserIdentifier).(uuid.UUID)

		span.SetAttributes(
			attribute.String("scrumlr.sessions.api.context.moderator.board", board.String()),
			attribute.String("scrumlr.sessions.api.context.moderator.user", user.String()),
		)

		exists, err := api.service.ModeratorSessionExists(ctx, board, user)
		if err != nil {
			otel.RecordErrorSpan(span, err, new(checkBoardSessionFailureMessage))
			log.Errorw("unable to verify board session", "err", err)
			common.Throw(w, r, common.InternalServerError)
			return
		}

		if !exists {
			otel.RecordErrorSpan(span, err, new("moderator session does not exist"))
			common.Throw(w, r, common.NotFoundError)
			return
		}

		boardContext := context.WithValue(ctx, identifiers.BoardIdentifier, board)
		next.ServeHTTP(w, r.WithContext(boardContext))
	})
}

func (api *API) BoardOwnerContext(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ctx, span := tracer.Start(r.Context(), "scrumlr.sessions.api.context.owner")
		defer span.End()
		log := logger.FromContext(ctx)

		boardParam := chi.URLParam(r, "id")
		board, err := uuid.Parse(boardParam)
		if err != nil {
			otel.RecordErrorSpan(span, err, new("unable to parse board id"))
			common.Throw(w, r, common.BadRequestError(errors.New("invalid board id")))
			return
		}
		user := ctx.Value(identifiers.UserIdentifier).(uuid.UUID)

		span.SetAttributes(
			attribute.String("scrumlr.sessions.api.context.owner.board", board.String()),
			attribute.String("scrumlr.sessions.api.context.owner.user", user.String()),
		)

		exists, err := api.service.OwnerSessionExists(ctx, board, user)
		if err != nil {
			otel.RecordErrorSpan(span, err, new(checkBoardSessionFailureMessage))
			log.Errorw("unable to verify board session", "err", err)
			common.Throw(w, r, common.InternalServerError)
			return
		}

		if !exists {
			otel.RecordErrorSpan(span, err, new("owner session does not exist"))
			common.Throw(w, r, common.NotFoundError)
			return
		}

		boardContext := context.WithValue(ctx, identifiers.BoardIdentifier, board)
		next.ServeHTTP(w, r.WithContext(boardContext))
	})
}
