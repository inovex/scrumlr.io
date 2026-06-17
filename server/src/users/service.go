package users

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	"strings"

	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/codes"
	"go.opentelemetry.io/otel/metric"
	"go.opentelemetry.io/otel/trace"
	"scrumlr.io/server/notes"
	"scrumlr.io/server/sessions"

	"github.com/google/uuid"
	"scrumlr.io/server/common"
	"scrumlr.io/server/logger"
	"scrumlr.io/server/realtime"
)

var tracer trace.Tracer = otel.Tracer("scrumlr.io/server/users")
var meter metric.Meter = otel.Meter("scrumlr.io/server/users")

type UserDatabase interface {
	CreateAnonymousUser(ctx context.Context, name string) (DatabaseUser, error)
	CreateAppleUser(ctx context.Context, id, name, avatarUrl string) (DatabaseUser, error)
	CreateAzureAdUser(ctx context.Context, id, name, avatarUrl string) (DatabaseUser, error)
	CreateGitHubUser(ctx context.Context, id, name, avatarUrl string) (DatabaseUser, error)
	CreateGoogleUser(ctx context.Context, id, name, avatarUrl string) (DatabaseUser, error)
	CreateMicrosoftUser(ctx context.Context, id, name, avatarUrl string) (DatabaseUser, error)
	CreateOIDCUser(ctx context.Context, id, name, avatarUrl string) (DatabaseUser, error)
	UpdateUser(ctx context.Context, update DatabaseUserUpdate) (DatabaseUser, error)
	DeleteUser(ctx context.Context, id uuid.UUID) error
	GetUser(ctx context.Context, id uuid.UUID) (DatabaseUser, error)
	GetUsers(ctx context.Context, boardID uuid.UUID) ([]DatabaseUser, error)

	IsUserAnonymous(ctx context.Context, id uuid.UUID) (bool, error)
	IsUserAvailableForKeyMigration(ctx context.Context, id uuid.UUID) (bool, error)
	SetKeyMigration(ctx context.Context, id uuid.UUID) (DatabaseUser, error)
}

type Service struct {
	database       UserDatabase
	sessionService sessions.SessionService
	realtime       *realtime.Broker
	notesService   notes.NotesService
}

func NewUserService(db UserDatabase, rt *realtime.Broker, sessionService sessions.SessionService, notesService notes.NotesService) UserService {
	service := new(Service)
	service.database = db
	service.realtime = rt
	service.sessionService = sessionService
	service.notesService = notesService

	return service
}

func (service *Service) CreateUser(ctx context.Context, id, name, avatarUrl string, accountType common.AccountType) (*User, error) {
	ctx, span := tracer.Start(ctx, "scrumlr.users.service.create")
	defer span.End()

	if err := validateUsername(name); err != nil {
		span.SetStatus(codes.Error, "failed to validate user name")
		span.RecordError(err)
		return nil, ErrInvalidUserName
	}

	span.SetAttributes(
		attribute.String("scrumlr.users.service.create.type", string(accountType)),
		attribute.String("scrumlr.users.service.create.name", name),
	)

	var user DatabaseUser
	var err error
	var specificCounter metric.Int64Counter

	switch accountType {
	case common.Anonymous:
		specificCounter = anonymousUserCreatedCounter
		user, err = service.database.CreateAnonymousUser(ctx, name)
	case common.Apple:
		specificCounter = appleUserCreatedCounter
		user, err = service.database.CreateAppleUser(ctx, id, name, avatarUrl)
	case common.AzureAd:
		specificCounter = azureAdUserCreatedCounter
		user, err = service.database.CreateAzureAdUser(ctx, id, name, avatarUrl)
	case common.GitHub:
		specificCounter = githubUserCreatedCounter
		user, err = service.database.CreateGitHubUser(ctx, id, name, avatarUrl)
	case common.Google:
		specificCounter = googleUserCreatedCounter
		user, err = service.database.CreateGoogleUser(ctx, id, name, avatarUrl)
	case common.Microsoft:
		specificCounter = microsoftUserCreatedCounter
		user, err = service.database.CreateMicrosoftUser(ctx, id, name, avatarUrl)
	case common.TypeOIDC:
		specificCounter = oicdUserCreatedCounter
		user, err = service.database.CreateOIDCUser(ctx, id, name, avatarUrl)
	default:
		return nil, common.BadRequestError(errors.New("invalid account type"))
	}

	if err != nil {
		span.SetStatus(codes.Error, "failed to create user")
		span.RecordError(err)
		return nil, UserError{Category: Internal, Message: fmt.Sprintf("failed to create user: %v", err), Err: err}
	}

	userCreatedCounter.Add(ctx, 1)
	specificCounter.Add(ctx, 1)

	return new(User).From(user), nil
}

