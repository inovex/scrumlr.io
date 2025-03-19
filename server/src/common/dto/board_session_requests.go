package dto

import (
	"net/http"

	"github.com/google/uuid"
	"scrumlr.io/server/database"
	"scrumlr.io/server/database/types"
	"scrumlr.io/server/users"
)

type BoardSessionRequest struct {
	User   users.User                      `json:"user"`
	Status types.BoardSessionRequestStatus `json:"status"`
}

func (r *BoardSessionRequest) From(request database.BoardSessionRequest) *BoardSessionRequest {
	r.User = users.User{
		ID:   request.User,
		Name: request.Name,
	}
	r.Status = request.Status
	return r
}

func (*BoardSessionRequest) Render(_ http.ResponseWriter, _ *http.Request) error {
	return nil
}

func BoardSessionRequests(requests []database.BoardSessionRequest) []*BoardSessionRequest {
	if requests == nil {
		return nil
	}

	list := make([]*BoardSessionRequest, len(requests))
	for index, request := range requests {
		list[index] = new(BoardSessionRequest).From(request)
	}
	return list
}

type BoardSessionRequestUpdate struct {
	Status types.BoardSessionRequestStatus `json:"status"`
	Board  uuid.UUID                       `json:"-"`
	User   uuid.UUID                       `json:"-"`
}
