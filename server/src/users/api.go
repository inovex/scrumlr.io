package users

import (
	"context"
	"errors"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"github.com/google/uuid"
	"go.opentelemetry.io/otel/attribute"
	"scrumlr.io/server/common"
	"scrumlr.io/server/identifiers"
	"scrumlr.io/server/logger"
	"scrumlr.io/server/otel"
	"scrumlr.io/server/sessions"
)

type UserService interface {
	Create(ctx context.Context, id, name, avatarUrl string, accountType common.AccountType) (*User, error)
	Get(ctx context.Context, id uuid.UUID) (*User, error)
	GetBoardUsers(ctx context.Context, boardID uuid.UUID) ([]*User, error)
	GetExistingUserIDs(ctx context.Context, userIDs []uuid.UUID) ([]uuid.UUID, error)
	Update(ctx context.Context, body UserUpdateRequest) (*User, error)
	Delete(ctx context.Context, id uuid.UUID) error
	IsUserAvailableForKeyMigration(ctx context.Context, id uuid.UUID) (bool, error)
	SetKeyMigration(ctx context.Context, id uuid.UUID) (*User, error)
}

type API struct {
	service                       UserService
	sessions                      sessions.SessionService
	allowAnonymousBoardCreation   bool
	allowAnonymousCustomTemplates bool
}

func NewUserApi(service UserService, sessionService sessions.SessionService, allowAnonymousBoardCreation, allowAnonymousCustomTemplates bool) UsersApi {
	api := new(API)
	api.service = service
	api.sessions = sessionService
	api.allowAnonymousBoardCreation = allowAnonymousBoardCreation
	api.allowAnonymousCustomTemplates = allowAnonymousCustomTemplates
	return api
}

// Get the logged in user
//
//	@Summary		Get the loged in user
//	@Description	Get the loged in user
//	@Tags			users
//	@Accept			json
//	@Param			Cookie	header	string	true	"jwt token to authenticate"
//	@Produce		json
//	@Success		200	{object}	User
//	@Failure		400	{object}	common.APIError
//	@Failure		403	{object}	common.APIError
//	@Failure		404	{object}	common.APIError
//	@Failure		500	{object}	common.APIError
//	@Router			/users [get]
func (api *API) GetUser(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "scrumlr.users.api.get")
	defer span.End()

	userId := ctx.Value(identifiers.UserIdentifier).(uuid.UUID)

	user, err := api.service.Get(ctx, userId)
	if err != nil {
		otel.RecordErrorSpan(span, err, new("failed to get user"))
		common.Throw(w, r, err)
		return
	}

	render.Status(r, http.StatusOK)
	render.Respond(w, r, user)
}

// Get a user by id
//
//	@Summary		Get a user by id
//	@Description	Get a user by id
//	@Tags			users
//	@Accept			json
//	@Param			Cookie	header	string	true	"jwt token to authenticate"
//	@Param			id		path	string	true	"id of the user"
//	@Produce		json
//	@Success		200	{object}	User
//	@Failure		400	{object}	common.APIError
//	@Failure		403	{object}	common.APIError
//	@Failure		404	{object}	common.APIError
//	@Failure		500	{object}	common.APIError
//	@Router			/users/{id} [get]
func (api *API) GetUserByID(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "scrumlr.users.api.get")
	defer span.End()
	log := logger.FromContext(ctx)

	userParam := chi.URLParam(r, "user")
	requestedUserId, err := uuid.Parse(userParam)
	if err != nil {
		otel.RecordErrorSpan(span, err, new("unable to parse uuid"))
		log.Errorw("unable to parse uuid", "err", err)
		common.Throw(w, r, err)
		return
	}

	user, err := api.service.Get(ctx, requestedUserId)
	if err != nil {
		otel.RecordErrorSpan(span, err, new("failed to get user by id"))
		common.Throw(w, r, err)
		return
	}

	render.Status(r, http.StatusOK)
	render.Respond(w, r, user)
}

