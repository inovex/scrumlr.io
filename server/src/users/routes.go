package users

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"scrumlr.io/server/sessions"
)

type UsersApi interface {
	GetUser(w http.ResponseWriter, r *http.Request)
	GetUserByID(w http.ResponseWriter, r *http.Request)
	GetUsersFromBoard(w http.ResponseWriter, r *http.Request)
	Update(w http.ResponseWriter, r *http.Request)
	Delete(w http.ResponseWriter, r *http.Request)

	BoardAuthenticatedContext(next http.Handler) http.Handler
	AnonymousBoardCreationContext(next http.Handler) http.Handler
	AnonymousCustomTemplateCreationContext(next http.Handler) http.Handler
}
type Router struct {
	usersApi   UsersApi
	sessionApi sessions.SessionApi
}

func (r *Router) RegisterRoutes() chi.Router {
	router := chi.NewRouter()
	router.Route("/users", func(router chi.Router) {
		router.Get("/", r.usersApi.GetUser)
		router.Get("/{user}", r.usersApi.GetUserByID)
		router.Put("/", r.usersApi.Update)
		router.With(r.sessionApi.BoardParticipantContext).Get("/board/{id}", r.usersApi.GetUsersFromBoard)
	})
	return router
}

func NewUsersRouter(usersApi UsersApi, sessionApi sessions.SessionApi) *Router {
	r := new(Router)
	r.usersApi = usersApi
	r.sessionApi = sessionApi
	return r
}
