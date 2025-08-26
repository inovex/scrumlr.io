package sessions

import (
	"context"
	"database/sql"
	"errors"
	"strings"

	"github.com/google/uuid"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/codes"
	"go.opentelemetry.io/otel/metric"
	"go.opentelemetry.io/otel/trace"
	"scrumlr.io/server/common"
	"scrumlr.io/server/logger"
	"scrumlr.io/server/realtime"
)

var userTracer trace.Tracer = otel.Tracer("scrumlr.io/server/users")
var userMeter metric.Meter = otel.Meter("scrumlr.io/server/users")

type UserDatabase interface {
	CreateAnonymousUser(ctx context.Context, name string) (DatabaseUser, error)
	CreateAppleUser(ctx context.Context, id, name, avatarUrl string) (DatabaseUser, error)
	CreateAzureAdUser(ctx context.Context, id, name, avatarUrl string) (DatabaseUser, error)
	CreateGitHubUser(ctx context.Context, id, name, avatarUrl string) (DatabaseUser, error)
	CreateGoogleUser(ctx context.Context, id, name, avatarUrl string) (DatabaseUser, error)
	CreateMicrosoftUser(ctx context.Context, id, name, avatarUrl string) (DatabaseUser, error)
	CreateOIDCUser(ctx context.Context, id, name, avatarUrl string) (DatabaseUser, error)
	UpdateUser(ctx context.Context, update DatabaseUserUpdate) (DatabaseUser, error)
	GetUser(ctx context.Context, id uuid.UUID) (DatabaseUser, error)

	IsUserAnonymous(ctx context.Context, id uuid.UUID) (bool, error)
	IsUserAvailableForKeyMigration(ctx context.Context, id uuid.UUID) (bool, error)
	SetKeyMigration(ctx context.Context, id uuid.UUID) (DatabaseUser, error)
}

type Service struct {
	database       UserDatabase
	sessionService SessionService
	realtime       *realtime.Broker
}

func NewUserService(db UserDatabase, rt *realtime.Broker, sessionService SessionService) UserService {
	service := new(Service)
	service.database = db
	service.realtime = rt
	service.sessionService = sessionService

	return service
}

func (service *Service) CreateAnonymous(ctx context.Context, name string) (*User, error) {
	ctx, span := userTracer.Start(ctx, "scrumlr.users.service.create.anonymous")
	defer span.End()

	err := validateUsername(name)
	if err != nil {
		span.SetStatus(codes.Error, "failed to validate user name")
		span.RecordError(err)
		return nil, err
	}

	span.SetAttributes(
		attribute.String("scrumlr.users.service.create.anonymous.type", string(common.Anonymous)),
		attribute.String("scrumlr.users.service.create.anonymous.name", name),
	)

	user, err := service.database.CreateAnonymousUser(ctx, name)
	if err != nil {
		span.SetStatus(codes.Error, "failed to create user")
		span.RecordError(err)
		return nil, err
	}

	userCreatedCounter.Add(ctx, 1)
	anonymousUserCreatedCounter.Add(ctx, 1)
	return new(User).From(user), err
}

func (service *Service) CreateAppleUser(ctx context.Context, id, name, avatarUrl string) (*User, error) {
	ctx, span := userTracer.Start(ctx, "scrumlr.users.service.create.apple")
	defer span.End()

	err := validateUsername(name)
	if err != nil {
		span.SetStatus(codes.Error, "failed to validate user name")
		span.RecordError(err)
		return nil, err
	}

	span.SetAttributes(
		attribute.String("scrumlr.users.service.create.apple.type", string(common.Apple)),
		attribute.String("scrumlr.users.service.create.apple.name", name),
	)

	user, err := service.database.CreateAppleUser(ctx, id, name, avatarUrl)
	if err != nil {
		span.SetStatus(codes.Error, "failed to create user")
		span.RecordError(err)
		return nil, err
	}

	userCreatedCounter.Add(ctx, 1)
	appleUserCreatedCounter.Add(ctx, 1)
	return new(User).From(user), err
}

