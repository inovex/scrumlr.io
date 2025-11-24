package users

import (
	"context"
	"errors"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"github.com/google/uuid"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/codes"
	"scrumlr.io/server/common"
	"scrumlr.io/server/identifiers"
	"scrumlr.io/server/logger"
	"scrumlr.io/server/sessions"
)

type UserService interface {
	CreateAnonymous(ctx context.Context, name string) (*User, error)
	CreateAppleUser(ctx context.Context, id, name, avatarUrl string) (*User, error)
	CreateAzureAdUser(ctx context.Context, id, name, avatarUrl string) (*User, error)
	CreateGitHubUser(ctx context.Context, id, name, avatarUrl string) (*User, error)
	CreateGoogleUser(ctx context.Context, id, name, avatarUrl string) (*User, error)
	CreateMicrosoftUser(ctx context.Context, id, name, avatarUrl string) (*User, error)
	CreateOIDCUser(ctx context.Context, id, name, avatarUrl string) (*User, error)
	Update(ctx context.Context, body UserUpdateRequest) (*User, error)
	Get(ctx context.Context, id uuid.UUID) (*User, error)
	GetBoardUsers(ctx context.Context, boardID uuid.UUID) ([]*User, error)

	IsUserAvailableForKeyMigration(ctx context.Context, id uuid.UUID) (bool, error)
	SetKeyMigration(ctx context.Context, id uuid.UUID) (*User, error)
}
type API struct {
	service                       UserService
	sessions                      sessions.SessionService
	allowAnonymousBoardCreation   bool
	allowAnonymousCustomTemplates bool
}

func (api *API) GetUser(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "scrumlr.users.api.get")
	defer span.End()

	userId := ctx.Value(identifiers.UserIdentifier).(uuid.UUID)

	user, err := api.service.Get(ctx, userId)
	if err != nil {
		span.SetStatus(codes.Error, "failed to get user")
		span.RecordError(err)
		common.Throw(w, r, err)
		return
	}

	render.Status(r, http.StatusOK)
	render.Respond(w, r, user)
}

func (api *API) GetUserByID(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "scrumlr.users.api.get")
	defer span.End()
	log := logger.FromContext(ctx)

	userParam := chi.URLParam(r, "user")
	requestedUserId, err := uuid.Parse(userParam)
	if err != nil {
		span.SetStatus(codes.Error, "unable to parse uuid")
		span.RecordError(err)
		log.Errorw("unable to parse uuid", "err", err)
		common.Throw(w, r, err)
		return
	}
	user, err := api.service.Get(ctx, requestedUserId)
	if err != nil {
		span.SetStatus(codes.Error, "failed to get user by id")
		span.RecordError(err)
		common.Throw(w, r, err)
		return
	}

	render.Status(r, http.StatusOK)
	render.Respond(w, r, user)
}

func (api *API) GetUsersFromBoard(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "scrumlr.users.api.getAll")
	defer span.End()

	boardID := ctx.Value(identifiers.BoardIdentifier).(uuid.UUID)

	users, err := api.service.GetBoardUsers(ctx, boardID)
	if err != nil {
		span.SetStatus(codes.Error, "failed to get users")
		span.RecordError(err)
		common.Throw(w, r, err)
		return
	}

	render.Status(r, http.StatusOK)
	render.Respond(w, r, users)
}

func (api *API) Update(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "scrumlr.users.api.update")
	defer span.End()
	log := logger.FromContext(ctx)

	user := ctx.Value(identifiers.UserIdentifier).(uuid.UUID)

	var body UserUpdateRequest
	if err := render.Decode(r, &body); err != nil {
		span.SetStatus(codes.Error, "unable to decode body")
		span.RecordError(err)
		log.Errorw("unable to decode body", "err", err)
		common.Throw(w, r, common.BadRequestError(err))
		return
	}

	body.ID = user

	updatedUser, err := api.service.Update(ctx, body)
	if err != nil {
		span.SetStatus(codes.Error, "failed to update user")
		span.RecordError(err)
		common.Throw(w, r, common.InternalServerError)
		return
	}

	render.Status(r, http.StatusOK)
	render.Respond(w, r, updatedUser)
}

func (api *API) Delete(w http.ResponseWriter, r *http.Request) {
	//TODO implement me
	panic("implement me")
}

