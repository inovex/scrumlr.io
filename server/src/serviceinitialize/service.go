package serviceinitialize

import (
	"net/http"

	"scrumlr.io/server/boards"
	"scrumlr.io/server/cache"
	"scrumlr.io/server/eventfilter"
	"scrumlr.io/server/events"
	"scrumlr.io/server/hash"
	"scrumlr.io/server/sessions"
	"scrumlr.io/server/timeprovider"
	"scrumlr.io/server/users"
	"scrumlr.io/server/websocket"

	"scrumlr.io/server/votings"

	"scrumlr.io/server/boardtemplates"
	"scrumlr.io/server/columns"
	"scrumlr.io/server/columntemplates"
	"scrumlr.io/server/notes"

	"github.com/uptrace/bun"
	"scrumlr.io/server/boardreactions"
	"scrumlr.io/server/feedback"
	"scrumlr.io/server/health"
	"scrumlr.io/server/reactions"
	"scrumlr.io/server/realtime"
	"scrumlr.io/server/sessionrequests"
)

type ServiceInitializer struct {
	clock       timeprovider.TimeProvider
	hash        hash.Hash
	db          *bun.DB
	broker      *realtime.Broker
	checkOrigin bool
	cache       *cache.Cache
	client      *http.Client
}

func NewServiceInitializer(db *bun.DB, broker *realtime.Broker, cache *cache.Cache) ServiceInitializer {
	initializer := new(ServiceInitializer)
	initializer.clock = timeprovider.NewClock()
	initializer.hash = hash.NewHashSha512()
	initializer.db = db
	initializer.broker = broker
	initializer.checkOrigin = false
	initializer.cache = cache
	initializer.client = &http.Client{}

	return *initializer
}

func (init *ServiceInitializer) InitializeBoardService(sessionService sessions.SessionService, columnService columns.ColumnService, noteService notes.NotesService, reactionService reactions.ReactionService, votingService votings.VotingService, userService users.UserService) boards.BoardService {
	boardDB := boards.NewBoardDatabase(init.db, init.clock)
	boardService := boards.NewBoardService(boardDB, init.broker, sessionService, columnService, noteService, reactionService, votingService, userService, init.clock, init.hash)

	return boardService
}

func (init *ServiceInitializer) InitializeColumnService(noteService notes.NotesService) columns.ColumnService {
	columnDb := columns.NewColumnsDatabase(init.db)
	boardsDB := boards.NewBoardDatabase(init.db, init.clock)
	boardLastModifiedUpdater := boards.NewLastModifiedUpdater(boardsDB, init.clock)
	columnService := columns.NewColumnService(columnDb, init.broker, noteService, boardLastModifiedUpdater)

	return columnService
}

func (init *ServiceInitializer) InitializeBoardReactionService() boardreactions.BoardReactionCreater {
	boardreactionService := boardreactions.NewBoardReactionService(init.broker)

	return boardreactionService
}

func (init *ServiceInitializer) InitializeBoardTemplateService(columnTemplateService columntemplates.ColumnTemplateService) boardtemplates.BoardTemplateService {
	boardTemplateDb := boardtemplates.NewBoardTemplateDatabase(init.db)
	boardTemplateService := boardtemplates.NewBoardTemplateService(boardTemplateDb, columnTemplateService)

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
	healthDb := health.NewHealthDatabaseChecker(init.db)
	healthService := health.NewHealthService(healthDb, init.broker)

	return healthService
}

func (init *ServiceInitializer) InitializeReactionService() reactions.ReactionService {
	reactionsDb := reactions.NewReactionsDatabase(init.db)
	reactionService := reactions.NewReactionService(reactionsDb, init.broker)

	return reactionService
}

func (init *ServiceInitializer) InitializeSessionService(columnService columns.ColumnService, noteService notes.NotesService) sessions.SessionService {
	sessionDb := sessions.NewSessionDatabase(init.db)
	sessionService := sessions.NewSessionService(sessionDb, init.broker, columnService, noteService)

	return sessionService
}

func (init *ServiceInitializer) InitializeSessionRequestService(eventListener events.EventListener, sessionService sessions.SessionService) sessionrequests.SessionRequestService {
	sessionRequestDb := sessionrequests.NewSessionRequestDatabase(init.db)
	sessionRequestService := sessionrequests.NewSessionRequestService(sessionRequestDb, init.broker, eventListener, sessionService)

	return sessionRequestService
}

func (init *ServiceInitializer) InitializeWebSocketService() websocket.Upgrader {
	return websocket.NewWebSocketUpgrader()
}

func (init *ServiceInitializer) InitializeUserService(sessionService sessions.SessionService, noteService notes.NotesService) users.UserService {
	userDb := users.NewUserDatabase(init.db)
	userService := users.NewUserService(userDb, init.broker, sessionService, noteService)
	return userService
}

func (init *ServiceInitializer) InitializeNotesService() notes.NotesService {
	notesDB := notes.NewNotesDatabase(init.db)
	boardsDB := boards.NewBoardDatabase(init.db, init.clock)
	boardLastModifiedUpdater := boards.NewLastModifiedUpdater(boardsDB, init.clock)
	notesService := notes.NewNotesService(notesDB, init.broker, init.cache, boardLastModifiedUpdater)

	return notesService
}

func (init *ServiceInitializer) InitializeVotingService() votings.VotingService {
	votingDB := votings.NewVotingDatabase(init.db)
	votingService := votings.NewVotingService(votingDB, init.broker)

	return votingService
}

func (init *ServiceInitializer) InitializeEventFilter(boardService boards.BoardService, columnService columns.ColumnService, sessionService sessions.SessionService) eventfilter.EventFilter {
	filterRules := []eventfilter.FilterRule{
		eventfilter.NewColumnRuleFilter(sessionService),
		eventfilter.NewNoteRuleFilter(boardService, columnService, sessionService),
		eventfilter.NewVotingRuleFilter(boardService, columnService, sessionService),
		eventfilter.NewVoteRuleFilter(),
	}

	filter := eventfilter.NewEventFilter(filterRules...)

	return filter
}

func (init *ServiceInitializer) InitializeEventListener(ws websocket.Upgrader, filter eventfilter.EventFilter, sessionService sessions.SessionService, noteService notes.NotesService) events.EventListener {
	boardConnection := events.NewBoardConnectionManager(init.broker, init.clock, filter)
	sessionRequestconnection := events.NewSessionRequestConnectionManager(init.broker, init.clock)
	listener := events.NewEventListener(ws, init.checkOrigin, boardConnection, sessionRequestconnection, sessionService, noteService)

	return listener
}
