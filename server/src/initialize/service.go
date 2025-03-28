package initialize

import (
	"net/http"

	"github.com/uptrace/bun"
	"scrumlr.io/server/notes"
	"scrumlr.io/server/health"
	"scrumlr.io/server/reactions"
  "scrumlr.io/server/realtime"
)

// TODO: create generic method to initialize services
func InitializeReactionService(db *bun.DB) *reactions.ReactionDatabase {
	reactionDB := reactions.NewReactionsDatabase(db)
	return &reactionDB
}

func InitializeNotesService(db *bun.DB) *notes.NotesDatabase {
	notesDB := notes.NewNotesDatabase(db)
	return &notesDB
}

func InitializeFeedbackService(webhookUrl string) feedback.FeedbackService {
	client := new(http.Client)
	feedbackService := feedback.NewFeedbackService(client, webhookUrl)

	return feedbackService
}

func InitializeHealthService(db *bun.DB, rt *realtime.Broker) health.HealthService {
	healthDb := health.NewHealthDatabase(db)
	healthService := health.NewHealthService(healthDb, rt)
	return healthService
}
