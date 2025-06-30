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
	//todo: add middleware
}

func (n *NotesRouter) RegisterRoutes(r chi.Router) {
	r.Route("/notes", func(r chi.Router) {
		//r.Use(n.BoardParticipantContext)

		r.Get("/", n.notesAPI.Get)
		r.Post("/", n.notesAPI.Create)

		//r.Route("/{note}", func(r chi.Router) {
		//  r.Use(n.NoteContext)
		//
		//  r.Get("/", n.getNote)
		//  r.With(n.BoardEditableContext).Put("/", n.updateNote)
		//  r.With(n.BoardEditableContext).Delete("/", n.deleteNote)
		//})
	})
}

func NewNotesRouter(notesAPI NotesAPI) *NotesRouter {
	return &NotesRouter{
		notesAPI: notesAPI,
	}
}
