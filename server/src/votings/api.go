package votings

import (
	"context"
	"github.com/google/uuid"
	"net/http"
	"scrumlr.io/server/common/filter"
)

type API struct {
	service  VotingService
	basePath string
}

type VotingService interface {
	Create(ctx context.Context, body VotingCreateRequest) (*Voting, error)
	Update(ctx context.Context, body VotingUpdateRequest, affectedNotes []Note) (*Voting, error)
	Get(ctx context.Context, board, id uuid.UUID) (*Voting, error)
	GetAll(ctx context.Context, board uuid.UUID) ([]*Voting, error)
	GetOpen(ctx context.Context, board uuid.UUID) (*Voting, error)

	AddVote(ctx context.Context, req VoteRequest) (*Vote, error)
	RemoveVote(ctx context.Context, req VoteRequest) error
	GetVotes(ctx context.Context, f filter.VoteFilter) ([]*Vote, error)
}

func (A API) createVoting(writer http.ResponseWriter, request *http.Request) {
	//TODO implement me
	panic("implement me")
}

func (A API) updateVoting(writer http.ResponseWriter, request *http.Request) {
	//TODO implement me
	panic("implement me")
}

func (A API) getVoting(writer http.ResponseWriter, request *http.Request) {
	//TODO implement me
	panic("implement me")
}

func (A API) addVote(writer http.ResponseWriter, request *http.Request) {
	//TODO implement me
	panic("implement me")
}

func (A API) removeVote(writer http.ResponseWriter, request *http.Request) {
	//TODO implement me
	panic("implement me")
}

func (A API) getVotes(writer http.ResponseWriter, request *http.Request) {
	//TODO implement me
	panic("implement me")
}

func NewVotingAPI(service VotingService, basePath string) VotingAPI {
	api := &API{service: service, basePath: basePath}
	return api
}
