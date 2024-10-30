package api

import (
	"fmt"
	"math"
	"net/http"
	"os"
	"strings"
	"time"

	"scrumlr.io/server/common"
	"scrumlr.io/server/logger"

	"github.com/go-chi/render"
	"github.com/gorilla/sessions"
	"github.com/markbates/goth/gothic"
	"scrumlr.io/server/common/dto"
	"scrumlr.io/server/database/types"
)

// AnonymousSignUpRequest represents the request to create a new anonymous user.
type AnonymousSignUpRequest struct {
	// The display name of the user.
	Name string
}

// signInAnonymously create a new anonymous user
func (s *Server) signInAnonymously(w http.ResponseWriter, r *http.Request) {
	log := logger.FromRequest(r)

	var body AnonymousSignUpRequest
	if err := render.Decode(r, &body); err != nil {
		log.Errorw("unable to decode body", "err", err)
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	user, err := s.users.LoginAnonymous(r.Context(), body.Name)
	if err != nil {
		common.Throw(w, r, common.InternalServerError)
		return
	}

	tokenString, err := s.auth.Sign(map[string]interface{}{"id": user.ID})
	if err != nil {
		log.Errorw("unable to generate token string", "err", err)
		common.Throw(w, r, common.InternalServerError)
		return
	}

	cookie := http.Cookie{Name: "jwt", Value: tokenString, Path: "/", HttpOnly: true, MaxAge: math.MaxInt32}
	common.SealCookie(r, &cookie)
	http.SetCookie(w, &cookie)

	render.Status(r, http.StatusCreated)
	render.Respond(w, r, user)
}

func (s *Server) logout(w http.ResponseWriter, r *http.Request) {
	cookie := http.Cookie{Name: "jwt", Value: "deleted", Path: "/", MaxAge: -1, Expires: time.UnixMilli(0)}
	common.SealCookie(r, &cookie)
	http.SetCookie(w, &cookie)

	if common.GetHostWithoutPort(r) != common.GetTopLevelHost(r) {
		cookieWithSubdomain := http.Cookie{Name: "jwt", Value: "deleted", Path: "/", MaxAge: -1, Expires: time.UnixMilli(0)}
		common.SealCookie(r, &cookieWithSubdomain)
		cookieWithSubdomain.Domain = common.GetHostWithoutPort(r)
		http.SetCookie(w, &cookieWithSubdomain)
	}

	render.Status(r, http.StatusNoContent)
	render.Respond(w, r, nil)
}

// beginAuthProviderVerification will redirect the user to the specified auth provider consent page
func (s *Server) beginAuthProviderVerification(w http.ResponseWriter, r *http.Request) {
	store := sessions.NewFilesystemStore(os.TempDir(), []byte("scrumlr.io"))
	store.MaxLength(1e9)
	gothic.Store = store
	gothic.BeginAuthHandler(w, r)
}

// verifyAuthProviderCallback will verify the auth provider call, create or update a user and redirect to the page provider with the state
func (s *Server) verifyAuthProviderCallback(w http.ResponseWriter, r *http.Request) {
	log := logger.FromRequest(r)
	externalUser, err := gothic.CompleteUserAuth(w, r)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		log.Errorw("could not complete user auth", "err", err)
		return
	}

	provider, err := types.NewAccountType(externalUser.Provider)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		log.Errorw("unsupported user provider", "err", err)
		return
	}

	userInfo, err := s.auth.ExtractUserInformation(provider, &externalUser)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		log.Errorw("insufficient user information from external auth source", "err", err)
		return
	}

	var internalUser *dto.User
	switch provider {
	case types.AccountTypeGoogle:
		internalUser, err = s.users.CreateGoogleUser(r.Context(), userInfo.Ident, userInfo.Name, userInfo.AvatarURL)
	case types.AccountTypeGitHub:
		internalUser, err = s.users.CreateGitHubUser(r.Context(), userInfo.Ident, userInfo.Name, userInfo.AvatarURL)
	case types.AccountTypeMicrosoft:
		internalUser, err = s.users.CreateMicrosoftUser(r.Context(), userInfo.Ident, userInfo.Name, userInfo.AvatarURL)
	case types.AccountTypeAzureAd:
		internalUser, err = s.users.CreateAzureAdUser(r.Context(), userInfo.Ident, userInfo.Name, userInfo.AvatarURL)
	case types.AccountTypeApple:
		internalUser, err = s.users.CreateAppleUser(r.Context(), userInfo.Ident, userInfo.Name, userInfo.AvatarURL)
	case types.AccountTypeOIDC:
		internalUser, err = s.users.CreateOIDCUser(r.Context(), userInfo.Ident, userInfo.Name, userInfo.AvatarURL)
	}
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		log.Errorw("could not create user", "err", err)
		return
	}

	tokenString, _ := s.auth.Sign(map[string]interface{}{"id": internalUser.ID})
	cookie := http.Cookie{Name: "jwt", Value: tokenString, Path: "/", Expires: time.Now().AddDate(0, 0, 3*7)}
	common.SealCookie(r, &cookie)
	http.SetCookie(w, &cookie)

	state := gothic.GetState(r)
	stateSplit := strings.Split(state, "__")
	if len(stateSplit) > 1 {
		w.Header().Set("Location", stateSplit[1])
		w.WriteHeader(http.StatusSeeOther)
	}
	if s.basePath == "/" {
		w.Header().Set("Location", fmt.Sprintf("%s://%s/", common.GetProtocol(r), r.Host))
	} else {
		w.Header().Set("Location", fmt.Sprintf("%s://%s%s/", common.GetProtocol(r), r.Host, s.basePath))
	}
	w.WriteHeader(http.StatusSeeOther)
}
