package dto

import (
	"github.com/google/uuid"
	"net/http"
	"scrumlr.io/server/database"
)

// Assign is the response for all assign requests.
type Assignment struct {
	ID    uuid.UUID `json:"id"`
	Board uuid.UUID `json:"board"`
	Note  uuid.UUID `json:"note"`
	Name  string    `json:"name"`
}

func (a *Assignment) From(assign database.Assignment) *Assignment {
	a.ID = assign.ID
  a.Board = assign.Board
	a.Note = assign.Note
	a.Name = assign.Name
	return a
}

func (*Assignment) Render(_ http.ResponseWriter, _ *http.Request) error {
	return nil
}

func Assignments(assignments []database.Assignment) []*Assignment {
	if assignments == nil {
		return nil
	}

	list := make([]*Assignment, len(assignments))
	for index, assignment := range assignments {
		list[index] = new(Assignment).From(assignment)
	}
	return list
}

// AssignRequest represents the request to add or delete an assign.
type AssignmentCreateRequest struct {
	Board uuid.UUID `json:"-"`
	Note  uuid.UUID `json:"note"`
	Name  string    `json:"name"`
}
