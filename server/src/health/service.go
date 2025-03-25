package health

import "scrumlr.io/server/realtime"

type HealthDatabase interface {
	IsHealthy() bool
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

func (service *Service) IsDatabaseHealthy() bool {
	return service.database.IsHealthy()
}

func (service *Service) IsRealtimeHealthy() bool {
	return service.realtime.IsHealthy()
}
