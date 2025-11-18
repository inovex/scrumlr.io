package users

import (
	"bytes"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/go-chi/chi/v5"
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
	mockUserService.EXPECT().Get(mock.Anything, userId).Return(&User{ID: userId, AccountType: common.Anonymous}, nil)

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
	var user User
	err := json.Unmarshal(rr.Body.Bytes(), &user)
	assert.Nil(t, err)
	assert.Equal(t, userId, user.ID)
}

func TestGetUser_api_InvalidUUID(t *testing.T) {

	mockUserService := NewMockUserService(t)
	mockSessionService := sessions.NewMockSessionService(t)
	mockUserService.EXPECT().Get(mock.Anything, uuid.Nil).Return(nil, errors.New("uuid required"))

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	userApi := NewUserApi(mockUserService, mockSessionService, true, true)
	rr := httptest.NewRecorder()
	req := technical_helper.NewTestRequestBuilder("GET", "/", nil).
		AddToContext(identifiers.UserIdentifier, uuid.Nil)

	userApi.GetUser(rr, req.Request())
	assert.Equal(t, http.StatusInternalServerError, rr.Result().StatusCode)
}

func Test_GetUserByID(t *testing.T) {
	user := User{
		ID:          uuid.New(),
		Name:        "Joseph",
		Avatar:      nil,
		AccountType: common.Anonymous,
	}

	mockUserService := NewMockUserService(t)
	mockSessionService := sessions.NewMockSessionService(t)

	userApi := NewUserApi(mockUserService, mockSessionService, true, true)

	rr := httptest.NewRecorder()

	req := technical_helper.NewTestRequestBuilder("GET", "/", nil).
		AddToContext(identifiers.UserIdentifier, user.ID)

	rctx := chi.NewRouteContext()
	rctx.URLParams.Add("user", user.ID.String())
	req.AddToContext(chi.RouteCtxKey, rctx)

	mockUserService.EXPECT().Get(mock.Anything, user.ID).Return(&user, nil)

	userApi.GetUserByID(rr, req.Request())

	assert.Equal(t, http.StatusOK, rr.Result().StatusCode)
	var response User
	err := json.Unmarshal(rr.Body.Bytes(), &response)
	assert.Nil(t, err)
	assert.Equal(t, user, response)

}

func Test_GetUserByID_api_InvalidUUID(t *testing.T) {
	mockUserService := NewMockUserService(t)
	mockSessionService := sessions.NewMockSessionService(t)

	userApi := NewUserApi(mockUserService, mockSessionService, true, true)

	rr := httptest.NewRecorder()

	req := technical_helper.NewTestRequestBuilder("GET", "/", nil).
		AddToContext(identifiers.UserIdentifier, uuid.Nil)

	userApi.GetUserByID(rr, req.Request())

	assert.Equal(t, http.StatusInternalServerError, rr.Result().StatusCode)
}

func Test_GetUserByID_ServiceError(t *testing.T) {
	mockUserService := NewMockUserService(t)
	mockSessionService := sessions.NewMockSessionService(t)
	userId := uuid.New()
	userApi := NewUserApi(mockUserService, mockSessionService, true, true)

	rr := httptest.NewRecorder()

	req := technical_helper.NewTestRequestBuilder("GET", "/", nil).
		AddToContext(identifiers.UserIdentifier, userId)

	rctx := chi.NewRouteContext()
	rctx.URLParams.Add("user", userId.String())
	req.AddToContext(chi.RouteCtxKey, rctx)

	mockUserService.EXPECT().Get(mock.Anything, userId).Return(nil, errors.New("service error"))
	userApi.GetUserByID(rr, req.Request())

	assert.Equal(t, http.StatusInternalServerError, rr.Result().StatusCode)
}

