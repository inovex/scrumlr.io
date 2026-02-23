package users

import (
	"context"
	"database/sql"
	"errors"
	"testing"

	"scrumlr.io/server/notes"
	"scrumlr.io/server/sessions"

	"github.com/google/uuid"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/suite"
	"scrumlr.io/server/common"
	"scrumlr.io/server/realtime"
)

type UserServiceTestSuite struct {
	suite.Suite
	userID           uuid.UUID
	mockUserDatabase *MockUserDatabase
	mockBroker       *realtime.MockClient
	broker           *realtime.Broker
}

func TestUserServiceTestSuite(t *testing.T) {
	suite.Run(t, new(UserServiceTestSuite))
}

func (suite *UserServiceTestSuite) SetupTest() {
	suite.userID = uuid.New()
	suite.mockUserDatabase = NewMockUserDatabase(suite.T())
	suite.mockBroker = realtime.NewMockClient(suite.T())
	suite.broker = new(realtime.Broker)
	suite.broker.Con = suite.mockBroker

}

func (suite *UserServiceTestSuite) TestGetUser() {
	suite.mockUserDatabase.EXPECT().GetUser(mock.Anything, suite.userID).Return(DatabaseUser{ID: suite.userID}, nil)

	mockSessionService := sessions.NewMockSessionService(suite.T())

	mockNotesService := notes.NewMockNotesService(suite.T())
	userService := NewUserService(suite.mockUserDatabase, suite.broker, mockSessionService, mockNotesService)

	user, err := userService.Get(context.Background(), suite.userID)

	suite.Nil(err)
	suite.NotNil(user)
}

func (suite *UserServiceTestSuite) TestGetUser_NotFound() {
	suite.mockUserDatabase.EXPECT().GetUser(mock.Anything, suite.userID).Return(DatabaseUser{}, sql.ErrNoRows)
	mockSessionService := sessions.NewMockSessionService(suite.T())
	mockNotesService := notes.NewMockNotesService(suite.T())
	userService := NewUserService(suite.mockUserDatabase, suite.broker, mockSessionService, mockNotesService)
	user, err := userService.Get(context.Background(), suite.userID)

	suite.Nil(user)
	suite.NotNil(err)
	suite.Equal(common.NotFoundError, err)
}

func (suite *UserServiceTestSuite) TestGetUser_DatabaseError() {
	dbError := "unable to execute"
	suite.mockUserDatabase.EXPECT().GetUser(mock.Anything, suite.userID).Return(DatabaseUser{}, errors.New(dbError))
	mockSessionService := sessions.NewMockSessionService(suite.T())
	mockNotesService := notes.NewMockNotesService(suite.T())
	userService := NewUserService(suite.mockUserDatabase, suite.broker, mockSessionService, mockNotesService)

	user, err := userService.Get(context.Background(), suite.userID)

	suite.Nil(user)
	suite.NotNil(err)
	suite.Equal(common.InternalServerError, err)
}

func (suite *UserServiceTestSuite) TestGetBoardUsers() {
	boardID := uuid.New()
	userIDs := []uuid.UUID{uuid.New(), uuid.New(), uuid.New()}
	suite.mockUserDatabase.EXPECT().GetUsers(mock.Anything, boardID).Return([]DatabaseUser{
		{ID: userIDs[0]},
		{ID: userIDs[1]},
		{ID: userIDs[2]},
	}, nil)
	mockSessionService := sessions.NewMockSessionService(suite.T())
	mockNotesService := notes.NewMockNotesService(suite.T())
	userService := NewUserService(suite.mockUserDatabase, suite.broker, mockSessionService, mockNotesService)

	user, err := userService.GetBoardUsers(context.Background(), boardID)

	suite.Nil(err)
	suite.NotNil(user)
}

