package initialize

import (
	"net/http"
	"scrumlr.io/server/board"

	"scrumlr.io/server/voting"

	"scrumlr.io/server/boardtemplates"
	"scrumlr.io/server/columns"
	"scrumlr.io/server/columntemplates"
	"scrumlr.io/server/notes"

	"github.com/gorilla/websocket"

	"github.com/uptrace/bun"
	"scrumlr.io/server/boardreactions"
	"scrumlr.io/server/feedback"
	"scrumlr.io/server/health"
	"scrumlr.io/server/reactions"
	"scrumlr.io/server/realtime"
	"scrumlr.io/server/sessionrequests"
	"scrumlr.io/server/sessions"
	"scrumlr.io/server/users"
)

type ServiceInitializer struct {
	db     *bun.DB
	rt     *realtime.Broker
	ws     websocket.Upgrader
	client *http.Client
}

func NewServiceInitializer(db *bun.DB, rt *realtime.Broker) ServiceInitializer {
	initializer := new(ServiceInitializer)
	initializer.db = db
	initializer.rt = rt
	initializer.ws = websocket.Upgrader{
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,
	}
	initializer.client = &http.Client{}

	return *initializer
}

func (init *ServiceInitializer) InitializeBoardService(sessionRequestService sessionrequests.SessionRequestService, sessionService sessions.SessionService, noteService notes.NotesService, service reactions.ReactionService, votingService voting.VotingService) board.BoardService {
	boardDB := board.NewBoardDatabase(init.db)
	boardService := board.NewBoardService(boardDB, init.rt)

	return boardService
}

func (init *ServiceInitializer) InitializeColumnService(noteService notes.NotesService, votingService voting.VotingService) columns.ColumnService {
	columnDb := columns.NewColumnsDatabase(init.db)
	columnService := columns.NewColumnService(columnDb, init.rt, noteService, votingService)

	return columnService
}

func (init *ServiceInitializer) InitializeBoardReactionService() boardreactions.BoardReactionService {
	boardreactionService := boardreactions.NewBoardReactionService(init.rt)

	return boardreactionService
}

func (init *ServiceInitializer) InitializeBoardTemplateService() boardtemplates.BoardTemplateService {
	boardTemplateDb := boardtemplates.NewBoardTemplateDatabase(init.db)
	boardTemplateService := boardtemplates.NewBoardTemplateService(boardTemplateDb)

	return boardTemplateService
}

func (init *ServiceInitializer) InitializeColumnTemplateService() columntemplates.ColumnTemplateService {
	columnTemplateDb := columntemplates.NewColumnTemplateDatabase(init.db)
	columntemplateService := columntemplates.NewColumnTemplateService(columnTemplateDb)

	return columntemplateService
}

func (init *ServiceInitializer) InitializeFeedbackService(webhookUrl string) feedback.FeedbackService {
	feedbackService := feedback.NewFeedbackService(init.client, webhookUrl)

	return feedbackService
}

func (init *ServiceInitializer) InitializeHealthService() health.HealthService {
	healthDb := health.NewHealthDatabase(init.db)
	healthService := health.NewHealthService(healthDb, init.rt)

	return healthService
}

func (init *ServiceInitializer) InitializeReactionService() reactions.ReactionService {
	reactionsDb := reactions.NewReactionsDatabase(init.db)
	reactionService := reactions.NewReactionService(reactionsDb, init.rt)

	return reactionService
}

func (init *ServiceInitializer) InitializeSessionService() sessions.SessionService {
	sessionDb := sessions.NewSessionDatabase(init.db)
	sessionService := sessions.NewSessionService(sessionDb, init.rt)

	return sessionService
}

func (init *ServiceInitializer) InitializeSessionRequestService(websocket sessionrequests.Websocket, sessionService sessions.SessionService) sessionrequests.SessionRequestService {
	sessionRequestDb := sessionrequests.NewSessionRequestDatabase(init.db)
	sessionRequestService := sessionrequests.NewSessionRequestService(sessionRequestDb, init.rt, websocket, sessionService)

	return sessionRequestService
}

func (init *ServiceInitializer) InitializeWebsocket() sessionrequests.Websocket {
	websocket := sessionrequests.NewWebsocket(init.ws, init.rt)

	return websocket
}

func (init *ServiceInitializer) InitializeUserService() users.UserService {
	userDb := users.NewUserDatabase(init.db)
	userService := users.NewUserService(userDb, init.rt)

	return userService
}

func (init *ServiceInitializer) InitializeNotesService() notes.NotesService {
	notesDB := notes.NewNotesDatabase(init.db)
	notesService := notes.NewNotesService(notesDB, init.rt)

	return notesService
}

func (init *ServiceInitializer) InitializeVotingService() voting.VotingService {
	votingDB := voting.NewVotingDatabase(init.db)
	votingService := voting.NewVotingService(votingDB, init.rt)

	return votingService
}
