package info

import (
	"context"

	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/trace"
	"scrumlr.io/server/auth"
	"scrumlr.io/server/common"
	"scrumlr.io/server/feedback"
	"scrumlr.io/server/timeprovider"
)

var tracer trace.Tracer = otel.Tracer("scrumlr.io/server/info")

type Service struct {
	clock           timeprovider.TimeProvider
	authService     auth.Auth
	feedbackService feedback.FeedbackService
	serverConfig    ServerConfig
}

type ServerConfig struct {
	AnonymousLoginDisabled        bool
	AllowAnonymousCustomTemplates bool
	AllowAnonymousBoardCreation   bool
	AllowAnonymousHistory         bool
}

func NewInfoService(authService auth.Auth, feedbackService feedback.FeedbackService, clock timeprovider.TimeProvider, serverConfig ServerConfig) InfoService {
	service := new(Service)
	service.clock = clock
	service.serverConfig = serverConfig

	service.authService = authService
	service.feedbackService = feedbackService

	return service
}

func (service *Service) Get(ctx context.Context) *Info {
	ctx, span := tracer.Start(ctx, "scrumlr.info.service.get")
	defer span.End()

	info := new(Info)
	info.AnonymousLoginDisabled = service.serverConfig.AnonymousLoginDisabled
	info.AllowAnonymousCustomTemplates = service.serverConfig.AllowAnonymousCustomTemplates
	info.AllowAnonymousBoardCreation = service.serverConfig.AllowAnonymousBoardCreation
	info.AllowAnonymousHistory = service.serverConfig.AllowAnonymousHistory

	info.AuthProvider = make([]common.AccountType, 0, 6)
	for _, provider := range []common.AccountType{common.Google, common.GitHub, common.Microsoft, common.AzureAd, common.Apple, common.TypeOIDC} {
		if service.authService.Exists(provider) {
			info.AuthProvider = append(info.AuthProvider, provider)
		}
	}

	info.FeedbackEnabled = service.feedbackService.Enabled()
	info.ServerTime = service.clock.Now()

	return info
}
