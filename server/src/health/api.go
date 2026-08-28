package health

import (
	"context"
	"errors"
	"net/http"

	"github.com/go-chi/render"
	"go.opentelemetry.io/otel/attribute"
	"scrumlr.io/server/logger"
	"scrumlr.io/server/otel"
)

type HealthService interface {
	IsDatabaseHealthy(ctx context.Context) bool
	IsRealtimeHealthy(ctx context.Context) bool
}

type Api struct {
	service HealthService
}

func NewHealthApi(service HealthService) HealthApi {
	api := new(Api)
	api.service = service

	return api
}

// Get server health status
//
//	@Summary		Get the health status
//	@Description	Get the health status of the scrumlr backend
//	@Tags			health
//	@Produce		json
//	@Success		204
//	@Failure		503
//	@Router			/health [get]
func (api *Api) Check(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "scrumlr.health.api")
	defer span.End()
	log := logger.FromContext(ctx)

	realtimeHealthy := api.service.IsRealtimeHealthy(ctx)
	databaseHealthy := api.service.IsDatabaseHealthy(ctx)

	span.SetAttributes(
		attribute.Bool("scrumlr.health.api.database.healthy", databaseHealthy),
		attribute.Bool("scrumlr.health.api.realtime.healthy", realtimeHealthy),
	)

	if realtimeHealthy && databaseHealthy {
		render.Status(r, http.StatusNoContent)
		render.Respond(w, r, nil)
		return
	}

	err := errors.New("service not healthy")
	otel.RecordErrorSpan(span, err, nil)
	log.Errorw("service is not healthy", "realtime", realtimeHealthy, "database", databaseHealthy)
	render.Status(r, http.StatusServiceUnavailable)
	render.Respond(w, r, nil)
}