func (suite *UserServiceTestSuite) TestCreateAnonymusUser() {
	name := "Stan"
	suite.mockUserDatabase.EXPECT().CreateAnonymousUser(mock.Anything, name).Return(DatabaseUser{ID: uuid.New(), Name: name}, nil)
	mockSessionService := sessions.NewMockSessionService(suite.T())
	mockNotesService := notes.NewMockNotesService(suite.T())
	userService := NewUserService(suite.mockUserDatabase, suite.broker, mockSessionService, mockNotesService)

	user, err := userService.CreateAnonymous(context.Background(), name)

	suite.Nil(err)
	suite.NotNil(user)
}

func (suite *UserServiceTestSuite) TestCreateAnonymusUser_DatabaseError() {
	name := "Stan"
	dbError := "unable to execute"
	suite.mockUserDatabase.EXPECT().CreateAnonymousUser(mock.Anything, name).Return(DatabaseUser{}, errors.New(dbError))
	mockSessionService := sessions.NewMockSessionService(suite.T())
	mockNotesService := notes.NewMockNotesService(suite.T())
	userService := NewUserService(suite.mockUserDatabase, suite.broker, mockSessionService, mockNotesService)

	user, err := userService.CreateAnonymous(context.Background(), name)

	suite.Nil(user)
	suite.NotNil(err)
	suite.Equal(errors.New(dbError), err)
}

func (suite *UserServiceTestSuite) TestCreateAnonymusUser_EmptyUsername() {
	name := "   "
	mockSessionService := sessions.NewMockSessionService(suite.T())
	mockNotesService := notes.NewMockNotesService(suite.T())
	userService := NewUserService(suite.mockUserDatabase, suite.broker, mockSessionService, mockNotesService)

	user, err := userService.CreateAnonymous(context.Background(), name)

	suite.Nil(user)
	suite.NotNil(err)
	suite.Equal(errors.New("name may not be empty"), err)
}

func (suite *UserServiceTestSuite) TestCreateAnonymusUser_NewLineUsername() {
	name := "Stan\n"
	mockSessionService := sessions.NewMockSessionService(suite.T())
	mockNotesService := notes.NewMockNotesService(suite.T())
	userService := NewUserService(suite.mockUserDatabase, suite.broker, mockSessionService, mockNotesService)

	user, err := userService.CreateAnonymous(context.Background(), name)

	suite.Nil(user)
	suite.NotNil(err)
	suite.Equal(errors.New("name may not contain newline characters"), err)
}

func (suite *UserServiceTestSuite) TestCreateAppleUser() {
	name := "Stan"
	avatarUrl := ""
	suite.mockUserDatabase.EXPECT().CreateAppleUser(mock.Anything, suite.userID.String(), name, avatarUrl).
		Return(DatabaseUser{ID: suite.userID, Name: name}, nil)
	mockSessionService := sessions.NewMockSessionService(suite.T())
	mockNotesService := notes.NewMockNotesService(suite.T())
	userService := NewUserService(suite.mockUserDatabase, suite.broker, mockSessionService, mockNotesService)

	user, err := userService.CreateAppleUser(context.Background(), suite.userID.String(), name, avatarUrl)

	suite.Nil(err)
	suite.NotNil(user)
}

func (suite *UserServiceTestSuite) TestCreateAppleUser_DatabaseError() {
	name := "Stan"
	avatarUrl := ""
	dbError := "unable to execute"
	suite.mockUserDatabase.EXPECT().CreateAppleUser(mock.Anything, suite.userID.String(), name, avatarUrl).Return(DatabaseUser{}, errors.New(dbError))
	mockSessionService := sessions.NewMockSessionService(suite.T())
	mockNotesService := notes.NewMockNotesService(suite.T())
	userService := NewUserService(suite.mockUserDatabase, suite.broker, mockSessionService, mockNotesService)

	user, err := userService.CreateAppleUser(context.Background(), suite.userID.String(), name, avatarUrl)

	suite.Nil(user)
	suite.NotNil(err)
	suite.Equal(common.InternalServerError, err)
}

