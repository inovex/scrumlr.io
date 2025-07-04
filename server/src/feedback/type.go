package feedback

import (
	"encoding/json"
	"errors"
)

type FeedbackType string

const (
	BugReport      FeedbackType = "BUG_REPORT"
	FeatureRequest FeedbackType = "FEATURE_REQUEST"
	Praise         FeedbackType = "PRAISE"
)

func (feedbackType *FeedbackType) UnmarshalJSON(b []byte) error {
	var s string
	if err := json.Unmarshal(b, &s); err != nil {
		return err
	}

	unmarshalledFeedbackType := FeedbackType(s)
	switch unmarshalledFeedbackType {
	case Praise, BugReport, FeatureRequest:
		*feedbackType = unmarshalledFeedbackType
		return nil
	}

	return errors.New("Invalid feedback type")
}
