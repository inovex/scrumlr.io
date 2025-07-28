package feedback

type FeedbackRequest struct {
	Contact *string      `json:"contact"`
	Text    *string      `json:"text"`
	Type    FeedbackType `json:"type"`
}
