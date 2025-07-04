package columns

import (
  "github.com/go-chi/chi/v5"
  "net/http"
)

type ColumnAPI interface {
  Create(w http.ResponseWriter, r *http.Request)
  Get(w http.ResponseWriter, r *http.Request)
  GetAll(w http.ResponseWriter, r *http.Request)
  Update(w http.ResponseWriter, r *http.Request)
  Delete(w http.ResponseWriter, r *http.Request)
}
type ColumnRouter struct {
  columnAPI ColumnAPI
}

// todo: implement the missing middleware
func (r *ColumnRouter) RegisterRoutes(router chi.Router) {
  //router.Route("/columns", func(router chi.Router) {
  //	router.With(s.BoardParticipantContext).Get("/", s.getColumns)
  //	router.With(s.BoardModeratorContext).Post("/", s.createColumn)
  //
  //	router.Route("/{column}", func(r chi.Router) {
  //		router.Use(s.ColumnContext)
  //
  //		router.With(s.BoardParticipantContext).Get("/", s.getColumn)
  //		router.With(s.BoardModeratorContext).Put("/", s.updateColumn)
  //		router.With(s.BoardModeratorContext).Delete("/", s.deleteColumn)
  //	})
  //})
}
func NewBoardsRouter(notesAPI ColumnAPI) *ColumnRouter {
  return &ColumnRouter{
    columnAPI: notesAPI,
  }
}
