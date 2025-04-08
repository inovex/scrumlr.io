package sessionrequests

import (
	"context"
	http "net/http"

	"github.com/google/uuid"
)

type SessionRequestService interface {
	Create(ctx context.Context, boardID, userID uuid.UUID) (*BoardSessionRequest, error)
	Update(ctx context.Context, body BoardSessionRequestUpdate) (*BoardSessionRequest, error)
	Get(ctx context.Context, boardID, userID uuid.UUID) (*BoardSessionRequest, error)
	GetAll(ctx context.Context, boardID uuid.UUID, statusQuery string) ([]*BoardSessionRequest, error)
	Exists(ctx context.Context, boardID, userID uuid.UUID) (bool, error)
	OpenSocket(w http.ResponseWriter, r *http.Request)
}
