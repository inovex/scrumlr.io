package feedback

import (
	"context"
	"net/http"

	"github.com/go-chi/render"
	"go.opentelemetry.io/otel/attribute"
	"scrumlr.io/server/logger"
	"scrumlr.io/server/otel"
)

type FeedbackService interface {
	Create(ctx context.Context, feedbackType FeedbackType, contact string, text string) error
	Enabled() bool
}

type Api struct {
	service FeedbackService
}

func NewFeedbackApi(feedbackService FeedbackService) FeedbackApi {
	api := new(Api)
	api.service = feedbackService

	return api
}

// Send feedback for scrumlr
//
//	@Summary		Send feedback for scrumlr
//	@Description	Send feedback for scrumlr
//	@Tags			feedback
//	@Accept			json
//	@Produce		json
//	@Param			feedback	body	feedback.FeedbackRequest	true	"Feedback to send"
//	@Success		204
//	@Failure		500
//	@Router			/feedback [post]
func (api *Api) CreateFeedback(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "scrumlr.feedback.api.create")
	defer span.End()
	log := logger.FromContext(ctx)

	var body FeedbackRequest
	if err := render.Decode(r, &body); err != nil {
		otel.RecordErrorSpan(span, err, new("failed to decode body"))
		log.Errorw("Unable to decode body", "err", err)
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	span.SetAttributes(attribute.String("type", string(body.Type)))

	if body.Contact == nil || *body.Contact == "" {
		body.Contact = new("/")
	}

	if body.Text == nil || *body.Text == "" {
		body.Text = new("/")
	}

	if body.Type == FeatureRequest && *body.Text == "/" {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	if body.Type == BugReport && *body.Text == "/" {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	err := api.service.Create(ctx, body.Type, *body.Contact, *body.Text)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
}
