package api

import (
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"math"
	"net/http"
	"net/url"
	"strings"
	"time"

	"scrumlr.io/server/account"
	"scrumlr.io/server/otel"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"scrumlr.io/server/common"
	"scrumlr.io/server/logger"
)

//var tracer trace.Tracer = otel.Tracer("scrumlr.io/server/api")

// AnonymousSignUpRequest represents the request to create a new anonymous user.
type AnonymousSignUpRequest struct {
	// The display name of the user.
	Name string
}

type AppleUserInfo struct {
	Name struct {
		FirstName string `json:"firstName"`
		LastName  string `json:"lastName"`
	} `json:"name"`
	Email string `json:"email"`
}

// Create a new anonymous user
//
//	@Summary		Create a new anonymous user
//	@Description	Create a new anonymous user
//	@Tags			auth
//	@Accept			json
//	@Param			user	body	AnonymousSignUpRequest	true	"user to create"
//	@Produce		json
//	@Header			201	{string}	Cookie	"jwt token to sign in"
//	@Success		201	{object}	users.User
//	@Failure		400	{object}	common.APIError
//	@Failure		403	{object}	common.APIError
//	@Failure		500	{object}	common.APIError
//	@Router			/login/anonymous [post]
func (s *Server) signInAnonymously(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "scrumlr.login.api.signin.anonymous")
	defer span.End()
	log := logger.FromContext(ctx)

	var body AnonymousSignUpRequest
	if err := render.Decode(r, &body); err != nil {
		otel.RecordErrorSpan(span, err, new("unable to decode body"))
		log.Errorw("unable to decode body", "err", err)
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	user, err := s.users.Create(ctx, "", body.Name, "", account.Anonymous)
	if err != nil {
		otel.RecordErrorSpan(span, err, new("failed to create anonyoums user"))
		common.Throw(w, r, common.InternalServerError)
		return
	}

	token, err := s.auth.Sign(map[string]any{"id": user.ID})
	if err != nil {
		otel.RecordErrorSpan(span, err, new("failed to generate token string"))
		log.Errorw("unable to generate token string", "err", err)
		common.Throw(w, r, common.InternalServerError)
		return
	}

	cookie := http.Cookie{
		Name:     "jwt",
		Value:    token,
		Path:     "/",
		HttpOnly: true,
		MaxAge:   math.MaxInt32,
		Secure:   true,
	}
	common.SealCookie(r, &cookie)
	http.SetCookie(w, &cookie)

	render.Status(r, http.StatusCreated)
	render.Respond(w, r, user)
}

// Log the current user out
//
//	@Summary		Log the current user out
//	@Description	Log the current user out
//	@Tags			auth
//	@Accept			json
//	@Produce		json
//	@Success		204
//	@Router			/login [delete]
func (s *Server) logout(w http.ResponseWriter, r *http.Request) {
	_, span := tracer.Start(r.Context(), "scrumlr.login.api.logout")
	defer span.End()

	cookie := http.Cookie{
		Name:    "jwt",
		Value:   "deleted",
		Path:    "/",
		MaxAge:  -1,
		Expires: time.UnixMilli(0),
	}
	common.SealCookie(r, &cookie)
	http.SetCookie(w, &cookie)

	if common.GetHostWithoutPort(r) != common.GetTopLevelHost(r) {
		cookieWithSubdomain := http.Cookie{
			Name:    "jwt",
			Value:   "deleted",
			Path:    "/",
			MaxAge:  -1,
			Expires: time.UnixMilli(0),
		}
		common.SealCookie(r, &cookieWithSubdomain)
		cookieWithSubdomain.Domain = common.GetHostWithoutPort(r)
		http.SetCookie(w, &cookieWithSubdomain)
	}

	render.Status(r, http.StatusNoContent)
	render.Respond(w, r, nil)
}

// Redirect the user to the specified auth provider consent page
//
//	@Summary		Redirect the user to the specified auth provider consent page
//	@Description	Redirect the user to the specified auth provider consent page
//	@Tags			auth
//	@Accept			json
//	@Param			provider	path	string	true	"provider to use to login"	Enums(GOOGLE, MICROSOFT, AZURE_AD, GITHUB, APPLE, OIDC)
//	@Produce		json
//	@Success		307
//	@Failure		400	{object}	common.APIError
//	@Router			/login/{provider} [get]
func (s *Server) beginAuthProviderVerification(w http.ResponseWriter, r *http.Request) {
	providerName := chi.URLParam(r, "provider")
	accountType, err := account.NewAccountType(providerName)
	if err != nil {
		http.Error(w, "unsupported auth provider", http.StatusBadRequest)
		return
	}

	provider, err := s.auth.GetProvider(accountType)
	if err != nil {
		http.Error(w, "auth provider not configured", http.StatusBadRequest)
		return
	}

	nonce, err := generateNonce(32)
	if err != nil {
		http.Error(w, "failed to generate state nonce", http.StatusInternalServerError)
		return
	}

	state := nonce
	returnUrl := r.URL.Query().Get("state")
	if returnUrl != "" {
		if isSafeRelativeUrl(returnUrl) {
			state = fmt.Sprintf("%s__%s", state, returnUrl)
		}
	}

	stateCookie := http.Cookie{
		Name:     "auth_state",
		Value:    state,
		MaxAge:   int(time.Minute.Seconds() * 5),
		Path:     "/",
		HttpOnly: true,
		Secure:   true,
	}
	common.SealCookie(r, &stateCookie)
	http.SetCookie(w, &stateCookie)

	authUrl := provider.AuthUrl(state)
	http.Redirect(w, r, authUrl, http.StatusTemporaryRedirect)
}

