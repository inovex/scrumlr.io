package health

import "net/http"

type HealthService interface {
	IsDatabaseHealthy() bool
	IsRealtimeHealthy() bool
}

type API struct {
	feedbackService HealthService
	basePath        string
}

func (A API) healthCheck(w http.ResponseWriter, r *http.Request) {
	//TODO implement me
	panic("implement me")
}

func NewHealthAPI(service HealthService, basePath string) HealthAPI {
	api := &API{feedbackService: service, basePath: basePath}
	return api
}