func Test_GetBoardUsers_api(t *testing.T) {
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

func Test_GetBoardUsers_ServiceError(t *testing.T) {
	boardID := uuid.New()

	mockUserService := NewMockUserService(t)
	mockSessionService := sessions.NewMockSessionService(t)

	mockUserService.EXPECT().GetBoardUsers(mock.Anything, boardID).Return(nil, errors.New("db error"))

	userApi := NewUserApi(mockUserService, mockSessionService, true, true)
	rr := httptest.NewRecorder()

	req := technical_helper.NewTestRequestBuilder("GET", "/board/{id}", nil).AddToContext(identifiers.BoardIdentifier, boardID)

	userApi.GetUsersFromBoard(rr, req.Request())

	assert.Equal(t, http.StatusInternalServerError, rr.Result().StatusCode)

}

func Test_UpdateUser_api(t *testing.T) {
	userID := uuid.New()

	updateBody := UserUpdateRequest{Name: "Jose", ID: userID}
	mockUpdatedUser := &User{ID: userID, Name: "Jose", AccountType: common.Anonymous}

	mockUserService := NewMockUserService(t)
	mockSessionService := sessions.NewMockSessionService(t)

	mockUserService.EXPECT().Update(mock.Anything, updateBody).Return(mockUpdatedUser, nil)

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

func Test_UpdateUser_ServiceError(t *testing.T) {
	userID := uuid.New()

	updateBody := UserUpdateRequest{Name: "Jose", ID: userID}

	mockUserService := NewMockUserService(t)
	mockSessionService := sessions.NewMockSessionService(t)

	mockUserService.EXPECT().Update(mock.Anything, updateBody).Return(nil, errors.New("db error"))

	userApi := NewUserApi(mockUserService, mockSessionService, true, true)
	rr := httptest.NewRecorder()

	bodyBytes, _ := json.Marshal(updateBody)
	req := technical_helper.NewTestRequestBuilder("PUT", "/", bytes.NewReader(bodyBytes)).
		AddToContext(identifiers.UserIdentifier, userID)

	userApi.Update(rr, req.Request())

	assert.Equal(t, http.StatusInternalServerError, rr.Result().StatusCode)
}

func Test_UpdateUserBoards_ServiceError(t *testing.T) {
	userID := uuid.New()

	updateBody := UserUpdateRequest{Name: "Jose", ID: userID}
	mockUpdatedUser := &User{ID: userID, Name: "Jose", AccountType: common.Anonymous}

	mockUserService := NewMockUserService(t)
	mockSessionService := sessions.NewMockSessionService(t)

	mockUserService.EXPECT().Update(mock.Anything, updateBody).Return(mockUpdatedUser, nil)

	userApi := NewUserApi(mockUserService, mockSessionService, true, true)
	rr := httptest.NewRecorder()

	bodyBytes, _ := json.Marshal(updateBody)
	req := technical_helper.NewTestRequestBuilder("PUT", "/", bytes.NewReader(bodyBytes)).
		AddToContext(identifiers.UserIdentifier, userID)

	userApi.Update(rr, req.Request())

	assert.Equal(t, http.StatusOK, rr.Result().StatusCode)
}

func Test_BoardAuthenticatedContext(t *testing.T) {
	userId := uuid.New()
	boardId := uuid.New()

	mockUserService := NewMockUserService(t)
	mockSessionService := sessions.NewMockSessionService(t)
	userApi := NewUserApi(mockUserService, mockSessionService, true, true)
	rr := httptest.NewRecorder()
	req := technical_helper.NewTestRequestBuilder("GET", "/", nil).
		AddToContext(identifiers.UserIdentifier, userId)

	rctx := chi.NewRouteContext()
	rctx.URLParams.Add("id", boardId.String())
	req.AddToContext(chi.RouteCtxKey, rctx)

	mockUserService.EXPECT().Get(mock.Anything, userId).Return(&User{ID: userId, AccountType: common.Google}, nil)

	next := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})

	userApi.BoardAuthenticatedContext(next).ServeHTTP(rr, req.Request())

	assert.Equal(t, http.StatusOK, rr.Result().StatusCode)
}

func Test_BoardAuthenticatedContext_NotAuthenticated(t *testing.T) {
	userId := uuid.New()
	boardId := uuid.New()

	mockUserService := NewMockUserService(t)
	mockSessionService := sessions.NewMockSessionService(t)
	userApi := NewUserApi(mockUserService, mockSessionService, true, true)
	rr := httptest.NewRecorder()
	req := technical_helper.NewTestRequestBuilder("GET", "/", nil).
		AddToContext(identifiers.UserIdentifier, userId)

	rctx := chi.NewRouteContext()
	rctx.URLParams.Add("id", boardId.String())
	req.AddToContext(chi.RouteCtxKey, rctx)

	mockUserService.EXPECT().Get(mock.Anything, userId).Return(&User{ID: userId, AccountType: common.Anonymous}, nil)

	next := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})

	userApi.BoardAuthenticatedContext(next).ServeHTTP(rr, req.Request())

	assert.Equal(t, http.StatusForbidden, rr.Result().StatusCode)
	assert.Error(t, common.ForbiddenError(errors.New("not authorized")))
}

