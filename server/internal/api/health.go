package api

import (
	"github.com/go-chi/render"
	"net/http"
	"scrumlr.io/server/internal/logger"
)

func (s *Server) healthCheck(w http.ResponseWriter, r *http.Request) {
	realtimeHealthy := s.health.IsRealtimeHealthy()
	databaseHealthy := s.health.IsDatabaseHealthy()

	if realtimeHealthy && databaseHealthy {
		render.Status(r, http.StatusNoContent)
		render.Respond(w, r, nil)
		return
	}
	logger.Get().Errorw("service is not healthy", "realtime", realtimeHealthy, "database", databaseHealthy)
	render.Status(r, http.StatusServiceUnavailable)
	render.Respond(w, r, nil)
}
