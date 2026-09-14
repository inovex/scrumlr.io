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
	mockAuthService.EXPECT().Exists(common.Google).
		Return(true)
	mockAuthService.EXPECT().Exists(common.GitHub).
		Return(true)
	mockAuthService.EXPECT().Exists(common.Microsoft).
		Return(false)
	mockAuthService.EXPECT().Exists(common.AzureAd).
		Return(false)
	mockAuthService.EXPECT().Exists(common.Apple).
		Return(false)
	mockAuthService.EXPECT().Exists(common.TypeOIDC).
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
	assert.Contains(t, info.AuthProvider, common.Google)
	assert.Contains(t, info.AuthProvider, common.GitHub)
	assert.Contains(t, info.AuthProvider, common.TypeOIDC)
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
	mockAuthService.EXPECT().Exists(common.Google).
		Return(true)
	mockAuthService.EXPECT().Exists(common.GitHub).
		Return(true)
	mockAuthService.EXPECT().Exists(common.Microsoft).
		Return(true)
	mockAuthService.EXPECT().Exists(common.AzureAd).
		Return(true)
	mockAuthService.EXPECT().Exists(common.Apple).
		Return(true)
	mockAuthService.EXPECT().Exists(common.TypeOIDC).
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
	assert.Equal(t, []common.AccountType{common.Google, common.GitHub, common.Microsoft, common.AzureAd, common.Apple, common.TypeOIDC}, info.AuthProvider)
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
	mockAuthService.EXPECT().Exists(common.Google).
		Return(false)
	mockAuthService.EXPECT().Exists(common.GitHub).
		Return(false)
	mockAuthService.EXPECT().Exists(common.Microsoft).
		Return(false)
	mockAuthService.EXPECT().Exists(common.AzureAd).
		Return(false)
	mockAuthService.EXPECT().Exists(common.Apple).
		Return(false)
	mockAuthService.EXPECT().Exists(common.TypeOIDC).
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