func (service *Service) CreateAzureAdUser(ctx context.Context, id, name, avatarUrl string) (*User, error) {
	ctx, span := userTracer.Start(ctx, "scrumlr.users.service.create.azuread")
	defer span.End()

	err := validateUsername(name)
	if err != nil {
		span.SetStatus(codes.Error, "failed to validate user name")
		span.RecordError(err)
		return nil, err
	}

	span.SetAttributes(
		attribute.String("scrumlr.users.service.create.azuread.type", string(common.AzureAd)),
		attribute.String("scrumlr.users.service.create.azuread.name", name),
	)

	user, err := service.database.CreateAzureAdUser(ctx, id, name, avatarUrl)
	if err != nil {
		span.SetStatus(codes.Error, "failed to create user")
		span.RecordError(err)
		return nil, err
	}

	userCreatedCounter.Add(ctx, 1)
	azureAdUserCreatedCounter.Add(ctx, 1)
	return new(User).From(user), err
}

func (service *Service) CreateGitHubUser(ctx context.Context, id, name, avatarUrl string) (*User, error) {
	ctx, span := userTracer.Start(ctx, "scrumlr.users.service.create.github")
	defer span.End()

	err := validateUsername(name)
	if err != nil {
		span.SetStatus(codes.Error, "failed to validate user name")
		span.RecordError(err)
		return nil, err
	}

	span.SetAttributes(
		attribute.String("scrumlr.users.service.create.github.type", string(common.GitHub)),
		attribute.String("scrumlr.users.service.create.github.name", name),
	)

	user, err := service.database.CreateGitHubUser(ctx, id, name, avatarUrl)
	if err != nil {
		span.SetStatus(codes.Error, "failed to create user")
		span.RecordError(err)
		return nil, err
	}

	userCreatedCounter.Add(ctx, 1)
	githubUserCreatedCounter.Add(ctx, 1)
	return new(User).From(user), err
}

func (service *Service) CreateGoogleUser(ctx context.Context, id, name, avatarUrl string) (*User, error) {
	ctx, span := userTracer.Start(ctx, "scrumlr.users.service.create.google")
	defer span.End()

	err := validateUsername(name)
	if err != nil {
		span.SetStatus(codes.Error, "failed to validate user name")
		span.RecordError(err)
		return nil, err
	}

	span.SetAttributes(
		attribute.String("scrumlr.users.service.create.google.type", string(common.Google)),
		attribute.String("scrumlr.users.service.create.google.name", name),
	)

	user, err := service.database.CreateGoogleUser(ctx, id, name, avatarUrl)
	if err != nil {
		span.SetStatus(codes.Error, "failed to create user")
		span.RecordError(err)
		return nil, err
	}

	userCreatedCounter.Add(ctx, 1)
	googleUserCreatedCounter.Add(ctx, 1)
	return new(User).From(user), err
}

func (service *Service) CreateMicrosoftUser(ctx context.Context, id, name, avatarUrl string) (*User, error) {
	ctx, span := userTracer.Start(ctx, "scrumlr.users.service.create.microsoft")
	defer span.End()

	err := validateUsername(name)
	if err != nil {
		span.SetStatus(codes.Error, "failed to validate user name")
		span.RecordError(err)
		return nil, err
	}

	span.SetAttributes(
		attribute.String("scrumlr.users.service.create.microsoft.type", string(common.Microsoft)),
		attribute.String("scrumlr.users.service.create.microsoft.name", name),
	)

	user, err := service.database.CreateMicrosoftUser(ctx, id, name, avatarUrl)
	if err != nil {
		span.SetStatus(codes.Error, "failed to create user")
		span.RecordError(err)
		return nil, err
	}

	userCreatedCounter.Add(ctx, 1)
	microsoftUserCreatedCounter.Add(ctx, 1)
	return new(User).From(user), err
}

func (service *Service) CreateOIDCUser(ctx context.Context, id, name, avatarUrl string) (*User, error) {
	ctx, span := userTracer.Start(ctx, "scrumlr.users.service.create.oidc")
	defer span.End()

	err := validateUsername(name)
	if err != nil {
		span.SetStatus(codes.Error, "failed to validate user name")
		span.RecordError(err)
		return nil, err
	}

	span.SetAttributes(
		attribute.String("scrumlr.users.service.create.oidc.type", string(common.TypeOIDC)),
		attribute.String("scrumlr.users.service.create.oidc.name", name),
	)

	user, err := service.database.CreateOIDCUser(ctx, id, name, avatarUrl)
	if err != nil {
		span.SetStatus(codes.Error, "failed to create user")
		span.RecordError(err)
		return nil, err
	}

	userCreatedCounter.Add(ctx, 1)
	oicdUserCreatedCounter.Add(ctx, 1)
	return new(User).From(user), err
}

