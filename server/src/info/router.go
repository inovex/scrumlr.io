package info

import (
	"net/http"

	"github.com/go-chi/chi/v5"
)

type InfoApi interface {
	GetInfo(w http.ResponseWriter, r *http.Request)
}

type Router struct {
	infoApi InfoApi
}

func NewInfoRouter(infoApi InfoApi) *Router {
	r := new(Router)
	r.infoApi = infoApi

	return r
}

func (r *Router) RegisterRoutes() chi.Router {
	router := chi.NewRouter()

	router.Get("/", r.infoApi.GetInfo)

	return router
}