// Get all users from a board
//
//	@Summary		Get all users from a board
//	@Description	Get all users from a board
//	@Tags			users
//	@Accept			json
//	@Param			Cookie	header	string	true	"jwt token to authenticate"
//	@Param			boardId	path	string	true	"id of the board"
//	@Produce		json
//	@Success		200	{object}	[]User
//	@Failure		400	{object}	common.APIError
//	@Failure		403	{object}	common.APIError
//	@Failure		404	{object}	common.APIError
//	@Failure		500	{object}	common.APIError
//	@Router			/users/board/{boardId} [get]
func (api *API) GetUsersFromBoard(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "scrumlr.users.api.getAll")
	defer span.End()

	boardID := ctx.Value(identifiers.BoardIdentifier).(uuid.UUID)

	users, err := api.service.GetBoardUsers(ctx, boardID)
	if err != nil {
		otel.RecordErrorSpan(span, err, new("failed to get users"))
		common.Throw(w, r, err)
		return
	}

	render.Status(r, http.StatusOK)
	render.Respond(w, r, users)
}

// Update the logged in user
//
//	@Summary		Update the logged in user
//	@Description	Update the logged in user
//	@Tags			users
//	@Accept			json
//	@Param			Cookie	header	string				true	"jwt token to authenticate"
//	@Param			user	body	UserUpdateRequest	true	"values to update the user"
//	@Produce		json
//	@Success		200	{object}	User
//	@Failure		400	{object}	common.APIError
//	@Failure		403	{object}	common.APIError
//	@Failure		404	{object}	common.APIError
//	@Failure		500	{object}	common.APIError
//	@Router			/users [put]
func (api *API) Update(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "scrumlr.users.api.update")
	defer span.End()
	log := logger.FromContext(ctx)

	user := ctx.Value(identifiers.UserIdentifier).(uuid.UUID)

	var body UserUpdateRequest
	if err := render.Decode(r, &body); err != nil {
		otel.RecordErrorSpan(span, err, new("unable to decode body"))
		log.Errorw("unable to decode body", "err", err)
		common.Throw(w, r, common.BadRequestError(err))
		return
	}

	body.ID = user

	updatedUser, err := api.service.Update(ctx, body)
	if err != nil {
		otel.RecordErrorSpan(span, err, new("failed to update user"))
		common.Throw(w, r, common.InternalServerError)
		return
	}

	render.Status(r, http.StatusOK)
	render.Respond(w, r, updatedUser)
}

// Delete the logged in user
//
//	@Summary		Delete the logged in user
//	@Description	Delete the logged in user
//	@Tags			users
//	@Accept			json
//	@Param			Cookie	header	string	true	"jwt token to authenticate"
//	@Param			id		path	string	true	"id of the user to delete"
//	@Produce		json
//	@Success		204
//	@Failure		400	{object}	common.APIError
//	@Failure		403	{object}	common.APIError
//	@Failure		404	{object}	common.APIError
//	@Failure		500	{object}	common.APIError
//	@Router			/users/{id} [delete]
func (api *API) Delete(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "scrumlr.users.api.delete")
	defer span.End()
	log := logger.FromContext(ctx)

	user := ctx.Value(identifiers.UserIdentifier).(uuid.UUID)

	err := api.service.Delete(ctx, user)
	if err != nil {
		otel.RecordErrorSpan(span, err, new("failed to delete user"))
		log.Errorw("failed to delete user", "user", user, "err", err)
		http.Error(w, "unable to delete user", http.StatusInternalServerError)
		return
	}

	render.Status(r, http.StatusNoContent)
	render.Respond(w, r, err)
}

