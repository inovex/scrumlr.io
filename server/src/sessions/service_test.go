package sessions

import (
	"context"
	"database/sql"
	"errors"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	mock "github.com/stretchr/testify/mock"
	"scrumlr.io/server/common"
	"scrumlr.io/server/realtime"
)

func TestGetUser(t *testing.T) {
	userId := uuid.New()

	mockUserDatabase := NewMockUserDatabase(t)
	mockUserDatabase.EXPECT().GetUser(mock.Anything, userId).Return(DatabaseUser{ID: userId}, nil)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockSessionService := NewMockSessionService(t)

	userService := NewUserService(mockUserDatabase, broker, mockSessionService)

	user, err := userService.Get(context.Background(), userId)

	assert.Nil(t, err)
	assert.NotNil(t, user)
}

func TestGetUser_NotFound(t *testing.T) {
	userId := uuid.New()

	mockUserDatabase := NewMockUserDatabase(t)
	mockUserDatabase.EXPECT().GetUser(mock.Anything, userId).Return(DatabaseUser{}, sql.ErrNoRows)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockSessionService := NewMockSessionService(t)

	userService := NewUserService(mockUserDatabase, broker, mockSessionService)

	user, err := userService.Get(context.Background(), userId)

	assert.Nil(t, user)
	assert.NotNil(t, err)
	assert.Equal(t, common.NotFoundError, err)
}

func TestGetUser_DatabaseError(t *testing.T) {
	userId := uuid.New()
	dbError := "unable to execute"

	mockUserDatabase := NewMockUserDatabase(t)
	mockUserDatabase.EXPECT().GetUser(mock.Anything, userId).Return(DatabaseUser{}, errors.New(dbError))

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockSessionService := NewMockSessionService(t)

	userService := NewUserService(mockUserDatabase, broker, mockSessionService)

	user, err := userService.Get(context.Background(), userId)

	assert.Nil(t, user)
	assert.NotNil(t, err)
	assert.Equal(t, common.InternalServerError, err)
}

func TestCreateAnonymusUser(t *testing.T) {
	name := "Stan"

	mockUserDatabase := NewMockUserDatabase(t)
	mockUserDatabase.EXPECT().CreateAnonymousUser(mock.Anything, name).Return(DatabaseUser{ID: uuid.New(), Name: name}, nil)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockSessionService := NewMockSessionService(t)

	userService := NewUserService(mockUserDatabase, broker, mockSessionService)

	user, err := userService.CreateAnonymous(context.Background(), name)

	assert.Nil(t, err)
	assert.NotNil(t, user)
}

func TestCreateAnonymusUser_DatabaseError(t *testing.T) {
	name := "Stan"
	dbError := "unable to execute"

	mockUserDatabase := NewMockUserDatabase(t)
	mockUserDatabase.EXPECT().CreateAnonymousUser(mock.Anything, name).Return(DatabaseUser{}, errors.New(dbError))

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockSessionService := NewMockSessionService(t)

	userService := NewUserService(mockUserDatabase, broker, mockSessionService)

	user, err := userService.CreateAnonymous(context.Background(), name)

	assert.Nil(t, user)
	assert.NotNil(t, err)
	assert.Equal(t, errors.New(dbError), err)
}

func TestCreateAnonymusUser_EmptyUsername(t *testing.T) {
	name := "   "

	mockUserDatabase := NewMockUserDatabase(t)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockSessionService := NewMockSessionService(t)

	userService := NewUserService(mockUserDatabase, broker, mockSessionService)

	user, err := userService.CreateAnonymous(context.Background(), name)

	assert.Nil(t, user)
	assert.NotNil(t, err)
	assert.Equal(t, errors.New("name may not be empty"), err)
}

func TestCreateAnonymusUser_NewLineUsername(t *testing.T) {
	name := "Stan\n"

	mockUserDatabase := NewMockUserDatabase(t)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockSessionService := NewMockSessionService(t)

	userService := NewUserService(mockUserDatabase, broker, mockSessionService)

	user, err := userService.CreateAnonymous(context.Background(), name)

	assert.Nil(t, user)
	assert.NotNil(t, err)
	assert.Equal(t, errors.New("name may not contain newline characters"), err)
}

