package api

import (
	"fmt"
	"math"
	"net/http"
	"scrumlr.io/server/users"
	"strings"
	"time"

	"github.com/go-chi/render"
	"github.com/markbates/goth/gothic"
	"go.opentelemetry.io/otel/codes"
	"scrumlr.io/server/common"
	"scrumlr.io/server/logger"
)

//var tracer trace.Tracer = otel.Tracer("scrumlr.io/server/api")

// AnonymousSignUpRequest represents the request to create a new anonymous user.
type AnonymousSignUpRequest struct {
	// The display name of the user.
	Name string
}

// signInAnonymously create a new anonymous user
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

	user, err := s.users.CreateAnonymous(ctx, body.Name)
	if err != nil {
		span.SetStatus(codes.Error, "failed to create anonyoums user")
		span.RecordError(err)
		common.Throw(w, r, common.InternalServerError)
		return
	}

	tokenString, err := s.auth.Sign(map[string]interface{}{"id": user.ID})
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

// beginAuthProviderVerification will redirect the user to the specified auth provider consent page
func (s *Server) beginAuthProviderVerification(w http.ResponseWriter, r *http.Request) {
	gothic.BeginAuthHandler(w, r)
}

// verifyAuthProviderCallback will verify the auth provider call, create or update a user and redirect to the page provider with the state
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
	switch provider {
	case common.Google:
		internalUser, err = s.users.CreateGoogleUser(ctx, userInfo.Ident, userInfo.Name, userInfo.AvatarURL)
	case common.GitHub:
		internalUser, err = s.users.CreateGitHubUser(ctx, userInfo.Ident, userInfo.Name, userInfo.AvatarURL)
	case common.Microsoft:
		internalUser, err = s.users.CreateMicrosoftUser(ctx, userInfo.Ident, userInfo.Name, userInfo.AvatarURL)
	case common.AzureAd:
		internalUser, err = s.users.CreateAzureAdUser(ctx, userInfo.Ident, userInfo.Name, userInfo.AvatarURL)
	case common.Apple:
		internalUser, err = s.users.CreateAppleUser(ctx, userInfo.Ident, userInfo.Name, userInfo.AvatarURL)
	case common.TypeOIDC:
		internalUser, err = s.users.CreateOIDCUser(ctx, userInfo.Ident, userInfo.Name, userInfo.AvatarURL)
	}
	if err != nil {
		span.SetStatus(codes.Error, "failed to create user")
		span.RecordError(err)
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
