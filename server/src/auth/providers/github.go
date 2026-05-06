package providers

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"

	"golang.org/x/oauth2"
	githubEndpoint "golang.org/x/oauth2/github"
)

type gitHubProvider struct {
	oauth2Cfg oauth2.Config
}

func NewGitHubProvider(clientID, clientSecret, redirectURI string) Provider {
	return &gitHubProvider{
		oauth2Cfg: oauth2.Config{
			ClientID:     clientID,
			ClientSecret: clientSecret,
			RedirectURL:  redirectURI,
			Endpoint:     githubEndpoint.Endpoint,
			Scopes:       []string{"read:user"},
		},
	}
}

func (p *gitHubProvider) Name() string { return "github" }

func (p *gitHubProvider) AuthURL(_ http.ResponseWriter, _ *http.Request, state string) (string, error) {
	return p.oauth2Cfg.AuthCodeURL(state), nil
}

func (p *gitHubProvider) Exchange(ctx context.Context, r *http.Request) (*UserInfo, error) {
	code := r.URL.Query().Get("code")
	if code == "" {
		return nil, fmt.Errorf("no authorization code in callback")
	}

	token, err := p.oauth2Cfg.Exchange(ctx, code)
	if err != nil {
		return nil, fmt.Errorf("GitHub token exchange failed: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, "https://api.github.com/user", nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create GitHub API request: %w", err)
	}
	req.Header.Set("Authorization", "Bearer "+token.AccessToken)
	req.Header.Set("Accept", "application/vnd.github.v3+json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("GitHub API request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("GitHub API returned status %d", resp.StatusCode)
	}

	var ghUser struct {
		ID        int64  `json:"id"`
		Login     string `json:"login"`
		Name      string `json:"name"`
		AvatarURL string `json:"avatar_url"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&ghUser); err != nil {
		return nil, fmt.Errorf("failed to decode GitHub user response: %w", err)
	}

	name := ghUser.Name
	if name == "" {
		name = ghUser.Login
	}

	return &UserInfo{
		Subject: fmt.Sprintf("%d", ghUser.ID),
		Name:    name,
		Picture: ghUser.AvatarURL,
	}, nil
}