func TestCreateAppleUser(t *testing.T) {
	userId := uuid.New()
	name := "Stan"
	avatarUrl := ""

	mockUserDatabase := NewMockUserDatabase(t)
	mockUserDatabase.EXPECT().CreateAppleUser(mock.Anything, userId.String(), name, avatarUrl).
		Return(DatabaseUser{ID: userId, Name: name}, nil)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockSessionService := NewMockSessionService(t)

	userService := NewUserService(mockUserDatabase, broker, mockSessionService)

	user, err := userService.CreateAppleUser(context.Background(), userId.String(), name, avatarUrl)

	assert.Nil(t, err)
	assert.NotNil(t, user)
}

func TestCreateAppleUser_DatabaseError(t *testing.T) {
	userId := uuid.New()
	name := "Stan"
	avatarUrl := ""
	dbError := "unable to execute"

	mockUserDatabase := NewMockUserDatabase(t)
	mockUserDatabase.EXPECT().CreateAppleUser(mock.Anything, userId.String(), name, avatarUrl).Return(DatabaseUser{}, errors.New(dbError))

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockSessionService := NewMockSessionService(t)

	userService := NewUserService(mockUserDatabase, broker, mockSessionService)

	user, err := userService.CreateAppleUser(context.Background(), userId.String(), name, avatarUrl)

	assert.Nil(t, user)
	assert.NotNil(t, err)
	assert.Equal(t, errors.New(dbError), err)
}

func TestCreateAppleUser_EmptyUsername(t *testing.T) {
	userId := uuid.New()
	name := "   "
	avatarUrl := ""

	mockUserDatabase := NewMockUserDatabase(t)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockSessionService := NewMockSessionService(t)

	userService := NewUserService(mockUserDatabase, broker, mockSessionService)

	user, err := userService.CreateAppleUser(context.Background(), userId.String(), name, avatarUrl)

	assert.Nil(t, user)
	assert.NotNil(t, err)
	assert.Equal(t, errors.New("name may not be empty"), err)
}

func TestCreateAppleUser_NewLineUsername(t *testing.T) {
	userId := uuid.New()
	name := "Stan\n"
	avatarUrl := ""

	mockUserDatabase := NewMockUserDatabase(t)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockSessionService := NewMockSessionService(t)

	userService := NewUserService(mockUserDatabase, broker, mockSessionService)

	user, err := userService.CreateAppleUser(context.Background(), userId.String(), name, avatarUrl)

	assert.Nil(t, user)
	assert.NotNil(t, err)
	assert.Equal(t, errors.New("name may not contain newline characters"), err)
}

func TestCreateAzureUser(t *testing.T) {
	userId := uuid.New()
	name := "Stan"
	avatarUrl := ""

	mockUserDatabase := NewMockUserDatabase(t)
	mockUserDatabase.EXPECT().CreateAzureAdUser(mock.Anything, userId.String(), name, avatarUrl).
		Return(DatabaseUser{ID: userId, Name: name}, nil)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockSessionService := NewMockSessionService(t)

	userService := NewUserService(mockUserDatabase, broker, mockSessionService)

	user, err := userService.CreateAzureAdUser(context.Background(), userId.String(), name, avatarUrl)

	assert.Nil(t, err)
	assert.NotNil(t, user)
}

func TestCreateAzureUser_DatabaseError(t *testing.T) {
	userId := uuid.New()
	name := "Stan"
	avatarUrl := ""
	dbError := "unable to execute"

	mockUserDatabase := NewMockUserDatabase(t)
	mockUserDatabase.EXPECT().CreateAzureAdUser(mock.Anything, userId.String(), name, avatarUrl).Return(DatabaseUser{}, errors.New(dbError))

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockSessionService := NewMockSessionService(t)

	userService := NewUserService(mockUserDatabase, broker, mockSessionService)

	user, err := userService.CreateAzureAdUser(context.Background(), userId.String(), name, avatarUrl)

	assert.Nil(t, user)
	assert.NotNil(t, err)
	assert.Equal(t, errors.New(dbError), err)
}

func TestCreateAzureUser_EmptyUsername(t *testing.T) {
	userId := uuid.New()
	name := "   "
	avatarUrl := ""

	mockUserDatabase := NewMockUserDatabase(t)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockSessionService := NewMockSessionService(t)

	userService := NewUserService(mockUserDatabase, broker, mockSessionService)

	user, err := userService.CreateAzureAdUser(context.Background(), userId.String(), name, avatarUrl)

	assert.Nil(t, user)
	assert.NotNil(t, err)
	assert.Equal(t, errors.New("name may not be empty"), err)
}

