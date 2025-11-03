package serviceinitialize

import (
	"github.com/go-chi/chi/v5"
	"scrumlr.io/server/middleware"
	"scrumlr.io/server/sessions"
	"scrumlr.io/server/users"
)

type RoutesInitializer struct {
	middleware middleware.ContextService
	r          chi.Router
	basePath   string
}

func NewRoutesInitializer(middleware middleware.ContextService) RoutesInitializer {
	initializer := new(RoutesInitializer)

	return *initializer
}

func (init *RoutesInitializer) InitializeBoardRoutes() {
	panic("Not implemented")
}

func (init *RoutesInitializer) InitializeColumnRoutes() {
	panic("Not implemented")

}

func (init *RoutesInitializer) InitializeBoardReactionRoutes() {
	panic("Not implemented")

}

func (init *RoutesInitializer) InitializeBoardTemplateRoutes() {
	panic("Not implemented")

}

func (init *RoutesInitializer) InitializeColumnTemplateRoutes() {

}

func (init *RoutesInitializer) InitializeFeedbackRoutes() {

}

func (init *RoutesInitializer) InitializeHealthRoutes() {
	panic("Not implemented")

}

func (init *RoutesInitializer) InitializeReactionRoutes() {
	panic("Not implemented")

}

func (init *RoutesInitializer) InitializeSessionRoutes(sessionApi sessions.SessionApi) chi.Router {
	router := sessions.NewSessionRouter(sessionApi).RegisterRoutes()
	return router
}

func (init *RoutesInitializer) InitializeSessionRequestRoutes() {
	panic("Not implemented")

}

func (init *RoutesInitializer) InitializeUserRoutes(userApi users.UsersApi, sessionApi sessions.SessionApi) chi.Router {
	router := users.NewUsersRouter(userApi, sessionApi).RegisterRoutes()
	return router
}

func (init *RoutesInitializer) InitializeNotesRoutes() {
	panic("Not implemented")
}

func (init *RoutesInitializer) InitializeVotingRoutes() {
	panic("Not implemented")
}
