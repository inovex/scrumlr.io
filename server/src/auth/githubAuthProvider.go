package auth

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"golang.org/x/oauth2"
	"scrumlr.io/server/account"
)

const (
	githubAuthUrl     = "https://github.com/login/oauth/authorize"
	githubTokenUrl    = "https://github.com/login/oauth/access_token"
	githubUserInfoUrl = "https://api.github.com/user"
)

type GitHubAuthProvider struct {
	config oauth2.Config
}

func newGithubAuthProvider(clientId string, clientSecret string, redirectUrl string, scopes ...string) (AuthProvider, error) {
	githubProvider := new(GitHubAuthProvider)

	githubProvider.config = oauth2.Config{
		ClientID:     clientId,
		ClientSecret: clientSecret,
		Endpoint: oauth2.Endpoint{
			AuthURL:  githubAuthUrl,
			TokenURL: githubTokenUrl,
		},
		RedirectURL: redirectUrl,
		Scopes:      scopes,
	}

	return githubProvider, nil
}

func (provider *GitHubAuthProvider) AuthUrl(state string) string {
	return provider.config.AuthCodeURL(state)
}

func (provider *GitHubAuthProvider) Authenticate(ctx context.Context, code string) (*UserInformation, error) {
	oauth2Token, err := provider.config.Exchange(ctx, code)
	if err != nil {
		return nil, fmt.Errorf("failed to exchange token: %w", err)
	}

	client := provider.config.Client(ctx, oauth2Token)

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, githubUserInfoUrl, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}
	req.Header.Set("Accept", "application/json")

	response, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch user info: %w", err)
	}
	defer response.Body.Close()

	if response.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("failed to fetch user info with status %s: %w", response.Status, err)
	}

	var githubUser struct {
		Id      int    `json:"id"`
		Name    string `json:"name"`
		Picture string `json:"avatar_url"`
	}

	err = json.NewDecoder(response.Body).Decode(&githubUser)
	if err != nil {
		return nil, fmt.Errorf("failed to decode user info: %w", err)
	}

	userInfo := UserInformation{
		Provider:  account.GitHub,
		Ident:     strconv.Itoa(githubUser.Id),
		Name:      githubUser.Name,
		AvatarURL: githubUser.Picture,
	}

	return &userInfo, nil
}
