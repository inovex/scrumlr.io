package columntemplates

import (
	"net/http"

	"github.com/go-chi/chi/v5"
)

type ColumnTemplateApi interface {
	CreateColumnTemplate(w http.ResponseWriter, r *http.Request)
	GetColumnTemplate(w http.ResponseWriter, r *http.Request)
	GetColumnTemplates(w http.ResponseWriter, r *http.Request)
	UpdateColumnTemplate(w http.ResponseWriter, r *http.Request)
	DeleteColumnTemplate(w http.ResponseWriter, r *http.Request)
}

type Router struct {
	columnTemplateAPI ColumnTemplateApi
}

func (r *Router) RegisterRoutes() chi.Router {
	router := chi.NewRouter()
	router.Post("/", r.columnTemplateAPI.CreateColumnTemplate)
	router.Get("/{id}", r.columnTemplateAPI.GetColumnTemplate)
	router.Get("/", r.columnTemplateAPI.GetColumnTemplates)
	router.Put("/{id}", r.columnTemplateAPI.UpdateColumnTemplate)
	router.Delete("/{id}", r.columnTemplateAPI.DeleteColumnTemplate)
	return router
}

func NewColumnTemplateRouter(columnTemplateApi ColumnTemplateApi) *Router {
	r := new(Router)
	r.columnTemplateAPI = columnTemplateApi
	return r
}
