package users

import (
	"context"
	"database/sql"
	"errors"
	"testing"

	"scrumlr.io/server/common"
	"scrumlr.io/server/notes"
	"scrumlr.io/server/sessions"

	"github.com/google/uuid"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/suite"
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

	var userErr UserError
	suite.ErrorAs(err, &userErr)

	suite.Equal(NotFound, userErr.Category)
}

func (suite *UserServiceTestSuite) TestGetUser_DatabaseError() {
	dbError := errors.New("unable to execute")
	suite.mockUserDatabase.EXPECT().GetUser(mock.Anything, suite.userID).Return(DatabaseUser{}, dbError)
	mockSessionService := sessions.NewMockSessionService(suite.T())
	mockNotesService := notes.NewMockNotesService(suite.T())
	userService := NewUserService(suite.mockUserDatabase, suite.broker, mockSessionService, mockNotesService)

	user, err := userService.Get(context.Background(), suite.userID)

	suite.Nil(user)
	suite.NotNil(err)
	suite.ErrorIs(err, dbError)
}

func (suite *UserServiceTestSuite) TestGetExistingUserIDs() {
	userIDs := []uuid.UUID{uuid.New(), uuid.New(), uuid.New()}
	suite.mockUserDatabase.EXPECT().GetExistingUserIDs(mock.Anything, userIDs).Return([]uuid.UUID{userIDs[0], userIDs[1], userIDs[2]}, nil)
	mockSessionService := sessions.NewMockSessionService(suite.T())
	mockNotesService := notes.NewMockNotesService(suite.T())
	userService := NewUserService(suite.mockUserDatabase, suite.broker, mockSessionService, mockNotesService)

	user, err := userService.GetExistingUserIDs(context.Background(), userIDs)

	suite.Nil(err)
	suite.NotNil(user)
}

func (suite *UserServiceTestSuite) TestGetExistingUserIDsError() {
	userIDs := []uuid.UUID{uuid.New(), uuid.New(), uuid.New()}
	dbError := "unable to execute"
	suite.mockUserDatabase.EXPECT().GetExistingUserIDs(mock.Anything, userIDs).Return(nil, errors.New(dbError))
	mockSessionService := sessions.NewMockSessionService(suite.T())
	mockNotesService := notes.NewMockNotesService(suite.T())
	userService := NewUserService(suite.mockUserDatabase, suite.broker, mockSessionService, mockNotesService)

	user, err := userService.GetExistingUserIDs(context.Background(), userIDs)

	suite.Nil(user)
	suite.NotNil(err)
	suite.Equal(common.InternalServerError, err)
}

