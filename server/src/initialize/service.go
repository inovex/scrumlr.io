package initialize

import (
	"github.com/go-chi/chi/v5"
	"net/http"
	"scrumlr.io/server/auth"
	"scrumlr.io/server/boards"
	"scrumlr.io/server/sessions"
	"scrumlr.io/server/timeprovider"

	"scrumlr.io/server/votings"

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
)

type ServiceInitializer struct {
	clock    timeprovider.TimeProvider
	db       *bun.DB
	rt       *realtime.Broker
	ws       websocket.Upgrader
	client   *http.Client
	basePath string
	r        chi.Router
}

func NewServiceInitializer(db *bun.DB, rt *realtime.Broker, basePath string, newRouter chi.Router) ServiceInitializer {
	initializer := new(ServiceInitializer)
	initializer.clock = timeprovider.NewClock()
	initializer.db = db
	initializer.rt = rt
	initializer.ws = websocket.Upgrader{
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,
	}
	initializer.client = &http.Client{}
	initializer.basePath = basePath
	initializer.r = newRouter
	return *initializer
}

func (init *ServiceInitializer) InitializeBoardService(sessionRequestService sessionrequests.SessionRequestService, sessionService sessions.SessionService, columnService columns.ColumnService, noteService notes.NotesService, reactionService reactions.ReactionService, votingService votings.VotingService) boards.BoardService {
	boardDB := boards.NewBoardDatabase(init.db)
	boardService := boards.NewBoardService(boardDB, init.rt, sessionRequestService, sessionService, columnService, noteService, reactionService, votingService, init.clock)

	return boardService
}
func (init *ServiceInitializer) InitializeAuthService(feedbackService feedback.FeedbackService, providers map[string]auth.AuthProviderConfiguration, unsafePrivateKey, privateKey string, database *bun.DB, userService sessions.UserService, anonymousLoginDisabled bool, allowAnonymousCustomTemplates bool) auth.AuthService {
	authService := auth.NewAuthService(providers, unsafePrivateKey, privateKey, database, userService)
	authAPI := auth.NewAuthAPI(authService, feedbackService, init.basePath, anonymousLoginDisabled, allowAnonymousCustomTemplates)

	auth.NewAuthRouter(authAPI).RegisterRoutes(init.r)
	return authService
}

func (init *ServiceInitializer) InitializeColumnService(noteService notes.NotesService) columns.ColumnService {
	columnDb := columns.NewColumnsDatabase(init.db)
	columnService := columns.NewColumnService(columnDb, init.rt, noteService)

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

func (init *ServiceInitializer) InitializeSessionService(columnService columns.ColumnService, noteService notes.NotesService) sessions.SessionService {
	sessionDb := sessions.NewSessionDatabase(init.db)
	sessionService := sessions.NewSessionService(sessionDb, init.rt, columnService, noteService)

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

func (init *ServiceInitializer) InitializeUserService(sessionService sessions.SessionService) sessions.UserService {
	userDb := sessions.NewUserDatabase(init.db)
	userService := sessions.NewUserService(userDb, init.rt, sessionService)

	return userService
}

func (init *ServiceInitializer) InitializeNotesService(votingService votings.VotingService) notes.NotesService {
	notesDB := notes.NewNotesDatabase(init.db)
	notesService := notes.NewNotesService(notesDB, init.rt, votingService)
	notesAPI := notes.NewNotesAPI(notesService, init.basePath)
	notes.NewNotesRouter(notesAPI).RegisterRoutes(init.r)
	return notesService
}

func (init *ServiceInitializer) InitializeVotingService() votings.VotingService {
	votingDB := votings.NewVotingDatabase(init.db)
	votingService := votings.NewVotingService(votingDB, init.rt)

	return votingService
}
