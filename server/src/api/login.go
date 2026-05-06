package api

import (
	"fmt"
	"math"
	"net/http"
	"time"

	"go.opentelemetry.io/otel/codes"
	"scrumlr.io/server/users"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"github.com/google/uuid"
	"scrumlr.io/server/auth"
	"scrumlr.io/server/common"
	"scrumlr.io/server/logger"
)

// AnonymousSignUpRequest represents the request to create a new anonymous user.
type AnonymousSignUpRequest struct {
	// The display name of the user.
	Name string
}

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
		span.SetStatus(codes.Error, "failed to create anonymous user")
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

func (s *Server) beginAuthProviderVerification(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "scrumlr.login.api.begin_auth")
	defer span.End()
	log := logger.FromContext(ctx)

	providerName := chi.URLParam(r, "provider")
	provider, ok := s.auth.GetProvider(providerName)
	if !ok {
		span.SetStatus(codes.Error, "provider not configured")
		log.Warnw("unknown auth provider requested", "provider", providerName)
		w.WriteHeader(http.StatusNotFound)
		return
	}

	state, err := auth.GenerateState(r.URL.Query().Get("state"), s.auth.SessionSecret())
	if err != nil {
		span.SetStatus(codes.Error, "failed to generate state")
		span.RecordError(err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	authURL, err := provider.AuthURL(w, r, state)
	if err != nil {
		span.SetStatus(codes.Error, "failed to build auth URL")
		span.RecordError(err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	http.Redirect(w, r, authURL, http.StatusFound)
}

func (s *Server) verifyAuthProviderCallback(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "scrumlr.login.api.verify_auth_provider")
	defer span.End()
	log := logger.FromContext(ctx)

	providerName := chi.URLParam(r, "provider")
	provider, ok := s.auth.GetProvider(providerName)
	if !ok {
		span.SetStatus(codes.Error, "provider not configured")
		log.Warnw("unknown auth provider in callback", "provider", providerName)
		w.WriteHeader(http.StatusNotFound)
		return
	}

	state := r.URL.Query().Get("state")
	redirectURL, err := auth.VerifyState(state, s.auth.SessionSecret())
	if err != nil {
		span.SetStatus(codes.Error, "invalid state")
		span.RecordError(err)
		log.Warnw("state verification failed", "err", err)
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	userInfo, err := provider.Exchange(ctx, r)
	if err != nil {
		span.SetStatus(codes.Error, "provider exchange failed")
		span.RecordError(err)
		log.Errorw("provider exchange failed", "provider", providerName, "err", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	accountType, err := common.NewAccountType(providerName)
	if err != nil {
		span.SetStatus(codes.Error, "unsupported provider type")
		span.RecordError(err)
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	var internalUser *users.User
	switch accountType {
	case common.Google:
		internalUser, err = s.users.CreateGoogleUser(ctx, userInfo.Subject, userInfo.Name, userInfo.Picture)
	case common.GitHub:
		internalUser, err = s.users.CreateGitHubUser(ctx, userInfo.Subject, userInfo.Name, userInfo.Picture)
	case common.Microsoft:
		internalUser, err = s.users.CreateMicrosoftUser(ctx, userInfo.Subject, userInfo.Name, userInfo.Picture)
	case common.AzureAd:
		internalUser, err = s.users.CreateAzureAdUser(ctx, userInfo.Subject, userInfo.Name, userInfo.Picture)
	case common.TypeOIDC:
		internalUser, err = s.users.CreateOIDCUser(ctx, userInfo.Subject, userInfo.Name, userInfo.Picture)
	default:
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	if err != nil {
		span.SetStatus(codes.Error, "failed to create user")
		span.RecordError(err)
		log.Errorw("could not create user", "provider", providerName, "err", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	s.issueAuthCookieAndRedirect(w, r, internalUser.ID, redirectURL)
}

func (s *Server) verifyAppleCallback(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "scrumlr.login.api.verify_apple")
	defer span.End()
	log := logger.FromContext(ctx)

	if err := r.ParseForm(); err != nil {
		span.SetStatus(codes.Error, "failed to parse form")
		span.RecordError(err)
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	state := r.FormValue("state")
	redirectURL, err := auth.VerifyState(state, s.auth.SessionSecret())
	if err != nil {
		span.SetStatus(codes.Error, "invalid state")
		span.RecordError(err)
		log.Warnw("Apple callback state verification failed", "err", err)
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	provider, ok := s.auth.GetProvider("apple")
	if !ok {
		w.WriteHeader(http.StatusNotFound)
		return
	}

	userInfo, err := provider.Exchange(ctx, r)
	if err != nil {
		span.SetStatus(codes.Error, "Apple exchange failed")
		span.RecordError(err)
		log.Errorw("Apple provider exchange failed", "err", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	internalUser, err := s.users.CreateAppleUser(ctx, userInfo.Subject, userInfo.Name, userInfo.Picture)
	if err != nil {
		span.SetStatus(codes.Error, "failed to create Apple user")
		span.RecordError(err)
		log.Errorw("could not create Apple user", "err", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	s.issueAuthCookieAndRedirect(w, r, internalUser.ID, redirectURL)
}

func (s *Server) issueAuthCookieAndRedirect(w http.ResponseWriter, r *http.Request, userID uuid.UUID, redirectURL string) {
	tokenString, _ := s.auth.Sign(map[string]any{"id": userID})
	cookie := http.Cookie{Name: "jwt", Value: tokenString, Path: "/", Expires: time.Now().AddDate(0, 0, 3*7)}
	common.SealCookie(r, &cookie)
	http.SetCookie(w, &cookie)

	if redirectURL != "" {
		http.Redirect(w, r, redirectURL, http.StatusSeeOther)
		return
	}

	if s.basePath == "/" {
		http.Redirect(w, r, fmt.Sprintf("%s://%s/", common.GetProtocol(r), r.Host), http.StatusSeeOther)
	} else {
		http.Redirect(w, r, fmt.Sprintf("%s://%s%s/", common.GetProtocol(r), r.Host, s.basePath), http.StatusSeeOther)
	}
}
