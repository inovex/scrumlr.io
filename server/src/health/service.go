package health

import (
	"context"

	"scrumlr.io/server/realtime"
)

type HealthChecker interface {
	IsHealthy(ctx context.Context) bool
}

type Service struct {
	database HealthChecker
	realtime *realtime.Broker
}

func NewHealthService(db HealthChecker, rt *realtime.Broker) HealthService {
	service := new(Service)
	service.database = db
	service.realtime = rt

	return service
}

func (service *Service) IsDatabaseHealthy(ctx context.Context) bool {
	return service.database.IsHealthy(ctx)
}

func (service *Service) IsRealtimeHealthy(ctx context.Context) bool {
	return service.realtime.IsHealthy(ctx)
}
