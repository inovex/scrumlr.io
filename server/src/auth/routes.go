package auth

import (
	"github.com/go-chi/chi/v5"
	"net/http"
)

type AuthAPI interface {
	getServerInfo(w http.ResponseWriter, r *http.Request)
}
type AuthRouter struct {
	authAPI AuthAPI
}

// todo: implement the missing middleware
func (r *AuthRouter) RegisterRoutes(router chi.Router) {
	router.Get("/info", r.authAPI.getServerInfo)

}
func NewAuthRouter(authAPI AuthAPI) *AuthRouter {
	return &AuthRouter{
		authAPI: authAPI,
	}
}
