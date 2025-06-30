package notes

import (
	"github.com/go-chi/chi/v5"
	"net/http"
)

type NotesAPI interface {
	Create(w http.ResponseWriter, r *http.Request)
	Get(w http.ResponseWriter, r *http.Request)
	GetAll(w http.ResponseWriter, r *http.Request)
	Update(w http.ResponseWriter, r *http.Request)
	Delete(w http.ResponseWriter, r *http.Request)
}
type NotesRouter struct {
	notesAPI NotesAPI
}

// todo: implement the missing middleware
func (r *NotesRouter) RegisterRoutes(router chi.Router) {
	router.Route("/notes", func(router chi.Router) {
		//r.Use(s.BoardParticipantContext)

		router.Get("/", r.notesAPI.GetAll)
		//router.With(s.BoardEditableContext).Post("/", r.notesAPI.Create)

		router.Route("/{note}", func(router chi.Router) {
			//r.Use(s.NoteContext)

			router.Get("/", r.notesAPI.Get)
			//router.With(s.BoardEditableContext).Put("/", r.notesAPI.Update)
			//router.With(s.BoardEditableContext).Delete("/", r.notesAPI.Delete)
		})
	})
}

func NewNotesRouter(notesAPI NotesAPI) *NotesRouter {
	return &NotesRouter{
		notesAPI: notesAPI,
	}
}
