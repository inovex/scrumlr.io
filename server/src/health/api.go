package health

import (
	"net/http"

	"github.com/go-chi/render"
	"scrumlr.io/server/logger"
)

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

func (api *HealthApi) healthcheck(w http.ResponseWriter, r *http.Request) {
	realtimeHealthy := api.service.IsRealtimeHealthy()
	databaseHealthy := api.service.IsDatabaseHealthy()

	if realtimeHealthy && databaseHealthy {
		render.Status(r, http.StatusNoContent)
		render.Respond(w, r, nil)
		return
	}

	logger.Get().Errorw("service is not healthy", "realtime", realtimeHealthy, "database", databaseHealthy)
	render.Status(r, http.StatusServiceUnavailable)
	render.Respond(w, r, nil)
}
