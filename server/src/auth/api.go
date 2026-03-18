package auth

import (
  "crypto/rand"
  "crypto/subtle"
  "encoding/base64"
  "errors"
  "fmt"
  "io"
  "math"
  "net/http"
  "strings"
  "time"

  "github.com/go-chi/chi/v5"
  "github.com/go-chi/render"
  "go.opentelemetry.io/otel/codes"
  "scrumlr.io/server/common"
  "scrumlr.io/server/logger"
  "scrumlr.io/server/users"
)

type API struct {
  service     AuthService
  userService users.UserService
  basePath    string
  hostPath    string
}

type AnonymousSignUpRequest struct {
  // The display name of the user.
  Name string
}

func (api *API) SignInAnonymously(w http.ResponseWriter, r *http.Request) {
  ctx, span := tracer.Start(r.Context(), "scrumlr.auth.api.signin.anonymous")
  defer span.End()
  log := logger.FromContext(ctx)

  var body AnonymousSignUpRequest
  if err := render.Decode(r, &body); err != nil {
    span.SetStatus(codes.Error, "unable to decode body")
    span.RecordError(err)
    log.Errorw("unable to decode body", "err", err)
    common.Throw(w, r, common.BadRequestError(err))
    return
  }

  user, err := api.userService.CreateAnonymous(ctx, body.Name)
  if err != nil {
    span.SetStatus(codes.Error, "failed to create anonymous user")
    span.RecordError(err)
    common.Throw(w, r, common.InternalServerError)
    return
  }
  tokenString, err := api.service.Sign(map[string]any{"id": user.ID})
  if err != nil {
    span.SetStatus(codes.Error, "failed to generate token string")
    span.RecordError(err)
    log.Errorw("unable to generate token string", "err", err)
    common.Throw(w, r, common.InternalServerError)
    return
  }

  cookie := http.Cookie{Name: "jwt", Value: tokenString, Path: "/", HttpOnly: true, MaxAge: math.MaxInt32, Secure: true, SameSite: http.SameSiteStrictMode}
  common.SealCookie(r, &cookie)
  http.SetCookie(w, &cookie)

  render.Status(r, http.StatusCreated)
  render.Respond(w, r, user)
}

func (api *API) Logout(w http.ResponseWriter, r *http.Request) {
  _, span := tracer.Start(r.Context(), "scrumlr.login.api.logout")
  defer span.End()

  cookie := http.Cookie{Name: "jwt", Value: "deleted", Path: "/", MaxAge: -1, Expires: time.UnixMilli(0), Secure: true, SameSite: http.SameSiteStrictMode}
  common.SealCookie(r, &cookie)
  http.SetCookie(w, &cookie)

  if common.GetHostWithoutPort(r) != common.GetTopLevelHost(r) {
    cookieWithSubdomain := http.Cookie{Name: "jwt", Value: "deleted", Path: "/", MaxAge: -1, Expires: time.UnixMilli(0), Secure: true, SameSite: http.SameSiteStrictMode}
    common.SealCookie(r, &cookieWithSubdomain)
    cookieWithSubdomain.Domain = common.GetHostWithoutPort(r)
    http.SetCookie(w, &cookieWithSubdomain)
  }

  render.Status(r, http.StatusNoContent)
  render.Respond(w, r, nil)
}

