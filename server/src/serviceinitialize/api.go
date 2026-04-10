package serviceinitialize

import (
	"scrumlr.io/server/auth"
	"scrumlr.io/server/sessions"
	"scrumlr.io/server/users"
)

type ApiInitializer struct {
	basePath             string
	hostPath             string
	allowedRedirectHosts []string
}

func NewApiInitializer(hostPath string, basePath string, allowedRedirectHosts []string) ApiInitializer {
	initializer := new(ApiInitializer)
	initializer.hostPath = hostPath
	initializer.basePath = basePath
	initializer.allowedRedirectHosts = allowedRedirectHosts
	return *initializer
}

func (init *ApiInitializer) InitializeAuthApi(authService auth.AuthService, userService users.UserService) auth.AuthApi {
	authApi := auth.NewAuthApi(authService, userService, init.hostPath, init.basePath, init.allowedRedirectHosts)
	return authApi
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
	usersApi := users.NewUserApi(userService, sessionService, allowAnonymousBoardCreation, allowAnonymousCustomTemplates)
	return usersApi
}

func (init *ApiInitializer) InitializeNotesApi() {
	panic("Not implemented")
}

func (init *ApiInitializer) InitializeVotingApi() {
	panic("Not implemented")
}