func TestCreateAzureUser_NewLineUsername(t *testing.T) {
	userId := uuid.New()
	name := "Stan\n"
	avatarUrl := ""

	mockUserDatabase := NewMockUserDatabase(t)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockSessionService := NewMockSessionService(t)

	userService := NewUserService(mockUserDatabase, broker, mockSessionService)

	user, err := userService.CreateAzureAdUser(context.Background(), userId.String(), name, avatarUrl)

	assert.Nil(t, user)
	assert.NotNil(t, err)
	assert.Equal(t, errors.New("name may not contain newline characters"), err)
}

func TestCreateGitHubUser(t *testing.T) {
	userId := uuid.New()
	name := "Stan"
	avatarUrl := ""

	mockUserDatabase := NewMockUserDatabase(t)
	mockUserDatabase.EXPECT().CreateGitHubUser(mock.Anything, userId.String(), name, avatarUrl).
		Return(DatabaseUser{ID: userId, Name: name}, nil)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockSessionService := NewMockSessionService(t)

	userService := NewUserService(mockUserDatabase, broker, mockSessionService)

	user, err := userService.CreateGitHubUser(context.Background(), userId.String(), name, avatarUrl)

	assert.Nil(t, err)
	assert.NotNil(t, user)
}

func TestCreateGitHubUser_DatabaseError(t *testing.T) {
	userId := uuid.New()
	name := "Stan"
	avatarUrl := ""
	dbError := "unable to execute"

	mockUserDatabase := NewMockUserDatabase(t)
	mockUserDatabase.EXPECT().CreateGitHubUser(mock.Anything, userId.String(), name, avatarUrl).Return(DatabaseUser{}, errors.New(dbError))

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockSessionService := NewMockSessionService(t)

	userService := NewUserService(mockUserDatabase, broker, mockSessionService)

	user, err := userService.CreateGitHubUser(context.Background(), userId.String(), name, avatarUrl)

	assert.Nil(t, user)
	assert.NotNil(t, err)
	assert.Equal(t, errors.New(dbError), err)
}

func TestCreateGitHubUser_EmptyUsername(t *testing.T) {
	userId := uuid.New()
	name := "   "
	avatarUrl := ""

	mockUserDatabase := NewMockUserDatabase(t)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockSessionService := NewMockSessionService(t)

	userService := NewUserService(mockUserDatabase, broker, mockSessionService)

	user, err := userService.CreateGitHubUser(context.Background(), userId.String(), name, avatarUrl)

	assert.Nil(t, user)
	assert.NotNil(t, err)
	assert.Equal(t, errors.New("name may not be empty"), err)
}

func TestCreateGitHubUser_NewLineUsername(t *testing.T) {
	userId := uuid.New()
	name := "Stan\n"
	avatarUrl := ""

	mockUserDatabase := NewMockUserDatabase(t)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockSessionService := NewMockSessionService(t)

	userService := NewUserService(mockUserDatabase, broker, mockSessionService)

	user, err := userService.CreateGitHubUser(context.Background(), userId.String(), name, avatarUrl)

	assert.Nil(t, user)
	assert.NotNil(t, err)
	assert.Equal(t, errors.New("name may not contain newline characters"), err)
}

func TestCreateGoogleUser(t *testing.T) {
	userId := uuid.New()
	name := "Stan"
	avatarUrl := ""

	mockUserDatabase := NewMockUserDatabase(t)
	mockUserDatabase.EXPECT().CreateGoogleUser(mock.Anything, userId.String(), name, avatarUrl).
		Return(DatabaseUser{ID: userId, Name: name}, nil)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockSessionService := NewMockSessionService(t)

	userService := NewUserService(mockUserDatabase, broker, mockSessionService)

	user, err := userService.CreateGoogleUser(context.Background(), userId.String(), name, avatarUrl)

	assert.Nil(t, err)
	assert.NotNil(t, user)
}

