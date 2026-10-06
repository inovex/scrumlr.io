package health

import (
	"context"

	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/trace"
	"scrumlr.io/server/realtime"
)

var tracer trace.Tracer = otel.Tracer("scrumlr.io/server/health")

type HealthDatabaseChecker interface {
	IsHealthy(ctx context.Context) bool
}

type Service struct {
	database HealthDatabaseChecker
	realtime *realtime.Broker
}

func NewHealthService(db HealthDatabaseChecker, rt *realtime.Broker) HealthService {
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