func (api *API) BeginAuth(w http.ResponseWriter, r *http.Request) {
  log := logger.FromContext(r.Context())
  _, span := tracer.Start(r.Context(), "scrumlr.login.api.begin_auth")
  defer span.End()
  provider := strings.ToUpper(chi.URLParam(r, "provider"))

  config, err := api.service.GetConfig(provider)
  if err != nil {
    log.Errorw("provider does not exist", "provider", provider)
    span.SetStatus(codes.Error, "provider does not exist")
    span.RecordError(fmt.Errorf("provider %s does not exist", provider))
    common.Throw(w, r, common.BadRequestError(err))
  }

  //get redirect url from query param
  nonceBytes := make([]byte, 64)
  if _, err := io.ReadFull(rand.Reader, nonceBytes); err != nil {
    log.Errorw("unable to generate nonce", "err", err)
    span.SetStatus(codes.Error, "unable to generate nonce")
    span.RecordError(fmt.Errorf("unable to generate nonce"))
    common.Throw(w, r, common.InternalServerError)
    return
  }
  nonce := base64.URLEncoding.EncodeToString(nonceBytes)
  // store nonce in secure cookie for later comparison
  http.SetCookie(w, &http.Cookie{
    Name:     "oauth_state",
    Value:    nonce,
    Path:     "/",
    MaxAge:   300,
    Secure:   true,
    HttpOnly: true,
    SameSite: http.SameSiteLaxMode,
  })

  returnURL := r.URL.Query().Get("state")
  if !strings.HasPrefix(returnURL, api.hostPath) {
    log.Errorw("host path not prefix of return url", "expected", api.hostPath, "got", returnURL)
    span.SetStatus(codes.Error, "host path not prefix of return url")
    span.RecordError(fmt.Errorf("host path not prefix of return url"))
    common.Throw(w, r, common.ForbiddenError(errors.New("invalid return url")))
    return
  }

  state := nonce
  if returnURL != "" {
    state = fmt.Sprintf("%s__%s", nonce, returnURL)
  }

  url := config.AuthCodeURL(state)
  http.Redirect(w, r, url, http.StatusTemporaryRedirect)
}

func (api *API) Callback(w http.ResponseWriter, r *http.Request) {
  log := logger.FromContext(r.Context())
  ctx, span := tracer.Start(r.Context(), "scrumlr.auth.service.handle_callback")
  defer span.End()

  providerStr := strings.ToUpper(chi.URLParam(r, "provider"))

  exists := api.service.Exists(common.AccountType(providerStr))
  if !exists {
    log.Errorw("provider does not exist", "provider", providerStr)
    span.SetStatus(codes.Error, "provider does not exist")
    span.RecordError(fmt.Errorf("provider %s does not exist", providerStr))
    common.Throw(w, r, common.BadRequestError(errors.New("provider does not exist")))
    return
  }

  state := r.FormValue("state")

  oauthCookie, err := r.Cookie("oauth_state")
  if err != nil {
    common.Throw(w, r, common.BadRequestError(err))
    return
  }

  //format: nonce__returnURL
  parts := strings.Split(state, "__")
  returnedNonce := parts[0]

  //compare nonce from cookie and request
  if subtle.ConstantTimeCompare([]byte(returnedNonce), []byte(oauthCookie.Value)) != 1 {
    common.Throw(w, r, common.ForbiddenError(errors.New("invalid state detected")))
    return
  }

  //Delete the cookie so it can't be reused
  http.SetCookie(w, &http.Cookie{
    Name:   "oauth_state",
    MaxAge: -1,
  })

  code := r.FormValue("code")
  cookie, err := api.service.HandleCallback(ctx, providerStr, code)
  if err != nil {
    span.SetStatus(codes.Error, "failed to handle callback")
    span.RecordError(err)
    log.Errorw("failed to handle callback", "err", err)
    common.Throw(w, r, err)
    return
  }

  common.SealCookie(r, cookie)
  http.SetCookie(w, cookie)

  targetURL := api.basePath
  stateSplit := strings.Split(state, "__")
  if len(stateSplit) > 1 {
    targetURL = stateSplit[1]
  }
  if api.basePath == "/" {
    w.Header().Set("Location", fmt.Sprintf("%s://%s/", common.GetProtocol(r), r.Host))
  } else {
    w.Header().Set("Location", fmt.Sprintf("%s://%s%s/", common.GetProtocol(r), r.Host, api.basePath))
  }
  http.Redirect(w, r, targetURL, http.StatusSeeOther)
}

func NewAuthApi(service AuthService, userService users.UserService, hostPath, basePath string) AuthApi {
  api := new(API)
  api.service = service
  api.userService = userService
  api.hostPath = hostPath
  api.basePath = basePath
  return api
}
