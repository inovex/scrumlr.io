package api

import (
	"net/http"

	"github.com/go-chi/render"
	"scrumlr.io/server/feedback"
	"scrumlr.io/server/logger"
)

func (s *Server) createFeedback(w http.ResponseWriter, r *http.Request) {
	log := logger.FromRequest(r)
	var body feedback.FeedbackRequest
	if err := render.Decode(r, &body); err != nil {
		log.Errorw("Unable to decode body", "err", err)
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	if body.Contact == nil || *body.Contact == "" {
		str := "/"
		body.Contact = &str
	}
	if body.Text == nil || *body.Text == "" {
		str := "/"
		body.Text = &str
	}
	if body.Type == feedback.FeatureRequest && *body.Text == "/" {
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	if body.Type == feedback.BugReport && *body.Text == "/" {
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	err := s.feedback.Create(r.Context(), string(body.Type), *body.Contact, *body.Text)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusCreated)
}
