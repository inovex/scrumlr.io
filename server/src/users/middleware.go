package users

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

func (api *API) BoardAuthenticatedContext(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ctx, span := tracer.Start(r.Context(), "scrumlr.user.api.context.authenticated")
		defer span.End()
		log := logger.FromContext(ctx)

		boardParam := chi.URLParam(r, "id")
		board, err := uuid.Parse(boardParam)
		if err != nil {
			otel.RecordErrorSpan(span, err, new(parseUUIDFailureMessage))
			common.Throw(w, r, common.BadRequestError(errors.New("invalid board id")))
			return
		}

		userId, ok := ctx.Value(identifiers.UserIdentifier).(uuid.UUID)
		if !ok {
			err = errors.New(improperUserIDMessage)
			otel.RecordErrorSpan(span, err, nil)
			log.Error(improperUserIDMessage)
			common.Throw(w, r, common.BadRequestError(err))
			return
		}

		span.SetAttributes(
			attribute.String("scrumlr.user.api.context.authenticated.board", board.String()),
			attribute.String("scrumlr.user.api.context.authenticated.user", userId.String()),
		)

		user, err := api.service.Get(ctx, userId)
		if err != nil {
			otel.RecordErrorSpan(span, err, new(fetchUserFailureMessage))
			log.Errorw(fetchUserFailureMessage, "error", err)
			common.Throw(w, r, errors.New(fetchUserFailureMessage))
			return
		}

		if user.AccountType == common.Anonymous {
			err = errors.New("not authorized to perform this action")
			otel.RecordErrorSpan(span, err, nil)
			log.Errorw("Not authorized to perform this action", "accountType", user.AccountType)
			common.Throw(w, r, common.ForbiddenError(err))
			return
		}

		boardContext := context.WithValue(ctx, identifiers.BoardIdentifier, board)
		next.ServeHTTP(w, r.WithContext(boardContext))
	})
}

func (api *API) AnonymousBoardCreationContext(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ctx, span := tracer.Start(r.Context(), "scrumlr.user.api.context.anonymous_board_creation")
		defer span.End()
		log := logger.FromContext(ctx)

		userId, ok := ctx.Value(identifiers.UserIdentifier).(uuid.UUID)
		if !ok {
			err := errors.New(improperUserIDMessage)
			otel.RecordErrorSpan(span, err, nil)
			log.Errorw(improperUserIDMessage)
			common.Throw(w, r, common.BadRequestError(err))
			return
		}

		span.SetAttributes(
			attribute.String("scrumlr.user.api.context.authenticated.user", userId.String()),
		)

		user, err := api.service.Get(ctx, userId)
		if err != nil {
			otel.RecordErrorSpan(span, err, new(fetchUserFailureMessage))
			log.Errorw(fetchUserFailureMessage, "error", err)
			common.Throw(w, r, common.InternalServerError)
			return
		}

		if user.AccountType == common.Anonymous && !api.allowAnonymousBoardCreation {
			err := errors.New("not authorized to create boards anonymously")
			otel.RecordErrorSpan(span, err, nil)
			log.Errorw("anonymous board creation not allowed")
			common.Throw(w, r, common.ForbiddenError(err))
			return
		}

		next.ServeHTTP(w, r)
	})
}

func (api *API) AnonymousCustomTemplateCreationContext(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ctx, span := tracer.Start(r.Context(), "scrumlr.user.api.context.anonymous_template_creation")
		defer span.End()
		log := logger.FromContext(ctx)

		userId, ok := ctx.Value(identifiers.UserIdentifier).(uuid.UUID)
		if !ok {
			err := errors.New(improperUserIDMessage)
			otel.RecordErrorSpan(span, err, nil)
			log.Errorw(improperUserIDMessage)
			common.Throw(w, r, common.BadRequestError(err))
			return
		}

		user, err := api.service.Get(ctx, userId)
		if err != nil {
			otel.RecordErrorSpan(span, err, new(fetchUserFailureMessage))
			log.Errorw(fetchUserFailureMessage, "error", err)
			common.Throw(w, r, common.InternalServerError)
			return
		}

		if user.AccountType == common.Anonymous && !api.allowAnonymousCustomTemplates {
			err := errors.New("not authorized to create custom templates anonymously")
			otel.RecordErrorSpan(span, err, nil)
			log.Errorw("anonymous custom template creation not allowed")
			common.Throw(w, r, common.ForbiddenError(err))
			return
		}

		next.ServeHTTP(w, r)
	})
}

func (api *API) IsAccountOwner(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ctx, span := tracer.Start(r.Context(), "scrumlr.user.api.context.is_account_owner")
		defer span.End()
		log := logger.FromContext(ctx)

		userId, ok := ctx.Value(identifiers.UserIdentifier).(uuid.UUID)
		if !ok {
			err := errors.New(improperUserIDMessage)
			otel.RecordErrorSpan(span, err, nil)
			log.Errorw(improperUserIDMessage)
			common.Throw(w, r, common.BadRequestError(err))
			return
		}

		requestID := chi.URLParam(r, "user")
		requestedUserID, err := uuid.Parse(requestID)
		if err != nil {
			otel.RecordErrorSpan(span, err, new(parseUUIDFailureMessage))
			log.Errorw(parseUUIDFailureMessage, "err", err)
			common.Throw(w, r, common.BadRequestError(err))
			return
		}

		span.SetAttributes(
			attribute.String("scrumlr.user.api.context.is_account_owner.userId", userId.String()),
			attribute.String("scrumlr.user.api.context.is_account_owner.requestedUserId", requestedUserID.String()),
		)

		if userId != requestedUserID {
			err := errors.New("requested user does not match authenticated user")
			otel.RecordErrorSpan(span, err, new("requested user does not match authenticated user"))
			log.Errorw("requested user does not match authenticated user", "requestedUserId", requestedUserID.String(), "userId", userId.String())
			common.Throw(w, r, common.BadRequestError(err))
			return
		}

		next.ServeHTTP(w, r)
	})
}
