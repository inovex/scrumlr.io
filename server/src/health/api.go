package health

import "context"

type HealthService interface {
	IsDatabaseHealthy(ctx context.Context) bool
	IsRealtimeHealthy(ctx context.Context) bool
}

type HealthApi struct {
	service HealthService
}

func NewHealthApi(service HealthService) *HealthApi {
	api := new(HealthApi)
	api.service = service

	return api
}
