package auth

import (
	"github.com/go-chi/render"
	"github.com/markbates/goth"
	"net/http"
	"scrumlr.io/server/common"
	"scrumlr.io/server/feedback"
	"time"
)

type AuthService interface {
	Sign(map[string]interface{}) (string, error)
	Verifier() func(http.Handler) http.Handler
	Authenticator() func(http.Handler) http.Handler
	Exists(accountType common.AccountType) bool
	ExtractUserInformation(common.AccountType, *goth.User) (*UserInformation, error)
}

type Info struct {
	AuthProvider                  []common.AccountType `json:"authProvider"`
	AnonymousLoginDisabled        bool                 `json:"anonymousLoginDisabled"`
	AllowAnonymousCustomTemplates bool                 `json:"allowAnonymousCustomTemplates"`
	ServerTime                    time.Time            `json:"serverTime"`
	FeedbackEnabled               bool                 `json:"feedbackEnabled"`
}

type API struct {
	service                       AuthService
	feedbackService               feedback.FeedbackService
	basePath                      string
	anonymousLoginDisabled        bool
	allowAnonymousCustomTemplates bool
}

func (a *API) getServerInfo(w http.ResponseWriter, r *http.Request) {
	info := Info{}
	info.AuthProvider = []common.AccountType{}

	info.AnonymousLoginDisabled = a.anonymousLoginDisabled

	info.AllowAnonymousCustomTemplates = a.allowAnonymousCustomTemplates

	if a.service.Exists(common.Google) {
		info.AuthProvider = append(info.AuthProvider, common.Google)
	}
	if a.service.Exists(common.GitHub) {
		info.AuthProvider = append(info.AuthProvider, common.GitHub)
	}
	if a.service.Exists(common.Microsoft) {
		info.AuthProvider = append(info.AuthProvider, common.Microsoft)
	}
	if a.service.Exists(common.AzureAd) {
		info.AuthProvider = append(info.AuthProvider, common.AzureAd)
	}
	if a.service.Exists(common.Apple) {
		info.AuthProvider = append(info.AuthProvider, common.Apple)
	}
	if a.service.Exists(common.TypeOIDC) {
		info.AuthProvider = append(info.AuthProvider, common.TypeOIDC)
	}

	info.ServerTime = time.Now()

	if a.feedbackService.Enabled() {
		info.FeedbackEnabled = true
	} else {
		info.FeedbackEnabled = false
	}

	render.Status(r, http.StatusOK)
	render.Respond(w, r, info)
}

func NewAuthAPI(service AuthService, feedbackService feedback.FeedbackService, basePath string, anonymousLoginDisabled bool, allowAnonymousCustomTemplates bool) AuthAPI {
	api := &API{service: service, feedbackService: feedbackService, basePath: basePath, allowAnonymousCustomTemplates: allowAnonymousCustomTemplates, anonymousLoginDisabled: anonymousLoginDisabled}
	return api
}
