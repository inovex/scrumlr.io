package serviceinitialize

import (
	"github.com/go-chi/chi/v5"
	"scrumlr.io/server/sessions"
	"scrumlr.io/server/users"
)

type RoutesInitializer struct {
}

func NewRoutesInitializer() RoutesInitializer {
	initializer := new(RoutesInitializer)

	return *initializer
}

func (init *RoutesInitializer) InitializeBoardRoutes() {
	// board routes are currently not initialized through the route initializer
	panic("Not implemented")
}

func (init *RoutesInitializer) InitializeColumnRoutes() {
	// column routes are currently not initialized through the route initializer
	panic("Not implemented")
}

func (init *RoutesInitializer) InitializeBoardReactionRoutes() {
	// board reaction routes are currently not initialized through the route initializer
	panic("Not implemented")
}

func (init *RoutesInitializer) InitializeBoardTemplateRoutes() {
	// board template routes are currently not initialized through the route initializer
	panic("Not implemented")
}

func (init *RoutesInitializer) InitializeColumnTemplateRoutes() {
	// column template routes are currently not initialized through the route initializer
	panic("Not implemented")
}

func (init *RoutesInitializer) InitializeFeedbackRoutes() {
	// feedback routes are currently not initialized through the route initializer
	panic("Not implemented")
}

func (init *RoutesInitializer) InitializeHealthRoutes() {
	// health routes are currently not initialized through the route initializer
	panic("Not implemented")
}

func (init *RoutesInitializer) InitializeReactionRoutes() {
	// reaction routes are currently not initialized through the route initializer
	panic("Not implemented")
}

func (init *RoutesInitializer) InitializeSessionRoutes(sessionApi sessions.SessionApi) chi.Router {
	router := sessions.NewSessionRouter(sessionApi).RegisterRoutes()
	return router
}

func (init *RoutesInitializer) InitializeSessionRequestRoutes() {
	// session request routes are currently not initialized through the route initializer
	panic("Not implemented")
}

func (init *RoutesInitializer) InitializeUserRoutes(userApi users.UsersApi, sessionApi sessions.SessionApi) chi.Router {
	router := users.NewUsersRouter(userApi, sessionApi).RegisterRoutes()
	return router
}

func (init *RoutesInitializer) InitializeNotesRoutes() {
	// note routes routes are currently not initialized through the route initializer
	panic("Not implemented")
}

func (init *RoutesInitializer) InitializeVotingRoutes() {
	// voting routes are currently not initialized through the route initializer
	panic("Not implemented")
}
