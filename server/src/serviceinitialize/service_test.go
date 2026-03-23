package serviceinitialize

import (
	"testing"

	"scrumlr.io/server/cache"
	"scrumlr.io/server/columns"
	"scrumlr.io/server/columntemplates"
	"scrumlr.io/server/notes"
	"scrumlr.io/server/reactions"
	"scrumlr.io/server/realtime"
	"scrumlr.io/server/sessionrequests"
	"scrumlr.io/server/sessions"
	"scrumlr.io/server/votings"

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

func TestServiceInitializer_InitializeServices(t *testing.T) {
	initializer := NewServiceInitializer(nil, &realtime.Broker{}, &cache.Cache{})

	noteService := notes.NewMockNotesService(t)
	columnService := columns.NewMockColumnService(t)
	reactionService := reactions.NewMockReactionService(t)
	votingService := votings.NewMockVotingService(t)
	sessionService := sessions.NewMockSessionService(t)
	sessionRequestService := sessionrequests.NewMockSessionRequestService(t)
	sessionRequestWebsocket := sessionrequests.NewMockSessionRequestWebsocket(t)
	columnTemplateService := columntemplates.NewMockColumnTemplateService(t)

	assert.NotNil(t, initializer.InitializeBoardService(sessionRequestService, sessionService, columnService, noteService, reactionService, votingService))
	assert.NotNil(t, initializer.InitializeColumnService(noteService))
	assert.NotNil(t, initializer.InitializeBoardReactionService())
	assert.NotNil(t, initializer.InitializeBoardTemplateService(columnTemplateService))
	assert.NotNil(t, initializer.InitializeColumnTemplateService())
	assert.NotNil(t, initializer.InitializeFeedbackService("https://example.com/webhook"))
	assert.NotNil(t, initializer.InitializeHealthService())
	assert.NotNil(t, initializer.InitializeReactionService())
	assert.NotNil(t, initializer.InitializeSessionService(columnService, noteService))
	assert.NotNil(t, initializer.InitializeSessionRequestService(sessionRequestWebsocket, sessionService))

	wsService := initializer.InitializeWebSocketService()
	assert.NotNil(t, wsService)
	assert.NotNil(t, initializer.InitializeSessionRequestWebsocket(wsService))

	assert.NotNil(t, initializer.InitializeUserService(sessionService, noteService))
	assert.NotNil(t, initializer.InitializeNotesService())
	assert.NotNil(t, initializer.InitializeVotingService())
}
