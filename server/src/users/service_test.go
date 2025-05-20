package users

import (
	"context"
	"database/sql"
	"errors"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"scrumlr.io/server/common"
	brokerMock "scrumlr.io/server/mocks/realtime"
	"scrumlr.io/server/realtime"
	"scrumlr.io/server/sessions"
)

func TestGetUser(t *testing.T) {
	userId := uuid.New()

	mockUserDatabase := NewMockUserDatabase(t)
	mockUserDatabase.EXPECT().GetUser(userId).Return(DatabaseUser{ID: userId}, nil)

	mockBroker := brokerMock.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockSessionService := sessions.NewMockSessionService(t)

	userService := NewUserService(mockUserDatabase, broker, mockSessionService)

	user, err := userService.Get(context.Background(), userId)

	assert.Nil(t, err)
	assert.NotNil(t, user)
}

func TestGetUser_NotFound(t *testing.T) {
	userId := uuid.New()

	mockUserDatabase := NewMockUserDatabase(t)
	mockUserDatabase.EXPECT().GetUser(userId).Return(DatabaseUser{}, sql.ErrNoRows)

	mockBroker := brokerMock.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockSessionService := sessions.NewMockSessionService(t)

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
	mockUserDatabase.EXPECT().GetUser(userId).Return(DatabaseUser{}, errors.New(dbError))

	mockBroker := brokerMock.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockSessionService := sessions.NewMockSessionService(t)

	userService := NewUserService(mockUserDatabase, broker, mockSessionService)

	user, err := userService.Get(context.Background(), userId)

	assert.Nil(t, user)
	assert.NotNil(t, err)
	assert.Equal(t, common.InternalServerError, err)
}

func TestCreateAnonymusUser(t *testing.T) {
	name := "Stan"

	mockUserDatabase := NewMockUserDatabase(t)
	mockUserDatabase.EXPECT().CreateAnonymousUser(name).Return(DatabaseUser{ID: uuid.New(), Name: name}, nil)

	mockBroker := brokerMock.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockSessionService := sessions.NewMockSessionService(t)

	userService := NewUserService(mockUserDatabase, broker, mockSessionService)

	user, err := userService.CreateAnonymous(context.Background(), name)

	assert.Nil(t, err)
	assert.NotNil(t, user)
}

func TestCreateAnonymusUser_DatabaseError(t *testing.T) {
	name := "Stan"
	dbError := "unable to execute"

	mockUserDatabase := NewMockUserDatabase(t)
	mockUserDatabase.EXPECT().CreateAnonymousUser(name).Return(DatabaseUser{}, errors.New(dbError))

	mockBroker := brokerMock.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockSessionService := sessions.NewMockSessionService(t)

	userService := NewUserService(mockUserDatabase, broker, mockSessionService)

	user, err := userService.CreateAnonymous(context.Background(), name)

	assert.Nil(t, user)
	assert.NotNil(t, err)
	assert.Equal(t, errors.New(dbError), err)
}

func TestCreateAnonymusUser_EmptyUsername(t *testing.T) {
	name := "   "

	mockUserDatabase := NewMockUserDatabase(t)

	mockBroker := brokerMock.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockSessionService := sessions.NewMockSessionService(t)

	userService := NewUserService(mockUserDatabase, broker, mockSessionService)

	user, err := userService.CreateAnonymous(context.Background(), name)

	assert.Nil(t, user)
	assert.NotNil(t, err)
	assert.Equal(t, errors.New("name may not be empty"), err)
}

