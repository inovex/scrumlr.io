package serviceinitialize

import (
	"testing"

	"scrumlr.io/server/auth"
	"scrumlr.io/server/cache"
	"scrumlr.io/server/columns"
	"scrumlr.io/server/columntemplates"
	"scrumlr.io/server/feedback"
	"scrumlr.io/server/info"
	"scrumlr.io/server/notes"
	"scrumlr.io/server/reactions"
	"scrumlr.io/server/realtime"
	"scrumlr.io/server/sessionrequests"
	"scrumlr.io/server/sessions"
	"scrumlr.io/server/users"
	"scrumlr.io/server/votings"
	"scrumlr.io/server/websocket"

	"github.com/stretchr/testify/assert"
)

func TestNewServiceInitializer(t *testing.T) {
	b := &realtime.Broker{}
	c := &cache.Cache{}

	initializer := NewServiceInitializer(nil, b, c)

	assert.Nil(t, initializer.db)
	assert.Equal(t, b, initializer.broker)
	assert.Equal(t, c, initializer.cache)
	assert.NotNil(t, initializer.clock)
	assert.NotNil(t, initializer.hash)
	assert.NotNil(t, initializer.client)
	assert.False(t, initializer.checkOrigin)
}

func TestInitializeBoardService(t *testing.T) {
	initializer := NewServiceInitializer(nil, &realtime.Broker{}, &cache.Cache{})

	columnService := columns.NewMockColumnService(t)
	sessionService := sessions.NewMockSessionService(t)
	sessionRequestService := sessionrequests.NewMockSessionRequestService(t)
	noteService := notes.NewMockNotesService(t)
	userSession := users.NewMockUserService(t)
	votingService := votings.NewMockVotingService(t)
	reactionService := reactions.NewMockReactionService(t)

	boardService := initializer.InitializeBoardService(sessionRequestService, sessionService, columnService, noteService, reactionService, votingService, userSession)

	assert.NotNil(t, boardService)
}

func TestInitializeColumnService(t *testing.T) {
	initializer := NewServiceInitializer(nil, &realtime.Broker{}, &cache.Cache{})

	noteService := notes.NewMockNotesService(t)

	columnService := initializer.InitializeColumnService(noteService)

	assert.NotNil(t, columnService)
}

func TestInitializeSessionService(t *testing.T) {
	initializer := NewServiceInitializer(nil, &realtime.Broker{}, &cache.Cache{})

	columnService := columns.NewMockColumnService(t)
	noteService := notes.NewMockNotesService(t)

	sessionService := initializer.InitializeSessionService(columnService, noteService)

	assert.NotNil(t, sessionService)
}

func TestInitializeSessionRequestService(t *testing.T) {
	initializer := NewServiceInitializer(nil, &realtime.Broker{}, &cache.Cache{})

	sessionRequestWebsocket := sessionrequests.NewMockSessionRequestWebsocket(t)
	sessionService := sessions.NewMockSessionService(t)

	sessionRequestService := initializer.InitializeSessionRequestService(sessionRequestWebsocket, sessionService)

	assert.NotNil(t, sessionRequestService)
}

func TestInitializeNoteService(t *testing.T) {
	initializer := NewServiceInitializer(nil, &realtime.Broker{}, &cache.Cache{})

	noteService := initializer.InitializeNotesService()

	assert.NotNil(t, noteService)
}

func TestInitializeUserService(t *testing.T) {
	initializer := NewServiceInitializer(nil, &realtime.Broker{}, &cache.Cache{})

	sessionService := sessions.NewMockSessionService(t)
	noteService := notes.NewMockNotesService(t)

	userService := initializer.InitializeUserService(sessionService, noteService)

	assert.NotNil(t, userService)
}

func TestInitializeVotingService(t *testing.T) {
	initializer := NewServiceInitializer(nil, &realtime.Broker{}, &cache.Cache{})

	votingService := initializer.InitializeVotingService()

	assert.NotNil(t, votingService)
}

func TestInitializeReactionService(t *testing.T) {
	initializer := NewServiceInitializer(nil, &realtime.Broker{}, &cache.Cache{})

	reactionService := initializer.InitializeReactionService()

	assert.NotNil(t, reactionService)
}

func TestInitializeBoardReactionService(t *testing.T) {
	initializer := NewServiceInitializer(nil, &realtime.Broker{}, &cache.Cache{})

	boardReactionService := initializer.InitializeBoardReactionService()

	assert.NotNil(t, boardReactionService)
}

func TestInitializeBoardTemplateService(t *testing.T) {
	initializer := NewServiceInitializer(nil, &realtime.Broker{}, &cache.Cache{})

	columnTemplateService := columntemplates.NewMockColumnTemplateService(t)

	boardTemplateService := initializer.InitializeBoardTemplateService(columnTemplateService)

	assert.NotNil(t, boardTemplateService)
}

func TestInitializeColumnTemplateService(t *testing.T) {
	initializer := NewServiceInitializer(nil, &realtime.Broker{}, &cache.Cache{})

	columnTemplateService := initializer.InitializeColumnTemplateService()

	assert.NotNil(t, columnTemplateService)
}

func TestInitializeFeedbackService(t *testing.T) {
	initializer := NewServiceInitializer(nil, &realtime.Broker{}, &cache.Cache{})

	feedbackService := initializer.InitializeFeedbackService("https://example.com/webhook")

	assert.NotNil(t, feedbackService)
}

func TestInitializeHealthService(t *testing.T) {
	initializer := NewServiceInitializer(nil, &realtime.Broker{}, &cache.Cache{})

	healthService := initializer.InitializeHealthService()

	assert.NotNil(t, healthService)
}

func TestInitializeInfoService(t *testing.T) {
	initializer := NewServiceInitializer(nil, &realtime.Broker{}, &cache.Cache{})

	auth := auth.NewMockAuth(t)
	feedbackService := feedback.NewMockFeedbackService(t)

	infoService := initializer.InitializeInfoService(auth, feedbackService, info.ServerConfig{})

	assert.NotNil(t, infoService)
}

func TestInitializeWebsocketService(t *testing.T) {
	initializer := NewServiceInitializer(nil, &realtime.Broker{}, &cache.Cache{})

	webSocketService := initializer.InitializeWebSocketService()

	assert.NotNil(t, webSocketService)
}

func TestInitializeSessionRequestWebsocketService(t *testing.T) {
	initializer := NewServiceInitializer(nil, &realtime.Broker{}, &cache.Cache{})

	webSocket := websocket.NewMockUpgrader(t)

	sessionRequestWebsocketService := initializer.InitializeSessionRequestWebsocket(webSocket)

	assert.NotNil(t, sessionRequestWebsocketService)
}