func TestCreateGoogleUser_DatabaseError(t *testing.T) {
	userId := uuid.New()
	name := "Stan"
	avatarUrl := ""
	dbError := "unable to execute"

	mockUserDatabase := NewMockUserDatabase(t)
	mockUserDatabase.EXPECT().CreateGoogleUser(mock.Anything, userId.String(), name, avatarUrl).Return(DatabaseUser{}, errors.New(dbError))

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockSessionService := NewMockSessionService(t)

	userService := NewUserService(mockUserDatabase, broker, mockSessionService)

	user, err := userService.CreateGoogleUser(context.Background(), userId.String(), name, avatarUrl)

	assert.Nil(t, user)
	assert.NotNil(t, err)
	assert.Equal(t, errors.New(dbError), err)
}

func TestCreateGoogleUser_EmptyUsername(t *testing.T) {
	userId := uuid.New()
	name := "   "
	avatarUrl := ""

	mockUserDatabase := NewMockUserDatabase(t)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockSessionService := NewMockSessionService(t)

	userService := NewUserService(mockUserDatabase, broker, mockSessionService)

	user, err := userService.CreateGoogleUser(context.Background(), userId.String(), name, avatarUrl)

	assert.Nil(t, user)
	assert.NotNil(t, err)
	assert.Equal(t, errors.New("name may not be empty"), err)
}

func TestCreateGoogleUser_NewLineUsername(t *testing.T) {
	userId := uuid.New()
	name := "Stan\n"
	avatarUrl := ""

	mockUserDatabase := NewMockUserDatabase(t)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockSessionService := NewMockSessionService(t)

	userService := NewUserService(mockUserDatabase, broker, mockSessionService)

	user, err := userService.CreateGoogleUser(context.Background(), userId.String(), name, avatarUrl)

	assert.Nil(t, user)
	assert.NotNil(t, err)
	assert.Equal(t, errors.New("name may not contain newline characters"), err)
}

func TestCreateMicrosoftUser(t *testing.T) {
	userId := uuid.New()
	name := "Stan"
	avatarUrl := ""

	mockUserDatabase := NewMockUserDatabase(t)
	mockUserDatabase.EXPECT().CreateMicrosoftUser(mock.Anything, userId.String(), name, avatarUrl).
		Return(DatabaseUser{ID: userId, Name: name}, nil)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockSessionService := NewMockSessionService(t)

	userService := NewUserService(mockUserDatabase, broker, mockSessionService)

	user, err := userService.CreateMicrosoftUser(context.Background(), userId.String(), name, avatarUrl)

	assert.Nil(t, err)
	assert.NotNil(t, user)
}

func TestCreateMicrosoftUser_DatabaseError(t *testing.T) {
	userId := uuid.New()
	name := "Stan"
	avatarUrl := ""
	dbError := "unable to execute"

	mockUserDatabase := NewMockUserDatabase(t)
	mockUserDatabase.EXPECT().CreateMicrosoftUser(mock.Anything, userId.String(), name, avatarUrl).Return(DatabaseUser{}, errors.New(dbError))

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockSessionService := NewMockSessionService(t)

	userService := NewUserService(mockUserDatabase, broker, mockSessionService)

	user, err := userService.CreateMicrosoftUser(context.Background(), userId.String(), name, avatarUrl)

	assert.Nil(t, user)
	assert.NotNil(t, err)
	assert.Equal(t, errors.New(dbError), err)
}

func TestCreateMicrosoftUser_EmptyUsername(t *testing.T) {
	userId := uuid.New()
	name := "   "
	avatarUrl := ""

	mockUserDatabase := NewMockUserDatabase(t)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockSessionService := NewMockSessionService(t)

	userService := NewUserService(mockUserDatabase, broker, mockSessionService)

	user, err := userService.CreateMicrosoftUser(context.Background(), userId.String(), name, avatarUrl)

	assert.Nil(t, user)
	assert.NotNil(t, err)
	assert.Equal(t, errors.New("name may not be empty"), err)
}

func TestCreateMicrosoftUser_NewLineUsername(t *testing.T) {
	userId := uuid.New()
	name := "Stan\n"
	avatarUrl := ""

	mockUserDatabase := NewMockUserDatabase(t)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockSessionService := NewMockSessionService(t)

	userService := NewUserService(mockUserDatabase, broker, mockSessionService)

	user, err := userService.CreateMicrosoftUser(context.Background(), userId.String(), name, avatarUrl)

	assert.Nil(t, user)
	assert.NotNil(t, err)
	assert.Equal(t, errors.New("name may not contain newline characters"), err)
}

