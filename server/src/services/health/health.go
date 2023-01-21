package health

import (
	"scrumlr.io/server/database"
	"scrumlr.io/server/realtime"
	"scrumlr.io/server/services"
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
