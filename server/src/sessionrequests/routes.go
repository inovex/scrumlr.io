package sessionrequests

import (
	"github.com/go-chi/chi/v5"
	"net/http"
)

type SessionRequestAPI interface {
	getBoardSessionRequest(w http.ResponseWriter, r *http.Request)
	getBoardSessionRequests(w http.ResponseWriter, r *http.Request)
	updateBoardSessionRequest(w http.ResponseWriter, r *http.Request)
}
type SessionRequestRouter struct {
	sessionRequestsAPI SessionRequestAPI
}

// todo: implement the missing middleware
func (r *SessionRequestRouter) RegisterRoutes(router chi.Router) {
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
func NewSessionRequestRouter(sessionRequestsAPI SessionRequestAPI) *SessionRequestRouter {
	return &SessionRequestRouter{
		sessionRequestsAPI: sessionRequestsAPI,
	}
}
