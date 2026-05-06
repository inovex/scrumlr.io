package auth

import (
	"crypto/ecdsa"
	"errors"
	"fmt"
	"math"
	"net/http"
	"strings"

	"scrumlr.io/server/auth/providers"
	"scrumlr.io/server/users"

	"github.com/uptrace/bun"

	"github.com/go-chi/jwtauth/v5"
	"github.com/google/uuid"
	"github.com/lestrrat-go/jwx/v3/jwt"
	"golang.org/x/crypto/ssh"
	"scrumlr.io/server/auth/devkeys"
	"scrumlr.io/server/common"
	"scrumlr.io/server/logger"
)

type Auth interface {
	Sign(map[string]any) (string, error)
	Verifier() func(http.Handler) http.Handler
	Authenticator() func(http.Handler) http.Handler
	Exists(accountType common.AccountType) bool
	GetProvider(name string) (providers.Provider, bool)
	SessionSecret() string
}

type AuthProviderConfiguration struct {
	TenantId       string
	ClientId       string
	ClientSecret   string
	RedirectUri    string
	DiscoveryUri   string
	UserIdentScope string
	UserNameScope  string
	TeamId         string
	KeyId          string
}

type AuthConfiguration struct {
	providerConfigs   map[string]AuthProviderConfiguration
	providerInstances map[string]providers.Provider
	sessionSecret     string
	unsafePrivateKey  string
	privateKey        string
	unsafeAuth        *jwtauth.JWTAuth
	auth              *jwtauth.JWTAuth
	database          *bun.DB
	userService       users.UserService
}

func NewAuthConfiguration(providerCfgs map[string]AuthProviderConfiguration, unsafePrivateKey, privateKey, sessionSecret string, database *bun.DB, userService users.UserService) (Auth, error) {
	a := &AuthConfiguration{
		providerConfigs:  providerCfgs,
		sessionSecret:    sessionSecret,
		unsafePrivateKey: unsafePrivateKey,
		privateKey:       privateKey,
		database:         database,
		userService:      userService,
	}
	if err := a.initializeProviders(); err != nil {
		return nil, err
	}
	if err := a.initializeJWTAuth(); err != nil {
		return nil, err
	}
	return a, nil
}

func (a *AuthConfiguration) initializeProviders() error {
	a.providerInstances = make(map[string]providers.Provider)

	if cfg, ok := a.providerConfigs[string(common.Google)]; ok {
		p, err := providers.NewGoogleProvider(cfg.ClientId, cfg.ClientSecret, cfg.RedirectUri)
		if err != nil {
			return fmt.Errorf("Google provider init failed: %w", err)
		}
		a.providerInstances[string(common.Google)] = p
	}

	if cfg, ok := a.providerConfigs[string(common.GitHub)]; ok {
		a.providerInstances[string(common.GitHub)] = providers.NewGitHubProvider(cfg.ClientId, cfg.ClientSecret, cfg.RedirectUri)
	}

	if cfg, ok := a.providerConfigs[string(common.Microsoft)]; ok {
		p, err := providers.NewMicrosoftProvider(cfg.ClientId, cfg.ClientSecret, cfg.RedirectUri)
		if err != nil {
			return fmt.Errorf("Microsoft provider init failed: %w", err)
		}
		a.providerInstances[string(common.Microsoft)] = p
	}

	if cfg, ok := a.providerConfigs[string(common.AzureAd)]; ok {
		p, err := providers.NewAzureADProvider(cfg.ClientId, cfg.ClientSecret, cfg.RedirectUri, cfg.TenantId)
		if err != nil {
			return fmt.Errorf("Azure AD provider init failed: %w", err)
		}
		a.providerInstances[string(common.AzureAd)] = p
	}

	if cfg, ok := a.providerConfigs[string(common.Apple)]; ok {
		p, err := providers.NewAppleProvider(cfg.ClientId, cfg.TeamId, cfg.KeyId, cfg.ClientSecret, cfg.RedirectUri)
		if err != nil {
			return fmt.Errorf("Apple provider init failed: %w", err)
		}
		a.providerInstances[string(common.Apple)] = p
	}

	if cfg, ok := a.providerConfigs[string(common.TypeOIDC)]; ok {
		p, err := providers.NewGenericOIDCProvider(cfg.ClientId, cfg.ClientSecret, cfg.RedirectUri, cfg.DiscoveryUri)
		if err != nil {
			logger.Get().Errorw("OIDC provider setup failed", "error", err)
		} else {
			a.providerInstances[string(common.TypeOIDC)] = p
		}
	}

	return nil
}

func (a *AuthConfiguration) GetProvider(name string) (providers.Provider, bool) {
	p, ok := a.providerInstances[strings.ToUpper(name)]
	return p, ok
}

func (a *AuthConfiguration) SessionSecret() string {
	return a.sessionSecret
}

func (a *AuthConfiguration) Sign(claims map[string]any) (string, error) {
	_, token, err := a.auth.Encode(claims)
	return token, err
}

func (a *AuthConfiguration) Verifier() func(http.Handler) http.Handler {
	if a.unsafeAuth != nil {
		return func(next http.Handler) http.Handler {
			hfn := func(w http.ResponseWriter, r *http.Request) {
				ctx := r.Context()
				log := logger.FromContext(ctx)
				var token jwt.Token
				var err error

				if token, err = jwtauth.VerifyRequest(a.unsafeAuth, r, jwtauth.TokenFromCookie); err == nil {
					var userID string
					err = token.Get("id", &userID)
					if err != nil {
						log.Errorw("Error getting user ID", "error", err)
					}
					var user uuid.UUID
					user, err = uuid.Parse(userID)

					if err == nil {
						var ok bool
						if ok, err = a.userService.IsUserAvailableForKeyMigration(ctx, user); ok {
							tokenString, _ := a.Sign(map[string]any{"id": user})
							cookie := http.Cookie{Name: "jwt", Value: tokenString, Path: "/", HttpOnly: true, MaxAge: math.MaxInt32}
							common.SealCookie(r, &cookie)
							http.SetCookie(w, &cookie)
							_, _ = a.userService.SetKeyMigration(ctx, user)
						} else {
							err = errors.New("not permitted to access key rotation")
						}
					}
				} else {
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
	_, ok := a.providerInstances[string(accountType)]
	return ok
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
