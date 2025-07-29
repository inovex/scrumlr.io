package auth

import (
	"github.com/go-chi/jwtauth/v5"
	"github.com/uptrace/bun"
	"scrumlr.io/server/common"
	"scrumlr.io/server/sessions"
)

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
	providers        map[string]AuthProviderConfiguration
	unsafePrivateKey string
	privateKey       string
	unsafeAuth       *jwtauth.JWTAuth
	auth             *jwtauth.JWTAuth
	database         *bun.DB
	userService      sessions.UserService
}

type UserInformation struct {
	Provider               common.AccountType
	Ident, Name, AvatarURL string
}