func (suite *UserServiceTestSuite) TestCreateAppleUser_EmptyUsername() {
	name := "   "
	avatarUrl := ""
	mockSessionService := sessions.NewMockSessionService(suite.T())
	mockNotesService := notes.NewMockNotesService(suite.T())
	userService := NewUserService(suite.mockUserDatabase, suite.broker, mockSessionService, mockNotesService)

	user, err := userService.CreateAppleUser(context.Background(), suite.userID.String(), name, avatarUrl)

	suite.Nil(user)
	suite.NotNil(err)
	suite.Equal(common.BadRequestError(errors.New("name may not be empty")), err)
}

func (suite *UserServiceTestSuite) TestCreateAppleUser_NewLineUsername() {
	name := "Stan\n"
	avatarUrl := ""
	mockSessionService := sessions.NewMockSessionService(suite.T())
	mockNotesService := notes.NewMockNotesService(suite.T())
	userService := NewUserService(suite.mockUserDatabase, suite.broker, mockSessionService, mockNotesService)

	user, err := userService.CreateAppleUser(context.Background(), suite.userID.String(), name, avatarUrl)

	suite.Nil(user)
	suite.NotNil(err)
	suite.Equal(common.BadRequestError(errors.New("name may not contain newline characters")), err)
}

func (suite *UserServiceTestSuite) TestCreateAzureUser() {
	name := "Stan"
	avatarUrl := ""
	suite.mockUserDatabase.EXPECT().CreateAzureAdUser(mock.Anything, suite.userID.String(), name, avatarUrl).
		Return(DatabaseUser{ID: suite.userID, Name: name}, nil)
	mockSessionService := sessions.NewMockSessionService(suite.T())
	mockNotesService := notes.NewMockNotesService(suite.T())
	userService := NewUserService(suite.mockUserDatabase, suite.broker, mockSessionService, mockNotesService)

	user, err := userService.CreateAzureAdUser(context.Background(), suite.userID.String(), name, avatarUrl)

	suite.Nil(err)
	suite.NotNil(user)
}

func (suite *UserServiceTestSuite) TestCreateAzureUser_DatabaseError() {
	name := "Stan"
	avatarUrl := ""
	dbError := "unable to execute"
	suite.mockUserDatabase.EXPECT().CreateAzureAdUser(mock.Anything, suite.userID.String(), name, avatarUrl).Return(DatabaseUser{}, errors.New(dbError))
	mockSessionService := sessions.NewMockSessionService(suite.T())
	mockNotesService := notes.NewMockNotesService(suite.T())
	userService := NewUserService(suite.mockUserDatabase, suite.broker, mockSessionService, mockNotesService)

	user, err := userService.CreateAzureAdUser(context.Background(), suite.userID.String(), name, avatarUrl)

	suite.Nil(user)
	suite.NotNil(err)
	suite.Equal(common.InternalServerError, err)
}

func (suite *UserServiceTestSuite) TestCreateAzureUser_EmptyUsername() {
	name := "   "
	avatarUrl := ""
	mockSessionService := sessions.NewMockSessionService(suite.T())
	mockNotesService := notes.NewMockNotesService(suite.T())
	userService := NewUserService(suite.mockUserDatabase, suite.broker, mockSessionService, mockNotesService)

	user, err := userService.CreateAzureAdUser(context.Background(), suite.userID.String(), name, avatarUrl)

	suite.Nil(user)
	suite.NotNil(err)
	suite.Equal(common.BadRequestError(errors.New("name may not be empty")), err)
}

func (suite *UserServiceTestSuite) TestCreateAzureUser_NewLineUsername() {
	name := "Stan\n"
	avatarUrl := ""
	mockSessionService := sessions.NewMockSessionService(suite.T())
	mockNotesService := notes.NewMockNotesService(suite.T())
	userService := NewUserService(suite.mockUserDatabase, suite.broker, mockSessionService, mockNotesService)

	user, err := userService.CreateAzureAdUser(context.Background(), suite.userID.String(), name, avatarUrl)

	suite.Nil(user)
	suite.NotNil(err)
	suite.Equal(common.BadRequestError(errors.New("name may not contain newline characters")), err)
}

