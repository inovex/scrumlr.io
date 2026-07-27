package swagger

import (
	"github.com/go-chi/chi/v5"
	httpSwagger "github.com/swaggo/http-swagger"
)

type Router struct {
	basePath string
}

func InitializeSwagger(basePath string) *Router {
	SwaggerInfo.BasePath = basePath
	router := new(Router)

	router.basePath = ""
	if basePath != "/" {
		router.basePath = basePath
	}

	return router
}

func (r *Router) RegisterRoutes() chi.Router {
	router := chi.NewRouter()
	router.Get("/*", httpSwagger.Handler(
		httpSwagger.URL(r.basePath+"/swagger/doc.json"),
	))

	return router
}
