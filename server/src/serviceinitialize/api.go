package serviceinitialize

import (
	"github.com/go-chi/chi/v5"
	"scrumlr.io/server/middleware"
	"scrumlr.io/server/sessions"
	"scrumlr.io/server/users"
)

type ApiInitializer struct {
	middleware middleware.ContextService
	r          chi.Router
	basePath   string
}

func NewApiInitializer(middleware middleware.ContextService, r chi.Router, basePath string) ApiInitializer {
	initializer := new(ApiInitializer)
	initializer.middleware = middleware
	initializer.r = r
	initializer.basePath = basePath
	return *initializer
}

func (init *ApiInitializer) InitializeBoardApi() {
	panic("Not implemented")
}

func (init *ApiInitializer) InitializeColumnApi() {
	panic("Not implemented")

}

func (init *ApiInitializer) InitializeBoardReactionApi() {
	panic("Not implemented")

}

func (init *ApiInitializer) InitializeBoardTemplateApi() {
	panic("Not implemented")

}

func (init *ApiInitializer) InitializeColumnTemplateApi() {

}

func (init *ApiInitializer) InitializeFeedbackApi() {

}

func (init *ApiInitializer) InitializeHealthApi() {
	panic("Not implemented")

}

func (init *ApiInitializer) InitializeReactionApi() {
	panic("Not implemented")

}

func (init *ApiInitializer) InitializeSessionApi(sessionService sessions.SessionService) sessions.SessionApi {
	sessionApi := sessions.NewSessionApi(sessionService)
	return sessionApi
}

func (init *ApiInitializer) InitializeSessionRequestApi() {
	panic("Not implemented")

}

func (init *ApiInitializer) InitializeUserApi(userService users.UserService, sessionService sessions.SessionService, allowAnonymousBoardCreation, allowAnonymousCustomTemplates bool) users.UsersApi {
	usersApi := users.NewUsersAPI(userService, sessionService, init.basePath, allowAnonymousBoardCreation, allowAnonymousCustomTemplates)
	return usersApi
}

func (init *ApiInitializer) InitializeNotesApi() {
	panic("Not implemented")
}

func (init *ApiInitializer) InitializeVotingApi() {
	panic("Not implemented")
}
