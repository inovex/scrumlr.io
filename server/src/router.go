package main

import (
	"github.com/go-chi/chi/v5"
)

type Router interface {
	RegisterRoutes(r chi.Router)
}

func RegisterRoutes(routers []Router) chi.Router {
	r := chi.NewRouter()

	for _, route := range routers {
		route.RegisterRoutes(r)
	}

	return r
}
