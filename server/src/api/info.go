package api

import (
	"github.com/go-chi/render"
	"net/http"
	"scrumlr.io/server/users"
	"time"
)

type Info struct {
	AuthProvider           []users.AccountType `json:"authProvider"`
	AnonymousLoginDisabled bool                `json:"anonymousLoginDisabled"`
	ServerTime             time.Time           `json:"serverTime"`
	FeedbackEnabled        bool                `json:"feedbackEnabled"`
}

func (s *Server) getServerInfo(w http.ResponseWriter, r *http.Request) {
	info := Info{}
	info.AuthProvider = []users.AccountType{}

	info.AnonymousLoginDisabled = s.anonymousLoginDisabled

	if s.auth.Exists(users.Google) {
		info.AuthProvider = append(info.AuthProvider, users.Google)
	}
	if s.auth.Exists(users.GitHub) {
		info.AuthProvider = append(info.AuthProvider, users.GitHub)
	}
	if s.auth.Exists(users.Microsoft) {
		info.AuthProvider = append(info.AuthProvider, users.Microsoft)
	}
	if s.auth.Exists(users.AzureAd) {
		info.AuthProvider = append(info.AuthProvider, users.AzureAd)
	}
	if s.auth.Exists(users.Apple) {
		info.AuthProvider = append(info.AuthProvider, users.Apple)
	}
	if s.auth.Exists(users.TypeOIDC) {
		info.AuthProvider = append(info.AuthProvider, users.TypeOIDC)
	}

	info.ServerTime = time.Now()

	if s.feedback.Enabled() {
		info.FeedbackEnabled = true
	} else {
		info.FeedbackEnabled = false
	}

	render.Status(r, http.StatusOK)
	render.Respond(w, r, info)
}
