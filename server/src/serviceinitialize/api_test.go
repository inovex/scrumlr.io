package serviceinitialize

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"scrumlr.io/server/boardtemplates"
	"scrumlr.io/server/columntemplates"
	"scrumlr.io/server/feedback"
	"scrumlr.io/server/health"
	"scrumlr.io/server/info"
	"scrumlr.io/server/sessions"
	"scrumlr.io/server/users"
)

func TestNewApiInitializer(t *testing.T) {
	initializer := NewApiInitializer("/")

	assert.NotNil(t, initializer)
	assert.Equal(t, "/", initializer.basePath)
}

func TestInitializeBoardApi(t *testing.T) {
	initializer := NewApiInitializer("/")

	assert.Panics(t, func() {
		initializer.InitializeBoardApi()
	})
}

func TestInitializeColumnApi(t *testing.T) {
	initializer := NewApiInitializer("/")

	assert.Panics(t, func() {
		initializer.InitializeColumnApi()
	})
}

func TestInitializeBoardReactionApi(t *testing.T) {
	initializer := NewApiInitializer("/")

	assert.Panics(t, func() {
		initializer.InitializeBoardReactionApi()
	})
}

func TestInitializeBoardTemplateApi(t *testing.T) {
	initializer := NewApiInitializer("/")

	boardTemplateService := boardtemplates.NewMockBoardTemplateService(t)

	boardTemplateApi := initializer.InitializeBoardTemplateApi(boardTemplateService)

	assert.NotNil(t, boardTemplateApi)
}

func TestInitializeColumnTemplateApi(t *testing.T) {
	initializer := NewApiInitializer("/")

	columnTemplateService := columntemplates.NewMockColumnTemplateService(t)

	columnTemplateApi := initializer.InitializeColumnTemplateApi(columnTemplateService)

	assert.NotNil(t, columnTemplateApi)
}

func TestInitializeFeedbackApi(t *testing.T) {
	initializer := NewApiInitializer("/")

	feedbackService := feedback.NewMockFeedbackService(t)

	feedbackApi := initializer.InitializeFeedbackApi(feedbackService)

	assert.NotNil(t, feedbackApi)
}

func TestInitializeInfoApi(t *testing.T) {
	initializer := NewApiInitializer("/")

	infoService := info.NewMockInfoService(t)

	infoApi := initializer.InitializeInfoApi(infoService)

	assert.NotNil(t, infoApi)
}

func TestInitializeHealthApi(t *testing.T) {
	initializer := NewApiInitializer("/")

	healthService := health.NewMockHealthService(t)

	healthApi := initializer.InitializeHealthApi(healthService)

	assert.NotNil(t, healthApi)
}

func TestInitializeReactionApi(t *testing.T) {
	initializer := NewApiInitializer("/")

	assert.Panics(t, func() {
		initializer.InitializeReactionApi()
	})
}

func TestInitializeSessionApi(t *testing.T) {
	initializer := NewApiInitializer("/")

	sessionService := sessions.NewMockSessionService(t)

	sessionApi := initializer.InitializeSessionApi(sessionService)

	assert.NotNil(t, sessionApi)
}

func TestInitializeSessionRequestApi(t *testing.T) {
	initializer := NewApiInitializer("/")

	assert.Panics(t, func() {
		initializer.InitializeSessionRequestApi()
	})
}

func TestInitializeUserApi(t *testing.T) {
	initializer := NewApiInitializer("/")

	userService := users.NewMockUserService(t)
	sessionService := sessions.NewMockSessionService(t)

	userApi := initializer.InitializeUserApi(userService, sessionService, true, true)

	assert.NotNil(t, userApi)
}

func TestInitializeNoteApi(t *testing.T) {
	initializer := NewApiInitializer("/")

	assert.Panics(t, func() {
		initializer.InitializeNotesApi()
	})
}

func TestInitializeVotingApi(t *testing.T) {
	initializer := NewApiInitializer("/")

	assert.Panics(t, func() {
		initializer.InitializeVotingApi()
	})
}
