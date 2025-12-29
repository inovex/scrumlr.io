package auth

import (
	"context"
	"crypto/ecdsa"
	"encoding/json"
	"errors"
	"fmt"
	"math"
	"net/http"

	"github.com/go-chi/chi/v5"
	ssh "golang.org/x/crypto/ssh"
	"golang.org/x/oauth2"
	"scrumlr.io/server/users"

	"github.com/uptrace/bun"

	"github.com/go-chi/jwtauth/v5"
	"github.com/google/uuid"
	"github.com/lestrrat-go/jwx/v2/jwt"
	"github.com/markbates/goth"

	"golang.org/x/oauth2/github"
	"golang.org/x/oauth2/google"
	"golang.org/x/oauth2/microsoft"
	"scrumlr.io/server/auth/devkeys"
	"scrumlr.io/server/common"
	"scrumlr.io/server/logger"
)

type Auth interface {
	Sign(map[string]interface{}) (string, error)
	Verifier() func(http.Handler) http.Handler
	Authenticator() func(http.Handler) http.Handler
	Exists(accountType common.AccountType) bool
	ExtractUserInformation(common.AccountType, *goth.User) (*UserInformation, error)
	BeginAuth(w http.ResponseWriter, r *http.Request)
	GetConfig(provider string) *oauth2.Config
	FetchExternalUser(ctx context.Context, provider string, token *oauth2.Token) (*UserInformation, error)
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
	database         *bun.DB
	userService      users.UserService
}

type UserInformation struct {
	Provider               common.AccountType
	Ident, Name, AvatarURL string
}

func NewAuthConfiguration(providers map[string]AuthProviderConfiguration, unsafePrivateKey, privateKey string, database *bun.DB, userService users.UserService) (Auth, error) {
	a := new(AuthConfiguration)
	a.providers = providers
	a.unsafePrivateKey = unsafePrivateKey
	a.database = database
	a.userService = userService
	a.privateKey = privateKey
	if err := a.initializeProviders(); err != nil {
		return nil, err
	}
	if err := a.initializeJWTAuth(); err != nil {
		return nil, err
	}

	return a, nil
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
			Scopes:       []string{"openid", "profile"},
		}
	}
	if p, ok := a.providers[string(common.GitHub)]; ok {
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
			Scopes:       []string{"User.Read"},
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

func (a *AuthConfiguration) ExtractUserInformation(accountType common.AccountType, user *goth.User) (*UserInformation, error) {
	ident := user.UserID
	name := user.NickName
	avatar := user.AvatarURL

	if ident == "" {
		return nil, fmt.Errorf("unable to extract identifier information for user")
	}

	if name == "" {
		name = user.Name
	}

	if name == "" {
		return nil, fmt.Errorf("unable to extract name information for user %q", ident)
	}

	result := &UserInformation{
		Provider:  accountType,
		Ident:     ident,
		Name:      name,
		AvatarURL: avatar,
	}

	return result, nil
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

func (a *AuthConfiguration) BeginAuth(w http.ResponseWriter, r *http.Request) {
	_ = chi.URLParam(r, "provider")

	config, ok := a.oauthConfigs[string(common.Google)]
	if !ok {
		http.Error(w, "Provider not found", http.StatusNotFound)
		return
	}

	// Use a secure state (random string) saved in a cookie
	state := "some-random-string" // In production, generate this dynamically
	url := config.AuthCodeURL(state)
	// DEBUG: Look for the redirect_uri parameter in this printed string
	fmt.Printf("Redirecting user to: %s\n", url)
	http.Redirect(w, r, url, http.StatusTemporaryRedirect)
}
func (a *AuthConfiguration) FetchExternalUser(ctx context.Context, provider string, token *oauth2.Token) (*UserInformation, error) {
	client := a.oauthConfigs[provider].Client(ctx, token)

	var url string
	switch provider {
	case "google":
		url = "https://www.googleapis.com/oauth2/v3/userinfo"
	case "github":
		url = "https://api.github.com/user"
	default:
		return nil, fmt.Errorf("unsupported provider info fetch: %s", provider)
	}

	resp, err := client.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var data map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&data); err != nil {
		return nil, err
	}

	// Map fields to your UserInformation struct
	res := &UserInformation{Provider: common.AccountType(provider)}
	if provider == "google" {
		res.Ident = fmt.Sprint(data["sub"])
		res.Name = fmt.Sprint(data["name"])
		res.AvatarURL = fmt.Sprint(data["picture"])
	} else if provider == "github" {
		res.Ident = fmt.Sprint(data["id"])
		res.Name = fmt.Sprint(data["login"])
		res.AvatarURL = fmt.Sprint(data["avatar_url"])
	}

	return res, nil
}
