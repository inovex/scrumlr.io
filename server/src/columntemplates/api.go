package columntemplates

import (
	"context"
	"net/http"

	"github.com/google/uuid"
)

type ColumnTemplateService interface {
	Create(ctx context.Context, body ColumnTemplateRequest) (*ColumnTemplate, error)
	Get(ctx context.Context, boardID, columnID uuid.UUID) (*ColumnTemplate, error)
	GetAll(ctx context.Context, board uuid.UUID) ([]*ColumnTemplate, error)
	Update(ctx context.Context, body ColumnTemplateUpdateRequest) (*ColumnTemplate, error)
	Delete(ctx context.Context, boar, column, user uuid.UUID) error
}

type API struct {
	service  ColumnTemplateService
	basePath string
}

func (A API) createColumnTemplate(w http.ResponseWriter, r *http.Request) {
	//TODO implement me
	panic("implement me")
}

func (A API) getColumnTemplate(w http.ResponseWriter, r *http.Request) {
	//TODO implement me
	panic("implement me")
}

func (A API) getColumnTemplates(w http.ResponseWriter, r *http.Request) {
	//TODO implement me
	panic("implement me")
}

func (A API) updateColumnTemplate(w http.ResponseWriter, r *http.Request) {
	//TODO implement me
	panic("implement me")
}

func (A API) deleteColumnTemplate(w http.ResponseWriter, r *http.Request) {
	//TODO implement me
	panic("implement me")
}

func NewColumnTemplateAPI(service ColumnTemplateService, basePath string) ColumnTemplateAPI {
	api := &API{service: service, basePath: basePath}
	return api
}