func (suite *UserServiceTestSuite) TestCreateGitHubUser() {
	name := "Stan"
	avatarUrl := ""
	suite.mockUserDatabase.EXPECT().CreateGitHubUser(mock.Anything, suite.userID.String(), name, avatarUrl).
		Return(DatabaseUser{ID: suite.userID, Name: name}, nil)
	mockSessionService := sessions.NewMockSessionService(suite.T())
	mockNotesService := notes.NewMockNotesService(suite.T())
	userService := NewUserService(suite.mockUserDatabase, suite.broker, mockSessionService, mockNotesService)

	user, err := userService.CreateGitHubUser(context.Background(), suite.userID.String(), name, avatarUrl)

	suite.Nil(err)
	suite.NotNil(user)
}

func (suite *UserServiceTestSuite) TestCreateGitHubUser_DatabaseError() {
	name := "Stan"
	avatarUrl := ""
	dbError := "unable to execute"
	suite.mockUserDatabase.EXPECT().CreateGitHubUser(mock.Anything, suite.userID.String(), name, avatarUrl).Return(DatabaseUser{}, errors.New(dbError))
	mockSessionService := sessions.NewMockSessionService(suite.T())
	mockNotesService := notes.NewMockNotesService(suite.T())
	userService := NewUserService(suite.mockUserDatabase, suite.broker, mockSessionService, mockNotesService)

	user, err := userService.CreateGitHubUser(context.Background(), suite.userID.String(), name, avatarUrl)

	suite.Nil(user)
	suite.NotNil(err)
	suite.Equal(common.InternalServerError, err)
}

func (suite *UserServiceTestSuite) TestCreateGitHubUser_EmptyUsername() {
	name := "   "
	avatarUrl := ""
	mockSessionService := sessions.NewMockSessionService(suite.T())
	mockNotesService := notes.NewMockNotesService(suite.T())
	userService := NewUserService(suite.mockUserDatabase, suite.broker, mockSessionService, mockNotesService)

	user, err := userService.CreateGitHubUser(context.Background(), suite.userID.String(), name, avatarUrl)

	suite.Nil(user)
	suite.NotNil(err)
	suite.Equal(common.BadRequestError(errors.New("name may not be empty")), err)
}

func (suite *UserServiceTestSuite) TestCreateGitHubUser_NewLineUsername() {
	name := "Stan\n"
	avatarUrl := ""
	mockSessionService := sessions.NewMockSessionService(suite.T())
	mockNotesService := notes.NewMockNotesService(suite.T())
	userService := NewUserService(suite.mockUserDatabase, suite.broker, mockSessionService, mockNotesService)

	user, err := userService.CreateGitHubUser(context.Background(), suite.userID.String(), name, avatarUrl)

	suite.Nil(user)
	suite.NotNil(err)
	suite.Equal(common.BadRequestError(errors.New("name may not contain newline characters")), err)
}

func (suite *UserServiceTestSuite) TestCreateGoogleUser() {
	name := "Stan"
	avatarUrl := ""
	suite.mockUserDatabase.EXPECT().CreateGoogleUser(mock.Anything, suite.userID.String(), name, avatarUrl).
		Return(DatabaseUser{ID: suite.userID, Name: name}, nil)
	mockSessionService := sessions.NewMockSessionService(suite.T())
	mockNotesService := notes.NewMockNotesService(suite.T())
	userService := NewUserService(suite.mockUserDatabase, suite.broker, mockSessionService, mockNotesService)

	user, err := userService.CreateGoogleUser(context.Background(), suite.userID.String(), name, avatarUrl)

	suite.Nil(err)
	suite.NotNil(user)
}

