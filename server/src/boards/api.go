package boards

import (
	"context"
	"github.com/google/uuid"
	"net/http"
)

type BoardService interface {
	Create(ctx context.Context, body CreateBoardRequest) (*Board, error)
	Get(ctx context.Context, id uuid.UUID) (*Board, error)
	Update(ctx context.Context, body BoardUpdateRequest) (*Board, error)
	Delete(ctx context.Context, id uuid.UUID) error

	SetTimer(ctx context.Context, id uuid.UUID, minutes uint8) (*Board, error)
	DeleteTimer(ctx context.Context, id uuid.UUID) (*Board, error)
	IncrementTimer(ctx context.Context, id uuid.UUID) (*Board, error)

	FullBoard(ctx context.Context, boardID uuid.UUID) (*FullBoard, error)
	BoardOverview(ctx context.Context, boardIDs []uuid.UUID, user uuid.UUID) ([]*BoardOverview, error)
	GetBoards(ctx context.Context, userID uuid.UUID) ([]uuid.UUID, error)
}

type API struct {
	service  BoardService
	basePath string
}

func (A API) Create(w http.ResponseWriter, r *http.Request) {
	//TODO implement me
	panic("implement me")
}

func (A API) Get(w http.ResponseWriter, r *http.Request) {
	//TODO implement me
	panic("implement me")
}

func (A API) GetAll(w http.ResponseWriter, r *http.Request) {
	//TODO implement me
	panic("implement me")
}

func (A API) Update(w http.ResponseWriter, r *http.Request) {
	//TODO implement me
	panic("implement me")
}

func (A API) Delete(w http.ResponseWriter, r *http.Request) {
	//TODO implement me
	panic("implement me")
}

func (A API) Join(w http.ResponseWriter, r *http.Request) {
	//TODO implement me
	panic("implement me")
}

func (A API) SetTimer(w http.ResponseWriter, r *http.Request) {
	//TODO implement me
	panic("implement me")
}

func (A API) DeleteTimer(w http.ResponseWriter, r *http.Request) {
	//TODO implement me
	panic("implement me")
}

func (A API) IncrementTimer(w http.ResponseWriter, r *http.Request) {
	//TODO implement me
	panic("implement me")
}

func (A API) Export(w http.ResponseWriter, r *http.Request) {
	//TODO implement me
	panic("implement me")
}

func (A API) Import(w http.ResponseWriter, r *http.Request) {
	//TODO implement me
	panic("implement me")
}

func NewBoardAPI(service BoardService, basePath string) BoardAPI {
	api := &API{service: service, basePath: basePath}
	return api
}
