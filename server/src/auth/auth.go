package auth

import (
	"crypto/ecdsa"
	"crypto/rand"
	"encoding/base64"
	"errors"
	"fmt"
	"io"
	"math"
	"net/http"
	"strings"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/jwtauth/v5"
	"github.com/google/uuid"
	"github.com/lestrrat-go/jwx/v2/jwt"
	"github.com/markbates/goth"
	"github.com/markbates/goth/gothic"
	"github.com/markbates/goth/providers/apple"
	"github.com/markbates/goth/providers/azureadv2"
	"github.com/markbates/goth/providers/github"
	"github.com/markbates/goth/providers/google"
	"github.com/markbates/goth/providers/microsoftonline"
	"golang.org/x/crypto/ssh"
	"scrumlr.io/server/auth/devkeys"
	"scrumlr.io/server/common"
	"scrumlr.io/server/database"
	"scrumlr.io/server/database/types"
	"scrumlr.io/server/logger"
)

type Auth interface {
	Sign(map[string]interface{}) (string, error)
	Verifier() func(http.Handler) http.Handler
	Exists(accountType types.AccountType) bool
}

type AuthProviderConfiguration struct {
	TenantId     string
	ClientId     string
	ClientSecret string
	RedirectUri  string
}

type AuthConfiguration struct {
	providers        map[string]AuthProviderConfiguration
	unsafePrivateKey string
	privateKey       string
	unsafeAuth       *jwtauth.JWTAuth
	auth             *jwtauth.JWTAuth
	database         *database.Database
}

func NewAuthConfiguration(providers map[string]AuthProviderConfiguration, unsafePrivateKey, privateKey string, database *database.Database) Auth {
	a := new(AuthConfiguration)
	a.providers = providers
	a.unsafePrivateKey = unsafePrivateKey
	a.database = database
	a.privateKey = privateKey
	a.initializeProviders()
	a.initializeJWTAuth()

	return a
}

func (a *AuthConfiguration) initializeProviders() {
	providers := []goth.Provider{}
	if provider, ok := a.providers[(string)(types.AccountTypeGoogle)]; ok {
		p := google.New(
			provider.ClientId,
			provider.ClientSecret,
			provider.RedirectUri,
			"openid",
			"profile",
		)
		p.SetName(strings.ToLower((string)(types.AccountTypeGoogle)))
		providers = append(providers, p)
	}
	if provider, ok := a.providers[(string)(types.AccountTypeGitHub)]; ok {
		p := github.New(
			provider.ClientId,
			provider.ClientSecret,
			provider.RedirectUri,
			"user",
		)
		p.SetName(strings.ToLower((string)(types.AccountTypeGitHub)))
		providers = append(providers, p)
	}
	if provider, ok := a.providers[(string)(types.AccountTypeMicrosoft)]; ok {
		p := microsoftonline.New(
			provider.ClientId,
			provider.ClientSecret,
			provider.RedirectUri,
			"User.Read",
		)
		p.SetName(strings.ToLower((string)(types.AccountTypeMicrosoft)))
		providers = append(providers, p)
	}
	if provider, ok := a.providers[(string)(types.AccountTypeAzureAd)]; ok {
		p := azureadv2.New(
			provider.ClientId,
			provider.ClientSecret,
			provider.RedirectUri,
			azureadv2.ProviderOptions{
				Tenant: azureadv2.TenantType(provider.TenantId),
				Scopes: []azureadv2.ScopeType{"User.Read"},
			},
		)
		p.SetName(strings.ToLower((string)(types.AccountTypeAzureAd)))
		providers = append(providers, p)
	}

	if provider, ok := a.providers[(string)(types.AccountTypeApple)]; ok {
		providers = append(providers, apple.New(
			provider.ClientId,
			provider.ClientSecret,
			provider.RedirectUri,
			nil,
			apple.ScopeName,
			apple.ScopeEmail,
		))
	}
	goth.UseProviders(providers...)
	gothic.GetProviderName = func(r *http.Request) (string, error) {
		return chi.URLParam(r, "provider"), nil
	}
	gothic.SetState = func(r *http.Request) string {
		nonceBytes := make([]byte, 64)
		_, err := io.ReadFull(rand.Reader, nonceBytes)
		if err != nil {
			panic("gothic: source of randomness unavailable: " + err.Error())
		}
		nonce := base64.URLEncoding.EncodeToString(nonceBytes)

		state := r.URL.Query().Get("state")
		if len(state) > 0 {
			return fmt.Sprintf("%s__%s", nonce, state)
		}

		return nonce
	}
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

				var token jwt.Token
				var err error

				if token, err = jwtauth.VerifyRequest(a.unsafeAuth, r, jwtauth.TokenFromCookie); err == nil {
					// check if user tries to authenticate by a prior authentication key
					// attempt to migrate JWT to new key
					userID := token.PrivateClaims()["id"].(string)
					var user uuid.UUID
					user, err = uuid.Parse(userID)

					if err == nil {
						var ok bool
						if ok, err = a.database.IsUserAvailableForKeyMigration(user); ok {
							// prepare new JWT
							tokenString, _ := a.Sign(map[string]interface{}{"id": user})
							cookie := http.Cookie{Name: "jwt", Value: tokenString, Path: "/", HttpOnly: true, MaxAge: math.MaxInt32}
							common.SealCookie(r, &cookie)
							http.SetCookie(w, &cookie)

							// update rotation flag in database for user, ignore errors
							_, _ = a.database.SetKeyMigration(user)
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

func (a *AuthConfiguration) Exists(accountType types.AccountType) bool {
	if _, ok := a.providers[string(accountType)]; ok {
		return true
	}
	return false
}

func (a *AuthConfiguration) initializeJWTAuth() {
	if a.privateKey == "" {
		logger.Get().Warnw("invalid keypair config, falling back to dev keys!")
		a.privateKey = devkeys.PrivateKey
	}

	if a.unsafePrivateKey != "" {
		unsafeKey, err := ssh.ParseRawPrivateKey([]byte(a.unsafePrivateKey))
		if err != nil {
			logger.Get().DPanicw("unable to start as we cannot parse unsafe auth keys", "error", err)
		}
		unsafePrivateKey, ok := unsafeKey.(*ecdsa.PrivateKey)
		if !ok {
			logger.Get().DPanic("unable to start as the provided unsafe keys are no ecdsa keys")
		}
		a.unsafeAuth = jwtauth.New("ES512", unsafePrivateKey, unsafePrivateKey.PublicKey)
	}

	key, err := ssh.ParseRawPrivateKey([]byte(a.privateKey))
	if err != nil {
		logger.Get().DPanicw("unable to start as we cannot parse auth keys", "error", err)
	}
	privateKey, ok := key.(*ecdsa.PrivateKey)
	if !ok {
		logger.Get().DPanic("unable to start as the provided keys are no ecdsa keys")
	}

	a.auth = jwtauth.New("ES512", privateKey, privateKey.PublicKey)
}
