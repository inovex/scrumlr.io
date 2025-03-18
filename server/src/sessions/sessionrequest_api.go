package sessions

import (
	"context"
	http "net/http"

	"github.com/google/uuid"
)

type SessionRequestService interface {
	CreateSessionRequest(ctx context.Context, boardID, userID uuid.UUID) (*BoardSessionRequest, error)
	UpdateSessionRequest(ctx context.Context, body BoardSessionRequestUpdate) (*BoardSessionRequest, error)
	GetSessionRequest(ctx context.Context, boardID, userID uuid.UUID) (*BoardSessionRequest, error)
	ListSessionRequest(ctx context.Context, boardID uuid.UUID, statusQuery string) ([]*BoardSessionRequest, error)
	SessionRequestExists(ctx context.Context, boardID, userID uuid.UUID) (bool, error)
	OpenBoardSessionRequestSocket(w http.ResponseWriter, r *http.Request)
}
