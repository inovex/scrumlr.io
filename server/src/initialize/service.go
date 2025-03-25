package initialize

import (
	"github.com/uptrace/bun"
	"scrumlr.io/server/health"
	"scrumlr.io/server/reactions"
	"scrumlr.io/server/realtime"
)

// TODO: create generic method to initialize services
func InitializeReactionService(db *bun.DB, rt *realtime.Broker) reactions.ReactionService {
	reactionsDb := reactions.NewReactionsDatabase(db)
	reactionService := reactions.NewReactionService(reactionsDb, rt)
	return reactionService
}

func InitializeHealthService(db *bun.DB, rt *realtime.Broker) health.HealthService {
	healthDb := health.NewHealthDatabase(db)
	healthService := health.NewHealthService(healthDb, rt)
	return healthService
}
