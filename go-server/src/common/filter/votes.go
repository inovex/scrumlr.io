package filter

import "github.com/google/uuid"

type VoteFilter struct {
	Board  uuid.UUID
	Voting *uuid.UUID
	User   *uuid.UUID
	Note   *uuid.UUID
}
