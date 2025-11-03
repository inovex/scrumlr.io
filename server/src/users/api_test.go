package users

import (
  "bytes"
  "encoding/json"
  "fmt"
  "net/http"
  "net/http/httptest"
  "testing"

  "github.com/google/uuid"
  "github.com/stretchr/testify/assert"
  "github.com/stretchr/testify/mock"
  "scrumlr.io/server/common"
  "scrumlr.io/server/identifiers"
  "scrumlr.io/server/realtime"
  "scrumlr.io/server/sessions"
  "scrumlr.io/server/technical_helper"
)

func TestGetUser_api(t *testing.T) {
  userId := uuid.New()

  mockUserService := NewMockUserService(t)
  mockSessionService := sessions.NewMockSessionService(t)
  mockUserService.EXPECT().Get(mock.Anything, userId).Return(&User{ID: userId}, nil)

  mockBroker := realtime.NewMockClient(t)
  broker := new(realtime.Broker)
  broker.Con = mockBroker

  userApi := NewUserApi(mockUserService, mockSessionService, true, true)
  rr := httptest.NewRecorder()
  req := technical_helper.NewTestRequestBuilder("GET", "/", nil).
    AddToContext(identifiers.UserIdentifier, userId)

  userApi.GetUser(rr, req.Request())

  assert.Equal(t, http.StatusOK, rr.Result().StatusCode)
  assert.NotNil(t, rr.Body)
  fmt.Println(string(rr.Body.Bytes()))
  var user User
  err := json.Unmarshal(rr.Body.Bytes(), &user)
  assert.Nil(t, err)
  assert.Equal(t, userId, user.ID)
}

func TestGetUserByID_api_InvalidUUID(t *testing.T) {
  mockUserService := NewMockUserService(t)
  mockSessionService := sessions.NewMockSessionService(t)

  userApi := NewUserApi(mockUserService, mockSessionService, true, true)

  rr := httptest.NewRecorder()

  req := technical_helper.NewTestRequestBuilder("GET", "/", nil).
    AddToContext(identifiers.UserIdentifier, uuid.Nil)

  userApi.GetUserByID(rr, req.Request())

  assert.Equal(t, http.StatusInternalServerError, rr.Result().StatusCode)
}

func TestGetBoardUsers_api(t *testing.T) {
  boardID := uuid.New()
  mockUsers := []*User{
    {ID: uuid.New(), Name: "User A", AccountType: common.Anonymous},
    {ID: uuid.New(), Name: "User B", AccountType: common.Anonymous},
  }

  mockUserService := NewMockUserService(t)
  mockSessionService := sessions.NewMockSessionService(t)

  mockUserService.EXPECT().GetBoardUsers(mock.Anything, boardID).Return(mockUsers, nil)

  userApi := NewUserApi(mockUserService, mockSessionService, true, true)
  rr := httptest.NewRecorder()

  req := technical_helper.NewTestRequestBuilder("GET", "/board/{id}", nil).AddToContext(identifiers.BoardIdentifier, boardID)

  userApi.GetUsersFromBoard(rr, req.Request())

  assert.Equal(t, http.StatusOK, rr.Result().StatusCode)
  var users []*User
  err := json.Unmarshal(rr.Body.Bytes(), &users)
  assert.Nil(t, err)
  assert.Len(t, users, 2)
  assert.Equal(t, "User A", users[0].Name)
}

func TestUpdateUser_api(t *testing.T) {
  userID := uuid.New()

  updateBody := UserUpdateRequest{Name: "Jose", ID: userID}
  sessionArg := sessions.BoardSessionUpdateRequest{User: userID}
  mockUpdatedUser := &User{ID: userID, Name: "Jose", AccountType: common.Anonymous}

  mockUserService := NewMockUserService(t)
  mockSessionService := sessions.NewMockSessionService(t)

  mockUserService.EXPECT().Update(mock.Anything, updateBody).Return(mockUpdatedUser, nil)
  mockSessionService.EXPECT().UpdateUserBoards(mock.Anything, sessionArg).Return(nil, nil)

  userApi := NewUserApi(mockUserService, mockSessionService, true, true)
  rr := httptest.NewRecorder()

  bodyBytes, _ := json.Marshal(updateBody)
  req := technical_helper.NewTestRequestBuilder("PUT", "/", bytes.NewReader(bodyBytes)).
    AddToContext(identifiers.UserIdentifier, userID)

  userApi.Update(rr, req.Request())

  assert.Equal(t, http.StatusOK, rr.Result().StatusCode)
  var user User
  err := json.Unmarshal(rr.Body.Bytes(), &user)
  assert.Nil(t, err)
  assert.Equal(t, mockUpdatedUser.Name, user.Name)
}
