package api

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"github.com/go-chi/render"
	"net/http"
	"time"
)

type FeedbackType string

const (
	FeedbackTypeBugReport      FeedbackType = "BUG_REPORT"
	FeedbackTypeFeatureRequest FeedbackType = "FEATURE_REQUEST"
	FeedbackTypePraise         FeedbackType = "PRAISE"
)

func (feedbackType *FeedbackType) UnmarshalJSON(b []byte) error {
	var s string
	json.Unmarshal(b, &s)
	unmarshalledFeedbackType := FeedbackType(s)
	switch unmarshalledFeedbackType {
	case FeedbackTypePraise, FeedbackTypeBugReport, FeedbackTypeFeatureRequest:
		*feedbackType = unmarshalledFeedbackType
		return nil
	}
	return errors.New("Invalid feedback type")
}

type FeedbackRequest struct {
	Contact *string      `json:"contact"`
	Text    string       `json:"text"`
	Type    FeedbackType `json:"type"`
}

type WebhookText struct {
	Type string `json:"type"`
	Text string `json:"text"`
}
type WebhookBlock struct {
	Type string      `json:"type"`
	Text WebhookText `json:"text"`
}
type WebhookRequest struct {
	Text   string         `json:"text"`
	Blocks []WebhookBlock `json:"blocks"`
}

func (s *Server) createFeedback(w http.ResponseWriter, r *http.Request) {
	var body FeedbackRequest
	if err := render.Decode(r, &body); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	if body.Contact == nil || *body.Contact == "" {
		str := "Unbekannt"
		body.Contact = &str
	}

	u, err := json.Marshal(WebhookRequest{Text: "Scrumlr hat neues Feedback erhalten!", Blocks: []WebhookBlock{
		{
			Type: "header", Text: WebhookText{
				Type: "plain_text", Text: fmt.Sprintf("%s vom %s", body.Type, time.Now().Format("02.01.2006 15:04")),
			},
		},
		{
			Type: "section", Text: WebhookText{
				Type: "mrkdwn", Text: fmt.Sprintf("*Kontakt:* %s\n*Text:* %s", *body.Contact, body.Text),
			},
		},
	},
	})
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	_, err = http.Post("https://hooks.slack.com/services/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", "application/json", bytes.NewBuffer(u))
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusCreated)
	return
}
