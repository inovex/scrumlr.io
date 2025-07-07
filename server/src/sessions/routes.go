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
	//router.Route("/columns", func(router chi.Router) {
	//	router.With(s.BoardParticipantContext).Get("/", s.getColumns)
	//	router.With(s.BoardModeratorContext).Post("/", s.createColumn)
	//
	//	router.Route("/{column}", func(r chi.Router) {
	//		router.Use(s.ColumnContext)
	//
	//		router.With(s.BoardParticipantContext).Get("/", s.getColumn)
	//		router.With(s.BoardModeratorContext).Put("/", s.updateColumn)
	//		router.With(s.BoardModeratorContext).Delete("/", s.deleteColumn)
	//	})
	//})
}

func NewSessionRouter(sessionRequestsAPI SessionAPI, userAPI UserAPI) *SessionRouter {
	return &SessionRouter{
		sessionRequestsAPI: sessionRequestsAPI,
		userAPI:            userAPI,
	}
}
