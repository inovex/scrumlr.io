package info

import (
	"time"

	"scrumlr.io/server/account"
)

type Info struct {
	AuthProvider                  []account.Type `json:"authProvider"`
	AnonymousLoginDisabled        bool                  `json:"anonymousLoginDisabled"`
	AllowAnonymousCustomTemplates bool                  `json:"allowAnonymousCustomTemplates"`
	AllowAnonymousBoardCreation   bool                  `json:"allowAnonymousBoardCreation"`
	AllowAnonymousHistory         bool                  `json:"allowAnonymousHistory"`
	ServerTime                    time.Time             `json:"serverTime"`
	FeedbackEnabled               bool                  `json:"feedbackEnabled"`
}