// Verify the auth provider call with the query response mode and create or update a user
// Redirect to the page provider with the state
//
//	@Summary		Verify the auth provider call and create or update a user
//	@Description	Verify the auth provider call and create or update a user. Redirect to the page provider with the state
//	@Tags			auth
//	@Accept			json
//	@Produce		json
//	@Header			303	{string}	Cookie		"jwt token to sign in"
//	@Header			303	{string}	Location	"Redirect url"
//	@Success		303	{object}	users.User
//	@Failure		400	{object}	common.APIError
//	@Failure		403	{object}	common.APIError
//	@Failure		500	{object}	common.APIError
//	@Router			/login/{provider}/callback [get]
func (s *Server) verifyQueryAuthProviderCallback(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "scrumlr.login.api.verify_query_auth_provider")
	defer span.End()
	log := logger.FromContext(ctx)

	state, err := r.Cookie("auth_state")
	if err != nil {
		http.Error(w, "auth state not found", http.StatusBadRequest)
		return
	}

	queryState := r.URL.Query().Get("state")
	if queryState != state.Value {
		http.Error(w, "auth state did not match", http.StatusBadRequest)
		return
	}

	clearCookie := http.Cookie{
		Name:    "auth_state",
		Value:   "",
		Path:    "/",
		MaxAge:  -1,
		Expires: time.UnixMilli(0),
	}
	common.SealCookie(r, &clearCookie)
	http.SetCookie(w, &clearCookie)

	providerName := chi.URLParam(r, "provider")
	accountType, err := account.NewAccountType(providerName)
	if err != nil {
		otel.RecordErrorSpan(span, err, new("user provider not supported"))
		http.Error(w, "unsupported auth provider", http.StatusBadRequest)
		return
	}

	provider, err := s.auth.GetProvider(accountType)
	if err != nil {
		http.Error(w, "auth provider not configured", http.StatusBadRequest)
		return
	}

	providerError := r.URL.Query().Get("error")
	if providerError != "" {
		errorDescription := r.URL.Query().Get("error_description")
		log.Errorw("auth provider returned an error", "error", providerError, "description", errorDescription)
		http.Error(w, fmt.Sprintf("authentication failed: %s", providerError), http.StatusBadRequest)
		return
	}

	code := r.URL.Query().Get("code")
	userInfo, err := provider.Authenticate(ctx, code)
	if err != nil {
		otel.RecordErrorSpan(span, err, new("failed to complete user auth"))
		http.Error(w, "failed to exchange token", http.StatusInternalServerError)
		return
	}

	user, err := s.users.Create(ctx, userInfo.Ident, userInfo.Name, userInfo.AvatarURL, userInfo.Provider)
	if err != nil {
		otel.RecordErrorSpan(span, err, new("failed to create user"))
		common.Throw(w, r, common.InternalServerError)
		return
	}

	token, err := s.auth.Sign(map[string]any{"id": user.ID})
	if err != nil {
		otel.RecordErrorSpan(span, err, new("failed to generate token string"))
		log.Errorw("unable to generate token string", "err", err)
		common.Throw(w, r, common.InternalServerError)
		return
	}

	cookie := http.Cookie{
		Name:    "jwt",
		Value:   token,
		Path:    "/",
		Expires: time.Now().AddDate(0, 0, 3*7),
		Secure:  true,
	}
	common.SealCookie(r, &cookie)
	http.SetCookie(w, &cookie)

	redirectUrl := s.buildRelativeURL("/")
	redirectState := strings.Split(queryState, "__")
	if len(redirectState) > 1 && redirectState[1] != "" {
		if isSafeRelativeUrl(redirectState[1]) {
			redirectUrl = redirectState[1]
		}
	}

	w.Header().Set("Location", redirectUrl)
	w.WriteHeader(http.StatusSeeOther)
}

