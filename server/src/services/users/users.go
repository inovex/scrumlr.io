package users

import (
	"context"
	"database/sql"

	"scrumlr.io/server/common"
	"scrumlr.io/server/common/dto"
	"scrumlr.io/server/realtime"
	"scrumlr.io/server/services"

	"github.com/google/uuid"

	"scrumlr.io/server/database"
	"scrumlr.io/server/logger"
)

type UserService struct {
	database *database.Database
	realtime *realtime.Broker
}

func NewUserService(db *database.Database, rt *realtime.Broker) services.Users {
	b := new(UserService)
	b.database = db
	b.realtime = rt
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
	user, err := s.database.CreateGitHubUser(id, name, avatarUrl)
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

func (s *UserService) CreateOIDCUser(_ context.Context, id, name, avatarUrl string) (*dto.User, error) {
	user, err := s.database.CreateOIDCUser(id, name, avatarUrl)
	return new(dto.User).From(user), err
}

func (s *UserService) Update(_ context.Context, body dto.UserUpdateRequest) (*dto.User, error) {
	user, err := s.database.UpdateUser(database.UserUpdate{
		ID:     body.ID,
		Name:   body.Name,
		Avatar: body.Avatar,
	})

	if err != nil {
		return nil, err
	}
	s.UpdatedUser(user)
	return new(dto.User).From(user), err
}

func (s *UserService) UpdatedUser(user database.User) {
	connectedBoards, err := s.database.GetSingleUserConnectedBoards(user.ID)
	if err != nil {
		logger.Get().Errorw("unable to retrieve all currently connected boards for single user in an updateduser call", "err", err)
		return
	}
	for _, session := range connectedBoards {
		err = s.realtime.BroadcastToBoard(session, realtime.BoardEvent{
			Type: realtime.BoardEventParticipantUpdated,
			Data: new(dto.User).From(user),
		})
		if err != nil {
			logger.Get().Errorw("unable to broadcast updated user", "err", err)
		}
	}
}
