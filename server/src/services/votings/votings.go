package votings

import (
  "github.com/google/uuid"
  "scrumlr.io/server/common/filter"
  "scrumlr.io/server/database"
  "scrumlr.io/server/realtime"
)

type VotingService struct {
  database DB
  realtime *realtime.Broker
}

type DB interface {
  CreateVoting(insert database.VotingInsert) (database.Voting, error)
  UpdateVoting(update database.VotingUpdate) (database.Voting, error)
  GetVoting(board, id uuid.UUID) (database.Voting, []database.Vote, error)
  GetVotings(board uuid.UUID) ([]database.Voting, []database.Vote, error)
  GetVotes(f filter.VoteFilter) ([]database.Vote, error)
  AddVote(board, user, note uuid.UUID) (database.Vote, error)
  RemoveVote(board, user, note uuid.UUID) error
  GetNotes(board uuid.UUID, columns ...uuid.UUID) ([]database.Note, error)
  GetOpenVoting(board uuid.UUID) (database.Voting, error)
}
