package feedback

import (
	"fmt"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestFeedbackTypeEnum(t *testing.T) {
	values := []FeedbackType{FeatureRequest, BugReport, Praise}
	for _, value := range values {
		var feedbackType FeedbackType
		err := feedbackType.UnmarshalJSON(fmt.Appendf(nil, "\"%s\"", value))
		assert.Nil(t, err)
		assert.Equal(t, value, feedbackType)
	}
}

func TestUnmarshalFeedbackTypeNil(t *testing.T) {
	var feedbackType FeedbackType
	err := feedbackType.UnmarshalJSON(nil)
	assert.NotNil(t, err)
}

func TestUnmarshalFeedbackTypeEmptyString(t *testing.T) {
	var feedbackType FeedbackType
	err := feedbackType.UnmarshalJSON([]byte(""))
	assert.NotNil(t, err)
}

func TestUnmarshalFeedbackTypeEmptyStringWithQuotation(t *testing.T) {
	var feedbackType FeedbackType
	err := feedbackType.UnmarshalJSON([]byte("\"\""))
	assert.NotNil(t, err)
}

func TestUnmarshalFeedbackTypeRandomValue(t *testing.T) {
	var feedbackType FeedbackType
	err := feedbackType.UnmarshalJSON([]byte("\"SOME_RANDOM_VALUE\""))
	assert.NotNil(t, err)
}
