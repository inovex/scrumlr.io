package health

import (
	"net/http"

	"github.com/go-chi/chi/v5"
)

type HealthApi interface {
	Check(w http.ResponseWriter, r *http.Request)
}

type Router struct {
	healthApi HealthApi
}

func NewHealthRouter(healthApi HealthApi) *Router {
	r := new(Router)
	r.healthApi = healthApi

	return r
}

func (r *Router) RegisterRoutes() chi.Router {
	router := chi.NewRouter()

	router.Get("/", r.healthApi.Check)

	return router
}