func Test_BoardAuthenticatedContext_InvalidBoardID(t *testing.T) {
	userId := uuid.New()
	boardId := "abc"

	mockUserService := NewMockUserService(t)
	mockSessionService := sessions.NewMockSessionService(t)
	userApi := NewUserApi(mockUserService, mockSessionService, true, true)
	rr := httptest.NewRecorder()
	req := technical_helper.NewTestRequestBuilder("GET", "/", nil).
		AddToContext(identifiers.UserIdentifier, userId)

	rctx := chi.NewRouteContext()
	rctx.URLParams.Add("id", boardId)
	req.AddToContext(chi.RouteCtxKey, rctx)

	next := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})

	userApi.BoardAuthenticatedContext(next).ServeHTTP(rr, req.Request())

	assert.Equal(t, http.StatusBadRequest, rr.Result().StatusCode)
	assert.Error(t, common.BadRequestError(errors.New("invalid board id")))
}

func Test_BoardAuthenticatedContext_InvalidUserID(t *testing.T) {
	userId := "abc"
	boardId := uuid.New()

	mockUserService := NewMockUserService(t)
	mockSessionService := sessions.NewMockSessionService(t)
	userApi := NewUserApi(mockUserService, mockSessionService, true, true)
	rr := httptest.NewRecorder()
	req := technical_helper.NewTestRequestBuilder("GET", "/", nil).
		AddToContext(identifiers.UserIdentifier, userId)

	rctx := chi.NewRouteContext()
	rctx.URLParams.Add("id", boardId.String())
	req.AddToContext(chi.RouteCtxKey, rctx)

	next := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})

	userApi.BoardAuthenticatedContext(next).ServeHTTP(rr, req.Request())

	assert.Equal(t, http.StatusBadRequest, rr.Result().StatusCode)
}

func Test_AnonymousBoardCreationContext(t *testing.T) {
	userId := uuid.New()

	mockUserService := NewMockUserService(t)
	mockSessionService := sessions.NewMockSessionService(t)
	userApi := NewUserApi(mockUserService, mockSessionService, true, true)
	rr := httptest.NewRecorder()
	req := technical_helper.NewTestRequestBuilder("GET", "/", nil).
		AddToContext(identifiers.UserIdentifier, userId)

	rctx := chi.NewRouteContext()
	rctx.URLParams.Add("id", userId.String())
	req.AddToContext(chi.RouteCtxKey, rctx)

	mockUserService.EXPECT().Get(mock.Anything, userId).Return(&User{ID: userId, AccountType: common.Anonymous}, nil)

	next := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})

	userApi.AnonymousBoardCreationContext(next).ServeHTTP(rr, req.Request())

	assert.Equal(t, http.StatusOK, rr.Result().StatusCode)
}

func Test_AnonymousBoardCreationContext_NotAllowed(t *testing.T) {
	userId := uuid.New()

	mockUserService := NewMockUserService(t)
	mockSessionService := sessions.NewMockSessionService(t)
	userApi := NewUserApi(mockUserService, mockSessionService, false, true)
	rr := httptest.NewRecorder()
	req := technical_helper.NewTestRequestBuilder("GET", "/", nil).
		AddToContext(identifiers.UserIdentifier, userId)

	rctx := chi.NewRouteContext()
	rctx.URLParams.Add("id", userId.String())

	mockUserService.EXPECT().Get(mock.Anything, userId).Return(&User{ID: userId, AccountType: common.Anonymous}, nil)

	next := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})

	userApi.AnonymousBoardCreationContext(next).ServeHTTP(rr, req.Request())

	assert.Equal(t, http.StatusForbidden, rr.Result().StatusCode)
	assert.Error(t, common.ForbiddenError(errors.New("not authorized to create boards anonymously")))
}

func Test_AnonymousCustomTemplateCreationContext_NotAllowed(t *testing.T) {
	userId := uuid.New()

	mockUserService := NewMockUserService(t)
	mockSessionService := sessions.NewMockSessionService(t)
	userApi := NewUserApi(mockUserService, mockSessionService, false, false)
	rr := httptest.NewRecorder()
	req := technical_helper.NewTestRequestBuilder("GET", "/", nil).
		AddToContext(identifiers.UserIdentifier, userId)

	mockUserService.EXPECT().Get(mock.Anything, userId).Return(&User{ID: userId, AccountType: common.Anonymous}, nil)

	next := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})

	userApi.AnonymousCustomTemplateCreationContext(next).ServeHTTP(rr, req.Request())

	assert.Equal(t, http.StatusForbidden, rr.Result().StatusCode)
	assert.Error(t, common.ForbiddenError(errors.New("not authorized to create custom templates anonymous")))
}
