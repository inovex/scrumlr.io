package auth

import (
	"context"
	"crypto/ecdsa"
	"errors"
	"fmt"
	"math"
	"net/http"

	"github.com/go-chi/jwtauth/v5"
	"github.com/google/uuid"
	"github.com/lestrrat-go/jwx/v3/jwt"
	"golang.org/x/crypto/ssh"
	"scrumlr.io/server/account"
	"scrumlr.io/server/auth/devkeys"
	"scrumlr.io/server/common"
	"scrumlr.io/server/logger"
	"scrumlr.io/server/users"
)

type UserInformation struct {
	Provider  account.Type
	Ident     string
	Name      string
	AvatarURL string
}

type AuthProvider interface {
	AuthUrl(state string) string
	Authenticate(ctx context.Context, code string) (*UserInformation, error)
}

type Auth interface {
	Sign(claims map[string]any) (string, error)
	Verifier() func(http.Handler) http.Handler
	Authenticator() func(http.Handler) http.Handler
	ConfiguredProvider() []account.Type
	GetProvider(accountType account.Type) (AuthProvider, error)

	CreateUser(ctx context.Context, userInfo UserInformation) (*users.User, string, error)
}

type AuthManager struct {
	providers        map[account.Type]AuthProvider
	unsafePrivateKey string
	privateKey       string
	unsafeAuth       *jwtauth.JWTAuth
	auth             *jwtauth.JWTAuth
	userService      users.UserService
}

func NewAuthManager(ctx context.Context, unsafePrivateKey string, privateKey string, userService users.UserService, opts ...AuthOptions) (Auth, error) {
	var options options
	for _, opt := range opts {
		err := opt(&options)
		if err != nil {
			return nil, err
		}
	}

	manager := new(AuthManager)

	manager.providers = options.provider
	manager.unsafePrivateKey = unsafePrivateKey
	manager.privateKey = privateKey

	err := manager.initializeJWTAuth(ctx)
	if err != nil {
		return nil, err
	}

	return manager, nil
}

func (manager *AuthManager) Sign(claims map[string]any) (string, error) {
	_, token, err := manager.auth.Encode(claims)
	return token, err
}

func (manager *AuthManager) Verifier() func(http.Handler) http.Handler {
	if manager.unsafeAuth == nil {
		return jwtauth.Verifier(manager.auth)
	}

	return func(next http.Handler) http.Handler {
		hfn := func(w http.ResponseWriter, r *http.Request) {
			ctx := r.Context()
			log := logger.FromContext(ctx)

			token, err := jwtauth.VerifyRequest(manager.auth, r, jwtauth.TokenFromCookie)
			if err == nil {
				// token is valid
				ctx = jwtauth.NewContext(ctx, token, err)
				next.ServeHTTP(w, r.WithContext(ctx))
				return
			}

			log.Debug("check if user tries to authenticate by a prior authentication key and attempt to migrate JWT to new key")
			token, err = manager.migrateUnsafeKey(w, r)

			ctx = jwtauth.NewContext(ctx, token, err)
			next.ServeHTTP(w, r.WithContext(ctx))
		}

		return http.HandlerFunc(hfn)
	}
}

func (manager *AuthManager) Authenticator() func(http.Handler) http.Handler {
	return jwtauth.Authenticator(manager.auth)
}

func (manager *AuthManager) ConfiguredProvider() []account.Type {
	configured := make([]account.Type, 0, len(manager.providers))

	for key := range manager.providers {
		configured = append(configured, key)
	}

	return configured
}

func (manager *AuthManager) GetProvider(accountType account.Type) (AuthProvider, error) {
	provider, ok := manager.providers[accountType]
	if !ok {
		return nil, fmt.Errorf("provider for %s not configured", accountType)
	}

	return provider, nil
}

func (manager *AuthManager) CreateUser(ctx context.Context, userInfo UserInformation) (*users.User, string, error) {
	user, err := manager.userService.Create(ctx, userInfo.Ident, userInfo.Name, userInfo.AvatarURL, userInfo.Provider)
	if err != nil {
		return nil, "", err
	}

	token, err := manager.Sign(map[string]any{"id": user.ID})
	if err != nil {
		return nil, "", err
	}

	return user, token, nil
}

func (manager *AuthManager) initializeJWTAuth(ctx context.Context) error {
	log := logger.FromContext(ctx)

	if manager.privateKey == "" {
		log.Warnw("invalid keypair config, falling back to dev keys!")
		manager.privateKey = devkeys.PrivateKey
	}

	if manager.unsafePrivateKey != "" {
		unsafeKey, err := ssh.ParseRawPrivateKey([]byte(manager.unsafePrivateKey))
		if err != nil {
			return fmt.Errorf("unable to parse unsafe auth keys: %w", err)
		}

		unsafePrivateKey, ok := unsafeKey.(*ecdsa.PrivateKey)
		if !ok {
			return errors.New("the provided unsafe keys are no ecdsa keys")
		}

		manager.unsafeAuth = jwtauth.New("ES512", unsafePrivateKey, unsafePrivateKey.PublicKey)
	}

	key, err := ssh.ParseRawPrivateKey([]byte(manager.privateKey))
	if err != nil {
		return fmt.Errorf("unable to parse auth keys: %w", err)
	}

	privateKey, ok := key.(*ecdsa.PrivateKey)
	if !ok {
		return errors.New("the provided keys are no ecdsa keys")
	}

	manager.auth = jwtauth.New("ES512", privateKey, privateKey.PublicKey)

	return nil
}

func (manager *AuthManager) migrateUnsafeKey(w http.ResponseWriter, r *http.Request) (jwt.Token, error) {
	ctx := r.Context()
	log := logger.FromContext(ctx)

	token, err := jwtauth.VerifyRequest(manager.unsafeAuth, r, jwtauth.TokenFromCookie)
	if err != nil {
		return nil, err
	}

	var id string
	err = token.Get("id", &id)
	if err != nil {
		log.Errorw("failed to get user id", "err", err)
		return nil, err
	}

	userId, err := uuid.Parse(id)
	if err != nil {
		log.Errorw("failed to parse user id", "err", err)
		return nil, err
	}

	canMigrate, err := manager.userService.IsUserAvailableForKeyMigration(ctx, userId)
	if err != nil {
		log.Errorw("failed to check for key migration", "err", err)
		return nil, err
	}

	if !canMigrate {
		err := errors.New("not permitted to access key rotation")
		log.Errorw("not permitted to access key rotation", "err", err)
		return nil, err
	}

	tokenString, err := manager.Sign(map[string]any{
		"id": userId,
	})
	if err != nil {
		log.Errorw("failed to sign claims", "err", err)
		return nil, err
	}

	cookie := http.Cookie{
		Name:     "jwt",
		Value:    tokenString,
		Path:     "/",
		HttpOnly: true,
		MaxAge:   math.MaxInt32,
	}
	common.SealCookie(r, &cookie)
	http.SetCookie(w, &cookie)

	_, err = manager.userService.SetKeyMigration(ctx, userId)
	if err != nil {
		log.Errorw("failed to set key migration", "err", err)
	}

	return token, nil
}
