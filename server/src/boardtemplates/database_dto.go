package boardtemplates

import (
	"github.com/google/uuid"
	"github.com/uptrace/bun"
	"scrumlr.io/server/columntemplates"
	"time"
)

type DatabaseBoardTemplate struct {
	bun.BaseModel `bun:"table:board_templates"`
	ID            uuid.UUID
	Creator       uuid.UUID
	Name          *string
	Description   *string
	Favourite     *bool
	CreatedAt     time.Time
}

type DatabaseBoardTemplateFull struct {
	bun.BaseModel   `bun:"table:board_templates"`
	Template        DatabaseBoardTemplate
	ColumnTemplates []columntemplates.DatabaseColumnTemplate
}

type DatabaseBoardTemplateInsert struct {
	bun.BaseModel `bun:"table:board_templates"`
	Creator       uuid.UUID
	Name          *string
	Description   *string
	Favourite     *bool
}

type DatabaseBoardTemplateUpdate struct {
	bun.BaseModel `bun:"table:board_templates"`
	ID            uuid.UUID
	Name          *string
	Description   *string
	Favourite     *bool
}
