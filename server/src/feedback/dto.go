package feedback

import (
	"encoding/json"
	"errors"
)

type FeedbackType string

const (
	FeedbackTypeBugReport      FeedbackType = "BUG_REPORT"
	FeedbackTypeFeatureRequest FeedbackType = "FEATURE_REQUEST"
	FeedbackTypePraise         FeedbackType = "PRAISE"
)

type FeedbackRequest struct {
	Contact *string      `json:"contact"`
	Text    *string      `json:"text"`
	Type    FeedbackType `json:"type"`
}

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