func TestCreateAnonymusUser_NewLineUsername(t *testing.T) {
	name := "Stan\n"

	mockUserDatabase := NewMockUserDatabase(t)

	mockBroker := brokerMock.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockSessionService := sessions.NewMockSessionService(t)

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
	mockUserDatabase.EXPECT().CreateAppleUser(userId.String(), name, avatarUrl).
		Return(DatabaseUser{ID: userId, Name: name}, nil)

	mockBroker := brokerMock.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockSessionService := sessions.NewMockSessionService(t)

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
	mockUserDatabase.EXPECT().CreateAppleUser(userId.String(), name, avatarUrl).Return(DatabaseUser{}, errors.New(dbError))

	mockBroker := brokerMock.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockSessionService := sessions.NewMockSessionService(t)

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

	mockBroker := brokerMock.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockSessionService := sessions.NewMockSessionService(t)

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

	mockBroker := brokerMock.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockSessionService := sessions.NewMockSessionService(t)

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
	mockUserDatabase.EXPECT().CreateAzureAdUser(userId.String(), name, avatarUrl).
		Return(DatabaseUser{ID: userId, Name: name}, nil)

	mockBroker := brokerMock.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockSessionService := sessions.NewMockSessionService(t)

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
	mockUserDatabase.EXPECT().CreateAzureAdUser(userId.String(), name, avatarUrl).Return(DatabaseUser{}, errors.New(dbError))

	mockBroker := brokerMock.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockSessionService := sessions.NewMockSessionService(t)

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

	mockBroker := brokerMock.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockSessionService := sessions.NewMockSessionService(t)

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

	mockBroker := brokerMock.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockSessionService := sessions.NewMockSessionService(t)

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
	mockUserDatabase.EXPECT().CreateGitHubUser(userId.String(), name, avatarUrl).
		Return(DatabaseUser{ID: userId, Name: name}, nil)

	mockBroker := brokerMock.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockSessionService := sessions.NewMockSessionService(t)

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
	mockUserDatabase.EXPECT().CreateGitHubUser(userId.String(), name, avatarUrl).Return(DatabaseUser{}, errors.New(dbError))

	mockBroker := brokerMock.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockSessionService := sessions.NewMockSessionService(t)

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

	mockBroker := brokerMock.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockSessionService := sessions.NewMockSessionService(t)

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

	mockBroker := brokerMock.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockSessionService := sessions.NewMockSessionService(t)

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
	mockUserDatabase.EXPECT().CreateGoogleUser(userId.String(), name, avatarUrl).
		Return(DatabaseUser{ID: userId, Name: name}, nil)

	mockBroker := brokerMock.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockSessionService := sessions.NewMockSessionService(t)

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
	mockUserDatabase.EXPECT().CreateGoogleUser(userId.String(), name, avatarUrl).Return(DatabaseUser{}, errors.New(dbError))

	mockBroker := brokerMock.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockSessionService := sessions.NewMockSessionService(t)

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

	mockBroker := brokerMock.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockSessionService := sessions.NewMockSessionService(t)

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

	mockBroker := brokerMock.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockSessionService := sessions.NewMockSessionService(t)

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
	mockUserDatabase.EXPECT().CreateMicrosoftUser(userId.String(), name, avatarUrl).
		Return(DatabaseUser{ID: userId, Name: name}, nil)

	mockBroker := brokerMock.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockSessionService := sessions.NewMockSessionService(t)

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
	mockUserDatabase.EXPECT().CreateMicrosoftUser(userId.String(), name, avatarUrl).Return(DatabaseUser{}, errors.New(dbError))

	mockBroker := brokerMock.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockSessionService := sessions.NewMockSessionService(t)

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

	mockBroker := brokerMock.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockSessionService := sessions.NewMockSessionService(t)

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

	mockBroker := brokerMock.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockSessionService := sessions.NewMockSessionService(t)

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
	mockUserDatabase.EXPECT().CreateOIDCUser(userId.String(), name, avatarUrl).
		Return(DatabaseUser{ID: userId, Name: name}, nil)

	mockBroker := brokerMock.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockSessionService := sessions.NewMockSessionService(t)

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
	mockUserDatabase.EXPECT().CreateOIDCUser(userId.String(), name, avatarUrl).Return(DatabaseUser{}, errors.New(dbError))

	mockBroker := brokerMock.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockSessionService := sessions.NewMockSessionService(t)

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

	mockBroker := brokerMock.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockSessionService := sessions.NewMockSessionService(t)

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

	mockBroker := brokerMock.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockSessionService := sessions.NewMockSessionService(t)

	userService := NewUserService(mockUserDatabase, broker, mockSessionService)

	user, err := userService.CreateOIDCUser(context.Background(), userId.String(), name, avatarUrl)

	assert.Nil(t, user)
	assert.NotNil(t, err)
	assert.Equal(t, errors.New("name may not contain newline characters"), err)
}

