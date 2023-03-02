package users

import (
	"context"
	"database/sql"
	"scrumlr.io/server/common"
	"scrumlr.io/server/common/dto"
	"scrumlr.io/server/services"

	"github.com/google/uuid"

	"scrumlr.io/server/database"
	"scrumlr.io/server/logger"
)

type UserService struct {
	database *database.Database
}

func NewUserService(db *database.Database) services.Users {
	b := new(UserService)
	b.database = db
	return b
}

func (s *UserService) Get(ctx context.Context, userID uuid.UUID) (*dto.User, error) {
	log := logger.FromContext(ctx)
	user, err := s.database.GetUser(userID)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, common.NotFoundError
		}
		log.Errorw("unable to get user", "user", userID, "err", err)
		return nil, common.InternalServerError
	}

	return new(dto.User).From(user), err
}

func (s *UserService) LoginAnonymous(_ context.Context, name string) (*dto.User, error) {
	user, err := s.database.CreateAnonymousUser(name)
	return new(dto.User).From(user), err
}

func (s *UserService) CreateGitHubUser(_ context.Context, id, name, avatarUrl string) (*dto.User, error) {
	user, err := s.database.CreateGoogleUser(id, name, avatarUrl)
	return new(dto.User).From(user), err
}

func (s *UserService) CreateGoogleUser(_ context.Context, id, name, avatarUrl string) (*dto.User, error) {
	user, err := s.database.CreateGoogleUser(id, name, avatarUrl)
	return new(dto.User).From(user), err
}

func (s *UserService) CreateMicrosoftUser(_ context.Context, id, name, avatarUrl string) (*dto.User, error) {
	user, err := s.database.CreateMicrosoftUser(id, name, avatarUrl)
	return new(dto.User).From(user), err
}

func (s *UserService) CreateAzureAdUser(_ context.Context, id, name, avatarUrl string) (*dto.User, error) {
	user, err := s.database.CreateAzureAdUser(id, name, avatarUrl)
	return new(dto.User).From(user), err
}

func (s *UserService) CreateAppleUser(_ context.Context, id, name, avatarUrl string) (*dto.User, error) {
	user, err := s.database.CreateAppleUser(id, name, avatarUrl)
	return new(dto.User).From(user), err
}

func (s *UserService) Update(_ context.Context, body dto.UserUpdateRequest) (*dto.User, error) {
	user, err := s.database.UpdateUser(database.UserUpdate{
		ID:     body.ID,
		Name:   body.Name,
		Avatar: body.Avatar,
	})
	return new(dto.User).From(user), err
}
