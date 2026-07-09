package serviceinitialize

import (
	"scrumlr.io/server/sessions"
	"scrumlr.io/server/users"
)

type ApiInitializer struct {
	basePath string
}

func NewApiInitializer(basePath string) ApiInitializer {
	initializer := new(ApiInitializer)
	initializer.basePath = basePath
	return *initializer
}

func (init *ApiInitializer) InitializeBoardApi() {
	// board api is currently not initialized through the api initializer
	panic("Not implemented")
}

func (init *ApiInitializer) InitializeColumnApi() {
	// column api is currently not initialized through the api initializer
	panic("Not implemented")
}

func (init *ApiInitializer) InitializeBoardReactionApi() {
	// board reaction api is currently not initialized through the api initializer
	panic("Not implemented")
}

func (init *ApiInitializer) InitializeBoardTemplateApi() {
	// board template api is currently not initialized through the api initializer
	panic("Not implemented")
}

func (init *ApiInitializer) InitializeColumnTemplateApi() {
	// column template api is currently not initialized through the api initializer
	panic("Not implemented")
}

func (init *ApiInitializer) InitializeFeedbackApi() {
	// feedback api is currently not initialized through the api initializer
	panic("Not implemented")
}

func (init *ApiInitializer) InitializeHealthApi() {
	// health api is currently not initialized through the api initializer
	panic("Not implemented")
}

func (init *ApiInitializer) InitializeReactionApi() {
	// reaction api is currently not initialized through the api initializer
	panic("Not implemented")
}

func (init *ApiInitializer) InitializeSessionApi(sessionService sessions.SessionService) sessions.SessionApi {
	sessionApi := sessions.NewSessionApi(sessionService)
	return sessionApi
}

func (init *ApiInitializer) InitializeSessionRequestApi() {
	// session request api is currently not initialized through the api initializer
	panic("Not implemented")
}

func (init *ApiInitializer) InitializeUserApi(userService users.UserService, sessionService sessions.SessionService, allowAnonymousBoardCreation, allowAnonymousCustomTemplates bool) users.UsersApi {
	usersApi := users.NewUserApi(userService, sessionService, allowAnonymousBoardCreation, allowAnonymousCustomTemplates)
	return usersApi
}

func (init *ApiInitializer) InitializeNotesApi() {
	// notes api is currently not initialized through the api initializer
	panic("Not implemented")
}

func (init *ApiInitializer) InitializeVotingApi() {
	// voting api is currently not initialized through the api initializer
	panic("Not implemented")
}
