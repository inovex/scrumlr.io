package api

import (
	"net/http"

	"github.com/go-chi/render"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/codes"
	"scrumlr.io/server/feedback"
	"scrumlr.io/server/logger"
)

//var tracer trace.Tracer = otel.Tracer("scrumlr.io/server/api")

func (s *Server) createFeedback(w http.ResponseWriter, r *http.Request) {
	ctx, span := Tracer.Start(r.Context(), "scrumlr.feedback.api.create")
	defer span.End()
	log := logger.FromContext(ctx)

	var body feedback.FeedbackRequest
	if err := render.Decode(r, &body); err != nil {
		span.SetStatus(codes.Error, "failed to decode body")
		span.RecordError(err)
		log.Errorw("Unable to decode body", "err", err)
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	span.SetAttributes(attribute.String("type", string(body.Type)))
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

	err := s.feedback.Create(ctx, string(body.Type), *body.Contact, *body.Text)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
}
