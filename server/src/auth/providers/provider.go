package providers

import (
	"context"
	"net/http"
)

type UserInfo struct {
	Subject string
	Name    string
	Picture string
}

type Provider interface {
	Name() string
	AuthURL(w http.ResponseWriter, r *http.Request, state string) (string, error)
	Exchange(ctx context.Context, r *http.Request) (*UserInfo, error)
}
