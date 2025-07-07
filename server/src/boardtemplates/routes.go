package boardtemplates

import (
	"github.com/go-chi/chi/v5"
	"net/http"
)

type BoardTemplateAPI interface {
	createBoardTemplate(w http.ResponseWriter, r *http.Request)
	getBoardTemplate(w http.ResponseWriter, r *http.Request)
	getBoardTemplates(w http.ResponseWriter, r *http.Request)
	updateBoardTemplate(w http.ResponseWriter, r *http.Request)
	deleteBoardTemplate(w http.ResponseWriter, r *http.Request)
}
type BoardTemplateRouter struct {
	boardTemplatesAPI BoardTemplateAPI
}

// todo: implement the missing middleware
func (r *BoardTemplateRouter) RegisterRoutes(router chi.Router) {

	//router.Post("/boards", r.boardAPI.Create)
	//router.Post("/import", r.boardAPI.Import)
	//router.Get("/boards", r.boardAPI.GetAll)
	//router.Route("/boards/{id}", func(r chi.Router) {
	//router.With(s.BoardParticipantContext).Get("/", r.)
	//router.With(s.BoardParticipantContext).Get("/export", r.exportBoard)
	//router.With(s.BoardModeratorContext).Post("/timer", r.setTimer)
	//router.With(s.BoardModeratorContext).Delete("/timer", r.deleteTimer)
	//router.With(s.BoardModeratorContext).Post("/timer/increment", r.incrementTimer)
	//router.With(s.BoardModeratorContext).Put("/", r.updateBoard)
	//router.With(s.BoardModeratorContext).Delete("/", r.deleteBoard)

	//})
}
func NewBoardTemplateRouter(boardTemplatesAPI BoardTemplateAPI) *BoardTemplateRouter {
	return &BoardTemplateRouter{
		boardTemplatesAPI: boardTemplatesAPI,
	}
}
