package filter

import "github.com/google/uuid"

type AssignFilter struct {
	Board  uuid.UUID
	Note *uuid.UUID
	Name string
	Id   *uuid.UUID
}
