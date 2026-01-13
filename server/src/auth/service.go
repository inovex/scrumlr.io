package auth

import (
	"context"
	"crypto/ecdsa"
	"encoding/json"
	"errors"
	"fmt"
	"math"
	"net/http"
	"time"

	"github.com/go-chi/jwtauth/v5"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/codes"
	"go.opentelemetry.io/otel/metric"
	"go.opentelemetry.io/otel/trace"
	"golang.org/x/crypto/ssh"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/github"
	"golang.org/x/oauth2/google"
	"golang.org/x/oauth2/microsoft"
	"scrumlr.io/server/auth/devkeys"
	"scrumlr.io/server/common"
	"scrumlr.io/server/logger"
	"scrumlr.io/server/users"

	jwx "github.com/lestrrat-go/jwx/v2/jwt"
)

var tracer trace.Tracer = otel.Tracer("scrumlr.io/server/auth")
var meter metric.Meter = otel.Meter("scrumlr.io/server/auth")

type AuthService interface {
	Sign(map[string]interface{}) (string, error)
	Verifier() func(http.Handler) http.Handler
	Authenticator() func(http.Handler) http.Handler
	Exists(accountType common.AccountType) bool
	HandleCallback(ctx context.Context, provider, code string) (*http.Cookie, *common.APIError)
	GetConfig(provider string) *oauth2.Config
	fetchExternalUser(ctx context.Context, provider string, token *oauth2.Token) (*UserInformation, error)
	fetchGithubUser(ctx context.Context, config *oauth2.Config, token *oauth2.Token) (*UserInformation, error)
}

type AuthProviderConfiguration struct {
	TenantId       string
	ClientId       string
	ClientSecret   string
	RedirectUri    string
	DiscoveryUri   string
	UserIdentScope string
	UserNameScope  string
}

type AuthConfiguration struct {
	oauthConfigs     map[string]*oauth2.Config
	providers        map[string]AuthProviderConfiguration
	unsafePrivateKey string
	privateKey       string
	unsafeAuth       *jwtauth.JWTAuth
	auth             *jwtauth.JWTAuth
	userService      users.UserService
}

type UserInformation struct {
	Provider  common.AccountType
	Ident     string `json:"id"`
	Name      string `json:"login"`
	AvatarURL string
}

type GithubUserInformation struct {
	Provider common.AccountType
	Ident    int64  `json:"id"`
	Name     string `json:"login"`
}

func NewAuthService(providers map[string]AuthProviderConfiguration, unsafePrivateKey, privateKey string, userService users.UserService) AuthService {
	a := new(AuthConfiguration)
	a.providers = providers
	a.unsafePrivateKey = unsafePrivateKey
	a.userService = userService
	a.privateKey = privateKey
	if err := a.initializeProviders(); err != nil {
		return nil
	}
	if err := a.initializeJWTAuth(); err != nil {
		return nil
	}

	return a
}

func (a *AuthConfiguration) GetConfig(provider string) *oauth2.Config {
	return a.oauthConfigs[provider]
}

func (a *AuthConfiguration) initializeProviders() error {
	a.oauthConfigs = make(map[string]*oauth2.Config)
	if p, ok := a.providers[string(common.Google)]; ok {
		a.oauthConfigs[string(common.Google)] = &oauth2.Config{
			ClientID:     p.ClientId,
			ClientSecret: p.ClientSecret,
			RedirectURL:  p.RedirectUri,
			Endpoint:     google.Endpoint,
			Scopes:       []string{"openid", "email", "profile"},
		}
	}
	if p, ok := a.providers[string(common.GitHub)]; ok {
		//todo: might need to add more scopes
		a.oauthConfigs[string(common.GitHub)] = &oauth2.Config{
			ClientID:     p.ClientId,
			ClientSecret: p.ClientSecret,
			RedirectURL:  p.RedirectUri,
			Endpoint:     github.Endpoint,
			Scopes:       []string{"user"},
		}
	}
	if p, ok := a.providers[string(common.Microsoft)]; ok {
		a.oauthConfigs[string(common.Microsoft)] = &oauth2.Config{
			ClientID:     p.ClientId,
			ClientSecret: p.ClientSecret,
			RedirectURL:  p.RedirectUri,
			Endpoint:     microsoft.AzureADEndpoint(""),
			Scopes:       []string{"openid", "email", "profile"},
		}
	}
	if p, ok := a.providers[string(common.TypeOIDC)]; ok {
		endpoint := oauth2.Endpoint{
			AuthURL:   "http://127.0.0.1:5556/dex/auth",
			TokenURL:  "http://127.0.0.1:5556/dex/token",
			AuthStyle: 0, //auto-detect
		}
		a.oauthConfigs[string(common.TypeOIDC)] = &oauth2.Config{
			ClientID:     p.ClientId,
			ClientSecret: p.ClientSecret,
			Endpoint:     endpoint,
			RedirectURL:  p.RedirectUri,
			Scopes:       []string{"openid", "profile", "email"},
		}
	}
	return nil
}