func (suite *UserServiceTestSuite) TestCreateGoogleUser_DatabaseError() {
	name := "Stan"
	avatarUrl := ""
	dbError := "unable to execute"
	suite.mockUserDatabase.EXPECT().CreateGoogleUser(mock.Anything, suite.userID.String(), name, avatarUrl).Return(DatabaseUser{}, errors.New(dbError))
	mockSessionService := sessions.NewMockSessionService(suite.T())
	mockNotesService := notes.NewMockNotesService(suite.T())
	userService := NewUserService(suite.mockUserDatabase, suite.broker, mockSessionService, mockNotesService)

	user, err := userService.CreateGoogleUser(context.Background(), suite.userID.String(), name, avatarUrl)

	suite.Nil(user)
	suite.NotNil(err)
	suite.Equal(common.InternalServerError, err)
}

func (suite *UserServiceTestSuite) TestCreateGoogleUser_EmptyUsername() {
	name := "   "
	avatarUrl := ""
	mockSessionService := sessions.NewMockSessionService(suite.T())
	mockNotesService := notes.NewMockNotesService(suite.T())
	userService := NewUserService(suite.mockUserDatabase, suite.broker, mockSessionService, mockNotesService)

	user, err := userService.CreateGoogleUser(context.Background(), suite.userID.String(), name, avatarUrl)

	suite.Nil(user)
	suite.NotNil(err)
	suite.Equal(common.BadRequestError(errors.New("name may not be empty")), err)
}

func (suite *UserServiceTestSuite) TestCreateGoogleUser_NewLineUsername() {
	name := "Stan\n"
	avatarUrl := ""
	mockSessionService := sessions.NewMockSessionService(suite.T())
	mockNotesService := notes.NewMockNotesService(suite.T())
	userService := NewUserService(suite.mockUserDatabase, suite.broker, mockSessionService, mockNotesService)

	user, err := userService.CreateGoogleUser(context.Background(), suite.userID.String(), name, avatarUrl)

	suite.Nil(user)
	suite.NotNil(err)
	suite.Equal(common.BadRequestError(errors.New("name may not contain newline characters")), err)
}

func (suite *UserServiceTestSuite) TestCreateMicrosoftUser() {
	name := "Stan"
	avatarUrl := ""
	suite.mockUserDatabase.EXPECT().CreateMicrosoftUser(mock.Anything, suite.userID.String(), name, avatarUrl).
		Return(DatabaseUser{ID: suite.userID, Name: name}, nil)
	mockSessionService := sessions.NewMockSessionService(suite.T())
	mockNotesService := notes.NewMockNotesService(suite.T())
	userService := NewUserService(suite.mockUserDatabase, suite.broker, mockSessionService, mockNotesService)

	user, err := userService.CreateMicrosoftUser(context.Background(), suite.userID.String(), name, avatarUrl)

	suite.Nil(err)
	suite.NotNil(user)
}

func (suite *UserServiceTestSuite) TestCreateMicrosoftUser_DatabaseError() {
	name := "Stan"
	avatarUrl := ""
	dbError := "unable to execute"
	suite.mockUserDatabase.EXPECT().CreateMicrosoftUser(mock.Anything, suite.userID.String(), name, avatarUrl).Return(DatabaseUser{}, errors.New(dbError))
	mockSessionService := sessions.NewMockSessionService(suite.T())
	mockNotesService := notes.NewMockNotesService(suite.T())
	userService := NewUserService(suite.mockUserDatabase, suite.broker, mockSessionService, mockNotesService)

	user, err := userService.CreateMicrosoftUser(context.Background(), suite.userID.String(), name, avatarUrl)

	suite.Nil(user)
	suite.NotNil(err)
	suite.Equal(common.InternalServerError, err)
}

