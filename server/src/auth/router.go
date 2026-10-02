package auth

import (
	"net/http"

	"github.com/go-chi/chi/v5"
)

type AuthApi interface {
	SignInAnonymously(w http.ResponseWriter, r *http.Request)
	BeginAuthProviderVerification(w http.ResponseWriter, r *http.Request)
	VerifyAuthProviderCallback(w http.ResponseWriter, r *http.Request)
	Logout(w http.ResponseWriter, r *http.Request)
}

type Router struct {
	authApi AuthApi
}

func NewAuthRouter(authApi AuthApi) *Router {
	r := new(Router)
	r.authApi = authApi

	return r
}

func (r *Router) RegisterRoutes() chi.Router {
	router := chi.NewRouter()

	router.Delete("/", r.authApi.Logout)
	router.With( /* TODO */ ).Post("/anonymous", r.authApi.SignInAnonymously)
	router.Route("/{provider}", func(router chi.Router) {
		router.Get("/", r.authApi.BeginAuthProviderVerification)
		router.Get("/callback", r.authApi.VerifyAuthProviderCallback)
	})

	return router
}
