package initialize

import (
	"github.com/uptrace/bun"
	"scrumlr.io/server/reactions"
	"scrumlr.io/server/realtime"
)

// TODO: create generic method to initialize services
func InitializeReactionService(db *bun.DB, rt *realtime.Broker) reactions.ReactionService {
	reactionsDb := reactions.NewReactionsDatabase(db)
	reactionService := reactions.NewReactionService(reactionsDb, rt)
	return reactionService
}