func (suite *UserServiceTestSuite) TestCreateMicrosoftUser_EmptyUsername() {
	name := "   "
	avatarUrl := ""
	mockSessionService := sessions.NewMockSessionService(suite.T())
	mockNotesService := notes.NewMockNotesService(suite.T())
	userService := NewUserService(suite.mockUserDatabase, suite.broker, mockSessionService, mockNotesService)

	user, err := userService.CreateMicrosoftUser(context.Background(), suite.userID.String(), name, avatarUrl)

	suite.Nil(user)
	suite.NotNil(err)
	suite.Equal(common.BadRequestError(errors.New("name may not be empty")), err)
}

func (suite *UserServiceTestSuite) TestCreateMicrosoftUser_NewLineUsername() {
	name := "Stan\n"
	avatarUrl := ""
	mockSessionService := sessions.NewMockSessionService(suite.T())
	mockNotesService := notes.NewMockNotesService(suite.T())
	userService := NewUserService(suite.mockUserDatabase, suite.broker, mockSessionService, mockNotesService)

	user, err := userService.CreateMicrosoftUser(context.Background(), suite.userID.String(), name, avatarUrl)

	suite.Nil(user)
	suite.NotNil(err)
	suite.Equal(common.BadRequestError(errors.New("name may not contain newline characters")), err)
}

func (suite *UserServiceTestSuite) TestCreateOIDCUser() {
	name := "Stan"
	avatarUrl := ""
	suite.mockUserDatabase.EXPECT().CreateOIDCUser(mock.Anything, suite.userID.String(), name, avatarUrl).
		Return(DatabaseUser{ID: suite.userID, Name: name}, nil)
	mockSessionService := sessions.NewMockSessionService(suite.T())
	mockNotesService := notes.NewMockNotesService(suite.T())
	userService := NewUserService(suite.mockUserDatabase, suite.broker, mockSessionService, mockNotesService)

	user, err := userService.CreateOIDCUser(context.Background(), suite.userID.String(), name, avatarUrl)

	suite.Nil(err)
	suite.NotNil(user)
}

func (suite *UserServiceTestSuite) TestCreateOIDCUser_DatabaseError() {
	name := "Stan"
	avatarUrl := ""
	dbError := "unable to execute"
	suite.mockUserDatabase.EXPECT().CreateOIDCUser(mock.Anything, suite.userID.String(), name, avatarUrl).Return(DatabaseUser{}, errors.New(dbError))
	mockSessionService := sessions.NewMockSessionService(suite.T())
	mockNotesService := notes.NewMockNotesService(suite.T())
	userService := NewUserService(suite.mockUserDatabase, suite.broker, mockSessionService, mockNotesService)

	user, err := userService.CreateOIDCUser(context.Background(), suite.userID.String(), name, avatarUrl)

	suite.Nil(user)
	suite.NotNil(err)
	suite.Equal(common.InternalServerError, err)
}

func (suite *UserServiceTestSuite) TestCreateOIDCUser_EmptyUsername() {
	name := "   "
	avatarUrl := ""
	mockSessionService := sessions.NewMockSessionService(suite.T())
	mockNotesService := notes.NewMockNotesService(suite.T())
	userService := NewUserService(suite.mockUserDatabase, suite.broker, mockSessionService, mockNotesService)

	user, err := userService.CreateOIDCUser(context.Background(), suite.userID.String(), name, avatarUrl)

	suite.Nil(user)
	suite.NotNil(err)
	suite.Equal(common.BadRequestError(errors.New("name may not be empty")), err)
}

func (suite *UserServiceTestSuite) TestCreateOIDCUser_NewLineUsername() {
	name := "Stan\n"
	avatarUrl := ""
	mockSessionService := sessions.NewMockSessionService(suite.T())
	mockNotesService := notes.NewMockNotesService(suite.T())
	userService := NewUserService(suite.mockUserDatabase, suite.broker, mockSessionService, mockNotesService)

	user, err := userService.CreateOIDCUser(context.Background(), suite.userID.String(), name, avatarUrl)

	suite.Nil(user)
	suite.NotNil(err)
	suite.Equal(common.BadRequestError(errors.New("name may not contain newline characters")), err)
}

