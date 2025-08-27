package health

import (
	"context"

	"scrumlr.io/server/realtime"
)

type HealthDatabase interface {
	IsHealthy(ctx context.Context) bool
}

type Service struct {
	database HealthDatabase
	realtime *realtime.Broker
}

func NewHealthService(db HealthDatabase, rt *realtime.Broker) HealthService {
	service := new(Service)
	service.database = db
	service.realtime = rt

	return service
}

func (service *Service) IsDatabaseHealthy(ctx context.Context) bool {
	return service.database.IsHealthy(ctx)
}

func (service *Service) IsRealtimeHealthy() bool {
	return service.realtime.IsHealthy()
}