func (service *Service) Update(ctx context.Context, body UserUpdateRequest) (*User, error) {
	log := logger.FromContext(ctx)
	ctx, span := tracer.Start(ctx, "scrumlr.users.service.update")
	defer span.End()

	err := validateUsername(body.Name)
	if err != nil {
		span.SetStatus(codes.Error, "failed to validate user name")
		span.RecordError(err)
		return nil, ErrInvalidUserName
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
		if errors.Is(err, sql.ErrNoRows) {
			span.SetStatus(codes.Error, "user to update not found")
			span.RecordError(err)
			log.Errorw("user to update not found", "user", body.ID, "err", err)
			return nil, ErrUserNotFound
		}

		span.SetStatus(codes.Error, "failed to update user")
		span.RecordError(err)
		log.Errorw("unable to update user", "user", body.ID, "err", err)
		return nil, UserError{Category: Internal, Message: fmt.Sprintf("failed to update user: %v", err), Err: err}
	}

	service.updatedUser(ctx, user)

	return new(User).From(user), err
}

func (service *Service) Delete(ctx context.Context, id uuid.UUID) error {
	log := logger.FromContext(ctx)
	ctx, span := tracer.Start(ctx, "scrumlr.users.service.delete")
	defer span.End()

	span.SetAttributes(
		attribute.String("scrumlr.users.service.delete.id", id.String()),
	)
	userBoards, err := service.sessionService.GetUserBoardSessions(ctx, id, false)
	if err != nil {
		span.SetStatus(codes.Error, "failed to get user boards")
		span.RecordError(err)
		return err
	}

	for _, board := range userBoards {
		if err := service.notesService.DeleteUserNotesFromBoard(ctx, id, board.Board); err != nil {
			span.SetStatus(codes.Error, "failed to delete user notes")
			span.RecordError(err)
			log.Errorw("failed to delete user notes from board", "board", board.Board, "user", id, "err", err)
		}

	}

	err = service.database.DeleteUser(ctx, id)
	if err != nil {
		span.SetStatus(codes.Error, "failed to delete user")
		span.RecordError(err)
		log.Errorw("failed to delete user", "user", id, "err", err)
		return UserError{Category: Internal, Message: fmt.Sprintf("failed to delete user: %v", err), Err: err}
	}

	deletedUserCounter.Add(ctx, 1)
	return err
}

func (service *Service) Get(ctx context.Context, userID uuid.UUID) (*User, error) {
	log := logger.FromContext(ctx)
	ctx, span := tracer.Start(ctx, "scrumlr.users.service.get")
	defer span.End()

	span.SetAttributes(
		attribute.String("scrumlr.users.service.get.id", userID.String()),
	)

	user, err := service.database.GetUser(ctx, userID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			span.SetStatus(codes.Error, "user not found")
			span.RecordError(err)
			return nil, ErrUserNotFound
		}

		span.SetStatus(codes.Error, "failed to get user")
		span.RecordError(err)
		log.Errorw("unable to get user", "user", userID, "err", err)
		return nil, UserError{Category: Internal, Message: fmt.Sprintf("failed to get user: %v", err), Err: err}
	}

	return new(User).From(user), err
}

func (service *Service) GetBoardUsers(ctx context.Context, boardID uuid.UUID) ([]*User, error) {
	log := logger.FromContext(ctx)
	ctx, span := tracer.Start(ctx, "scrumlr.users.service.multiple")
	defer span.End()

	users, err := service.database.GetUsers(ctx, boardID)
	if err != nil {
		span.SetStatus(codes.Error, "failed to get users")
		span.RecordError(err)
		log.Errorw("unable to get users", "board", boardID, "err", err)
		return nil, UserError{Category: Internal, Message: fmt.Sprintf("failed to get users: %v", err), Err: err}
	}

	return UserSlice(users), nil
}

func (service *Service) IsUserAvailableForKeyMigration(ctx context.Context, id uuid.UUID) (bool, error) {
	ctx, span := tracer.Start(ctx, "scrumlr.users.service.available_key_migration")
	defer span.End()

	span.SetAttributes(
		attribute.String("scrumlr.users.service.available_key_migration.id", id.String()),
	)

	return service.database.IsUserAvailableForKeyMigration(ctx, id)
}

func (service *Service) SetKeyMigration(ctx context.Context, id uuid.UUID) (*User, error) {
	ctx, span := tracer.Start(ctx, "scrumlr.users.service.set_key_migration")
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
	ctx, span := tracer.Start(ctx, "scrumlr.users.service.update")
	defer span.End()

	span.SetAttributes(
		attribute.String("scrumlr.users.service.update.id", user.ID.String()),
		attribute.String("scrumlr.users.service.update.name", user.Name),
		attribute.String("scrumlr.users.service.update.type", string(user.AccountType)),
	)

	connectedBoards, err := service.sessionService.GetUserBoardSessions(ctx, user.ID, true)
	if err != nil {
		span.SetStatus(codes.Error, "failed to get connected boards")
		span.RecordError(err)
		return
	}

	for _, session := range connectedBoards {
		_ = service.realtime.BroadcastToBoard(ctx, session.Board, realtime.BoardEvent{
			Type: realtime.BoardEventParticipantUpdated,
			Data: new(User).From(user),
		})
	}
}

func validateUsername(name string) error {
	if strings.TrimSpace(name) == "" {
		return ErrEmptyUserName
	}

	if strings.Contains(name, "\n") {
		return ErrNewLineUserName
	}

	return nil
}