func (suite *UserServiceTestSuite) TestGetBoardUsers() {
	boardID := uuid.New()
	userIDs := []uuid.UUID{uuid.New(), uuid.New(), uuid.New()}
	suite.mockUserDatabase.EXPECT().GetUsersByBoardID(mock.Anything, boardID).Return([]DatabaseUser{
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

	user, err := userService.Create(context.Background(), "", name, "", common.Anonymous)

	suite.Nil(err)
	suite.NotNil(user)
}

func (suite *UserServiceTestSuite) TestCreateAnonymusUser_DatabaseError() {
	name := "Stan"
	dbError := errors.New("unable to execute")
	suite.mockUserDatabase.EXPECT().CreateAnonymousUser(mock.Anything, name).Return(DatabaseUser{}, dbError)
	mockSessionService := sessions.NewMockSessionService(suite.T())
	mockNotesService := notes.NewMockNotesService(suite.T())
	userService := NewUserService(suite.mockUserDatabase, suite.broker, mockSessionService, mockNotesService)

	user, err := userService.Create(context.Background(), "", name, "", common.Anonymous)

	suite.Nil(user)
	suite.NotNil(err)
	suite.ErrorIs(err, dbError)
}

func (suite *UserServiceTestSuite) TestCreateAnonymusUser_EmptyUsername() {
	name := "   "
	mockSessionService := sessions.NewMockSessionService(suite.T())
	mockNotesService := notes.NewMockNotesService(suite.T())
	userService := NewUserService(suite.mockUserDatabase, suite.broker, mockSessionService, mockNotesService)

	user, err := userService.Create(context.Background(), "", name, "", common.Anonymous)

	suite.Nil(user)
	suite.NotNil(err)

	var userErr UserError
	suite.ErrorAs(err, &userErr)
	suite.Equal(BadRequest, userErr.Category)
	suite.Equal("name may not be empty", userErr.Message)
}

func (suite *UserServiceTestSuite) TestCreateAnonymusUser_NewLineUsername() {
	name := "Stan\n"
	mockSessionService := sessions.NewMockSessionService(suite.T())
	mockNotesService := notes.NewMockNotesService(suite.T())
	userService := NewUserService(suite.mockUserDatabase, suite.broker, mockSessionService, mockNotesService)

	user, err := userService.Create(context.Background(), "", name, "", common.Anonymous)

	suite.Nil(user)
	suite.NotNil(err)

	var userErr UserError
	suite.ErrorAs(err, &userErr)
	suite.Equal(BadRequest, userErr.Category)
	suite.Equal("name may not contain newline characters", userErr.Message)
}

func (suite *UserServiceTestSuite) TestCreateAppleUser() {
	name := "Stan"
	avatarUrl := ""
	suite.mockUserDatabase.EXPECT().CreateAppleUser(mock.Anything, suite.userID.String(), name, avatarUrl).
		Return(DatabaseUser{ID: suite.userID, Name: name}, nil)
	mockSessionService := sessions.NewMockSessionService(suite.T())
	mockNotesService := notes.NewMockNotesService(suite.T())
	userService := NewUserService(suite.mockUserDatabase, suite.broker, mockSessionService, mockNotesService)

	user, err := userService.Create(context.Background(), suite.userID.String(), name, avatarUrl, common.Apple)

	suite.Nil(err)
	suite.NotNil(user)
}

func (suite *UserServiceTestSuite) TestCreateAppleUser_DatabaseError() {
	name := "Stan"
	avatarUrl := ""
	dbError := errors.New("unable to execute")
	suite.mockUserDatabase.EXPECT().CreateAppleUser(mock.Anything, suite.userID.String(), name, avatarUrl).Return(DatabaseUser{}, dbError)
	mockSessionService := sessions.NewMockSessionService(suite.T())
	mockNotesService := notes.NewMockNotesService(suite.T())
	userService := NewUserService(suite.mockUserDatabase, suite.broker, mockSessionService, mockNotesService)

	user, err := userService.Create(context.Background(), suite.userID.String(), name, avatarUrl, common.Apple)

	suite.Nil(user)
	suite.NotNil(err)
	suite.ErrorIs(err, dbError)
}

func (suite *UserServiceTestSuite) TestCreateAppleUser_EmptyUsername() {
	name := "   "
	avatarUrl := ""
	mockSessionService := sessions.NewMockSessionService(suite.T())
	mockNotesService := notes.NewMockNotesService(suite.T())
	userService := NewUserService(suite.mockUserDatabase, suite.broker, mockSessionService, mockNotesService)

	user, err := userService.Create(context.Background(), suite.userID.String(), name, avatarUrl, common.Apple)

	suite.Nil(user)
	suite.NotNil(err)

	var userErr UserError
	suite.ErrorAs(err, &userErr)

	suite.Equal(BadRequest, userErr.Category)
	suite.Equal("name may not be empty", userErr.Message)
}

func (suite *UserServiceTestSuite) TestCreateAppleUser_NewLineUsername() {
	name := "Stan\n"
	avatarUrl := ""
	mockSessionService := sessions.NewMockSessionService(suite.T())
	mockNotesService := notes.NewMockNotesService(suite.T())
	userService := NewUserService(suite.mockUserDatabase, suite.broker, mockSessionService, mockNotesService)

	user, err := userService.Create(context.Background(), suite.userID.String(), name, avatarUrl, common.Apple)

	suite.Nil(user)
	suite.NotNil(err)

	var userErr UserError
	suite.ErrorAs(err, &userErr)

	suite.Equal(BadRequest, userErr.Category)
	suite.Equal("name may not contain newline characters", userErr.Message)
}

func (suite *UserServiceTestSuite) TestCreateAzureUser() {
	name := "Stan"
	avatarUrl := ""
	suite.mockUserDatabase.EXPECT().CreateAzureAdUser(mock.Anything, suite.userID.String(), name, avatarUrl).
		Return(DatabaseUser{ID: suite.userID, Name: name}, nil)
	mockSessionService := sessions.NewMockSessionService(suite.T())
	mockNotesService := notes.NewMockNotesService(suite.T())
	userService := NewUserService(suite.mockUserDatabase, suite.broker, mockSessionService, mockNotesService)

	user, err := userService.Create(context.Background(), suite.userID.String(), name, avatarUrl, common.AzureAd)

	suite.Nil(err)
	suite.NotNil(user)
}

func (suite *UserServiceTestSuite) TestCreateAzureUser_DatabaseError() {
	name := "Stan"
	avatarUrl := ""
	dbError := errors.New("unable to execute")
	suite.mockUserDatabase.EXPECT().CreateAzureAdUser(mock.Anything, suite.userID.String(), name, avatarUrl).Return(DatabaseUser{}, dbError)
	mockSessionService := sessions.NewMockSessionService(suite.T())
	mockNotesService := notes.NewMockNotesService(suite.T())
	userService := NewUserService(suite.mockUserDatabase, suite.broker, mockSessionService, mockNotesService)

	user, err := userService.Create(context.Background(), suite.userID.String(), name, avatarUrl, common.AzureAd)

	suite.Nil(user)
	suite.NotNil(err)
	suite.ErrorIs(err, dbError)
}

func (suite *UserServiceTestSuite) TestCreateAzureUser_EmptyUsername() {
	name := "   "
	avatarUrl := ""
	mockSessionService := sessions.NewMockSessionService(suite.T())
	mockNotesService := notes.NewMockNotesService(suite.T())
	userService := NewUserService(suite.mockUserDatabase, suite.broker, mockSessionService, mockNotesService)

	user, err := userService.Create(context.Background(), suite.userID.String(), name, avatarUrl, common.AzureAd)

	suite.Nil(user)
	suite.NotNil(err)

	var userErr UserError
	suite.ErrorAs(err, &userErr)
	suite.Equal(BadRequest, userErr.Category)
	suite.Equal("name may not be empty", userErr.Message)
}

func (suite *UserServiceTestSuite) TestCreateAzureUser_NewLineUsername() {
	name := "Stan\n"
	avatarUrl := ""
	mockSessionService := sessions.NewMockSessionService(suite.T())
	mockNotesService := notes.NewMockNotesService(suite.T())
	userService := NewUserService(suite.mockUserDatabase, suite.broker, mockSessionService, mockNotesService)

	user, err := userService.Create(context.Background(), suite.userID.String(), name, avatarUrl, common.AzureAd)

	suite.Nil(user)
	suite.NotNil(err)

	var userErr UserError
	suite.ErrorAs(err, &userErr)
	suite.Equal(BadRequest, userErr.Category)
	suite.Equal("name may not contain newline characters", userErr.Message)
}

func (suite *UserServiceTestSuite) TestCreateGitHubUser() {
	name := "Stan"
	avatarUrl := ""
	suite.mockUserDatabase.EXPECT().CreateGitHubUser(mock.Anything, suite.userID.String(), name, avatarUrl).
		Return(DatabaseUser{ID: suite.userID, Name: name}, nil)
	mockSessionService := sessions.NewMockSessionService(suite.T())
	mockNotesService := notes.NewMockNotesService(suite.T())
	userService := NewUserService(suite.mockUserDatabase, suite.broker, mockSessionService, mockNotesService)

	user, err := userService.Create(context.Background(), suite.userID.String(), name, avatarUrl, common.GitHub)

	suite.Nil(err)
	suite.NotNil(user)
}

func (suite *UserServiceTestSuite) TestCreateGitHubUser_DatabaseError() {
	name := "Stan"
	avatarUrl := ""
	dbError := errors.New("unable to execute")
	suite.mockUserDatabase.EXPECT().CreateGitHubUser(mock.Anything, suite.userID.String(), name, avatarUrl).Return(DatabaseUser{}, dbError)
	mockSessionService := sessions.NewMockSessionService(suite.T())
	mockNotesService := notes.NewMockNotesService(suite.T())
	userService := NewUserService(suite.mockUserDatabase, suite.broker, mockSessionService, mockNotesService)

	user, err := userService.Create(context.Background(), suite.userID.String(), name, avatarUrl, common.GitHub)

	suite.Nil(user)
	suite.NotNil(err)
	suite.ErrorIs(err, dbError)
}

func (suite *UserServiceTestSuite) TestCreateGitHubUser_EmptyUsername() {
	name := "   "
	avatarUrl := ""
	mockSessionService := sessions.NewMockSessionService(suite.T())
	mockNotesService := notes.NewMockNotesService(suite.T())
	userService := NewUserService(suite.mockUserDatabase, suite.broker, mockSessionService, mockNotesService)

	user, err := userService.Create(context.Background(), suite.userID.String(), name, avatarUrl, common.GitHub)

	suite.Nil(user)
	suite.NotNil(err)

	var userErr UserError
	suite.ErrorAs(err, &userErr)
	suite.Equal(BadRequest, userErr.Category)
	suite.Equal("name may not be empty", userErr.Message)
}

func (suite *UserServiceTestSuite) TestCreateGitHubUser_NewLineUsername() {
	name := "Stan\n"
	avatarUrl := ""
	mockSessionService := sessions.NewMockSessionService(suite.T())
	mockNotesService := notes.NewMockNotesService(suite.T())
	userService := NewUserService(suite.mockUserDatabase, suite.broker, mockSessionService, mockNotesService)

	user, err := userService.Create(context.Background(), suite.userID.String(), name, avatarUrl, common.GitHub)

	suite.Nil(user)
	suite.NotNil(err)

	var userErr UserError
	suite.ErrorAs(err, &userErr)
	suite.Equal(BadRequest, userErr.Category)
	suite.Equal("name may not contain newline characters", userErr.Message)
}

func (suite *UserServiceTestSuite) TestCreateGoogleUser() {
	name := "Stan"
	avatarUrl := ""
	suite.mockUserDatabase.EXPECT().CreateGoogleUser(mock.Anything, suite.userID.String(), name, avatarUrl).
		Return(DatabaseUser{ID: suite.userID, Name: name}, nil)
	mockSessionService := sessions.NewMockSessionService(suite.T())
	mockNotesService := notes.NewMockNotesService(suite.T())
	userService := NewUserService(suite.mockUserDatabase, suite.broker, mockSessionService, mockNotesService)

	user, err := userService.Create(context.Background(), suite.userID.String(), name, avatarUrl, common.Google)

	suite.Nil(err)
	suite.NotNil(user)
}

func (suite *UserServiceTestSuite) TestCreateGoogleUser_DatabaseError() {
	name := "Stan"
	avatarUrl := ""
	dbError := errors.New("unable to execute")
	suite.mockUserDatabase.EXPECT().CreateGoogleUser(mock.Anything, suite.userID.String(), name, avatarUrl).Return(DatabaseUser{}, dbError)
	mockSessionService := sessions.NewMockSessionService(suite.T())
	mockNotesService := notes.NewMockNotesService(suite.T())
	userService := NewUserService(suite.mockUserDatabase, suite.broker, mockSessionService, mockNotesService)

	user, err := userService.Create(context.Background(), suite.userID.String(), name, avatarUrl, common.Google)

	suite.Nil(user)
	suite.NotNil(err)
	suite.ErrorIs(err, dbError)
}

func (suite *UserServiceTestSuite) TestCreateGoogleUser_EmptyUsername() {
	name := "   "
	avatarUrl := ""
	mockSessionService := sessions.NewMockSessionService(suite.T())
	mockNotesService := notes.NewMockNotesService(suite.T())
	userService := NewUserService(suite.mockUserDatabase, suite.broker, mockSessionService, mockNotesService)

	user, err := userService.Create(context.Background(), suite.userID.String(), name, avatarUrl, common.Google)

	suite.Nil(user)
	suite.NotNil(err)

	var userErr UserError
	suite.ErrorAs(err, &userErr)
	suite.Equal(BadRequest, userErr.Category)
	suite.Equal("name may not be empty", userErr.Message)
}

func (suite *UserServiceTestSuite) TestCreateGoogleUser_NewLineUsername() {
	name := "Stan\n"
	avatarUrl := ""
	mockSessionService := sessions.NewMockSessionService(suite.T())
	mockNotesService := notes.NewMockNotesService(suite.T())
	userService := NewUserService(suite.mockUserDatabase, suite.broker, mockSessionService, mockNotesService)

	user, err := userService.Create(context.Background(), suite.userID.String(), name, avatarUrl, common.Google)

	suite.Nil(user)
	suite.NotNil(err)

	var userErr UserError
	suite.ErrorAs(err, &userErr)
	suite.Equal(BadRequest, userErr.Category)
	suite.Equal("name may not contain newline characters", userErr.Message)
}

func (suite *UserServiceTestSuite) TestCreateMicrosoftUser() {
	name := "Stan"
	avatarUrl := ""
	suite.mockUserDatabase.EXPECT().CreateMicrosoftUser(mock.Anything, suite.userID.String(), name, avatarUrl).
		Return(DatabaseUser{ID: suite.userID, Name: name}, nil)
	mockSessionService := sessions.NewMockSessionService(suite.T())
	mockNotesService := notes.NewMockNotesService(suite.T())
	userService := NewUserService(suite.mockUserDatabase, suite.broker, mockSessionService, mockNotesService)

	user, err := userService.Create(context.Background(), suite.userID.String(), name, avatarUrl, common.Microsoft)

	suite.Nil(err)
	suite.NotNil(user)
}

func (suite *UserServiceTestSuite) TestCreateMicrosoftUser_DatabaseError() {
	name := "Stan"
	avatarUrl := ""
	dbError := errors.New("unable to execute")
	suite.mockUserDatabase.EXPECT().CreateMicrosoftUser(mock.Anything, suite.userID.String(), name, avatarUrl).Return(DatabaseUser{}, dbError)
	mockSessionService := sessions.NewMockSessionService(suite.T())
	mockNotesService := notes.NewMockNotesService(suite.T())
	userService := NewUserService(suite.mockUserDatabase, suite.broker, mockSessionService, mockNotesService)

	user, err := userService.Create(context.Background(), suite.userID.String(), name, avatarUrl, common.Microsoft)

	suite.Nil(user)
	suite.NotNil(err)
	suite.ErrorIs(err, dbError)
}

func (suite *UserServiceTestSuite) TestCreateMicrosoftUser_EmptyUsername() {
	name := "   "
	avatarUrl := ""
	mockSessionService := sessions.NewMockSessionService(suite.T())
	mockNotesService := notes.NewMockNotesService(suite.T())
	userService := NewUserService(suite.mockUserDatabase, suite.broker, mockSessionService, mockNotesService)

	user, err := userService.Create(context.Background(), suite.userID.String(), name, avatarUrl, common.Microsoft)

	suite.Nil(user)
	suite.NotNil(err)

	var userErr UserError
	suite.ErrorAs(err, &userErr)
	suite.Equal(BadRequest, userErr.Category)
	suite.Equal("name may not be empty", userErr.Message)
}

func (suite *UserServiceTestSuite) TestCreateMicrosoftUser_NewLineUsername() {
	name := "Stan\n"
	avatarUrl := ""
	mockSessionService := sessions.NewMockSessionService(suite.T())
	mockNotesService := notes.NewMockNotesService(suite.T())
	userService := NewUserService(suite.mockUserDatabase, suite.broker, mockSessionService, mockNotesService)

	user, err := userService.Create(context.Background(), suite.userID.String(), name, avatarUrl, common.Microsoft)

	suite.Nil(user)
	suite.NotNil(err)

	var userErr UserError
	suite.ErrorAs(err, &userErr)
	suite.Equal(BadRequest, userErr.Category)
	suite.Equal("name may not contain newline characters", userErr.Message)
}

func (suite *UserServiceTestSuite) TestCreateOIDCUser() {
	name := "Stan"
	avatarUrl := ""
	suite.mockUserDatabase.EXPECT().CreateOIDCUser(mock.Anything, suite.userID.String(), name, avatarUrl).
		Return(DatabaseUser{ID: suite.userID, Name: name}, nil)
	mockSessionService := sessions.NewMockSessionService(suite.T())
	mockNotesService := notes.NewMockNotesService(suite.T())
	userService := NewUserService(suite.mockUserDatabase, suite.broker, mockSessionService, mockNotesService)

	user, err := userService.Create(context.Background(), suite.userID.String(), name, avatarUrl, common.TypeOIDC)

	suite.Nil(err)
	suite.NotNil(user)
}

func (suite *UserServiceTestSuite) TestCreateOIDCUser_DatabaseError() {
	name := "Stan"
	avatarUrl := ""
	dbError := errors.New("unable to execute")
	suite.mockUserDatabase.EXPECT().CreateOIDCUser(mock.Anything, suite.userID.String(), name, avatarUrl).Return(DatabaseUser{}, dbError)
	mockSessionService := sessions.NewMockSessionService(suite.T())
	mockNotesService := notes.NewMockNotesService(suite.T())
	userService := NewUserService(suite.mockUserDatabase, suite.broker, mockSessionService, mockNotesService)

	user, err := userService.Create(context.Background(), suite.userID.String(), name, avatarUrl, common.TypeOIDC)

	suite.Nil(user)
	suite.NotNil(err)
	suite.ErrorIs(err, dbError)
}

func (suite *UserServiceTestSuite) TestCreateOIDCUser_EmptyUsername() {
	name := "   "
	avatarUrl := ""
	mockSessionService := sessions.NewMockSessionService(suite.T())
	mockNotesService := notes.NewMockNotesService(suite.T())
	userService := NewUserService(suite.mockUserDatabase, suite.broker, mockSessionService, mockNotesService)

	user, err := userService.Create(context.Background(), suite.userID.String(), name, avatarUrl, common.TypeOIDC)

	suite.Nil(user)
	suite.NotNil(err)

	var userErr UserError
	suite.ErrorAs(err, &userErr)
	suite.Equal(BadRequest, userErr.Category)
	suite.Equal("name may not be empty", userErr.Message)
}

func (suite *UserServiceTestSuite) TestCreateOIDCUser_NewLineUsername() {
	name := "Stan\n"
	avatarUrl := ""
	mockSessionService := sessions.NewMockSessionService(suite.T())
	mockNotesService := notes.NewMockNotesService(suite.T())
	userService := NewUserService(suite.mockUserDatabase, suite.broker, mockSessionService, mockNotesService)

	user, err := userService.Create(context.Background(), suite.userID.String(), name, avatarUrl, common.TypeOIDC)

	suite.Nil(user)
	suite.NotNil(err)

	var userErr UserError
	suite.ErrorAs(err, &userErr)
	suite.Equal(BadRequest, userErr.Category)
	suite.Equal("name may not contain newline characters", userErr.Message)
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
	mockNotesService := notes.NewMockNotesService(suite.T())
	userService := NewUserService(suite.mockUserDatabase, suite.broker, mockUserService, mockNotesService)

	updatedUser, err := userService.Update(context.Background(), UserUpdateRequest{ID: suite.userID, Name: name})

	suite.Nil(err)
	suite.NotNil(updatedUser)
}

func (suite *UserServiceTestSuite) TestUpdateUser_DatabaseError() {
	name := "Stan"
	dbError := errors.New("unable to execute")
	suite.mockUserDatabase.EXPECT().UpdateUser(mock.Anything, DatabaseUserUpdate{ID: suite.userID, Name: name}).
		Return(DatabaseUser{}, dbError)
	mockSessionService := sessions.NewMockSessionService(suite.T())
	mockNotesService := notes.NewMockNotesService(suite.T())
	userService := NewUserService(suite.mockUserDatabase, suite.broker, mockSessionService, mockNotesService)

	user, err := userService.Update(context.Background(), UserUpdateRequest{ID: suite.userID, Name: name})

	suite.Nil(user)
	suite.NotNil(err)
	suite.ErrorIs(err, dbError)
}

func (suite *UserServiceTestSuite) TestUpdateUser_EmptyUsername() {
	name := "   "
	mockSessionService := sessions.NewMockSessionService(suite.T())
	mockNotesService := notes.NewMockNotesService(suite.T())
	userService := NewUserService(suite.mockUserDatabase, suite.broker, mockSessionService, mockNotesService)

	user, err := userService.Update(context.Background(), UserUpdateRequest{ID: suite.userID, Name: name})

	suite.Nil(user)
	suite.NotNil(err)

	var userErr UserError
	suite.ErrorAs(err, &userErr)
	suite.Equal(BadRequest, userErr.Category)
	suite.Equal("name may not be empty", userErr.Message)
}

func (suite *UserServiceTestSuite) TestUpdateUser_NewLineUsername() {
	name := "Stan\n"
	mockSessionService := sessions.NewMockSessionService(suite.T())
	mockNotesService := notes.NewMockNotesService(suite.T())
	userService := NewUserService(suite.mockUserDatabase, suite.broker, mockSessionService, mockNotesService)

	user, err := userService.Update(context.Background(), UserUpdateRequest{ID: suite.userID, Name: name})

	suite.Nil(user)
	suite.NotNil(err)

	var userErr UserError
	suite.ErrorAs(err, &userErr)
	suite.Equal(BadRequest, userErr.Category)
	suite.Equal("name may not contain newline characters", userErr.Message)
}

func (suite *UserServiceTestSuite) TestUpgradeAnonymouseUserToApple() {
	name := "Stan"
	appleId := uuid.New().String()
	avatarUrl := ""

	suite.mockUserDatabase.EXPECT().UpgradeToAppleUser(mock.Anything, suite.userID, appleId, name, avatarUrl).
		Return(DatabaseUser{ID: suite.userID, Name: name, AccountType: common.Apple}, nil)
	suite.mockBroker.EXPECT().Publish(mock.Anything, mock.AnythingOfType("string"), mock.Anything).
		Return(nil)
	mockSessionService := sessions.NewMockSessionService(suite.T())
	mockSessionService.EXPECT().GetUserBoardSessions(mock.Anything, suite.userID, true).
		Return([]*sessions.BoardSession{{UserID: suite.userID, Board: uuid.New()}}, nil)
	mockNotesService := notes.NewMockNotesService(suite.T())

	userService := NewUserService(suite.mockUserDatabase, suite.broker, mockSessionService, mockNotesService)

	user, err := userService.UpgradeAnonymousUser(context.Background(), suite.userID, appleId, name, avatarUrl, common.Apple)

	suite.Nil(err)
	suite.NotNil(user)
	suite.Equal(common.Apple, user.AccountType)
}

func (suite *UserServiceTestSuite) TestUpgradeAnonymouseUserToAzure() {
	name := "Stan"
	azureId := uuid.New().String()
	avatarUrl := ""

	suite.mockUserDatabase.EXPECT().UpgradeToAzureUser(mock.Anything, suite.userID, azureId, name, avatarUrl).
		Return(DatabaseUser{ID: suite.userID, Name: name, AccountType: common.AzureAd}, nil)
	suite.mockBroker.EXPECT().Publish(mock.Anything, mock.AnythingOfType("string"), mock.Anything).
		Return(nil)
	mockSessionService := sessions.NewMockSessionService(suite.T())
	mockSessionService.EXPECT().GetUserBoardSessions(mock.Anything, suite.userID, true).
		Return([]*sessions.BoardSession{{UserID: suite.userID, Board: uuid.New()}}, nil)
	mockNotesService := notes.NewMockNotesService(suite.T())

	userService := NewUserService(suite.mockUserDatabase, suite.broker, mockSessionService, mockNotesService)

	user, err := userService.UpgradeAnonymousUser(context.Background(), suite.userID, azureId, name, avatarUrl, common.AzureAd)

	suite.Nil(err)
	suite.NotNil(user)
	suite.Equal(common.AzureAd, user.AccountType)
}

func (suite *UserServiceTestSuite) TestUpgradeAnonymouseUserToGitHub() {
	name := "Stan"
	githubId := uuid.New().String()
	avatarUrl := ""

	suite.mockUserDatabase.EXPECT().UpgradeToGitHubUser(mock.Anything, suite.userID, githubId, name, avatarUrl).
		Return(DatabaseUser{ID: suite.userID, Name: name, AccountType: common.GitHub}, nil)
	suite.mockBroker.EXPECT().Publish(mock.Anything, mock.AnythingOfType("string"), mock.Anything).
		Return(nil)
	mockSessionService := sessions.NewMockSessionService(suite.T())
	mockSessionService.EXPECT().GetUserBoardSessions(mock.Anything, suite.userID, true).
		Return([]*sessions.BoardSession{{UserID: suite.userID, Board: uuid.New()}}, nil)
	mockNotesService := notes.NewMockNotesService(suite.T())

	userService := NewUserService(suite.mockUserDatabase, suite.broker, mockSessionService, mockNotesService)

	user, err := userService.UpgradeAnonymousUser(context.Background(), suite.userID, githubId, name, avatarUrl, common.GitHub)

	suite.Nil(err)
	suite.NotNil(user)
	suite.Equal(common.GitHub, user.AccountType)
}

func (suite *UserServiceTestSuite) TestUpgradeAnonymouseUserToGoogle() {
	name := "Stan"
	googleId := uuid.New().String()
	avatarUrl := ""

	suite.mockUserDatabase.EXPECT().UpgradeToGoogleUser(mock.Anything, suite.userID, googleId, name, avatarUrl).
		Return(DatabaseUser{ID: suite.userID, Name: name, AccountType: common.Google}, nil)
	suite.mockBroker.EXPECT().Publish(mock.Anything, mock.AnythingOfType("string"), mock.Anything).
		Return(nil)
	mockSessionService := sessions.NewMockSessionService(suite.T())
	mockSessionService.EXPECT().GetUserBoardSessions(mock.Anything, suite.userID, true).
		Return([]*sessions.BoardSession{{UserID: suite.userID, Board: uuid.New()}}, nil)
	mockNotesService := notes.NewMockNotesService(suite.T())

	userService := NewUserService(suite.mockUserDatabase, suite.broker, mockSessionService, mockNotesService)

	user, err := userService.UpgradeAnonymousUser(context.Background(), suite.userID, googleId, name, avatarUrl, common.Google)

	suite.Nil(err)
	suite.NotNil(user)
	suite.Equal(common.Google, user.AccountType)
}

func (suite *UserServiceTestSuite) TestUpgradeAnonymouseUserToMicrosoft() {
	name := "Stan"
	microsoftId := uuid.New().String()
	avatarUrl := ""

	suite.mockUserDatabase.EXPECT().UpgradeToMicrosoftUser(mock.Anything, suite.userID, microsoftId, name, avatarUrl).
		Return(DatabaseUser{ID: suite.userID, Name: name, AccountType: common.Microsoft}, nil)
	suite.mockBroker.EXPECT().Publish(mock.Anything, mock.AnythingOfType("string"), mock.Anything).
		Return(nil)
	mockSessionService := sessions.NewMockSessionService(suite.T())
	mockSessionService.EXPECT().GetUserBoardSessions(mock.Anything, suite.userID, true).
		Return([]*sessions.BoardSession{{UserID: suite.userID, Board: uuid.New()}}, nil)
	mockNotesService := notes.NewMockNotesService(suite.T())

	userService := NewUserService(suite.mockUserDatabase, suite.broker, mockSessionService, mockNotesService)

	user, err := userService.UpgradeAnonymousUser(context.Background(), suite.userID, microsoftId, name, avatarUrl, common.Microsoft)

	suite.Nil(err)
	suite.NotNil(user)
	suite.Equal(common.Microsoft, user.AccountType)
}

func (suite *UserServiceTestSuite) TestUpgradeAnonymouseUserToOIDC() {
	name := "Stan"
	oidcId := uuid.New().String()
	avatarUrl := ""

	suite.mockUserDatabase.EXPECT().UpgradeToOIDCUser(mock.Anything, suite.userID, oidcId, name, avatarUrl).
		Return(DatabaseUser{ID: suite.userID, Name: name, AccountType: common.TypeOIDC}, nil)
	suite.mockBroker.EXPECT().Publish(mock.Anything, mock.AnythingOfType("string"), mock.Anything).
		Return(nil)
	mockSessionService := sessions.NewMockSessionService(suite.T())
	mockSessionService.EXPECT().GetUserBoardSessions(mock.Anything, suite.userID, true).
		Return([]*sessions.BoardSession{{UserID: suite.userID, Board: uuid.New()}}, nil)
	mockNotesService := notes.NewMockNotesService(suite.T())

	userService := NewUserService(suite.mockUserDatabase, suite.broker, mockSessionService, mockNotesService)

	user, err := userService.UpgradeAnonymousUser(context.Background(), suite.userID, oidcId, name, avatarUrl, common.TypeOIDC)

	suite.Nil(err)
	suite.NotNil(user)
	suite.Equal(common.TypeOIDC, user.AccountType)
}

func (suite *UserServiceTestSuite) TestUpgradeAnonymouseUserInvalideProvider() {
	name := "Stan"
	oidcId := uuid.New().String()
	avatarUrl := ""

	mockSessionService := sessions.NewMockSessionService(suite.T())
	mockNotesService := notes.NewMockNotesService(suite.T())

	userService := NewUserService(suite.mockUserDatabase, suite.broker, mockSessionService, mockNotesService)

	user, err := userService.UpgradeAnonymousUser(context.Background(), suite.userID, oidcId, name, avatarUrl, common.Anonymous)

	suite.NotNil(err)
	suite.Nil(user)

	var userErr UserError
	suite.ErrorAs(err, &userErr)
	suite.Equal(BadRequest, userErr.Category)
}

func (suite *UserServiceTestSuite) TestUpgradeAnonymouseUserDatabaseError() {
	name := "Stan"
	oidcId := uuid.New().String()
	avatarUrl := ""
	dbError := errors.New("database error")

	suite.mockUserDatabase.EXPECT().UpgradeToOIDCUser(mock.Anything, suite.userID, oidcId, name, avatarUrl).
		Return(DatabaseUser{}, dbError)
	mockSessionService := sessions.NewMockSessionService(suite.T())
	mockNotesService := notes.NewMockNotesService(suite.T())

	userService := NewUserService(suite.mockUserDatabase, suite.broker, mockSessionService, mockNotesService)

	user, err := userService.UpgradeAnonymousUser(context.Background(), suite.userID, oidcId, name, avatarUrl, common.TypeOIDC)

	suite.NotNil(err)
	suite.Nil(user)

	var userErr UserError
	suite.ErrorAs(err, &userErr)
	suite.Equal(Internal, userErr.Category)
}

func (suite *UserServiceTestSuite) TestUpgradeAnonymouseUserInvalidName() {
	name := "Stan\n"
	oidcId := uuid.New().String()
	avatarUrl := ""

	mockSessionService := sessions.NewMockSessionService(suite.T())
	mockNotesService := notes.NewMockNotesService(suite.T())

	userService := NewUserService(suite.mockUserDatabase, suite.broker, mockSessionService, mockNotesService)

	user, err := userService.UpgradeAnonymousUser(context.Background(), suite.userID, oidcId, name, avatarUrl, common.TypeOIDC)

	suite.NotNil(err)
	suite.Nil(user)

	var userErr UserError
	suite.ErrorAs(err, &userErr)
	suite.Equal(BadRequest, userErr.Category)
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
	dbError := errors.New("unable to execute")
	suite.mockUserDatabase.EXPECT().IsUserAvailableForKeyMigration(mock.Anything, suite.userID).Return(false, dbError)
	mockSessionService := sessions.NewMockSessionService(suite.T())
	mockNotesService := notes.NewMockNotesService(suite.T())
	userService := NewUserService(suite.mockUserDatabase, suite.broker, mockSessionService, mockNotesService)

	available, err := userService.IsUserAvailableForKeyMigration(context.Background(), suite.userID)

	suite.False(available)
	suite.NotNil(err)
	suite.ErrorIs(err, dbError)
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
	dbError := errors.New("unable to execute")
	suite.mockUserDatabase.EXPECT().SetKeyMigration(mock.Anything, suite.userID).Return(DatabaseUser{}, dbError)
	mockSessionService := sessions.NewMockSessionService(suite.T())
	mockNotesService := notes.NewMockNotesService(suite.T())
	userService := NewUserService(suite.mockUserDatabase, suite.broker, mockSessionService, mockNotesService)

	user, err := userService.SetKeyMigration(context.Background(), suite.userID)

	suite.Nil(user)
	suite.NotNil(err)
	suite.ErrorIs(err, dbError)
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
	suite.ErrorIs(err, dbError)
}
