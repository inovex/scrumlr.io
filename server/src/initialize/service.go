package initialize

import (
  "net/http"
  "scrumlr.io/server/notes"

  "github.com/gorilla/websocket"

  "github.com/uptrace/bun"
  "scrumlr.io/server/feedback"
  "scrumlr.io/server/health"
  "scrumlr.io/server/reactions"
  "scrumlr.io/server/realtime"
  "scrumlr.io/server/sessionrequests"
  "scrumlr.io/server/sessions"
)

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

func InitializeReactionService(db *bun.DB, rt *realtime.Broker) reactions.ReactionService {
  reactionsDb := reactions.NewReactionsDatabase(db)
  reactionService := reactions.NewReactionService(reactionsDb, rt)

  return reactionService
}

func InitializeSessionService(db *bun.DB, rt *realtime.Broker) sessions.SessionService {
  sessionDb := sessions.NewSessionDatabase(db)
  sessionService := sessions.NewSessionService(sessionDb, rt)

  return sessionService
}

func InitializeSessionRequestService(db *bun.DB, rt *realtime.Broker, websocket sessionrequests.Websocket, sessionService sessions.SessionService) sessionrequests.SessionRequestService {
  sessionRequestDb := sessionrequests.NewSessionRequestDatabase(db)
  sessionRequestService := sessionrequests.NewSessionRequestService(sessionRequestDb, rt, websocket, sessionService)

  return sessionRequestService
}

func InitializeWebsocket(ws websocket.Upgrader, rt *realtime.Broker) sessionrequests.Websocket {
  websocket := sessionrequests.NewWebsocket(ws, rt)

  return websocket
}

func InitializeNotesService(db *bun.DB, rt *realtime.Broker) notes.NotesService {
  notesDB := notes.NewNotesDatabase(db)
  notesService := notes.NewNotesService(&notesDB, rt)

  return notesService
}
