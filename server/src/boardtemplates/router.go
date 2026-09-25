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
	router.With(r.boardTemplateAPI.BoardTemplateContext).Get("/{id}", r.boardTemplateAPI.GetBoardTemplate)
	router.With(r.boardTemplateAPI.BoardTemplateContext).Put("/{id}", r.boardTemplateAPI.UpdateBoardTemplate)
	router.With(r.boardTemplateAPI.BoardTemplateContext).Delete("/{id}", r.boardTemplateAPI.DeleteBoardTemplate)
	return router
}
