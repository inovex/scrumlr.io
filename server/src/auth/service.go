package auth

import (
	"context"
	"crypto/ecdsa"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"math"
	"net/http"
	"time"

	"github.com/MicahParks/keyfunc/v3"
	"github.com/go-chi/jwtauth/v5"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/codes"
	"go.opentelemetry.io/otel/trace"
	"golang.org/x/crypto/ssh"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/endpoints"
	"scrumlr.io/server/auth/devkeys"
	"scrumlr.io/server/common"
	"scrumlr.io/server/logger"
	"scrumlr.io/server/users"
)

var tracer trace.Tracer = otel.Tracer("scrumlr.io/server/auth")

const (
	googleCertUrl    = "https://www.googleapis.com/oauth2/v3/certs"
	microsoftCertUrl = "https://login.microsoftonline.com/common/discovery/v2.0/keys"
	appleCertUrl     = "https://appleid.apple.com/auth/keys"
	githubApi        = "https://api.github.com/user"
)

type AuthService interface {
	Sign(map[string]interface{}) (string, error)
	Verifier() func(http.Handler) http.Handler
	Authenticator() func(http.Handler) http.Handler
	Exists(accountType common.AccountType) bool
	HandleCallback(ctx context.Context, provider, code string) (*http.Cookie, error)
	GetConfig(provider string) (*oauth2.Config, error)
	fetchExternalUser(ctx context.Context, provider string, token *oauth2.Token) (*UserInformation, error)
	fetchGithubUser(ctx context.Context, config *oauth2.Config, token *oauth2.Token) (*UserInformation, error)
}

var googleJWKS keyfunc.Keyfunc
var microsoftJWKS keyfunc.Keyfunc
var oidcJWKS keyfunc.Keyfunc
var appleJWKS keyfunc.Keyfunc
var azureAdJWKS keyfunc.Keyfunc

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

func (a *AuthConfiguration) GetConfig(provider string) (*oauth2.Config, error) {
	if ok := a.oauthConfigs[provider]; ok != nil {
		return a.oauthConfigs[provider], nil
	}
	return nil, errors.New("Error:" + provider + " config does not exists")
}

