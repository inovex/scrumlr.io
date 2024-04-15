package api

import (
	"encoding/json"
	"errors"
	"github.com/go-chi/render"
	"net/http"
)

type FeedbackType string

const (
	FeedbackTypeBugReport      FeedbackType = "BUG_REPORT"
	FeedbackTypeFeatureRequest FeedbackType = "FEATURE_REQUEST"
	FeedbackTypePraise         FeedbackType = "PRAISE"
)

func (feedbackType *FeedbackType) UnmarshalJSON(b []byte) error {
	var s string
	if err := json.Unmarshal(b, &s); err != nil {
		return err
	}
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
	Text    *string      `json:"text"`
	Type    FeedbackType `json:"type"`
}

func (s *Server) createFeedback(w http.ResponseWriter, r *http.Request) {
	var body FeedbackRequest
	if err := render.Decode(r, &body); err != nil {
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
	if body.Type == FeedbackTypeFeatureRequest && *body.Text == "/" {
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	if body.Type == FeedbackTypeBugReport && *body.Text == "/" {
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