func (api *API) BoardAuthenticatedContext(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ctx, span := tracer.Start(r.Context(), "scrumlr.user.api.context.authenticated")
		defer span.End()
		log := logger.FromContext(ctx)

		boardParam := chi.URLParam(r, "id")
		board, err := uuid.Parse(boardParam)
		if err != nil {
			otel.RecordErrorSpan(span, err, new("unable to parse uuid"))
			common.Throw(w, r, common.BadRequestError(errors.New("invalid board id")))
			return
		}

		userIDValue := ctx.Value(identifiers.UserIdentifier)
		userID, ok := userIDValue.(uuid.UUID)
		if !ok {
			err = errors.New("invalid or missing user identifier in context")
			otel.RecordErrorSpan(span, err, nil)
			log.Error("invalid or missing user identifier in context")
			common.Throw(w, r, common.BadRequestError(err))
			return
		}

		span.SetAttributes(
			attribute.String("scrumlr.user.api.context.authenticated.board", board.String()),
			attribute.String("scrumlr.user.api.context.authenticated.user", userID.String()),
		)

		user, err := api.service.Get(ctx, userID)
		if err != nil {
			otel.RecordErrorSpan(span, err, new("could not fetch user"))
			log.Errorw("Could not fetch user", "error", err)
			common.Throw(w, r, errors.New("could not fetch user"))
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

		userIDValue := ctx.Value(identifiers.UserIdentifier)
		userID, ok := userIDValue.(uuid.UUID)
		if !ok {
			err := errors.New("invalid or missing user identifier in context")
			otel.RecordErrorSpan(span, err, nil)
			log.Errorw("invalid or missing user identifier in context")
			common.Throw(w, r, common.BadRequestError(err))
			return
		}

		span.SetAttributes(
			attribute.String("scrumlr.user.api.context.authenticated.user", userID.String()),
		)

		user, err := api.service.Get(ctx, userID)
		if err != nil {
			otel.RecordErrorSpan(span, err, new("could not fetch user"))
			log.Errorw("Could not fetch user", "error", err)
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

		userIDValue := ctx.Value(identifiers.UserIdentifier)
		userID, ok := userIDValue.(uuid.UUID)
		if !ok {
			err := errors.New("invalid or missing user identifier in context")
			otel.RecordErrorSpan(span, err, nil)
			log.Errorw("invalid or missing user identifier in context")
			common.Throw(w, r, common.BadRequestError(err))
			return
		}

		user, err := api.service.Get(ctx, userID)
		if err != nil {
			otel.RecordErrorSpan(span, err, new("could not fetch user"))
			log.Errorw("Could not fetch user", "error", err)
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

func (api *API) isAccountOwner(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ctx, span := tracer.Start(r.Context(), "scrumlr.user.api.context.is_account_owner")
		defer span.End()
		log := logger.FromContext(ctx)

		userIDValue := ctx.Value(identifiers.UserIdentifier)
		userID, ok := userIDValue.(uuid.UUID)
		if !ok {
			err := errors.New("invalid or missing user identifier in context")
			otel.RecordErrorSpan(span, err, nil)
			log.Errorw("invalid or missing user identifier in context")
			common.Throw(w, r, common.BadRequestError(err))
			return
		}

		requestID := chi.URLParam(r, "user")
		requestedUserID, err := uuid.Parse(requestID)
		if err != nil {
			otel.RecordErrorSpan(span, err, new("unable to parse uuid"))
			log.Errorw("unable to parse uuid", "err", err)
			common.Throw(w, r, common.BadRequestError(err))
			return
		}

		span.SetAttributes(
			attribute.String("scrumlr.user.api.context.is_account_owner.userId", userID.String()),
			attribute.String("scrumlr.user.api.context.is_account_owner.requestedUserId", requestedUserID.String()),
		)

		if userID != requestedUserID {
			err := errors.New("requested user does not match authenticated user")
			otel.RecordErrorSpan(span, err, new("requested user does not match authenticated user"))
			log.Errorw("requested user does not match authenticated user", "requestedUserId", requestedUserID.String(), "userId", userID.String())
			common.Throw(w, r, common.BadRequestError(err))
			return
		}

		next.ServeHTTP(w, r)
	})
}
