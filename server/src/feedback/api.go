package feedback

import "context"

type FeedbackService interface {
	Create(ctx context.Context, feedbackType string, contact string, text string) error
	Enabled() bool
}

type FeedbackApi struct {
	feedbackService FeedbackService
}

func NewFeedbackApi(feedbackService FeedbackService) *FeedbackApi {
	api := new(FeedbackApi)
	api.feedbackService = feedbackService

	return api
}
