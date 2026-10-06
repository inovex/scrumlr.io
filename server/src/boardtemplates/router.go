package boardtemplates

import (
	"net/http"

	"github.com/go-chi/chi/v5"
)

type BoardTemplateApi interface {
	CreateBoardTemplate(w http.ResponseWriter, r *http.Request)
	GetBoardTemplate(w http.ResponseWriter, r *http.Request)
	GetBoardTemplates(w http.ResponseWriter, r *http.Request)
	UpdateBoardTemplate(w http.ResponseWriter, r *http.Request)
	DeleteBoardTemplate(w http.ResponseWriter, r *http.Request)
	BoardTemplateContext(next http.Handler) http.Handler
}

type Router struct {
	boardTemplateAPI BoardTemplateApi
  columnRouter     chi.Router
}

func NewBoardTemplateRouter(boardTemplateApi BoardTemplateApi) *Router {
	r := new(Router)
	r.boardTemplateAPI = boardTemplateApi
	return r
}

func (r *Router) RegisterRoutes() chi.Router {
	router := chi.NewRouter()

	router.Post("/", r.boardTemplateAPI.CreateBoardTemplate)
	router.Get("/", r.boardTemplateAPI.GetBoardTemplates)

  router.Route("/{id}", func(sub chi.Router) {
    sub.Use(r.boardTemplateAPI.BoardTemplateContext)

    sub.Get("/", r.boardTemplateAPI.GetBoardTemplate)
    sub.Put("/", r.boardTemplateAPI.UpdateBoardTemplate)
    sub.Delete("/", r.boardTemplateAPI.DeleteBoardTemplate)
  })
	return router
}
