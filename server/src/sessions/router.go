package sessions

import (
	"net/http"

	"github.com/go-chi/chi/v5"
)

type SessionApi interface {
	GetBoardSessions(w http.ResponseWriter, r *http.Request)
	GetBoardSession(w http.ResponseWriter, r *http.Request)
	UpdateBoardSession(w http.ResponseWriter, r *http.Request)
	UpdateBoardSessions(w http.ResponseWriter, r *http.Request)
	BoardParticipantContext(next http.Handler) http.Handler
	BoardModeratorContext(next http.Handler) http.Handler
}
type Router struct {
	sessionAPI SessionApi
}

func (r *Router) RegisterRoutes() chi.Router {
	router := chi.NewRouter()
	router.With(r.sessionAPI.BoardParticipantContext).Get("/", r.sessionAPI.GetBoardSessions)
	router.With(r.sessionAPI.BoardModeratorContext).Put("/", r.sessionAPI.UpdateBoardSessions)

	router.Route("/{session}", func(router chi.Router) {
		router.Use(r.sessionAPI.BoardParticipantContext)
		router.Get("/", r.sessionAPI.GetBoardSession)
		router.Put("/", r.sessionAPI.UpdateBoardSession)
	})
	return router
}

func NewSessionRouter(sessionApi SessionApi) *Router {
	return &Router{
		sessionAPI: sessionApi,
	}
}
