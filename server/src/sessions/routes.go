package sessions

import (
  "github.com/go-chi/chi/v5"
  "net/http"
)

type SessionAPI interface {
  getBoardSession(w http.ResponseWriter, r *http.Request)
  getBoardSessions(w http.ResponseWriter, r *http.Request)
  updateBoardSession(w http.ResponseWriter, r *http.Request)
  updateBoardSessions(w http.ResponseWriter, r *http.Request)
}

type UserAPI interface {
  getUser(w http.ResponseWriter, r *http.Request)
  updateUser(w http.ResponseWriter, r *http.Request)
}
type SessionRouter struct {
  sessionRequestsAPI SessionAPI
  userAPI            UserAPI
}

// todo: implement the missing middleware
func (r *SessionRouter) RegisterRoutes(router chi.Router) {
  router.Route("/user", func(router chi.Router) {
    router.Get("/", r.userAPI.getUser)
    router.Put("/", r.userAPI.updateUser)
  })
  router.Route("/participants", func(router chi.Router) {
    router.With(s.BoardParticipantContext).Get("/", r.sessionRequestsAPI.getBoardSessions)
    router.With(s.BoardModeratorContext).Put("/", r.sessionRequestsAPI.updateBoardSessions)
    router.Route("/{session}", func(router chi.Router) {
      router.Use(s.BoardParticipantContext)
      router.Get("/", r.sessionRequestsAPI.getBoardSession)
      router.Put("/", r.sessionRequestsAPI.updateBoardSession)
    })
  }
}

func NewSessionRouter(sessionRequestsAPI SessionAPI, userAPI UserAPI) *SessionRouter {
  return &SessionRouter{
    sessionRequestsAPI: sessionRequestsAPI,
    userAPI:            userAPI,
  }
}
