package feedback

import (
	"bytes"
	"context"
	"fmt"
	"net/http"
	"time"

	"scrumlr.io/server/logger"
)

type Service struct {
	client     *http.Client
	webhookUrl string
}

func NewFeedbackService(client *http.Client, webhookUrl string) FeedbackService {
	service := new(Service)
	service.webhookUrl = webhookUrl
	service.client = client

	return service
}

func (service *Service) Create(ctx context.Context, feedbackType string, contact string, text string) error {
	log := logger.FromContext(ctx)
	log.Info("Webhook URL", service.webhookUrl)

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

	_, err := service.client.Post(service.webhookUrl, "application/json", bytes.NewBuffer(jsonData))

	return err
}

func (service *Service) Enabled() bool {
	return service.webhookUrl != ""
}
