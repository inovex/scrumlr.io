package health

import (
	"scrumlr.io/server/internal/database"
	"scrumlr.io/server/internal/realtime"
	"scrumlr.io/server/internal/services"
)

type HealthService struct {
	database *database.Database
	realtime *realtime.Broker
}

func NewHealthService(database *database.Database, realtime *realtime.Broker) services.Health {
	b := new(HealthService)
	b.database = database
	b.realtime = realtime
	return b
}

func (h *HealthService) IsDatabaseHealthy() bool {
	return h.database.IsHealthy()
}

func (h *HealthService) IsRealtimeHealthy() bool {
	return h.realtime.IsHealthy()
}
