package columns

import (
  "context"
  "scrumlr.io/server/realtime"

  "github.com/google/uuid"
)

type ColumnService interface {
  Create(ctx context.Context, body ColumnRequest) (*Column, error)
  Delete(ctx context.Context, board, column, user uuid.UUID) error
  Update(ctx context.Context, body ColumnUpdateRequest) (*Column, error)
  Get(ctx context.Context, boardID, columnID uuid.UUID) (*Column, error)
  GetAll(ctx context.Context, boardID uuid.UUID) ([]*Column, error)
  UpdateEvent(event *realtime.BoardEvent, boardID, userID uuid.UUID, isMod bool) (*realtime.BoardEvent, bool)
}

type ColumnApi struct {
  service ColumnService
}

func NewColumnApi(service ColumnService) *ColumnApi {
  api := new(ColumnApi)
  api.service = service

  return api
}
