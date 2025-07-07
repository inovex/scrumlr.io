package sessions

import (
	"context"
	"net/http"
	"net/url"

	"github.com/google/uuid"
)

type API struct {
	sessionService SessionService
	userService    UserService
	basePath       string
}

type SessionService interface {
	Create(ctx context.Context, boardID, userID uuid.UUID) (*BoardSession, error)
	Update(ctx context.Context, body BoardSessionUpdateRequest) (*BoardSession, error)
	UpdateAll(ctx context.Context, body BoardSessionsUpdateRequest) ([]*BoardSession, error)
	UpdateUserBoards(ctx context.Context, body BoardSessionUpdateRequest) ([]*BoardSession, error)
	Get(ctx context.Context, boardID, userID uuid.UUID) (*BoardSession, error)
	GetAll(ctx context.Context, boardID uuid.UUID, filter BoardSessionFilter) ([]*BoardSession, error)
	GetUserConnectedBoards(ctx context.Context, user uuid.UUID) ([]*BoardSession, error)

	Connect(ctx context.Context, boardID, userID uuid.UUID) error
	Disconnect(ctx context.Context, boardID, userID uuid.UUID) error

	Exists(ctx context.Context, boardID, userID uuid.UUID) (bool, error)
	ModeratorSessionExists(ctx context.Context, boardID, userID uuid.UUID) (bool, error)
	IsParticipantBanned(ctx context.Context, boardID, userID uuid.UUID) (bool, error)

	BoardSessionFilterTypeFromQueryString(query url.Values) BoardSessionFilter
}

func (A API) getUser(w http.ResponseWriter, r *http.Request) {
	//TODO implement me
	panic("implement me")
}

func (A API) updateUser(w http.ResponseWriter, r *http.Request) {
	//TODO implement me
	panic("implement me")
}

func (A API) getBoardSession(w http.ResponseWriter, r *http.Request) {
	//TODO implement me
	panic("implement me")
}

func (A API) getBoardSessions(w http.ResponseWriter, r *http.Request) {
	//TODO implement me
	panic("implement me")
}

func (A API) updateBoardSession(w http.ResponseWriter, r *http.Request) {
	//TODO implement me
	panic("implement me")
}

func (A API) updateBoardSessions(w http.ResponseWriter, r *http.Request) {
	//TODO implement me
	panic("implement me")
}

func NewSessionAPI(sessionService SessionService, userService UserService, basePath string) SessionAPI {
	api := &API{sessionService: sessionService, userService: userService, basePath: basePath}
	return api
}