// Verify the auth provider call with the form post response mode and create or update a user
// Redirect to the page provider with the state
//
//	@Summary		Verify the auth provider call and create or update a user
//	@Description	Verify the auth provider call and create or update a user. Redirect to the page provider with the state
//	@Tags			auth
//	@Accept			json
//	@Produce		json
//	@Header			303	{string}	Cookie		"jwt token to sign in"
//	@Header			303	{string}	Location	"Redirect url"
//	@Success		303	{object}	users.User
//	@Failure		400	{object}	common.APIError
//	@Failure		403	{object}	common.APIError
//	@Failure		500	{object}	common.APIError
//	@Router			/login/{provider}/callback [post]
func (s *Server) verifyPostFormauthProviderCallback(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "scrumlr.login.api.verify_form_post_auth_provider")
	defer span.End()
	log := logger.FromContext(ctx)

	err := r.ParseForm()
	if err != nil {
		http.Error(w, "failed to parse form", http.StatusBadRequest)
		return
	}

	providerError := r.PostFormValue("error")
	if providerError != "" {
		errorDescription := r.PostFormValue("error_description")
		log.Errorw("auth provider returned an error", "error", providerError, "description", errorDescription)
		http.Error(w, fmt.Sprintf("authentication failed: %s", providerError), http.StatusBadRequest)
		return
	}

	formState := r.PostFormValue("state")
	code := r.PostFormValue("code")

	state, err := r.Cookie("auth_state")
	if err != nil {
		http.Error(w, "auth state not found", http.StatusBadRequest)
		return
	}

	if formState != state.Value {
		http.Error(w, "auth state did not match", http.StatusBadRequest)
		return
	}

	clearCookie := http.Cookie{
		Name:    "auth_state",
		Value:   "",
		Path:    "/",
		MaxAge:  -1,
		Expires: time.UnixMilli(0),
	}
	common.SealCookie(r, &clearCookie)
	http.SetCookie(w, &clearCookie)

	providerName := chi.URLParam(r, "provider")
	accountType, err := account.NewAccountType(providerName)
	if err != nil {
		otel.RecordErrorSpan(span, err, new("user provider not supported"))
		http.Error(w, "unsupported auth provider", http.StatusBadRequest)
		return
	}

	provider, err := s.auth.GetProvider(accountType)
	if err != nil {
		http.Error(w, "auth provider not configured", http.StatusBadRequest)
		return
	}

	userInfo, err := provider.Authenticate(ctx, code)
	if err != nil {
		otel.RecordErrorSpan(span, err, new("failed to complete user auth"))
		log.Debugw("failed to exchange token", "err", err)
		http.Error(w, "failed to exchange token", http.StatusInternalServerError)
		return
	}

	if userInfo.Provider == account.Apple {
		userValue := r.PostFormValue("user")
		appleUser, err := extractAppleUser(userValue)
		if err != nil {
			otel.RecordErrorSpan(span, err, new("failed to extract user data"))
			log.Debugw("failed to extract user data", "err", err)
			http.Error(w, "failed to extract user data", http.StatusInternalServerError)
			return
		}

		if appleUser != nil {
			userInfo.Name = fmt.Sprintf("%s %s", appleUser.Name.FirstName, appleUser.Name.LastName)
		}
	}

	user, err := s.users.Create(ctx, userInfo.Ident, userInfo.Name, userInfo.AvatarURL, userInfo.Provider)
	if err != nil {
		otel.RecordErrorSpan(span, err, new("failed to create user"))
		common.Throw(w, r, common.InternalServerError)
		return
	}

	token, err := s.auth.Sign(map[string]any{"id": user.ID})
	if err != nil {
		otel.RecordErrorSpan(span, err, new("failed to generate token string"))
		log.Errorw("unable to generate token string", "err", err)
		common.Throw(w, r, common.InternalServerError)
		return
	}

	cookie := http.Cookie{
		Name:    "jwt",
		Value:   token,
		Path:    "/",
		Expires: time.Now().AddDate(0, 0, 3*7),
		Secure:  true,
	}
	common.SealCookie(r, &cookie)
	http.SetCookie(w, &cookie)

	redirectUrl := s.buildRelativeURL("/")
	redirectState := strings.Split(formState, "__")
	if len(redirectState) > 1 && redirectState[1] != "" {
		if isSafeRelativeUrl(redirectState[1]) {
			redirectUrl = redirectState[1]
		}
	}

	w.Header().Set("Location", redirectUrl)
	w.WriteHeader(http.StatusSeeOther)
}

func generateNonce(length int) (string, error) {
	nonce := make([]byte, length)
	_, err := rand.Read(nonce)
	if err != nil {
		return "", err
	}

	return base64.RawURLEncoding.EncodeToString(nonce), nil
}

func isSafeRelativeUrl(relativeUrl string) bool {
	if !strings.HasPrefix(relativeUrl, "/") || strings.HasPrefix(relativeUrl, "//") || strings.HasPrefix(relativeUrl, "/\\") {
		return false
	}

	u, err := url.Parse(relativeUrl)
	if err != nil {
		return false
	}

	return u.Scheme == "" && u.Host == ""
}

func extractAppleUser(userInfo string) (*AppleUserInfo, error) {
	if userInfo == "" {
		return nil, nil
	}

	var user AppleUserInfo
	err := json.Unmarshal([]byte(userInfo), &user)
	if err != nil {
		return nil, fmt.Errorf("failed to extract user: %v", err)
	}

	return &user, nil
}
