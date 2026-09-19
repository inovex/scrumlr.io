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
}

type Router struct {
	boardTemplateAPI BoardTemplateApi
}

func (r *Router) RegisterRoutes() chi.Router {
	router := chi.NewRouter()
	router.Post("/", r.boardTemplateAPI.CreateBoardTemplate)
	router.Get("/{id}", r.boardTemplateAPI.GetBoardTemplate)
	router.Get("/", r.boardTemplateAPI.GetBoardTemplates)
	router.Put("/{id}", r.boardTemplateAPI.UpdateBoardTemplate)
	router.Delete("/{id}", r.boardTemplateAPI.DeleteBoardTemplate)
	return router
}

func NewBoardTemplateRouter(boardTemplateApi BoardTemplateApi) *Router {
	r := new(Router)
	r.boardTemplateAPI = boardTemplateApi
	return r
}
