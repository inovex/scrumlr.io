package sessionrequests

import (
	"context"
	"net/http"

	"github.com/google/uuid"
)

type API struct {
	service  SessionRequestService
	basePath string
}

type SessionRequestService interface {
	Create(ctx context.Context, boardID, userID uuid.UUID) (*BoardSessionRequest, error)
	Update(ctx context.Context, body BoardSessionRequestUpdate) (*BoardSessionRequest, error)
	Get(ctx context.Context, boardID, userID uuid.UUID) (*BoardSessionRequest, error)
	GetAll(ctx context.Context, boardID uuid.UUID, statusQuery string) ([]*BoardSessionRequest, error)
	Exists(ctx context.Context, boardID, userID uuid.UUID) (bool, error)
	OpenSocket(w http.ResponseWriter, r *http.Request)
}

func (s API) getBoardSessionRequest(w http.ResponseWriter, r *http.Request) {
	//TODO implement me
	panic("implement me")
}

func (s API) getBoardSessionRequests(w http.ResponseWriter, r *http.Request) {
	//TODO implement me
	panic("implement me")
}

func (s API) updateBoardSessionRequest(w http.ResponseWriter, r *http.Request) {
	//TODO implement me
	panic("implement me")
}

func NewSessionRequestAPI(service SessionRequestService, basePath string) SessionRequestAPI {
	api := &API{service: service, basePath: basePath}
	return api
}
