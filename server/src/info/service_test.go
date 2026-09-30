package info

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"scrumlr.io/server/account"
	"scrumlr.io/server/auth"
	"scrumlr.io/server/feedback"
	"scrumlr.io/server/timeprovider"
)

func TestGetInfo(t *testing.T) {
	ctx := t.Context()

	mockAuthService := auth.NewMockAuth(t)
	mockAuthService.EXPECT().ConfiguredProvider().
		Return([]account.Type{account.Google, account.GitHub, account.Microsoft, account.AzureAd, account.Apple, account.OIDC})

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
	assert.Contains(t, info.AuthProvider, account.Google)
	assert.Contains(t, info.AuthProvider, account.GitHub)
	assert.Contains(t, info.AuthProvider, account.OIDC)
	assert.True(t, info.FeedbackEnabled)
	assert.False(t, info.AnonymousLoginDisabled)
	assert.True(t, info.AllowAnonymousBoardCreation)
	assert.False(t, info.AllowAnonymousCustomTemplates)
	assert.False(t, info.AllowAnonymousHistory)
	assert.Equal(t, dateTime, info.ServerTime)
}

func TestGetInfoAllAccountProviders(t *testing.T) {
	ctx := t.Context()

	mockAuthService := auth.NewMockAuth(t)
	mockAuthService.EXPECT().ConfiguredProvider().
		Return([]account.Type{account.Google, account.GitHub, account.Microsoft, account.AzureAd, account.Apple, account.OIDC})

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
	assert.Equal(t, []account.Type{account.Google, account.GitHub, account.Microsoft, account.AzureAd, account.Apple, account.OIDC}, info.AuthProvider)
	assert.True(t, info.FeedbackEnabled)
	assert.False(t, info.AnonymousLoginDisabled)
	assert.True(t, info.AllowAnonymousBoardCreation)
	assert.True(t, info.AllowAnonymousCustomTemplates)
	assert.True(t, info.AllowAnonymousHistory)
	assert.Equal(t, dateTime, info.ServerTime)
}

func TestGetInfoNoAccountProviders(t *testing.T) {
	ctx := t.Context()

	mockAuthService := auth.NewMockAuth(t)
	mockAuthService.EXPECT().ConfiguredProvider().
		Return([]account.Type{})

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
