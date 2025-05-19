package users

import (
	"context"
	"database/sql"
	"errors"
	"scrumlr.io/server/sessions"
	"strings"

	"github.com/google/uuid"
	"scrumlr.io/server/common"
	"scrumlr.io/server/logger"
	"scrumlr.io/server/realtime"
)

type UserDatabase interface {
	CreateAnonymousUser(name string) (DatabaseUser, error)
	CreateAppleUser(id, name, avatarUrl string) (DatabaseUser, error)
	CreateAzureAdUser(id, name, avatarUrl string) (DatabaseUser, error)
	CreateGitHubUser(id, name, avatarUrl string) (DatabaseUser, error)
	CreateGoogleUser(id, name, avatarUrl string) (DatabaseUser, error)
	CreateMicrosoftUser(id, name, avatarUrl string) (DatabaseUser, error)
	CreateOIDCUser(id, name, avatarUrl string) (DatabaseUser, error)
	UpdateUser(update DatabaseUserUpdate) (DatabaseUser, error)
	GetUser(id uuid.UUID) (DatabaseUser, error)

	IsUserAnonymous(id uuid.UUID) (bool, error)
	IsUserAvailableForKeyMigration(id uuid.UUID) (bool, error)
	SetKeyMigration(id uuid.UUID) (DatabaseUser, error)
}

type Service struct {
	database       UserDatabase
	sessionService sessions.SessionService
	realtime       *realtime.Broker
}

func NewUserService(db UserDatabase, rt *realtime.Broker) UserService {
	service := new(Service)
	service.database = db
	service.realtime = rt

	return service
}

func (service *Service) CreateAnonymous(ctx context.Context, name string) (*User, error) {
	err := validateUsername(name)
	if err != nil {
		return nil, err
	}

	user, err := service.database.CreateAnonymousUser(name)
	if err != nil {
		return nil, err
	}

	return new(User).From(user), err
}

func (service *Service) CreateAppleUser(_ context.Context, id, name, avatarUrl string) (*User, error) {
	err := validateUsername(name)
	if err != nil {
		return nil, err
	}

	user, err := service.database.CreateAppleUser(id, name, avatarUrl)
	if err != nil {
		return nil, err
	}

	return new(User).From(user), err
}

func (service *Service) CreateAzureAdUser(_ context.Context, id, name, avatarUrl string) (*User, error) {
	err := validateUsername(name)
	if err != nil {
		return nil, err
	}

	user, err := service.database.CreateAzureAdUser(id, name, avatarUrl)
	if err != nil {
		return nil, err
	}

	return new(User).From(user), err
}

func (service *Service) CreateGitHubUser(_ context.Context, id, name, avatarUrl string) (*User, error) {
	err := validateUsername(name)
	if err != nil {
		return nil, err
	}

	user, err := service.database.CreateGitHubUser(id, name, avatarUrl)
	if err != nil {
		return nil, err
	}

	return new(User).From(user), err
}

func (service *Service) CreateGoogleUser(_ context.Context, id, name, avatarUrl string) (*User, error) {
	err := validateUsername(name)
	if err != nil {
		return nil, err
	}

	user, err := service.database.CreateGoogleUser(id, name, avatarUrl)
	if err != nil {
		return nil, err
	}

	return new(User).From(user), err
}

func (service *Service) CreateMicrosoftUser(_ context.Context, id, name, avatarUrl string) (*User, error) {
	err := validateUsername(name)
	if err != nil {
		return nil, err
	}

	user, err := service.database.CreateMicrosoftUser(id, name, avatarUrl)
	if err != nil {
		return nil, err
	}

	return new(User).From(user), err
}

func (service *Service) CreateOIDCUser(_ context.Context, id, name, avatarUrl string) (*User, error) {
	err := validateUsername(name)
	if err != nil {
		return nil, err
	}

	user, err := service.database.CreateOIDCUser(id, name, avatarUrl)
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

	user, err := service.database.UpdateUser(DatabaseUserUpdate{
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
	user, err := service.database.GetUser(userID)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, common.NotFoundError
		}
		log.Errorw("unable to get user", "user", userID, "err", err)
		return nil, common.InternalServerError
	}

	return new(User).From(user), err
}

func (service *Service) IsUserAvailableForKeyMigration(ctx context.Context, id uuid.UUID) (bool, error) {
	return service.database.IsUserAvailableForKeyMigration(id)
}

func (service *Service) SetKeyMigration(ctx context.Context, id uuid.UUID) (*User, error) {
	user, err := service.database.SetKeyMigration(id)
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
		userSession, err := service.sessionService.Get(ctx, session.Board, session.User.ID)
		if err != nil {
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
