package feedback

import (
	"net/http"

	"github.com/go-chi/chi/v5"
)

type FeedbackApi interface {
	CreateFeedback(w http.ResponseWriter, r *http.Request)
}

type Router struct {
	feedBackApi FeedbackApi
}

func NewFeedbackRouter(feedbackApi FeedbackApi) *Router {
	r := new(Router)
	r.feedBackApi = feedbackApi

	return r
}

func (r *Router) RegisterRoutes() chi.Router {
	router := chi.NewRouter()

	router.Post("/", r.feedBackApi.CreateFeedback)

	return router
}
