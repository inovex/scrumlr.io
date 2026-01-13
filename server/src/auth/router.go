package auth

import (
	"net/http"

	"github.com/go-chi/chi/v5"
)

type AuthApi interface {
	SignInAnonymously(w http.ResponseWriter, r *http.Request)
	Logout(w http.ResponseWriter, r *http.Request)
	BeginAuth(w http.ResponseWriter, r *http.Request)
	Callback(w http.ResponseWriter, r *http.Request)
}

type Router struct {
	authAPI AuthApi
}

func (r *Router) RegisterRoutes() chi.Router {
	router := chi.NewRouter()

	router.Group(func(router chi.Router) {
		router.Delete("/", r.authAPI.Logout)
		router.Post("/anonymous", r.authAPI.SignInAnonymously)

		router.Route("/{provider}", func(router chi.Router) {
			router.Get("/", r.authAPI.BeginAuth)
			router.Get("/callback", r.authAPI.Callback)
		})
	})

	return router
}

func NewAuthRouter(authAPI AuthApi) *Router {
	r := new(Router)
	r.authAPI = authAPI
	return r
}
