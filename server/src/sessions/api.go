package sessions

import (
	"context"
	"github.com/google/uuid"
)

type UserService interface {
	CreateAnonymous(ctx context.Context, name string) (*User, error)
	CreateAppleUser(ctx context.Context, id, name, avatarUrl string) (*User, error)
	CreateAzureAdUser(ctx context.Context, id, name, avatarUrl string) (*User, error)
	CreateGitHubUser(ctx context.Context, id, name, avatarUrl string) (*User, error)
	CreateGoogleUser(ctx context.Context, id, name, avatarUrl string) (*User, error)
	CreateMicrosoftUser(ctx context.Context, id, name, avatarUrl string) (*User, error)
	CreateOIDCUser(ctx context.Context, id, name, avatarUrl string) (*User, error)
	Update(ctx context.Context, body UserUpdateRequest) (*User, error)
	Get(ctx context.Context, id uuid.UUID) (*User, error)

	IsUserAvailableForKeyMigration(ctx context.Context, id uuid.UUID) (bool, error)
	SetKeyMigration(ctx context.Context, id uuid.UUID) (*User, error)
}
