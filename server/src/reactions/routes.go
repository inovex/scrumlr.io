package reactions

import (
	"github.com/go-chi/chi/v5"
	"net/http"
)

type ReactionAPI interface {
	createReaction(w http.ResponseWriter, r *http.Request)
	getReaction(w http.ResponseWriter, r *http.Request)
	removeReaction(w http.ResponseWriter, r *http.Request)
	updateReaction(w http.ResponseWriter, r *http.Request)
}

type ReactionRouter struct {
	reactionAPI ReactionAPI
}

// todo: implement the missing middleware
func (r *ReactionRouter) RegisterRoutes(router chi.Router) {
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

func NewReactionRouter(reactionAPI ReactionAPI) *ReactionRouter {
	return &ReactionRouter{
		reactionAPI: reactionAPI,
	}
}