func (service *Service) Update(ctx context.Context, body UserUpdateRequest) (*User, error) {
	log := logger.FromContext(ctx)
	ctx, span := userTracer.Start(ctx, "scrumlr.users.service.update")
	defer span.End()

	err := validateUsername(body.Name)
	if err != nil {
		span.SetStatus(codes.Error, "failed to validate user name")
		span.RecordError(err)
		return nil, err
	}

	span.SetAttributes(
		attribute.String("scrumlr.users.service.update.id", body.ID.String()),
		attribute.String("scrumlr.users.service.update.name", body.Name),
	)

	user, err := service.database.UpdateUser(ctx, DatabaseUserUpdate{
		ID:     body.ID,
		Name:   body.Name,
		Avatar: body.Avatar,
	})

	if err != nil {
		span.SetStatus(codes.Error, "failed to update user")
		span.RecordError(err)
		log.Errorw("unable to update user", "user", body.ID, "err", err)
		return nil, err
	}

	service.updatedUser(ctx, user)

	return new(User).From(user), err
}

func (service *Service) Get(ctx context.Context, userID uuid.UUID) (*User, error) {
	log := logger.FromContext(ctx)
	ctx, span := userTracer.Start(ctx, "scrumlr.users.service.get")
	defer span.End()

	span.SetAttributes(
		attribute.String("scrumlr.users.service.get.id", userID.String()),
	)

	user, err := service.database.GetUser(ctx, userID)
	if err != nil {
		if err == sql.ErrNoRows {
			span.SetStatus(codes.Error, "user not found")
			span.RecordError(err)
			return nil, common.NotFoundError
		}

		span.SetStatus(codes.Error, "failed to get user")
		span.RecordError(err)
		log.Errorw("unable to get user", "user", userID, "err", err)
		return nil, common.InternalServerError
	}

	return new(User).From(user), err
}

func (service *Service) IsUserAvailableForKeyMigration(ctx context.Context, id uuid.UUID) (bool, error) {
	ctx, span := userTracer.Start(ctx, "scrumlr.users.service.available_key_migration")
	defer span.End()

	span.SetAttributes(
		attribute.String("scrumlr.users.service.available_key_migration.id", id.String()),
	)

	return service.database.IsUserAvailableForKeyMigration(ctx, id)
}

func (service *Service) SetKeyMigration(ctx context.Context, id uuid.UUID) (*User, error) {
	ctx, span := userTracer.Start(ctx, "scrumlr.users.service.set_key_migration")
	defer span.End()

	span.SetAttributes(
		attribute.String("scrumlr.users.service.set_key_migration.id", id.String()),
	)

	user, err := service.database.SetKeyMigration(ctx, id)
	if err != nil {
		span.SetStatus(codes.Error, "failed to set key migration")
		span.RecordError(err)
		return nil, err
	}

	return new(User).From(user), nil
}

func (service *Service) updatedUser(ctx context.Context, user DatabaseUser) {
	ctx, span := userTracer.Start(ctx, "scrumlr.users.service.update")
	defer span.End()

	span.SetAttributes(
		attribute.String("scrumlr.users.service.update.id", user.ID.String()),
		attribute.String("scrumlr.users.service.update.name", user.Name),
		attribute.String("scrumlr.users.service.update.type", string(user.AccountType)),
	)

	connectedBoards, err := service.sessionService.GetUserConnectedBoards(ctx, user.ID)
	if err != nil {
		span.SetStatus(codes.Error, "failed to get connected boards")
		span.RecordError(err)
		return
	}

	for _, session := range connectedBoards {
		userSession, err := service.sessionService.Get(ctx, session.Board, session.User.ID)
		if err != nil {
			span.SetStatus(codes.Error, "failed to sessions")
			span.RecordError(err)
			logger.Get().Errorw("unable to get board session", "board", userSession.Board, "user", userSession.User.ID, "err", err)
		}
		_ = service.realtime.BroadcastToBoard(session.Board, realtime.BoardEvent{
			Type: realtime.BoardEventParticipantUpdated,
			Data: session,
		})
	}
}

func validateUsername(name string) error {
	if strings.TrimSpace(name) == "" {
		return errors.New("name may not be empty")
	}

	if strings.Contains(name, "\n") {
		return errors.New("name may not contain newline characters")
	}

	return nil
}