func (suite *UserServiceTestSuite) TestUpdateUser() {
	firstBoardID := uuid.New()
	secondBoardID := uuid.New()
	name := "Stan"
	user := User{
		ID:   suite.userID,
		Name: name,
	}
	suite.mockUserDatabase.EXPECT().UpdateUser(mock.Anything, DatabaseUserUpdate{ID: suite.userID, Name: name}).
		Return(DatabaseUser{ID: suite.userID, Name: name}, nil)
	suite.mockBroker.EXPECT().Publish(mock.Anything, mock.AnythingOfType("string"), mock.Anything).Return(nil)
	mockUserService := sessions.NewMockSessionService(suite.T())
	mockUserService.EXPECT().GetUserBoardSessions(mock.Anything, suite.userID, true).
		Return([]*sessions.BoardSession{
			{UserID: user.ID, Board: firstBoardID},
			{UserID: user.ID, Board: secondBoardID},
		}, nil)
	mockUserService.EXPECT().Get(mock.Anything, firstBoardID, suite.userID).
		Return(&sessions.BoardSession{UserID: user.ID, Board: firstBoardID}, nil)
	mockUserService.EXPECT().Get(mock.Anything, secondBoardID, suite.userID).
		Return(&sessions.BoardSession{UserID: user.ID, Board: secondBoardID}, nil)
	mockNotesService := notes.NewMockNotesService(suite.T())
	userService := NewUserService(suite.mockUserDatabase, suite.broker, mockUserService, mockNotesService)

	updatedUser, err := userService.Update(context.Background(), UserUpdateRequest{ID: suite.userID, Name: name})

	suite.Nil(err)
	suite.NotNil(updatedUser)
}

func (suite *UserServiceTestSuite) TestUpdateUser_DatabaseError() {
	name := "Stan"
	dbError := "unable to execute"
	suite.mockUserDatabase.EXPECT().UpdateUser(mock.Anything, DatabaseUserUpdate{ID: suite.userID, Name: name}).
		Return(DatabaseUser{}, errors.New(dbError))
	mockSessionService := sessions.NewMockSessionService(suite.T())
	mockNotesService := notes.NewMockNotesService(suite.T())
	userService := NewUserService(suite.mockUserDatabase, suite.broker, mockSessionService, mockNotesService)

	user, err := userService.Update(context.Background(), UserUpdateRequest{ID: suite.userID, Name: name})

	suite.Nil(user)
	suite.NotNil(err)
	suite.Equal(common.InternalServerError, err)
}

func (suite *UserServiceTestSuite) TestUpdateUser_EmptyUsername() {
	name := "   "
	mockSessionService := sessions.NewMockSessionService(suite.T())
	mockNotesService := notes.NewMockNotesService(suite.T())
	userService := NewUserService(suite.mockUserDatabase, suite.broker, mockSessionService, mockNotesService)

	user, err := userService.Update(context.Background(), UserUpdateRequest{ID: suite.userID, Name: name})

	suite.Nil(user)
	suite.NotNil(err)
	suite.Equal(common.BadRequestError(errors.New("name may not be empty")), err)
}

func (suite *UserServiceTestSuite) TestUpdateUser_NewLineUsername() {
	name := "Stan\n"
	mockSessionService := sessions.NewMockSessionService(suite.T())
	mockNotesService := notes.NewMockNotesService(suite.T())
	userService := NewUserService(suite.mockUserDatabase, suite.broker, mockSessionService, mockNotesService)

	user, err := userService.Update(context.Background(), UserUpdateRequest{ID: suite.userID, Name: name})

	suite.Nil(user)
	suite.NotNil(err)
	suite.Equal(common.BadRequestError(errors.New("name may not contain newline characters")), err)
}

