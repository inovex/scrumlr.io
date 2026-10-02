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
	ColumnTemplateContext(next http.Handler) http.Handler
}

type Router struct {
	columnTemplateAPI ColumnTemplateApi
}

func NewColumnTemplateRouter(columnTemplateApi ColumnTemplateApi) *Router {
	r := new(Router)
	r.columnTemplateAPI = columnTemplateApi
	return r
}

func (r *Router) RegisterRoutes() chi.Router {
	router := chi.NewRouter()
	router.Post("/", r.columnTemplateAPI.CreateColumnTemplate)
	router.With(r.columnTemplateAPI.ColumnTemplateContext).Get("/{id}", r.columnTemplateAPI.GetColumnTemplate)
	router.Get("/", r.columnTemplateAPI.GetColumnTemplates)
	router.With(r.columnTemplateAPI.ColumnTemplateContext).Put("/{id}", r.columnTemplateAPI.UpdateColumnTemplate)
	router.With(r.columnTemplateAPI.ColumnTemplateContext).Delete("/{id}", r.columnTemplateAPI.DeleteColumnTemplate)
	return router
}
