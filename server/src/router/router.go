package router

import (
	"github.com/go-chi/chi/v5"
)

type Router interface {
	RegisterRoutes(r chi.Router)
}
