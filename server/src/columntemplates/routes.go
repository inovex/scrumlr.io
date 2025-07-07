package columntemplates

import (
	"github.com/go-chi/chi/v5"
	"net/http"
)

type ColumnTemplateAPI interface {
	createColumnTemplate(w http.ResponseWriter, r *http.Request)
	getColumnTemplate(w http.ResponseWriter, r *http.Request)
	getColumnTemplates(w http.ResponseWriter, r *http.Request)
	updateColumnTemplate(w http.ResponseWriter, r *http.Request)
	deleteColumnTemplate(w http.ResponseWriter, r *http.Request)
}
type ColumnTemplateRouter struct {
	columnTemplatesAPI ColumnTemplateAPI
}

// todo: implement the missing middleware
func (r *ColumnTemplateRouter) RegisterRoutes(router chi.Router) {

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
func NewColumnTemplateRouter(columnTemplateAPI ColumnTemplateAPI) *ColumnTemplateRouter {
	return &ColumnTemplateRouter{
		columnTemplatesAPI: columnTemplateAPI,
	}
}
