package info

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"scrumlr.io/server/auth"
	"scrumlr.io/server/common"
	"scrumlr.io/server/feedback"
	"scrumlr.io/server/timeprovider"
)

func TestGetInfo(t *testing.T) {
	ctx := t.Context()

	mockAuthService := auth.NewMockAuth(t)
	mockAuthService.EXPECT().Exists(auth.Google).
		Return(true)
	mockAuthService.EXPECT().Exists(auth.GitHub).
		Return(true)
	mockAuthService.EXPECT().Exists(auth.Microsoft).
		Return(false)
	mockAuthService.EXPECT().Exists(auth.AzureAd).
		Return(false)
	mockAuthService.EXPECT().Exists(auth.Apple).
		Return(false)
	mockAuthService.EXPECT().Exists(auth.TypeOIDC).
		Return(true)

	mockFeedbackService := feedback.NewMockFeedbackService(t)
	mockFeedbackService.EXPECT().Enabled().
		Return(true)

	dateTime := time.Date(2026, time.August, 28, 16, 35, 0, 0, time.UTC)
	mockClock := timeprovider.NewMockTimeProvider(t)
	mockClock.EXPECT().Now().
		Return(dateTime)

	serverConfig := ServerConfig{
		AnonymousLoginDisabled:        false,
		AllowAnonymousBoardCreation:   true,
		AllowAnonymousCustomTemplates: false,
		AllowAnonymousHistory:         false,
	}

	infoService := NewInfoService(mockAuthService, mockFeedbackService, mockClock, serverConfig)

	info := infoService.Get(ctx)

	assert.Len(t, info.AuthProvider, 3)
	assert.Contains(t, info.AuthProvider, auth.Google)
	assert.Contains(t, info.AuthProvider, auth.GitHub)
	assert.Contains(t, info.AuthProvider, auth.TypeOIDC)
	assert.True(t, info.FeedbackEnabled)
	assert.False(t, info.AnonymousLoginDisabled)
	assert.True(t, info.AllowAnonymousBoardCreation)
	assert.False(t, info.AllowAnonymousCustomTemplates)
	assert.False(t, info.AllowAnonymousHistory)
	assert.Equal(t, dateTime, info.ServerTime)
}

func TestGetInfoAllAuthProviders(t *testing.T) {
	ctx := t.Context()

	mockAuthService := auth.NewMockAuth(t)
	mockAuthService.EXPECT().Exists(auth.Google).
		Return(true)
	mockAuthService.EXPECT().Exists(auth.GitHub).
		Return(true)
	mockAuthService.EXPECT().Exists(auth.Microsoft).
		Return(true)
	mockAuthService.EXPECT().Exists(auth.AzureAd).
		Return(true)
	mockAuthService.EXPECT().Exists(auth.Apple).
		Return(true)
	mockAuthService.EXPECT().Exists(auth.TypeOIDC).
		Return(true)

	mockFeedbackService := feedback.NewMockFeedbackService(t)
	mockFeedbackService.EXPECT().Enabled().
		Return(true)

	dateTime := time.Date(2026, time.August, 28, 16, 35, 0, 0, time.UTC)
	mockClock := timeprovider.NewMockTimeProvider(t)
	mockClock.EXPECT().Now().
		Return(dateTime)

	serverConfig := ServerConfig{
		AnonymousLoginDisabled:        false,
		AllowAnonymousBoardCreation:   true,
		AllowAnonymousCustomTemplates: true,
		AllowAnonymousHistory:         true,
	}

	infoService := NewInfoService(mockAuthService, mockFeedbackService, mockClock, serverConfig)

	info := infoService.Get(ctx)

	assert.Len(t, info.AuthProvider, 6)
	assert.Equal(t, []auth.AccountType{auth.Google, auth.GitHub, auth.Microsoft, auth.AzureAd, auth.Apple, auth.TypeOIDC}, info.AuthProvider)
	assert.True(t, info.FeedbackEnabled)
	assert.False(t, info.AnonymousLoginDisabled)
	assert.True(t, info.AllowAnonymousBoardCreation)
	assert.True(t, info.AllowAnonymousCustomTemplates)
	assert.True(t, info.AllowAnonymousHistory)
	assert.Equal(t, dateTime, info.ServerTime)
}

func TestGetInfoNoAuthProviders(t *testing.T) {
	ctx := t.Context()

	mockAuthService := auth.NewMockAuth(t)
	mockAuthService.EXPECT().Exists(auth.Google).
		Return(false)
	mockAuthService.EXPECT().Exists(auth.GitHub).
		Return(false)
	mockAuthService.EXPECT().Exists(auth.Microsoft).
		Return(false)
	mockAuthService.EXPECT().Exists(auth.AzureAd).
		Return(false)
	mockAuthService.EXPECT().Exists(auth.Apple).
		Return(false)
	mockAuthService.EXPECT().Exists(auth.TypeOIDC).
		Return(false)

	mockFeedbackService := feedback.NewMockFeedbackService(t)
	mockFeedbackService.EXPECT().Enabled().
		Return(true)

	dateTime := time.Date(2026, time.August, 28, 16, 35, 0, 0, time.UTC)
	mockClock := timeprovider.NewMockTimeProvider(t)
	mockClock.EXPECT().Now().
		Return(dateTime)

	serverConfig := ServerConfig{
		AnonymousLoginDisabled:        false,
		AllowAnonymousBoardCreation:   true,
		AllowAnonymousCustomTemplates: true,
		AllowAnonymousHistory:         true,
	}

	infoService := NewInfoService(mockAuthService, mockFeedbackService, mockClock, serverConfig)

	info := infoService.Get(ctx)

	assert.Len(t, info.AuthProvider, 0)
	assert.True(t, info.FeedbackEnabled)
	assert.False(t, info.AnonymousLoginDisabled)
	assert.True(t, info.AllowAnonymousBoardCreation)
	assert.True(t, info.AllowAnonymousCustomTemplates)
	assert.True(t, info.AllowAnonymousHistory)
	assert.Equal(t, dateTime, info.ServerTime)
}
