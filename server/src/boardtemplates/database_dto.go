package boardtemplates

import (
	"scrumlr.io/server/board"
	"time"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
	"scrumlr.io/server/columntemplates"
)

type DatabaseBoardTemplate struct {
	bun.BaseModel `bun:"table:board_templates"`
	ID            uuid.UUID
	Creator       uuid.UUID
	Name          *string
	Description   *string
	AccessPolicy  boards.AccessPolicy
	Favourite     *bool
	CreatedAt     time.Time
}

type DatabaseBoardTemplateFull struct {
	bun.BaseModel   `bun:"table:board_templates"`
	ID              uuid.UUID
	Creator         uuid.UUID
	Name            *string
	Description     *string
	AccessPolicy    boards.AccessPolicy
	Favourite       *bool
	ColumnTemplates []columntemplates.DatabaseColumnTemplate
	CreatedAt       time.Time
}

type DatabaseBoardTemplateInsert struct {
	bun.BaseModel `bun:"table:board_templates"`
	Creator       uuid.UUID
	Name          *string
	Description   *string
	AccessPolicy  boards.AccessPolicy
	Favourite     *bool
}

type DatabaseBoardTemplateUpdate struct {
	bun.BaseModel `bun:"table:board_templates"`
	ID            uuid.UUID
	Name          *string
	Description   *string
	AccessPolicy  *boards.AccessPolicy
	Favourite     *bool
}