func TestCreateOIDCUser(t *testing.T) {
	userId := uuid.New()
	name := "Stan"
	avatarUrl := ""

	mockUserDatabase := NewMockUserDatabase(t)
	mockUserDatabase.EXPECT().CreateOIDCUser(mock.Anything, userId.String(), name, avatarUrl).
		Return(DatabaseUser{ID: userId, Name: name}, nil)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockSessionService := NewMockSessionService(t)

	userService := NewUserService(mockUserDatabase, broker, mockSessionService)

	user, err := userService.CreateOIDCUser(context.Background(), userId.String(), name, avatarUrl)

	assert.Nil(t, err)
	assert.NotNil(t, user)
}

func TestCreateOIDCUser_DatabaseError(t *testing.T) {
	userId := uuid.New()
	name := "Stan"
	avatarUrl := ""
	dbError := "unable to execute"

	mockUserDatabase := NewMockUserDatabase(t)
	mockUserDatabase.EXPECT().CreateOIDCUser(mock.Anything, userId.String(), name, avatarUrl).Return(DatabaseUser{}, errors.New(dbError))

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockSessionService := NewMockSessionService(t)

	userService := NewUserService(mockUserDatabase, broker, mockSessionService)

	user, err := userService.CreateOIDCUser(context.Background(), userId.String(), name, avatarUrl)

	assert.Nil(t, user)
	assert.NotNil(t, err)
	assert.Equal(t, errors.New(dbError), err)
}

func TestCreateOIDCUser_EmptyUsername(t *testing.T) {
	userId := uuid.New()
	name := "   "
	avatarUrl := ""

	mockUserDatabase := NewMockUserDatabase(t)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockSessionService := NewMockSessionService(t)

	userService := NewUserService(mockUserDatabase, broker, mockSessionService)

	user, err := userService.CreateOIDCUser(context.Background(), userId.String(), name, avatarUrl)

	assert.Nil(t, user)
	assert.NotNil(t, err)
	assert.Equal(t, errors.New("name may not be empty"), err)
}

func TestCreateOIDCUser_NewLineUsername(t *testing.T) {
	userId := uuid.New()
	name := "Stan\n"
	avatarUrl := ""

	mockUserDatabase := NewMockUserDatabase(t)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockSessionService := NewMockSessionService(t)

	userService := NewUserService(mockUserDatabase, broker, mockSessionService)

	user, err := userService.CreateOIDCUser(context.Background(), userId.String(), name, avatarUrl)

	assert.Nil(t, user)
	assert.NotNil(t, err)
	assert.Equal(t, errors.New("name may not contain newline characters"), err)
}

func TestUpdateUser(t *testing.T) {
	userId := uuid.New()
	firstBoardId := uuid.New()
	secondBoardId := uuid.New()
	name := "Stan"

	user := User{
		ID:   userId,
		Name: name,
	}

	mockUserDatabase := NewMockUserDatabase(t)
	mockUserDatabase.EXPECT().UpdateUser(mock.Anything, DatabaseUserUpdate{ID: userId, Name: name}).
		Return(DatabaseUser{ID: userId, Name: name}, nil)

	mockBroker := realtime.NewMockClient(t)
	mockBroker.EXPECT().Publish(mock.Anything, mock.AnythingOfType("string"), mock.Anything).Return(nil)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockSessionService := NewMockSessionService(t)
	mockSessionService.EXPECT().GetUserConnectedBoards(mock.Anything, userId).
		Return([]*BoardSession{
			{User: user, Board: firstBoardId},
			{User: user, Board: secondBoardId},
		}, nil)
	mockSessionService.EXPECT().Get(mock.Anything, firstBoardId, userId).
		Return(&BoardSession{User: user, Board: firstBoardId}, nil)
	mockSessionService.EXPECT().Get(mock.Anything, secondBoardId, userId).
		Return(&BoardSession{User: user, Board: secondBoardId}, nil)

	userService := NewUserService(mockUserDatabase, broker, mockSessionService)

	updatedUser, err := userService.Update(context.Background(), UserUpdateRequest{ID: userId, Name: name})

	assert.Nil(t, err)
	assert.NotNil(t, updatedUser)
}

