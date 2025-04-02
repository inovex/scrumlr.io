package sessions

import (
	"context"
	"net/url"

	"github.com/google/uuid"
)

type SessionService interface {
	Create(ctx context.Context, boardID, userID uuid.UUID) (*BoardSession, error)
	Update(ctx context.Context, body BoardSessionUpdateRequest) (*BoardSession, error)
	UpdateAll(ctx context.Context, body BoardSessionsUpdateRequest) ([]*BoardSession, error)
	//UpdateUserBoards(ctx context.Context, body BoardSessionUpdateRequest) ([]*BoardSession, error)
	Get(ctx context.Context, boardID, userID uuid.UUID) (*BoardSession, error)
	Gets(ctx context.Context, boardID uuid.UUID, filter BoardSessionFilter) ([]*BoardSession, error)
	GetUserConnectedBoards(ctx context.Context, user uuid.UUID) ([]*BoardSession, error)

	Connect(ctx context.Context, boardID, userID uuid.UUID) error
	Disconnect(ctx context.Context, boardID, userID uuid.UUID) error

	Exists(ctx context.Context, boardID, userID uuid.UUID) (bool, error)
	ModeratorSessionExists(ctx context.Context, boardID, userID uuid.UUID) (bool, error)
	IsParticipantBanned(ctx context.Context, boardID, userID uuid.UUID) (bool, error)

	BoardSessionFilterTypeFromQueryString(query url.Values) BoardSessionFilter
}