func (a *AuthConfiguration) Sign(claims map[string]interface{}) (string, error) {
	_, token, err := a.auth.Encode(claims)
	return token, err
}

func (a *AuthConfiguration) Verifier() func(http.Handler) http.Handler {
	if a.unsafeAuth != nil {
		return func(next http.Handler) http.Handler {
			hfn := func(w http.ResponseWriter, r *http.Request) {
				ctx := r.Context()

				var authToken jwx.Token
				var err error

				if authToken, err = jwtauth.VerifyRequest(a.unsafeAuth, r, jwtauth.TokenFromCookie); err == nil {
					// check if user tries to authenticate by a prior authentication key
					// attempt to migrate JWT to new key
					userID := authToken.PrivateClaims()["id"].(string)
					var user uuid.UUID
					user, err = uuid.Parse(userID)

					if err == nil {
						var ok bool
						if ok, err = a.userService.IsUserAvailableForKeyMigration(ctx, user); ok {
							// prepare new JWT
							tokenString, _ := a.Sign(map[string]interface{}{"id": user})
							cookie := http.Cookie{Name: "jwt", Value: tokenString, Path: "/", HttpOnly: true, MaxAge: math.MaxInt32}
							common.SealCookie(r, &cookie)
							http.SetCookie(w, &cookie)

							// update rotation flag in database for user, ignore errors
							_, _ = a.userService.SetKeyMigration(ctx, user)
						} else {
							err = errors.New("not permitted to access key rotation")
						}
					}
				} else {
					// attempt to verify request by new key
					authToken, err = jwtauth.VerifyRequest(a.auth, r, jwtauth.TokenFromCookie)
				}

				ctx = jwtauth.NewContext(ctx, authToken, err)
				next.ServeHTTP(w, r.WithContext(ctx))
			}
			return http.HandlerFunc(hfn)
		}
	}
	return jwtauth.Verifier(a.auth)
}

func (a *AuthConfiguration) Authenticator() func(http.Handler) http.Handler {
	return jwtauth.Authenticator(a.auth)
}

func (a *AuthConfiguration) Exists(accountType common.AccountType) bool {
	if _, ok := a.providers[string(accountType)]; ok {
		return true
	}
	return false
}

func (a *AuthConfiguration) initializeJWTAuth() error {
	if a.privateKey == "" {
		logger.Get().Warnw("invalid keypair config, falling back to dev keys!")
		a.privateKey = devkeys.PrivateKey
	}

	if a.unsafePrivateKey != "" {
		unsafeKey, err := ssh.ParseRawPrivateKey([]byte(a.unsafePrivateKey))
		if err != nil {
			return fmt.Errorf("unable parse unsafe auth keys: %w", err)
		}
		unsafePrivateKey, ok := unsafeKey.(*ecdsa.PrivateKey)
		if !ok {
			return errors.New("the provided unsafe keys are no ecdsa keys")
		}
		a.unsafeAuth = jwtauth.New("ES512", unsafePrivateKey, unsafePrivateKey.PublicKey)
	}

	key, err := ssh.ParseRawPrivateKey([]byte(a.privateKey))
	if err != nil {
		return fmt.Errorf("unable to parse auth keys: %w", err)
	}
	privateKey, ok := key.(*ecdsa.PrivateKey)
	if !ok {
		return errors.New("the provided keys are no ecdsa keys")
	}

	a.auth = jwtauth.New("ES512", privateKey, privateKey.PublicKey)
	return nil
}