func (api *API) BoardAuthenticatedContext(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ctx, span := tracer.Start(r.Context(), "scrumlr.user.api.context.authenticated")
		defer span.End()
		log := logger.FromContext(ctx)

		boardParam := chi.URLParam(r, "id")
		board, err := uuid.Parse(boardParam)
		if err != nil {
			span.SetStatus(codes.Error, "unable to parse uuid")
			span.RecordError(err)
			common.Throw(w, r, common.BadRequestError(errors.New("invalid board id")))
			return
		}

		userIDValue := r.Context().Value(identifiers.UserIdentifier)
		userID, ok := userIDValue.(uuid.UUID)
		span.SetAttributes(
			attribute.String("scrumlr.user.api.context.authenticated.board", board.String()),
			attribute.String("scrumlr.user.api.context.authenticated.user", userID.String()),
		)
		if !ok {
			span.SetStatus(codes.Error, "unable to authenticate user")
			err = errors.New("invalid user id")
			span.RecordError(err)
			log.Errorw("Invalid user id", "error", err)
			common.Throw(w, r, common.BadRequestError(err))
			return
		}

		user, err := api.service.Get(ctx, userID)

		if err != nil {
			span.SetStatus(codes.Error, "could not fetch user")
			span.RecordError(err)
			log.Errorw("Could not fetch user", "error", err)
			common.Throw(w, r, errors.New("could not fetch user"))
			return
		}

		if user.AccountType == common.Anonymous {
			span.SetStatus(codes.Error, "not authorized to perform this action")
			err = errors.New("not authorized")
			span.RecordError(err)
			log.Errorw("Not authorized to perform this action", "accountType", user.AccountType)
			common.Throw(w, r, common.ForbiddenError(err))
			return
		}

		boardContext := context.WithValue(r.Context(), identifiers.BoardIdentifier, board)
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
		span.SetAttributes(
			attribute.String("scrumlr.user.api.context.authenticated.user", userID.String()),
		)
		if !ok {
			span.SetStatus(codes.Error, "invalid or missing user identifier in context")
			span.RecordError(errors.New("invalid or missing user identifier in context"))
			log.Errorw("invalid or missing user identifier in context")
			common.Throw(w, r, common.InternalServerError)
			return
		}

		user, err := api.service.Get(ctx, userID)
		if err != nil {
			span.SetStatus(codes.Error, "could not fetch user")
			span.RecordError(err)
			log.Errorw("Could not fetch user", "error", err)
			common.Throw(w, r, common.InternalServerError)
			return
		}

		if user.AccountType == common.Anonymous && !api.allowAnonymousBoardCreation {
			span.SetStatus(codes.Error, "not authorized to create boards anonymously")
			err := errors.New("not authorized to create boards anonymously")
			span.RecordError(err)
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
			span.SetStatus(codes.Error, "invalid or missing user identifier in context")
			span.RecordError(errors.New("invalid or missing user identifier in context"))
			log.Errorw("invalid or missing user identifier in context")
			common.Throw(w, r, common.InternalServerError)
			return
		}

		user, err := api.service.Get(ctx, userID)
		if err != nil {
			span.SetStatus(codes.Error, "could not fetch user")
			span.RecordError(err)
			log.Errorw("Could not fetch user", "error", err)
			common.Throw(w, r, common.InternalServerError)
			return
		}

		if user.AccountType == common.Anonymous && !api.allowAnonymousCustomTemplates {
			span.SetStatus(codes.Error, "not authorized to create custom templates")
			err := errors.New("not authorized to create custom templates anonymously")
			span.RecordError(err)
			log.Errorw("anonymous custom template creation not allowed")
			common.Throw(w, r, common.ForbiddenError(err))
			return
		}

		next.ServeHTTP(w, r)
	})
}

func NewUserApi(service UserService, sessionService sessions.SessionService, allowAnonymousBoardCreation, allowAnonymousCustomTemplates bool) UsersApi {
	api := new(API)
	api.service = service
	api.sessions = sessionService
	api.allowAnonymousBoardCreation = allowAnonymousBoardCreation
	api.allowAnonymousCustomTemplates = allowAnonymousCustomTemplates
	return api
}
