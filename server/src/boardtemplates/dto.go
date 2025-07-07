package boardtemplates

import (
  "github.com/google/uuid"
  "scrumlr.io/server/columntemplates"
)

type BoardTemplate struct {
  // The board template id
  ID uuid.UUID `json:"id"`

  // The board template creator id
  Creator uuid.UUID `json:"creator"`

  // The board template name
  Name *string `json:"name,omitempty"`

  // Description of the board template
  Description *string `json:"description"`

  // The favourite status of the template
  Favourite *bool `json:"favourite"`
}

func (bt *BoardTemplate) From(board DatabaseBoardTemplate) *BoardTemplate {
  bt.ID = board.ID
  bt.Creator = board.Creator
  bt.Name = board.Name
  bt.Description = board.Description
  bt.Favourite = board.Favourite

  return bt
}

type BoardTemplateFull struct {
  Template *BoardTemplate `json:"template"`

  // Board templates associated column templates
  ColumnTemplates []*columntemplates.ColumnTemplate `json:"columns"`
}

func (bt *BoardTemplateFull) From(board DatabaseBoardTemplateFull) *BoardTemplateFull {
  bt.Template = new(BoardTemplate).From(board.Template)
  // parse db to dto column templates with dto helper function ColumnTemplates
  bt.ColumnTemplates = columntemplates.ColumnTemplates(board.ColumnTemplates)

  return bt
}

// CreateBoardTemplateRequest represents the request to create a new board template.
type CreateBoardTemplateRequest struct {
  // The name of the board template.
  Name *string `json:"name"`

  // The user who creates the template
  Creator uuid.UUID `json:"creator"`

  // Description of the board template
  Description *string `json:"description"`

  // The favourite status of the template
  Favourite *bool `json:"favourite"`

  // The column templates to create for the board template.
  Columns []*columntemplates.ColumnTemplateRequest `json:"columnTemplates"`
}

type BoardTemplateUpdateRequest struct {
  // The board template id
  ID uuid.UUID `json:"id"`

  // The board template name
  Name *string `json:"name,omitempty"`

  // Description of the board template
  Description *string `json:"description"`

  // The favourite status of the template
  Favourite *bool `json:"favourite"`
}
