package boardtemplates

import (
	"time"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
	"scrumlr.io/server/columntemplates"
	"scrumlr.io/server/database/types"
)

type DatabaseBoardTemplate struct {
	bun.BaseModel `bun:"table:board_templates"`
	ID            uuid.UUID
	Creator       uuid.UUID
	Name          *string
	Description   *string
	AccessPolicy  types.AccessPolicy
	Favourite     *bool
	CreatedAt     time.Time
}

type DatabaseBoardTemplateFull struct {
	bun.BaseModel   `bun:"table:board_templates"`
	ID              uuid.UUID
	Creator         uuid.UUID
	Name            *string
	Description     *string
	AccessPolicy    types.AccessPolicy
	Favourite       *bool
	ColumnTemplates []columntemplates.DatabaseColumnTemplate
	CreatedAt       time.Time
}

type DatabaseBoardTemplateInsert struct {
	bun.BaseModel `bun:"table:board_templates"`
	Creator       uuid.UUID
	Name          *string
	Description   *string
	AccessPolicy  types.AccessPolicy
	Favourite     *bool
}

type DatabaseBoardTemplateUpdate struct {
	bun.BaseModel `bun:"table:board_templates"`
	ID            uuid.UUID
	Name          *string
	Description   *string
	AccessPolicy  *types.AccessPolicy
	Favourite     *bool
}
