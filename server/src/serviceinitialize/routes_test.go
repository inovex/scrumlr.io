package serviceinitialize

import (
	"net/http"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"scrumlr.io/server/feedback"
	"scrumlr.io/server/health"
	"scrumlr.io/server/info"
	"scrumlr.io/server/sessions"
	"scrumlr.io/server/users"
)

func TestNewRouteInitializer(t *testing.T) {
	initializer := NewRoutesInitializer()

	assert.NotNil(t, initializer)
}

func TestInitializeBoardRoutes(t *testing.T) {
	initializer := NewRoutesInitializer()

	assert.Panics(t, func() {
		initializer.InitializeBoardRoutes()
	})
}

func TestInitializeColumnRoutes(t *testing.T) {
	initializer := NewRoutesInitializer()

	assert.Panics(t, func() {
		initializer.InitializeColumnRoutes()
	})
}

func TestInitializeBoardReactionRoutes(t *testing.T) {
	initializer := NewRoutesInitializer()

	assert.Panics(t, func() {
		initializer.InitializeBoardReactionRoutes()
	})
}

func TestInitializeBoardTemplateRoutes(t *testing.T) {
	initializer := NewRoutesInitializer()

	assert.Panics(t, func() {
		initializer.InitializeBoardTemplateRoutes()
	})
}

func TestInitializeColumnTemplateRoutes(t *testing.T) {
	initializer := NewRoutesInitializer()

	assert.Panics(t, func() {
		initializer.InitializeColumnTemplateRoutes()
	})
}

func TestInitializeFeedbackRoutes(t *testing.T) {
	initializer := NewRoutesInitializer()

	feedbackApi := feedback.NewMockFeedbackApi(t)

	feedBackroutes := initializer.InitializeFeedbackRoutes(feedbackApi)

	assert.NotNil(t, feedBackroutes)
}

func TestInitializeHealthRoutes(t *testing.T) {
	initializer := NewRoutesInitializer()

	healthApi := health.NewMockHealthApi(t)

	healthRoutes := initializer.InitializeHealthRoutes(healthApi)

	assert.NotNil(t, healthRoutes)
}

func TestInitializeInfoRoutes(t *testing.T) {
	initializer := NewRoutesInitializer()

	infoApi := info.NewMockInfoApi(t)

	infoRoutes := initializer.InitializeInfoRoutes(infoApi)

	assert.NotNil(t, infoRoutes)
}

func TestInitializeReactionRoutes(t *testing.T) {
	initializer := NewRoutesInitializer()

	assert.Panics(t, func() {
		initializer.InitializeReactionRoutes()
	})
}

func TestInitializeSessionRoutes(t *testing.T) {
	initializer := NewRoutesInitializer()

	sessionApi := sessions.NewMockSessionApi(t)
	sessionApi.EXPECT().BoardParticipantContext(mock.Anything).
		RunAndReturn(func(next http.Handler) http.Handler { return next })
	sessionApi.EXPECT().BoardModeratorContext(mock.Anything).
		RunAndReturn(func(next http.Handler) http.Handler { return next })

	sessionRoutes := initializer.InitializeSessionRoutes(sessionApi)

	assert.NotNil(t, sessionRoutes)
}

func TestInitializeSessionRequestsRoutes(t *testing.T) {
	initializer := NewRoutesInitializer()

	assert.Panics(t, func() {
		initializer.InitializeSessionRequestRoutes()
	})
}

func TestInitializeUserRoutes(t *testing.T) {
	initializer := NewRoutesInitializer()

	userApi := users.NewMockUsersApi(t)
	userApi.EXPECT().IsAccountOwner(mock.Anything).
		RunAndReturn(func(next http.Handler) http.Handler { return next })
	sessionApi := sessions.NewMockSessionApi(t)
	sessionApi.EXPECT().BoardParticipantContext(mock.Anything).
		RunAndReturn(func(next http.Handler) http.Handler { return next })

	userRoutes := initializer.InitializeUserRoutes(userApi, sessionApi)

	assert.NotNil(t, userRoutes)
}

func TestInitializeNoteRoutes(t *testing.T) {
	initializer := NewRoutesInitializer()

	assert.Panics(t, func() {
		initializer.InitializeNotesRoutes()
	})
}

func TestInitializeVotingRoutes(t *testing.T) {
	initializer := NewRoutesInitializer()

	assert.Panics(t, func() {
		initializer.InitializeVotingRoutes()
	})
}

func TestInitializeSwaggerRoutes(t *testing.T) {
	initializer := NewRoutesInitializer()

	swaggerRoutes := initializer.InitializeSwaggerRoutes("/")

	assert.NotNil(t, swaggerRoutes)
}
