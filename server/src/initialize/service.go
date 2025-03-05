package initialize

import (
	"github.com/uptrace/bun"
	"scrumlr.io/server/realtime"
	"scrumlr.io/server/votes"
)

// TODO: create generic method to initialize services
func InitializeReactionService(db *bun.DB, rt *realtime.Broker) *votes.Service {
	votingDB := votes.NewVotingDatabase(db)
	votingService := votes.NewVotingService(&votingDB, rt)
	return votingService
}
