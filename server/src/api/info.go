package api

import (
	"github.com/go-chi/render"
	"net/http"
	"scrumlr.io/server/auth"
	"time"
)

type Info struct {
	AuthProvider           []auth.AccountType `json:"authProvider"`
	AnonymousLoginDisabled bool               `json:"anonymousLoginDisabled"`
	ServerTime             time.Time          `json:"serverTime"`
	FeedbackEnabled        bool               `json:"feedbackEnabled"`
}

func (s *Server) getServerInfo(w http.ResponseWriter, r *http.Request) {
	info := Info{}
	info.AuthProvider = []auth.AccountType{}

	info.AnonymousLoginDisabled = s.anonymousLoginDisabled

	if s.auth.Exists(auth.Google) {
		info.AuthProvider = append(info.AuthProvider, auth.Google)
	}
	if s.auth.Exists(auth.GitHub) {
		info.AuthProvider = append(info.AuthProvider, auth.GitHub)
	}
	if s.auth.Exists(auth.Microsoft) {
		info.AuthProvider = append(info.AuthProvider, auth.Microsoft)
	}
	if s.auth.Exists(auth.AzureAd) {
		info.AuthProvider = append(info.AuthProvider, auth.AzureAd)
	}
	if s.auth.Exists(auth.Apple) {
		info.AuthProvider = append(info.AuthProvider, auth.Apple)
	}
	if s.auth.Exists(auth.TypeOIDC) {
		info.AuthProvider = append(info.AuthProvider, auth.TypeOIDC)
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
