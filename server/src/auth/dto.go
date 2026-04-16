package auth

import (
	"github.com/go-chi/jwtauth/v5"
	"golang.org/x/oauth2"
	"scrumlr.io/server/common"
	"scrumlr.io/server/users"
)

type AuthProviderConfiguration struct {
	TenantId       string
	ClientId       string
	ClientSecret   string
	RedirectUri    string
	DiscoveryUri   string
	UserIdentScope string
	UserNameScope  string
	AuthBasePath   string
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

type providerMap struct {
	identClaim  string
	nameClaim   string
	avatarClaim string
}

var externalProviderConfigs = map[string]providerMap{
	string(common.Google):    {identClaim: "sub", nameClaim: "name", avatarClaim: "picture"},
	string(common.Microsoft): {identClaim: "oid", nameClaim: "name", avatarClaim: "avatar_url"},
	string(common.AzureAd):   {identClaim: "oid", nameClaim: "name", avatarClaim: ""},
	string(common.Apple):     {identClaim: "sub", nameClaim: "name", avatarClaim: ""},
	string(common.TypeOIDC):  {identClaim: "sub", nameClaim: "name", avatarClaim: ""},
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
