package users

import (
	"context"
	"database/sql"
	"errors"
	"strings"

	"scrumlr.io/server/sessions"

	"github.com/google/uuid"
	"scrumlr.io/server/common"
	"scrumlr.io/server/logger"
	"scrumlr.io/server/realtime"
)

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
	GetMultipleUsers(ctx context.Context, ids []uuid.UUID) ([]DatabaseUser, error)

	IsUserAnonymous(ctx context.Context, id uuid.UUID) (bool, error)
	IsUserAvailableForKeyMigration(ctx context.Context, id uuid.UUID) (bool, error)
	SetKeyMigration(ctx context.Context, id uuid.UUID) (DatabaseUser, error)
}

type Service struct {
	database       UserDatabase
	sessionService sessions.SessionService
	realtime       *realtime.Broker
}

func NewUserService(db UserDatabase, rt *realtime.Broker, sessionService sessions.SessionService) UserService {
	service := new(Service)
	service.database = db
	service.realtime = rt
	service.sessionService = sessionService

	return service
}

func (service *Service) CreateAnonymous(ctx context.Context, name string) (*User, error) {
	err := validateUsername(name)
	if err != nil {
		return nil, err
	}

	user, err := service.database.CreateAnonymousUser(ctx, name)
	if err != nil {
		return nil, err
	}

	return new(User).From(user), err
}

func (service *Service) CreateAppleUser(ctx context.Context, id, name, avatarUrl string) (*User, error) {
	err := validateUsername(name)
	if err != nil {
		return nil, err
	}

	user, err := service.database.CreateAppleUser(ctx, id, name, avatarUrl)
	if err != nil {
		return nil, err
	}

	return new(User).From(user), err
}

func (service *Service) CreateAzureAdUser(ctx context.Context, id, name, avatarUrl string) (*User, error) {
	err := validateUsername(name)
	if err != nil {
		return nil, err
	}

	user, err := service.database.CreateAzureAdUser(ctx, id, name, avatarUrl)
	if err != nil {
		return nil, err
	}

	return new(User).From(user), err
}

func (service *Service) CreateGitHubUser(ctx context.Context, id, name, avatarUrl string) (*User, error) {
	err := validateUsername(name)
	if err != nil {
		return nil, err
	}

	user, err := service.database.CreateGitHubUser(ctx, id, name, avatarUrl)
	if err != nil {
		return nil, err
	}

	return new(User).From(user), err
}

func (service *Service) CreateGoogleUser(ctx context.Context, id, name, avatarUrl string) (*User, error) {
	err := validateUsername(name)
	if err != nil {
		return nil, err
	}

	user, err := service.database.CreateGoogleUser(ctx, id, name, avatarUrl)
	if err != nil {
		return nil, err
	}

	return new(User).From(user), err
}

func (service *Service) CreateMicrosoftUser(ctx context.Context, id, name, avatarUrl string) (*User, error) {
	err := validateUsername(name)
	if err != nil {
		return nil, err
	}

	user, err := service.database.CreateMicrosoftUser(ctx, id, name, avatarUrl)
	if err != nil {
		return nil, err
	}

	return new(User).From(user), err
}

func (service *Service) CreateOIDCUser(ctx context.Context, id, name, avatarUrl string) (*User, error) {
	err := validateUsername(name)
	if err != nil {
		return nil, err
	}

	user, err := service.database.CreateOIDCUser(ctx, id, name, avatarUrl)
	if err != nil {
		return nil, err
	}

	return new(User).From(user), err
}

func (service *Service) Update(ctx context.Context, body UserUpdateRequest) (*User, error) {
	log := logger.FromContext(ctx)
	err := validateUsername(body.Name)
	if err != nil {
		return nil, err
	}

	user, err := service.database.UpdateUser(ctx, DatabaseUserUpdate{
		ID:     body.ID,
		Name:   body.Name,
		Avatar: body.Avatar,
	})

	if err != nil {
		log.Errorw("unable to update user", "user", body.ID, "err", err)
		return nil, err
	}

	service.updatedUser(ctx, user)

	return new(User).From(user), err
}

func (service *Service) Get(ctx context.Context, userID uuid.UUID) (*User, error) {
	log := logger.FromContext(ctx)
	user, err := service.database.GetUser(ctx, userID)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, common.NotFoundError
		}
		log.Errorw("unable to get user", "user", userID, "err", err)
		return nil, common.InternalServerError
	}

	return new(User).From(user), err
}

func (service *Service) GetMultiple(ctx context.Context, ids []uuid.UUID) ([]User, error) {
	log := logger.FromContext(ctx)

	users, err := service.database.GetMultipleUsers(ctx, ids)
	if err != nil {
		log.Errorw("unable to get multiple users", "users", ids, "err", err)
		return nil, err
	}

	mappedUsers := make([]User, 0, len(users))
	for _, user := range users {
		mappedUsers = append(mappedUsers, *new(User).From(user))

	}
	return mappedUsers, nil
}

func (service *Service) IsUserAvailableForKeyMigration(ctx context.Context, id uuid.UUID) (bool, error) {
	return service.database.IsUserAvailableForKeyMigration(ctx, id)
}

func (service *Service) SetKeyMigration(ctx context.Context, id uuid.UUID) (*User, error) {
	user, err := service.database.SetKeyMigration(ctx, id)
	if err != nil {
		return nil, err
	}

	return new(User).From(user), nil
}

func (service *Service) updatedUser(ctx context.Context, user DatabaseUser) {
	connectedBoards, err := service.sessionService.GetUserConnectedBoards(ctx, user.ID)
	if err != nil {
		return
	}

	for _, session := range connectedBoards {
		userSession, err := service.sessionService.Get(ctx, session.Board, session.UserID)
		if err != nil {
			logger.Get().Errorw("unable to get board session", "board", userSession.Board, "user", userSession.UserID, "err", err)
		}
		_ = service.realtime.BroadcastToBoard(ctx, session.Board, realtime.BoardEvent{
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
