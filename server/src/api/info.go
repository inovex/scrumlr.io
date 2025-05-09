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

	if s.auth.Exists(auth.AccountTypeGoogle) {
		info.AuthProvider = append(info.AuthProvider, auth.AccountTypeGoogle)
	}
	if s.auth.Exists(auth.AccountTypeGitHub) {
		info.AuthProvider = append(info.AuthProvider, auth.AccountTypeGitHub)
	}
	if s.auth.Exists(auth.AccountTypeMicrosoft) {
		info.AuthProvider = append(info.AuthProvider, auth.AccountTypeMicrosoft)
	}
	if s.auth.Exists(auth.AccountTypeAzureAd) {
		info.AuthProvider = append(info.AuthProvider, auth.AccountTypeAzureAd)
	}
	if s.auth.Exists(auth.AccountTypeApple) {
		info.AuthProvider = append(info.AuthProvider, auth.AccountTypeApple)
	}
	if s.auth.Exists(auth.AccountTypeOIDC) {
		info.AuthProvider = append(info.AuthProvider, auth.AccountTypeOIDC)
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
