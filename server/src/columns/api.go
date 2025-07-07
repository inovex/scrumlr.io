package columns

import (
	"context"
	"net/http"

	"github.com/google/uuid"
)

type ColumnService interface {
	Create(ctx context.Context, body ColumnRequest) (*Column, error)
	Delete(ctx context.Context, board, column, user uuid.UUID) error
	Update(ctx context.Context, body ColumnUpdateRequest) (*Column, error)
	Get(ctx context.Context, boardID, columnID uuid.UUID) (*Column, error)
	GetAll(ctx context.Context, boardID uuid.UUID) ([]*Column, error)
}

type API struct {
	service  ColumnService
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

func NewColumnApi(service ColumnService, basePath string) ColumnAPI {
	api := &API{service: service, basePath: basePath}
	return api
}
