package health

import (
	"github.com/go-chi/chi/v5"
	"net/http"
)

type HealthAPI interface {
	healthCheck(w http.ResponseWriter, r *http.Request)
}

type HealthRouter struct {
	healthAPI HealthAPI
}

// todo: implement the missing middleware
func (r *HealthRouter) RegisterRoutes(router chi.Router) {
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

func NewFeedbackRouter(healthAPI HealthAPI) *HealthRouter {
	return &HealthRouter{
		healthAPI: healthAPI,
	}
}
