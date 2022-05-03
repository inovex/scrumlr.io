package auth

import (
	"crypto/ecdsa"
	"crypto/rand"
	"encoding/base64"
	"fmt"
	"io"
	"net/http"
	"strings"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/jwtauth/v5"
	"github.com/markbates/goth"
	"github.com/markbates/goth/gothic"
	"github.com/markbates/goth/providers/apple"
	"github.com/markbates/goth/providers/github"
	"github.com/markbates/goth/providers/google"
	"github.com/markbates/goth/providers/microsoftonline"
	"golang.org/x/crypto/ssh"
	"scrumlr.io/server/auth/devkeys"
	"scrumlr.io/server/database/types"
	"scrumlr.io/server/logger"
)

type Auth interface {
	Sign(map[string]interface{}) (string, error)
	Verifier() func(http.Handler) http.Handler
	Exists(accountType types.AccountType) bool
}

type AuthProviderConfiguration struct {
	ClientId     string
	ClientSecret string
	RedirectUri  string
}

type AuthConfiguration struct {
	providers  map[string]AuthProviderConfiguration
	PublicKey  string
	privateKey string
	auth       *jwtauth.JWTAuth
}

func NewAuthConfiguration(providers map[string]AuthProviderConfiguration, privateKey string) Auth {
	a := new(AuthConfiguration)
	a.providers = providers
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
