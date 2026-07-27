package api

import (
	"net/http"
	"time"

	"github.com/go-chi/render"
	"scrumlr.io/server/common"
)

type Info struct {
	AuthProvider                  []common.AccountType `json:"authProvider"`
	AnonymousLoginDisabled        bool                 `json:"anonymousLoginDisabled"`
	AllowAnonymousCustomTemplates bool                 `json:"allowAnonymousCustomTemplates"`
	AllowAnonymousBoardCreation   bool                 `json:"allowAnonymousBoardCreation"`
	ServerTime                    time.Time            `json:"serverTime"`
	FeedbackEnabled               bool                 `json:"feedbackEnabled"`
}

// Get server info
//
//	@Summary		Show server info
//	@Description	Get the server info with the configured options
//	@Tags			info
//	@Produce		json
//	@Success		200	{object}	api.Info
//	@Router			/info [get]
func (s *Server) getServerInfo(w http.ResponseWriter, r *http.Request) {
	info := Info{}
	info.AuthProvider = []common.AccountType{}

	info.AnonymousLoginDisabled = s.anonymousLoginDisabled

	info.AllowAnonymousCustomTemplates = s.allowAnonymousCustomTemplates

	info.AllowAnonymousBoardCreation = s.allowAnonymousBoardCreation

	if s.auth.Exists(common.Google) {
		info.AuthProvider = append(info.AuthProvider, common.Google)
	}
	if s.auth.Exists(common.GitHub) {
		info.AuthProvider = append(info.AuthProvider, common.GitHub)
	}
	if s.auth.Exists(common.Microsoft) {
		info.AuthProvider = append(info.AuthProvider, common.Microsoft)
	}
	if s.auth.Exists(common.AzureAd) {
		info.AuthProvider = append(info.AuthProvider, common.AzureAd)
	}
	if s.auth.Exists(common.Apple) {
		info.AuthProvider = append(info.AuthProvider, common.Apple)
	}
	if s.auth.Exists(common.TypeOIDC) {
		info.AuthProvider = append(info.AuthProvider, common.TypeOIDC)
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
