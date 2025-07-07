package boardtemplates

import (
	"context"
	"github.com/google/uuid"
	"net/http"
)

type BoardTemplateService interface {
	Create(ctx context.Context, body CreateBoardTemplateRequest) (*BoardTemplate, error)
	Get(ctx context.Context, id uuid.UUID) (*BoardTemplate, error)
	GetAll(ctx context.Context, user uuid.UUID) ([]*BoardTemplateFull, error)
	Update(ctx context.Context, body BoardTemplateUpdateRequest) (*BoardTemplate, error)
	Delete(ctx context.Context, id uuid.UUID) error
}

type API struct {
	service  BoardTemplateService
	basePath string
}

func (A API) createBoardTemplate(w http.ResponseWriter, r *http.Request) {
	//TODO implement me
	panic("implement me")
}

func (A API) getBoardTemplate(w http.ResponseWriter, r *http.Request) {
	//TODO implement me
	panic("implement me")
}

func (A API) getBoardTemplates(w http.ResponseWriter, r *http.Request) {
	//TODO implement me
	panic("implement me")
}

func (A API) updateBoardTemplate(w http.ResponseWriter, r *http.Request) {
	//TODO implement me
	panic("implement me")
}

func (A API) deleteBoardTemplate(w http.ResponseWriter, r *http.Request) {
	//TODO implement me
	panic("implement me")
}

func NewBoardTemplateAPI(service BoardTemplateService, basePath string) BoardTemplateAPI {
	api := &API{service: service, basePath: basePath}
	return api
}
