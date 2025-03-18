package initialize

import (
	"net/http"

	"github.com/gorilla/websocket"

	"github.com/uptrace/bun"
	"scrumlr.io/server/feedback"
	"scrumlr.io/server/health"
	"scrumlr.io/server/reactions"
	"scrumlr.io/server/realtime"
	"scrumlr.io/server/sessions"
)

// TODO: create generic method to initialize services
func InitializeReactionService(db *bun.DB, rt *realtime.Broker) reactions.ReactionService {
	reactionsDb := reactions.NewReactionsDatabase(db)
	reactionService := reactions.NewReactionService(reactionsDb, rt)
	return reactionService
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

func InitializeSessionService(db *bun.DB, rt *realtime.Broker) sessions.SessionService {
	sessionDb := sessions.NewSessionDatabase(db)
	sessionService := sessions.NewSessionService(sessionDb, rt)

	return sessionService
}

func InitializeWebsocket(ws websocket.Upgrader, rt *realtime.Broker) sessions.Websocket {
	websocket := sessions.NewWebsocket(ws, rt)

	return websocket
}

func InitializeSessionRequestService(db *bun.DB, rt *realtime.Broker, websocket sessions.Websocket, sessionService sessions.SessionService) sessions.SessionRequestService {
	sessionRequestDb := sessions.NewSessionRequestDatabase(db)
	sessionRequestService := sessions.NewSessionRequestService(sessionRequestDb, rt, websocket, sessionService)

	return sessionRequestService
}
