package feedback

import (
	"context"
	"net/http"
)

type FeedbackService interface {
	Create(ctx context.Context, feedbackType string, contact string, text string) error
	Enabled() bool
}

type API struct {
	feedbackService FeedbackService
	basePath        string
}

func (A API) createFeedback(w http.ResponseWriter, r *http.Request) {
	//TODO implement me
	panic("implement me")
}

func NewFeedbackAPI(service FeedbackService, basePath string) FeedbackAPI {
	api := &API{feedbackService: service, basePath: basePath}
	return api
}
