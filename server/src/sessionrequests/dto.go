package sessionrequests

import (
	"net/http"
	"scrumlr.io/server/users"

	"github.com/google/uuid"
)

type BoardSessionRequest struct {
	User   users.User    `json:"user"`
	Status RequestStatus `json:"status"`
}

type BoardSessionRequestUpdate struct {
	Status RequestStatus `json:"status"`
	Board  uuid.UUID     `json:"-"`
	User   uuid.UUID     `json:"-"`
}

func (r *BoardSessionRequest) From(request DatabaseBoardSessionRequest) *BoardSessionRequest {
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

func BoardSessionRequests(requests []DatabaseBoardSessionRequest) []*BoardSessionRequest {
	if requests == nil {
		return nil
	}

	list := make([]*BoardSessionRequest, len(requests))
	for index, request := range requests {
		list[index] = new(BoardSessionRequest).From(request)
	}
	return list
}
