package feedback

import (
	"bytes"
	"context"
	"fmt"
	"net/http"
	"scrumlr.io/server/logger"
	"scrumlr.io/server/services"
	"time"
)

type FeedbackService struct {
	webhookUrl string
}

func NewFeedbackService(webhookUrl string) services.Feedback {
	b := new(FeedbackService)
	b.webhookUrl = webhookUrl
	return b
}

func (s *FeedbackService) Create(ctx context.Context, feedbackType string, contact string, text string) error {
	log := logger.FromContext(ctx)
	log.Info("Webhook URL", s.webhookUrl)
	var jsonData = []byte(fmt.Sprintf(`{
    "text": "Scrumlr hat neues Feedback erhalten!",
    "blocks": [
      {
        "type": "header",
        "text": {
          "type": "plain_text",
          "text": "%s vom %s"
        }
      },
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": "Kontakt: %s\nText: %s"
        }
      }
    ]
  }`, feedbackType, time.Now().Format("02.01.2006 15:04"), contact, text))
	_, err := http.Post(s.webhookUrl, "application/json", bytes.NewBuffer(jsonData))
	return err
}

func (s *FeedbackService) Enabled() bool {
	return s.webhookUrl != ""
}
