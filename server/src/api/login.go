package api

import (
  "fmt"
  "net"
  "net/http"
  "net/url"
  "scrumlr.io/server/common"
  "scrumlr.io/server/logger"
  "strings"
  "time"

  "github.com/go-chi/render"
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
    w.WriteHeader(http.StatusBadRequest)
    return
  }

  user, err := s.users.LoginAnonymous(r.Context(), body.Name)
  if err != nil {
    log.Errorw("could not create user", "req", body, "err", err)
    common.Throw(w, r, common.InternalServerError)
    return
  }

  tokenString, err := s.auth.Sign(map[string]interface{}{"id": user.ID})
  if err != nil {
    log.Errorw("unable to generate token string", "err", err)
    common.Throw(w, r, common.InternalServerError)
    return
  }

  cookie := http.Cookie{Name: "jwt", Value: tokenString, Path: "/", HttpOnly: true}
  s.sealCookie(&cookie)
  http.SetCookie(w, &cookie)

  render.Status(r, http.StatusCreated)
  render.Respond(w, r, user)
}

func (s *Server) logout(w http.ResponseWriter, r *http.Request) {
  cookie := http.Cookie{Name: "jwt", Expires: time.UnixMilli(0)}
  http.SetCookie(w, &cookie)
  render.Status(r, http.StatusNoContent)
  render.Respond(w, r, nil)
}

// beginAuthProviderVerification will redirect the user to the specified auth provider consent page
func (s *Server) beginAuthProviderVerification(w http.ResponseWriter, r *http.Request) {
  gothic.BeginAuthHandler(w, r)
}

// verifyAuthProviderCallback will verify the auth provider call, create or update a user and redirect to the page provider with the state
func (s *Server) verifyAuthProviderCallback(w http.ResponseWriter, r *http.Request) {
  externalUser, err := gothic.CompleteUserAuth(w, r)
  if err != nil {
    w.WriteHeader(http.StatusInternalServerError)
    return
  }

  provider := strings.ToUpper(externalUser.Provider)
  var internalUser *dto.User
  switch provider {
  case (string)(types.AccountTypeGoogle):
    internalUser, err = s.users.CreateGoogleUser(r.Context(), externalUser.UserID, externalUser.NickName, externalUser.AvatarURL)
  case (string)(types.AccountTypeGitHub):
    internalUser, err = s.users.CreateGitHubUser(r.Context(), externalUser.UserID, externalUser.NickName, externalUser.AvatarURL)
  case (string)(types.AccountTypeMicrosoft):
    internalUser, err = s.users.CreateMicrosoftUser(r.Context(), externalUser.UserID, externalUser.NickName, externalUser.AvatarURL)
  case (string)(types.AccountTypeApple):
    internalUser, err = s.users.CreateAppleUser(r.Context(), externalUser.UserID, externalUser.NickName, externalUser.AvatarURL)
  }
  if err != nil {
    w.WriteHeader(http.StatusInternalServerError)
    return
  }

  tokenString, _ := s.auth.Sign(map[string]interface{}{"id": internalUser.ID})
  cookie := http.Cookie{Name: "jwt", Value: tokenString, Path: "/", Expires: time.Now().AddDate(0, 0, 3*7)}
  s.sealCookie(&cookie)
  http.SetCookie(w, &cookie)

  state := gothic.GetState(r)
  stateSplit := strings.Split(state, "__")
  if len(stateSplit) > 1 {
    w.Header().Set("Location", stateSplit[1])
    w.WriteHeader(http.StatusSeeOther)
  }

  w.Header().Set("Location", fmt.Sprintf("%s/", s.baseURL))
  w.WriteHeader(http.StatusSeeOther)
}

func (s *Server) sealCookie(cookie *http.Cookie) {
  if s.baseURL != "" {
    baseURL, _ := url.Parse(s.baseURL)
    if baseURL.Scheme == "https" {
      cookie.Secure = true
      cookie.SameSite = http.SameSiteStrictMode
    }

    hostname, _, _ := net.SplitHostPort(baseURL.Host)
    hostWithSubdomain := strings.Split(hostname, ".")
    if len(hostWithSubdomain) == 3 {
      cookie.Domain = fmt.Sprintf("%s.%s", hostWithSubdomain[1], hostWithSubdomain[2])
    } else {
      cookie.Domain = hostname
    }
  }
  cookie.HttpOnly = true
}