func (a *AuthConfiguration) initializeProviders() error {
	a.oauthConfigs = make(map[string]*oauth2.Config)
	if p, ok := a.providers[string(common.Google)]; ok {
		a.oauthConfigs[string(common.Google)] = &oauth2.Config{
			ClientID:     p.ClientId,
			ClientSecret: p.ClientSecret,
			RedirectURL:  p.RedirectUri,
			Endpoint:     endpoints.Google,
			Scopes:       []string{"openid", "email", "profile"},
		}
		var err error
		googleJWKS, err = keyfunc.NewDefault([]string{googleCertUrl})
		if err != nil {
			return err
		}
	}
	if p, ok := a.providers[string(common.GitHub)]; ok {
		a.oauthConfigs[string(common.GitHub)] = &oauth2.Config{
			ClientID:     p.ClientId,
			ClientSecret: p.ClientSecret,
			RedirectURL:  p.RedirectUri,
			Endpoint:     endpoints.GitHub,
			Scopes:       []string{"user"},
		}
	}
	if p, ok := a.providers[string(common.Microsoft)]; ok {
		a.oauthConfigs[string(common.Microsoft)] = &oauth2.Config{
			ClientID:     p.ClientId,
			ClientSecret: p.ClientSecret,
			RedirectURL:  p.RedirectUri,
			Endpoint:     endpoints.AzureAD(""),
			Scopes:       []string{"openid", "email", "profile"},
		}

		var err error
		microsoftJWKS, err = keyfunc.NewDefault([]string{microsoftCertUrl})
		if err != nil {
			return err
		}
	}
	if p, ok := a.providers[string(common.AzureAd)]; ok {
		a.oauthConfigs[string(common.AzureAd)] = &oauth2.Config{
			ClientID:     p.ClientId,
			ClientSecret: p.ClientSecret,
			RedirectURL:  p.RedirectUri,
			Endpoint:     endpoints.AzureAD(p.TenantId),
			Scopes:       []string{"openid", "email", "profile"},
		}

		var err error
		azureAdJWKS, err = keyfunc.NewDefault([]string{microsoftCertUrl})
		if err != nil {
			return err
		}
	}
	if p, ok := a.providers[string(common.TypeOIDC)]; ok {
		endpoint := oauth2.Endpoint{
			AuthURL:   p.AuthBasePath + "/auth",
			TokenURL:  p.AuthBasePath + "/token",
			AuthStyle: 0, //auto-detect
		}
		a.oauthConfigs[string(common.TypeOIDC)] = &oauth2.Config{
			ClientID:     p.ClientId,
			ClientSecret: p.ClientSecret,
			Endpoint:     endpoint,
			RedirectURL:  p.RedirectUri,
			Scopes:       []string{"openid", "profile", "email"},
		}
		var err error
		oidcJWKS, err = keyfunc.NewDefault([]string{p.AuthBasePath + "/keys"})
		if err != nil {
			return err
		}
	}
	if p, ok := a.providers[string(common.Apple)]; ok {
		a.oauthConfigs[string(common.Apple)] = &oauth2.Config{
			ClientID:     p.ClientId,
			ClientSecret: p.ClientSecret,
			RedirectURL:  p.RedirectUri,
			Endpoint:     endpoints.Apple,
			Scopes:       []string{"name", "email"},
		}
		var err error
		appleJWKS, err = keyfunc.NewDefault([]string{appleCertUrl})
		if err != nil {
			return err
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
				log := logger.FromContext(ctx)
				token, err := jwtauth.VerifyRequest(a.unsafeAuth, r, jwtauth.TokenFromCookie)

				if err == nil {
					// check if user tries to authenticate by a prior authentication key
					// attempt to migrate JWT to new key
					var tokenUserID string
					err = token.Get("id", &tokenUserID)
					if err != nil {
						log.Errorw("Error getting user ID", "error", err)
					}
					var userID uuid.UUID
					userID, err = uuid.Parse(tokenUserID)

					if err == nil {
						var ok bool
						if ok, err = a.userService.IsUserAvailableForKeyMigration(ctx, userID); ok {
							// prepare new JWT
							tokenString, err := a.Sign(map[string]any{"id": userID})
							if err != nil {
								log.Errorw("failed to sign migrated jwt", "err", err)
							} else {
								cookie := CreateCookie("jwt", tokenString, "/", math.MaxInt32, nil)

								SealCookie(r, cookie)
								http.SetCookie(w, cookie)

								// update rotation flag in database for user, ignore errors
								_, _ = a.userService.SetKeyMigration(ctx, userID)
							}
						} else {
							err = errors.New("not permitted to access key rotation")
						}
					}
				} else {
					// attempt to verify request by new key
					token, err = jwtauth.VerifyRequest(a.auth, r, jwtauth.TokenFromCookie)
				}

				ctx = jwtauth.NewContext(ctx, token, err)
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

func (a *AuthConfiguration) HandleCallback(ctx context.Context, provider, code string) (*http.Cookie, error) {
	// Handles the callback after login at a provider
	ctx, span := tracer.Start(ctx, "scrumlr.auth.service.handle_callback")
	log := logger.FromContext(ctx)
	defer span.End()

	span.SetAttributes(
		attribute.String("scrumlr.auth.service.handle_callback.provider", provider),
	)
	// err gets already handled in API Layer
	config, _ := a.GetConfig(provider)
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
	case common.AzureAd:
		internalUser, err = a.userService.CreateAzureAdUser(ctx, userInfo.Ident, userInfo.Name, userInfo.AvatarURL)
	case common.Apple:
		internalUser, err = a.userService.CreateAppleUser(ctx, userInfo.Ident, userInfo.Name, userInfo.AvatarURL)
	default:
		return nil, common.InternalServerError
	}

	if err != nil {
		span.SetStatus(codes.Error, "failed to create user")
		span.RecordError(err)
		return nil, common.InternalServerError
	}

	tokenString, err := a.Sign(map[string]any{"id": internalUser.ID})
	if err != nil {
		span.SetStatus(codes.Error, "failed to sign token")
		span.RecordError(err)
		log.Errorw("failed to sign jwt", "err", err)
		return nil, common.InternalServerError
	}
	cookieMaxAge := time.Duration(21) * 24 * time.Hour //maxAge = 21 Days
	cookie := CreateCookie("jwt", tokenString, "/", int(cookieMaxAge.Seconds()), nil)
	return cookie, nil
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

	// select the right pubkey cache
	var kf jwt.Keyfunc
	switch provider {
	case string(common.Google):
		kf = googleJWKS.Keyfunc
	case string(common.AzureAd), string(common.Microsoft):
		kf = microsoftJWKS.Keyfunc
	case string(common.TypeOIDC):
		kf = oidcJWKS.Keyfunc
	case string(common.Apple):
		kf = appleJWKS.Keyfunc
	default:
		return nil, fmt.Errorf("unsupported provider: %s", provider)
	}

	// validate the token with the providers pubkey
	parsedToken, err := jwt.Parse(rawIDToken, kf)
	if err != nil {
		span.SetStatus(codes.Error, "failed to parse and verify id_token")
		span.RecordError(err)
		log.Errorf("failed to parse and verify id_token: %v", err)
		return nil, errors.New("failed to verify id_token")
	}

	// access user info
	var claims jwt.MapClaims
	if claims, ok = parsedToken.Claims.(jwt.MapClaims); ok {
		email := claims["email"]
		log.Infof("User logged in: %v", email)
	}
	// Map fields to UserInformation struct
	config, supported := externalProviderConfigs[provider]
	if !supported {
		return nil, fmt.Errorf("provider mapping not configured: %s", provider)
	}

	res := &UserInformation{
		Provider:  common.AccountType(provider),
		Ident:     GetClaim(config.identClaim, claims),
		Name:      GetClaim(config.nameClaim, claims),
		AvatarURL: GetClaim(config.avatarClaim, claims),
	}

	if res.Ident == "" || res.Ident == "<nil>" {
		return nil, errors.New("token is missing critical identity claim")
	}
	return res, nil
}

func (a *AuthConfiguration) fetchGithubUser(ctx context.Context, config *oauth2.Config, token *oauth2.Token) (*UserInformation, error) {
	// GitHub does not return a jwt token therefore an extra step is needed
	ctx, span := tracer.Start(ctx, "scrumlr.auth.service.fetch_github_user")
	defer span.End()
	log := logger.FromContext(ctx)
	var user GithubUserInformation
	client := config.Client(ctx, token)
	resp, err := client.Get(githubApi)
	if err != nil {
		span.RecordError(err)
		log.Errorw("failed to fetch github user", "err", err)
		return nil, common.UnauthorizedError
	}
	defer func(Body io.ReadCloser) {
		err := Body.Close()
		if err != nil {
			log.Errorw("failed to close response body", "err", err)
		}
	}(resp.Body)

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
