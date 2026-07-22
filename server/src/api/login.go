package api

import (
	"math"
	"net/http"
	"strings"
	"time"

	"go.opentelemetry.io/otel/codes"
	"scrumlr.io/server/users"

	"github.com/go-chi/render"
	"github.com/markbates/goth/gothic"
	"scrumlr.io/server/common"
	"scrumlr.io/server/logger"
)

//var tracer trace.Tracer = otel.Tracer("scrumlr.io/server/api")

// AnonymousSignUpRequest represents the request to create a new anonymous user.
type AnonymousSignUpRequest struct {
	// The display name of the user.
	Name string
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
//	@Router			/login [post]
func (s *Server) signInAnonymously(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "scrumlr.login.api.signin.anonymous")
	defer span.End()
	log := logger.FromContext(ctx)

	var body AnonymousSignUpRequest
	if err := render.Decode(r, &body); err != nil {
		span.SetStatus(codes.Error, "unable to decode body")
		span.RecordError(err)
		log.Errorw("unable to decode body", "err", err)
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	user, err := s.users.CreateUser(ctx, "", body.Name, "", common.Anonymous)
	if err != nil {
		span.SetStatus(codes.Error, "failed to create anonyoums user")
		span.RecordError(err)
		common.Throw(w, r, common.InternalServerError)
		return
	}

	tokenString, err := s.auth.Sign(map[string]any{"id": user.ID})
	if err != nil {
		span.SetStatus(codes.Error, "failed to generate token string")
		span.RecordError(err)
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
func (s *Server) beginAuthProviderVerification(w http.ResponseWriter, r *http.Request) {
	gothic.BeginAuthHandler(w, r)
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
func (s *Server) verifyAuthProviderCallback(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "scrumlr.login.api.verify_auth_provider")
	defer span.End()
	log := logger.FromContext(ctx)

	externalUser, err := gothic.CompleteUserAuth(w, r)
	if err != nil {
		span.SetStatus(codes.Error, "failed to complete user auth")
		span.RecordError(err)
		w.WriteHeader(http.StatusInternalServerError)
		log.Errorw("could not complete user auth", "err", err)
		return
	}

	provider, err := common.NewAccountType(externalUser.Provider)
	if err != nil {
		span.SetStatus(codes.Error, "user provider not supported")
		span.RecordError(err)
		w.WriteHeader(http.StatusInternalServerError)
		log.Errorw("unsupported user provider", "err", err)
		return
	}

	userInfo, err := s.auth.ExtractUserInformation(provider, &externalUser)
	if err != nil {
		span.SetStatus(codes.Error, "insufficient user information from external auth source")
		span.RecordError(err)
		w.WriteHeader(http.StatusInternalServerError)
		log.Errorw("insufficient user information from external auth source", "err", err)
		return
	}

	var internalUser *users.User
	internalUser, err = s.users.CreateUser(ctx, userInfo.Ident, userInfo.Name, userInfo.AvatarURL, provider)
	if err != nil {
		span.SetStatus(codes.Error, "failed to create user")
		span.RecordError(err)
		w.WriteHeader(http.StatusInternalServerError)
		log.Errorw("could not create user", "err", err)
		return
	}

	tokenString, _ := s.auth.Sign(map[string]any{"id": internalUser.ID})
	cookie := http.Cookie{Name: "jwt", Value: tokenString, Path: "/", Expires: time.Now().AddDate(0, 0, 3*7)}
	common.SealCookie(r, &cookie)
	http.SetCookie(w, &cookie)

	state := gothic.GetState(r)
	stateSplit := strings.Split(state, "__")
	if len(stateSplit) > 1 {
		w.Header().Set("Location", stateSplit[1])
		w.WriteHeader(http.StatusSeeOther)
		return
	}
	w.Header().Set("Location", s.buildRelativeURL("/"))
	w.WriteHeader(http.StatusSeeOther)
}