func (a *AuthConfiguration) HandleCallback(ctx context.Context, provider, code string) (*http.Cookie, *common.APIError) {
	ctx, span := tracer.Start(ctx, "scrumlr.auth.service.handle_callback")
	log := logger.FromContext(ctx)
	defer span.End()

	span.SetAttributes(
		attribute.String("scrumlr.auth.service.handle_callback.provider", provider),
	)

	config := a.GetConfig(provider)
	token, err := config.Exchange(ctx, code)
	if err != nil {
		span.SetStatus(codes.Error, "failed to exchange code")
		span.RecordError(err)
		log.Errorw("could not exchange oauth2 code", "err", err)
		return nil, common.UnauthorizedError
	}

	var userInfo *UserInformation
	if provider == string(common.GitHub) {
		userInfo, err = a.fetchGithubUser(ctx, config, token)
	} else {
		userInfo, err = a.fetchExternalUser(ctx, provider, token)
	}

	if err != nil {
		span.SetStatus(codes.Error, "failed to fetch user info")
		span.RecordError(err)
		log.Errorw("failed to fetch external user info", "err", err)
		return nil, common.InternalServerError
	}

	var internalUser *users.User
	switch userInfo.Provider {
	case common.Google:
		internalUser, err = a.userService.CreateGoogleUser(ctx, userInfo.Ident, userInfo.Name, userInfo.AvatarURL)
	case common.GitHub:
		internalUser, err = a.userService.CreateGitHubUser(ctx, userInfo.Ident, userInfo.Name, userInfo.AvatarURL)
	case common.TypeOIDC:
		internalUser, err = a.userService.CreateOIDCUser(ctx, userInfo.Ident, userInfo.Name, userInfo.AvatarURL)
	case common.Microsoft:
		internalUser, err = a.userService.CreateMicrosoftUser(ctx, userInfo.Ident, userInfo.Name, userInfo.AvatarURL)

	}

	if err != nil {
		span.SetStatus(codes.Error, "failed to create user")
		span.RecordError(err)
		return nil, common.InternalServerError
	}

	tokenString, _ := a.Sign(map[string]interface{}{"id": internalUser.ID})
	cookie := http.Cookie{
		Name:     "jwt",
		Value:    tokenString,
		Path:     "/",
		Expires:  time.Now().AddDate(0, 0, 21),
		HttpOnly: true,
	}

	return &cookie, nil
}

func (a *AuthConfiguration) fetchExternalUser(ctx context.Context, provider string, token *oauth2.Token) (*UserInformation, error) {
	ctx, span := tracer.Start(ctx, "scrumlr.auth.service.fetch_external_user")
	log := logger.FromContext(ctx)
	defer span.End()

	span.SetAttributes(
		attribute.String("scrumlr.auth.service.fetch_external_user.provider", provider),
	)

	// returns jwt token
	rawIDToken, ok := token.Extra("id_token").(string)
	if !ok {
		span.SetStatus(codes.Error, "failed to extract id token")
		span.RecordError(errors.New("no id_token found in response"))
		log.Error("no id_token found in response")
		return nil, errors.New("no id_token found in response")
	}

	// parse the rawIDToken
	parser := jwt.NewParser()
	parsedToken, _, err := parser.ParseUnverified(rawIDToken, jwt.MapClaims{})
	if err != nil {
		span.SetStatus(codes.Error, "failed to parse id_token")
		span.RecordError(err)
		log.Errorf("failed to parse id_token: %v", err)
		return nil, errors.New("failed to parse id_token")
	}

	// access user info
	var claims jwt.MapClaims
	if claims, ok = parsedToken.Claims.(jwt.MapClaims); ok {
		email := claims["email"]
		log.Infof("User logged in: %v", email)
	}
	// Map fields to UserInformation struct
	res := &UserInformation{Provider: common.AccountType(provider)}
	switch provider {
	case string(common.Google):
		res.Ident = fmt.Sprint(claims["sub"])
		res.Name = fmt.Sprint(claims["name"])
		res.AvatarURL = fmt.Sprint(claims["picture"])
	case string(common.AzureAd):
		res.Ident = fmt.Sprint(claims["id"])
		res.Name = fmt.Sprint(claims["login"])
		res.AvatarURL = fmt.Sprint(claims["avatar_url"])
	case string(common.Microsoft):
		res.Ident = fmt.Sprint(claims["oid"])
		res.Name = fmt.Sprint(claims["name"])
		res.AvatarURL = fmt.Sprint(claims["avatar_url"])
	case string(common.Apple):
		panic("not implemented")
	case string(common.TypeOIDC):
		res.Ident = fmt.Sprint(claims["sub"])
		res.Name = fmt.Sprint(claims["name"])

	}

	return res, nil
}

func (a *AuthConfiguration) fetchGithubUser(ctx context.Context, config *oauth2.Config, token *oauth2.Token) (*UserInformation, error) {
	ctx, span := tracer.Start(ctx, "scrumlr.auth.service.fetch_github_user")
	log := logger.FromContext(ctx)
	var user GithubUserInformation
	client := config.Client(ctx, token)
	resp, err := client.Get("https://api.github.com/user")
	if err != nil {
		span.RecordError(err)
		log.Errorw("failed to fetch github user", "err", err)
		return nil, common.UnauthorizedError
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		log.Errorw("github api returned non-200", "status", resp.Status)
		return nil, common.UnauthorizedError
	}

	if err := json.NewDecoder(resp.Body).Decode(&user); err != nil {
		span.RecordError(err)
		log.Errorw("failed to decode github user json", "err", err)
		return nil, common.UnauthorizedError
	}

	return &UserInformation{
		Provider: common.GitHub,
		Ident:    fmt.Sprint(user.Ident),
		Name:     user.Name,
	}, nil
}
