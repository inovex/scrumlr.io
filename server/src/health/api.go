package health

type HealthService interface {
	IsDatabaseHealthy() bool
	IsRealtimeHealthy() bool
}

type HealthApi struct {
	service HealthService
}

func NewHealthApi(service HealthService) *HealthApi {
	api := new(HealthApi)
	api.service = service

	return api
}
