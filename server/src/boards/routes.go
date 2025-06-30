package boards

import (
	"github.com/go-chi/chi/v5"
	"net/http"
)

type BoardAPI interface {
	Create(w http.ResponseWriter, r *http.Request)
	Get(w http.ResponseWriter, r *http.Request)
	GetAll(w http.ResponseWriter, r *http.Request)
	Update(w http.ResponseWriter, r *http.Request)
	Delete(w http.ResponseWriter, r *http.Request)
	Join(w http.ResponseWriter, r *http.Request)

	SetTimer(w http.ResponseWriter, r *http.Request)
	DeleteTimer(w http.ResponseWriter, r *http.Request)
	IncrementTimer(w http.ResponseWriter, r *http.Request)

	Export(w http.ResponseWriter, r *http.Request)
	Import(w http.ResponseWriter, r *http.Request)
}
type BoardsRouter struct {
	boardAPI BoardAPI
}

// todo: implement the missing middleware
func (r *BoardsRouter) RegisterRoutes(router chi.Router) {

	router.Post("/boards", r.boardAPI.Create)
	router.Post("/import", r.boardAPI.Import)
	router.Get("/boards", r.boardAPI.GetAll)
	router.Route("/boards/{id}", func(r chi.Router) {
		//router.With(s.BoardParticipantContext).Get("/", r.)
		//router.With(s.BoardParticipantContext).Get("/export", r.exportBoard)
		//router.With(s.BoardModeratorContext).Post("/timer", r.setTimer)
		//router.With(s.BoardModeratorContext).Delete("/timer", r.deleteTimer)
		//router.With(s.BoardModeratorContext).Post("/timer/increment", r.incrementTimer)
		//router.With(s.BoardModeratorContext).Put("/", r.updateBoard)
		//router.With(s.BoardModeratorContext).Delete("/", r.deleteBoard)

	})
}
func NewBoardsRouter(notesAPI BoardAPI) *BoardsRouter {
	return &BoardsRouter{
		boardAPI: notesAPI,
	}
}
