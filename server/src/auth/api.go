package auth

import (
	"crypto/rand"
	"encoding/base64"
	"fmt"
	"math"
	"net/http"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"scrumlr.io/server/account"
	"scrumlr.io/server/common"
	"scrumlr.io/server/logger"
	"scrumlr.io/server/otel"
)

type Api struct {
	auth Auth
}

func NewauthApi(auth Auth) AuthApi {
	api := new(Api)
	api.auth = auth
	return api
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
func (api *Api) SignInAnonymously(w http.ResponseWriter, r *http.Request) {
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

	user, token, err := api.auth.CreateUser(ctx, UserInformation{Name: body.Name, Provider: account.Anonymous})
	if err != nil {
		otel.RecordErrorSpan(span, err, new("failed to create anonyoums user"))
		common.Throw(w, r, common.InternalServerError)
		return
	}

	cookie := http.Cookie{
		Name:     "jwt",
		Value:    token,
		Path:     "/",
		HttpOnly: true,
		MaxAge:   math.MaxInt32,
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
func (api *Api) Logout(w http.ResponseWriter, r *http.Request) {
	_, span := tracer.Start(r.Context(), "scrumlr.login.api.logout")
	defer span.End()

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
func (api *Api) BeginAuthProviderVerification(w http.ResponseWriter, r *http.Request) {
	providerName := chi.URLParam(r, "provider")
	accountType, err := account.NewAccountType(providerName)
	if err != nil {
		http.Error(w, "unsupported auth provider", http.StatusBadRequest)
		return
	}

	provider, err := api.auth.GetProvider(accountType)
	if err != nil {
		http.Error(w, "auth provider not configured", http.StatusBadRequest)
		return
	}

	nonce, err := api.generateNonce(32)
	if err != nil {
		http.Error(w, "failed to generate state nonce", http.StatusInternalServerError)
		return
	}

	state := nonce
	returnUrl := r.URL.Query().Get("state")
	if returnUrl != "" {
		state = fmt.Sprintf("%s__%s", state, returnUrl)
	}

	stateCookie := http.Cookie{
		Name:     "auth_state",
		Value:    state,
		MaxAge:   int(time.Minute.Seconds() * 5),
		Path:     "/",
		HttpOnly: true,
	}
	common.SealCookie(r, &stateCookie)
	http.SetCookie(w, &stateCookie)

	authUrl := provider.AuthUrl(nonce)
	http.Redirect(w, r, authUrl, http.StatusTemporaryRedirect)
}

// Verify the auth provider call and create or update a user
// Redirect to the page provider with the state
//
//	@Summary		Verify the auth provider call and create or update a user
//	@Description	Verify the auth provider call and create or update a user. Redirect to the page provider with the state
//	@Tags			auth
//	@Accept			json
//	@Param			user	body	AnonymousSignUpRequest	true	"user to create"
//	@Produce		json
//	@Header			303	{string}	Cookie		"jwt token to sign in"
//	@Header			303	{string}	Location	"Redirect url"
//	@Success		303	{object}	users.User
//	@Failure		400	{object}	common.APIError
//	@Failure		403	{object}	common.APIError
//	@Failure		500	{object}	common.APIError
//	@Router			/login/{provider}/callback [get]
func (api *Api) VerifyAuthProviderCallback(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "scrumlr.login.api.verify_auth_provider")
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

	providerName := chi.URLParam(r, "provider")
	accountType, err := account.NewAccountType(providerName)
	if err != nil {
		otel.RecordErrorSpan(span, err, new("user provider not supported"))
		http.Error(w, "unsupported auth provider", http.StatusBadRequest)
		return
	}

	provider, err := api.auth.GetProvider(accountType)
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

	_, token, err := api.auth.CreateUser(ctx, *userInfo)
	if err != nil {
		otel.RecordErrorSpan(span, err, new("failed to create user"))
		w.WriteHeader(http.StatusInternalServerError)
		log.Errorw("could not create user", "err", err)
		return
	}

	cookie := http.Cookie{
		Name:    "jwt",
		Value:   token,
		Path:    "/",
		Expires: time.Now().AddDate(0, 0, 3*7),
	}
	common.SealCookie(r, &cookie)
	http.SetCookie(w, &cookie)

	redirectState := strings.Split(queryState, "__")
	if len(redirectState) > 1 && redirectState[1] != "" {
		w.Header().Set("Location", redirectState[1])
		w.WriteHeader(http.StatusSeeOther)
		return
	}

	w.Header().Set("Location", s.buildRelativeURL("/"))
	w.WriteHeader(http.StatusSeeOther)
}

func (api *Api) generateNonce(length int) (string, error) {
	nonce := make([]byte, length)
	_, err := rand.Read(nonce)
	if err != nil {
		return "", err
	}

	return base64.RawURLEncoding.EncodeToString(nonce), nil
}
