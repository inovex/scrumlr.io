package dto

import (
	"github.com/google/uuid"
	"net/http"
	"scrumlr.io/server/database"
)

// Assign is the response for all assign requests.
type Assign struct {
	Board uuid.UUID `json:"board"`
	Note  uuid.UUID `json:"note"`
	Name  string    `json:"name"`
	Id    uuid.UUID `json:"id"`
}

func (a *Assign) From(assign database.Assign) *Assign {
	a.Note = assign.Note
	a.Name = assign.Name
	a.Id = assign.Id
	return a
}

func (*Assign) Render(_ http.ResponseWriter, _ *http.Request) error {
	return nil
}

func Assignings(assignings []database.Assign) []*Assign {
	if assignings == nil {
		return nil
	}

	list := make([]*Assign, len(assignings))
	for index, assign := range assignings {
		list[index] = new(Assign).From(assign)
	}
	return list
}

// AssignRequest represents the request to add or delete an assign.
type AssignRequest struct {
	Board uuid.UUID `json:"board"`
	Note  uuid.UUID `json:"note"`
	Name  string    `json:"name"`
	Id    uuid.UUID `json:"id"`
}