func TestUpdateUser_DatabaseError(t *testing.T) {
	userId := uuid.New()
	name := "Stan"
	dbError := "unable to execute"

	mockUserDatabase := NewMockUserDatabase(t)
	mockUserDatabase.EXPECT().UpdateUser(mock.Anything, DatabaseUserUpdate{ID: userId, Name: name}).
		Return(DatabaseUser{}, errors.New(dbError))

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockSessionService := NewMockSessionService(t)

	userService := NewUserService(mockUserDatabase, broker, mockSessionService)

	user, err := userService.Update(context.Background(), UserUpdateRequest{ID: userId, Name: name})

	assert.Nil(t, user)
	assert.NotNil(t, err)
	assert.Equal(t, errors.New(dbError), err)
}

func TestUpdateUser_EmptyUsername(t *testing.T) {
	userId := uuid.New()
	name := "   "

	mockUserDatabase := NewMockUserDatabase(t)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockSessionService := NewMockSessionService(t)

	userService := NewUserService(mockUserDatabase, broker, mockSessionService)

	user, err := userService.Update(context.Background(), UserUpdateRequest{ID: userId, Name: name})

	assert.Nil(t, user)
	assert.NotNil(t, err)
	assert.Equal(t, errors.New("name may not be empty"), err)
}

func TestUpdateUser_NewLineUsername(t *testing.T) {
	userId := uuid.New()
	name := "Stan\n"

	mockUserDatabase := NewMockUserDatabase(t)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockSessionService := NewMockSessionService(t)

	userService := NewUserService(mockUserDatabase, broker, mockSessionService)

	user, err := userService.Update(context.Background(), UserUpdateRequest{ID: userId, Name: name})

	assert.Nil(t, user)
	assert.NotNil(t, err)
	assert.Equal(t, errors.New("name may not contain newline characters"), err)
}

func TestAvailableForKeyMigration(t *testing.T) {
	userId := uuid.New()

	mockUserDatabase := NewMockUserDatabase(t)
	mockUserDatabase.EXPECT().IsUserAvailableForKeyMigration(mock.Anything, userId).Return(true, nil)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockSessionService := NewMockSessionService(t)

	userService := NewUserService(mockUserDatabase, broker, mockSessionService)

	available, err := userService.IsUserAvailableForKeyMigration(context.Background(), userId)

	assert.Nil(t, err)
	assert.True(t, available)
}

func TestAvailableForKeyMigration_DatabaseError(t *testing.T) {
	userId := uuid.New()
	dbError := "unable to execute"

	mockUserDatabase := NewMockUserDatabase(t)
	mockUserDatabase.EXPECT().IsUserAvailableForKeyMigration(mock.Anything, userId).Return(false, errors.New(dbError))

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockSessionService := NewMockSessionService(t)

	userService := NewUserService(mockUserDatabase, broker, mockSessionService)

	available, err := userService.IsUserAvailableForKeyMigration(context.Background(), userId)

	assert.False(t, available)
	assert.NotNil(t, err)
	assert.Equal(t, errors.New(dbError), err)
}

func TestSetKeyMigration(t *testing.T) {
	userId := uuid.New()

	mockUserDatabase := NewMockUserDatabase(t)
	mockUserDatabase.EXPECT().SetKeyMigration(mock.Anything, userId).Return(DatabaseUser{ID: userId}, nil)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockSessionService := NewMockSessionService(t)

	userService := NewUserService(mockUserDatabase, broker, mockSessionService)

	user, err := userService.SetKeyMigration(context.Background(), userId)

	assert.Nil(t, err)
	assert.NotNil(t, user)
}

func TestSetKeymigration_DatabaseError(t *testing.T) {
	userId := uuid.New()
	dbError := "unable to execute"

	mockUserDatabase := NewMockUserDatabase(t)
	mockUserDatabase.EXPECT().SetKeyMigration(mock.Anything, userId).Return(DatabaseUser{}, errors.New(dbError))

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockSessionService := NewMockSessionService(t)

	userService := NewUserService(mockUserDatabase, broker, mockSessionService)

	user, err := userService.SetKeyMigration(context.Background(), userId)

	assert.Nil(t, user)
	assert.NotNil(t, err)
	assert.Equal(t, errors.New(dbError), err)
}