func TestUpdateUser(t *testing.T) {
	userId := uuid.New()
	name := "Stan"

	mockUserDatabase := NewMockUserDatabase(t)
	mockUserDatabase.EXPECT().UpdateUser(DatabaseUserUpdate{ID: userId, Name: name}).
		Return(DatabaseUser{ID: userId, Name: name}, nil)

	mockBroker := brokerMock.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockSessionService := sessions.NewMockSessionService(t)

	userService := NewUserService(mockUserDatabase, broker, mockSessionService)

	user, err := userService.Update(context.Background(), UserUpdateRequest{ID: userId, Name: name})

	assert.Nil(t, err)
	assert.NotNil(t, user)
}

func TestUpdateUser_DatabaseError(t *testing.T) {
	userId := uuid.New()
	name := "Stan"
	dbError := "unable to execute"

	mockUserDatabase := NewMockUserDatabase(t)
	mockUserDatabase.EXPECT().UpdateUser(DatabaseUserUpdate{ID: userId, Name: name}).
		Return(DatabaseUser{}, errors.New(dbError))

	mockBroker := brokerMock.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockSessionService := sessions.NewMockSessionService(t)

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

	mockBroker := brokerMock.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockSessionService := sessions.NewMockSessionService(t)

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

	mockBroker := brokerMock.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockSessionService := sessions.NewMockSessionService(t)

	userService := NewUserService(mockUserDatabase, broker, mockSessionService)

	user, err := userService.Update(context.Background(), UserUpdateRequest{ID: userId, Name: name})

	assert.Nil(t, user)
	assert.NotNil(t, err)
	assert.Equal(t, errors.New("name may not contain newline characters"), err)
}

func TestAvailableForKeyMigration(t *testing.T) {
	userId := uuid.New()

	mockUserDatabase := NewMockUserDatabase(t)
	mockUserDatabase.EXPECT().IsUserAvailableForKeyMigration(userId).Return(true, nil)

	mockBroker := brokerMock.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockSessionService := sessions.NewMockSessionService(t)

	userService := NewUserService(mockUserDatabase, broker, mockSessionService)

	available, err := userService.IsUserAvailableForKeyMigration(context.Background(), userId)

	assert.Nil(t, err)
	assert.True(t, available)
}

func TestAvailableForKeyMigration_DatabaseError(t *testing.T) {
	userId := uuid.New()
	dbError := "unable to execute"

	mockUserDatabase := NewMockUserDatabase(t)
	mockUserDatabase.EXPECT().IsUserAvailableForKeyMigration(userId).Return(false, errors.New(dbError))

	mockBroker := brokerMock.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockSessionService := sessions.NewMockSessionService(t)

	userService := NewUserService(mockUserDatabase, broker, mockSessionService)

	available, err := userService.IsUserAvailableForKeyMigration(context.Background(), userId)

	assert.False(t, available)
	assert.NotNil(t, err)
	assert.Equal(t, errors.New(dbError), err)
}

func TestSetKeyMigration(t *testing.T) {
	userId := uuid.New()

	mockUserDatabase := NewMockUserDatabase(t)
	mockUserDatabase.EXPECT().SetKeyMigration(userId).Return(DatabaseUser{ID: userId}, nil)

	mockBroker := brokerMock.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockSessionService := sessions.NewMockSessionService(t)

	userService := NewUserService(mockUserDatabase, broker, mockSessionService)

	user, err := userService.SetKeyMigration(context.Background(), userId)

	assert.Nil(t, err)
	assert.NotNil(t, user)
}

func TestSetKeymigration_DatabaseError(t *testing.T) {
	userId := uuid.New()
	dbError := "unable to execute"

	mockUserDatabase := NewMockUserDatabase(t)
	mockUserDatabase.EXPECT().SetKeyMigration(userId).Return(DatabaseUser{}, errors.New(dbError))

	mockBroker := brokerMock.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockSessionService := sessions.NewMockSessionService(t)

	userService := NewUserService(mockUserDatabase, broker, mockSessionService)

	user, err := userService.SetKeyMigration(context.Background(), userId)

	assert.Nil(t, user)
	assert.NotNil(t, err)
	assert.Equal(t, errors.New(dbError), err)
}
