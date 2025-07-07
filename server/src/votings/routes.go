package votings

import (
	"github.com/go-chi/chi/v5"
	"net/http"
)

type VotingAPI interface {
	createVoting(http.ResponseWriter, *http.Request)
	updateVoting(http.ResponseWriter, *http.Request)
	getVoting(http.ResponseWriter, *http.Request)

	addVote(http.ResponseWriter, *http.Request)
	removeVote(http.ResponseWriter, *http.Request)
	getVotes(http.ResponseWriter, *http.Request)
}

type VotingRouter struct {
	votingAPI VotingAPI
}

// todo: implement the missing middleware
func (r *VotingRouter) RegisterRoutes(router chi.Router) {
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

func NewVotingRouter(votingAPI VotingAPI) *VotingRouter {
	return &VotingRouter{
		votingAPI: votingAPI,
	}
}