func (suite *UserServiceTestSuite) TestAvailableForKeyMigration() {
	suite.mockUserDatabase.EXPECT().IsUserAvailableForKeyMigration(mock.Anything, suite.userID).Return(true, nil)
	mockSessionService := sessions.NewMockSessionService(suite.T())
	mockNotesService := notes.NewMockNotesService(suite.T())
	userService := NewUserService(suite.mockUserDatabase, suite.broker, mockSessionService, mockNotesService)

	available, err := userService.IsUserAvailableForKeyMigration(context.Background(), suite.userID)

	suite.Nil(err)
	suite.True(available)
}

func (suite *UserServiceTestSuite) TestAvailableForKeyMigration_DatabaseError() {
	dbError := "unable to execute"
	suite.mockUserDatabase.EXPECT().IsUserAvailableForKeyMigration(mock.Anything, suite.userID).Return(false, errors.New(dbError))
	mockSessionService := sessions.NewMockSessionService(suite.T())
	mockNotesService := notes.NewMockNotesService(suite.T())
	userService := NewUserService(suite.mockUserDatabase, suite.broker, mockSessionService, mockNotesService)

	available, err := userService.IsUserAvailableForKeyMigration(context.Background(), suite.userID)

	suite.False(available)
	suite.NotNil(err)
	suite.Equal(errors.New(dbError), err)
}

func (suite *UserServiceTestSuite) TestSetKeyMigration() {
	suite.mockUserDatabase.EXPECT().SetKeyMigration(mock.Anything, suite.userID).Return(DatabaseUser{ID: suite.userID}, nil)
	mockSessionService := sessions.NewMockSessionService(suite.T())
	mockNotesService := notes.NewMockNotesService(suite.T())
	userService := NewUserService(suite.mockUserDatabase, suite.broker, mockSessionService, mockNotesService)

	user, err := userService.SetKeyMigration(context.Background(), suite.userID)

	suite.Nil(err)
	suite.NotNil(user)
}

func (suite *UserServiceTestSuite) TestSetKeymigration_DatabaseError() {
	dbError := "unable to execute"
	suite.mockUserDatabase.EXPECT().SetKeyMigration(mock.Anything, suite.userID).Return(DatabaseUser{}, errors.New(dbError))
	mockSessionService := sessions.NewMockSessionService(suite.T())
	mockNotesService := notes.NewMockNotesService(suite.T())
	userService := NewUserService(suite.mockUserDatabase, suite.broker, mockSessionService, mockNotesService)

	user, err := userService.SetKeyMigration(context.Background(), suite.userID)

	suite.Nil(user)
	suite.NotNil(err)
	suite.Equal(errors.New(dbError), err)
}

func (suite *UserServiceTestSuite) TestDeleteUser() {
	suite.mockUserDatabase.EXPECT().DeleteUser(mock.Anything, suite.userID).
		Return(nil)
	mockSessionService := sessions.NewMockSessionService(suite.T())
	mockSessionService.EXPECT().GetUserBoardSessions(mock.Anything, suite.userID, false).Return([]*sessions.BoardSession{}, nil)
	mockNotesService := notes.NewMockNotesService(suite.T())
	userService := NewUserService(suite.mockUserDatabase, suite.broker, mockSessionService, mockNotesService)

	err := userService.Delete(context.Background(), suite.userID)

	suite.Nil(err)
}

func (suite *UserServiceTestSuite) TestDeleteUser_DatabaseError() {
	dbError := errors.New("database error")
	suite.mockUserDatabase.EXPECT().DeleteUser(mock.Anything, suite.userID).
		Return(dbError)
	mockSessionService := sessions.NewMockSessionService(suite.T())
	mockSessionService.EXPECT().GetUserBoardSessions(mock.Anything, suite.userID, false).Return([]*sessions.BoardSession{}, nil)
	mockNotesService := notes.NewMockNotesService(suite.T())
	userService := NewUserService(suite.mockUserDatabase, suite.broker, mockSessionService, mockNotesService)

	err := userService.Delete(context.Background(), suite.userID)

	suite.NotNil(err)
	suite.Equal(common.InternalServerError, err)
}
