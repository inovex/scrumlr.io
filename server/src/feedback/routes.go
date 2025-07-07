package feedback

import (
	"github.com/go-chi/chi/v5"
	"net/http"
)

type FeedbackAPI interface {
	createFeedback(w http.ResponseWriter, r *http.Request)
}

type FeedbackRouter struct {
	feedbackAPI FeedbackAPI
}

// todo: implement the missing middleware
func (r *FeedbackRouter) RegisterRoutes(router chi.Router) {
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

func NewFeedbackRouter(feedbackAPI FeedbackAPI) *FeedbackRouter {
	return &FeedbackRouter{
		feedbackAPI: feedbackAPI,
	}
}
