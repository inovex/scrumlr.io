package columntemplates

import (
	"context"
	"log"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"
	"github.com/testcontainers/testcontainers-go/modules/postgres"
	"github.com/uptrace/bun"
	"scrumlr.io/server/columns"
	"scrumlr.io/server/common"
	"scrumlr.io/server/initialize"
)

type ColumnTemplateServiceIntegrationTestSuite struct {
	suite.Suite
	dbContainer     *postgres.PostgresContainer
	db              *bun.DB
	users           map[string]TestUser
	boardTemplates  map[string]TestBoardTemplate
	columnTemplates map[string]DatabaseColumnTemplate
}

func TestColumnTemplateServiceIntegrationTestSuite(t *testing.T) {
	suite.Run(t, new(ColumnTemplateServiceIntegrationTestSuite))
}

func (suite *ColumnTemplateServiceIntegrationTestSuite) SetupSuite() {
	dbContainer, bun := initialize.StartTestDatabase()
	suite.SeedDatabase(bun)

	suite.dbContainer = dbContainer
	suite.db = bun
}

func (suite *ColumnTemplateServiceIntegrationTestSuite) TearDownSuite() {
	initialize.StopTestDatabase(suite.dbContainer)
}

func (suite *ColumnTemplateServiceIntegrationTestSuite) Test_Create() {
	t := suite.T()
	ctx := context.Background()

	boardId := suite.boardTemplates["InsertNoIndex"].id
	name := "CreateNoIndex"
	description := "This is inserted from the test"
	color := columns.ColorYieldingYellow
	visible := true

	database := NewColumnTemplateDatabase(suite.db)
	service := NewColumnTemplateService(database)

	template, err := service.Create(ctx, ColumnTemplateRequest{
		BoardTemplate: boardId,
		Name:          name,
		Description:   description,
		Color:         color,
		Visible:       &visible,
		Index:         nil,
	})

	assert.Nil(t, err)
	assert.Equal(t, boardId, template.BoardTemplate)
	assert.Equal(t, name, template.Name)
	assert.Equal(t, description, template.Description)
	assert.Equal(t, color, template.Color)
	assert.Equal(t, 1, template.Index)
	assert.Equal(t, visible, template.Visible)
}

func (suite *ColumnTemplateServiceIntegrationTestSuite) Test_Create_FirstIndex() {
	t := suite.T()
	ctx := context.Background()

	boardId := suite.boardTemplates["InsertFirst"].id
	name := "CreateFirst"
	description := "This is inserted from the test"
	color := columns.ColorYieldingYellow
	visible := true
	index := 0

	database := NewColumnTemplateDatabase(suite.db)
	service := NewColumnTemplateService(database)

	template, err := service.Create(ctx, ColumnTemplateRequest{
		BoardTemplate: boardId,
		Name:          name,
		Description:   description,
		Color:         color,
		Visible:       &visible,
		Index:         &index,
	})

	assert.Nil(t, err)
	assert.Equal(t, boardId, template.BoardTemplate)
	assert.Equal(t, name, template.Name)
	assert.Equal(t, description, template.Description)
	assert.Equal(t, color, template.Color)
	assert.Equal(t, index, template.Index)
	assert.Equal(t, visible, template.Visible)
}

func (suite *ColumnTemplateServiceIntegrationTestSuite) Test_Create_LastIndex() {
	t := suite.T()
	ctx := context.Background()

	boardId := suite.boardTemplates["InsertLast"].id
	name := "CreateLast"
	description := "This is inserted from the test"
	color := columns.ColorYieldingYellow
	visible := true
	index := 1

	database := NewColumnTemplateDatabase(suite.db)
	service := NewColumnTemplateService(database)

	template, err := service.Create(ctx, ColumnTemplateRequest{
		BoardTemplate: boardId,
		Name:          name,
		Description:   description,
		Color:         color,
		Visible:       &visible,
		Index:         &index,
	})

	assert.Nil(t, err)
	assert.Equal(t, boardId, template.BoardTemplate)
	assert.Equal(t, name, template.Name)
	assert.Equal(t, description, template.Description)
	assert.Equal(t, color, template.Color)
	assert.Equal(t, index, template.Index)
	assert.Equal(t, visible, template.Visible)
}

func (suite *ColumnTemplateServiceIntegrationTestSuite) Test_Create_MiddleIndex() {
	t := suite.T()
	ctx := context.Background()

	boardId := suite.boardTemplates["InsertMiddleIndex"].id
	name := "CreateMiddle"
	description := "This is inserted from the test"
	color := columns.ColorYieldingYellow
	visible := true
	index := 1

	database := NewColumnTemplateDatabase(suite.db)
	service := NewColumnTemplateService(database)

	template, err := service.Create(ctx, ColumnTemplateRequest{
		BoardTemplate: boardId,
		Name:          name,
		Description:   description,
		Color:         color,
		Visible:       &visible,
		Index:         &index,
	})

	assert.Nil(t, err)
	assert.Equal(t, boardId, template.BoardTemplate)
	assert.Equal(t, name, template.Name)
	assert.Equal(t, description, template.Description)
	assert.Equal(t, color, template.Color)
	assert.Equal(t, index, template.Index)
	assert.Equal(t, visible, template.Visible)
}

func (suite *ColumnTemplateServiceIntegrationTestSuite) Test_Update() {
	t := suite.T()
	ctx := context.Background()

	columnId := suite.columnTemplates["Update"].ID
	boardId := suite.columnTemplates["Update"].BoardTemplate
	name := "Updated Name"
	description := "This column was updated"
	color := columns.ColorGoalGreen
	index := 1
	visible := true

	database := NewColumnTemplateDatabase(suite.db)
	service := NewColumnTemplateService(database)

	template, err := service.Update(ctx, ColumnTemplateUpdateRequest{
		ID:            columnId,
		BoardTemplate: boardId,
		Name:          name,
		Description:   description,
		Color:         color,
		Visible:       visible,
		Index:         index,
	})

	assert.Nil(t, err)
	assert.Equal(t, columnId, template.ID)
	assert.Equal(t, boardId, template.BoardTemplate)
	assert.Equal(t, name, template.Name)
	assert.Equal(t, description, template.Description)
	assert.Equal(t, color, template.Color)
	assert.Equal(t, index, template.Index)
	assert.Equal(t, visible, template.Visible)
}

func (suite *ColumnTemplateServiceIntegrationTestSuite) Test_Delete() {
	t := suite.T()
	ctx := context.Background()

	columnId := suite.columnTemplates["Delete"].ID
	boardId := suite.columnTemplates["Delete"].BoardTemplate

	database := NewColumnTemplateDatabase(suite.db)
	service := NewColumnTemplateService(database)

	err := service.Delete(ctx, boardId, columnId)

	assert.Nil(t, err)
}

func (suite *ColumnTemplateServiceIntegrationTestSuite) Test_Get() {
	t := suite.T()
	ctx := context.Background()

	columnId := suite.columnTemplates["Read1"].ID
	boardId := suite.boardTemplates["Read1"].id

	database := NewColumnTemplateDatabase(suite.db)
	service := NewColumnTemplateService(database)

	template, err := service.Get(ctx, boardId, columnId)

	assert.Nil(t, err)
	assert.Equal(t, columnId, template.ID)
	assert.Equal(t, boardId, template.BoardTemplate)
	assert.Equal(t, suite.columnTemplates["Read1"].Name, template.Name)
	assert.Equal(t, suite.columnTemplates["Read1"].Description, template.Description)
	assert.Equal(t, suite.columnTemplates["Read1"].Color, template.Color)
	assert.Equal(t, suite.columnTemplates["Read1"].Index, template.Index)
	assert.Equal(t, suite.columnTemplates["Read1"].Visible, template.Visible)
}

func (suite *ColumnTemplateServiceIntegrationTestSuite) Test_GetAll() {
	t := suite.T()
	ctx := context.Background()

	boardId := suite.boardTemplates["Read1"].id

	database := NewColumnTemplateDatabase(suite.db)
	service := NewColumnTemplateService(database)

	templates, err := service.GetAll(ctx, boardId)

	assert.Nil(t, err)
	assert.Len(t, templates, 2)

	assert.Equal(t, suite.columnTemplates["Read1"].ID, templates[0].ID)
	assert.Equal(t, boardId, templates[0].BoardTemplate)
	assert.Equal(t, suite.columnTemplates["Read1"].Name, templates[0].Name)
	assert.Equal(t, suite.columnTemplates["Read1"].Description, templates[0].Description)
	assert.Equal(t, suite.columnTemplates["Read1"].Color, templates[0].Color)
	assert.Equal(t, suite.columnTemplates["Read1"].Index, templates[0].Index)
	assert.Equal(t, suite.columnTemplates["Read1"].Visible, templates[0].Visible)

	assert.Equal(t, suite.columnTemplates["Read2"].ID, templates[1].ID)
	assert.Equal(t, boardId, templates[0].BoardTemplate)
	assert.Equal(t, suite.columnTemplates["Read2"].Name, templates[1].Name)
	assert.Equal(t, suite.columnTemplates["Read2"].Description, templates[1].Description)
	assert.Equal(t, suite.columnTemplates["Read2"].Color, templates[1].Color)
	assert.Equal(t, suite.columnTemplates["Read2"].Index, templates[1].Index)
	assert.Equal(t, suite.columnTemplates["Read2"].Visible, templates[1].Visible)
}

func (suite *ColumnTemplateServiceIntegrationTestSuite) SeedDatabase(db *bun.DB) {
	// tests users
	suite.users = make(map[string]TestUser, 2)
	suite.users["Stan"] = TestUser{id: uuid.New(), name: "Stan", accountType: common.Google}
	suite.users["Santa"] = TestUser{id: uuid.New(), name: "Santa", accountType: common.Anonymous}

	// test board templates
	suite.boardTemplates = make(map[string]TestBoardTemplate, 7)
	suite.boardTemplates["InsertFirst"] = TestBoardTemplate{id: uuid.New(), creator: suite.users["Santa"].id, name: "InsertFirst", description: "This is a description", favourite: false}
	suite.boardTemplates["InsertNoIndex"] = TestBoardTemplate{id: uuid.New(), creator: suite.users["Santa"].id, name: "InsertNoIndex", description: "This is a description", favourite: false}
	suite.boardTemplates["InsertLast"] = TestBoardTemplate{id: uuid.New(), creator: suite.users["Santa"].id, name: "InsertLast", description: "This is a description", favourite: false}
	suite.boardTemplates["InsertHighIndex"] = TestBoardTemplate{id: uuid.New(), creator: suite.users["Santa"].id, name: "InsertHighIndex", description: "This is a description", favourite: false}
	suite.boardTemplates["InsertMiddleIndex"] = TestBoardTemplate{id: uuid.New(), creator: suite.users["Santa"].id, name: "InsertMiddleindex", description: "This is a description", favourite: false}
	suite.boardTemplates["Write"] = TestBoardTemplate{id: uuid.New(), creator: suite.users["Santa"].id, name: "WriteTemplate", description: "This is a description", favourite: true}
	suite.boardTemplates["Read1"] = TestBoardTemplate{id: uuid.New(), creator: suite.users["Stan"].id, name: "ReadTemplate", description: "This is a description", favourite: true}

	// test column templates
	suite.columnTemplates = make(map[string]DatabaseColumnTemplate, 11)
	// test column templates for insert
	suite.columnTemplates["InsertFirst"] = DatabaseColumnTemplate{ID: uuid.New(), BoardTemplate: suite.boardTemplates["InsertFirst"].id, Name: "InsertFirst", Description: "Initial template", Visible: false, Color: columns.ColorYieldingYellow, Index: 0}
	suite.columnTemplates["InsertNoIndex"] = DatabaseColumnTemplate{ID: uuid.New(), BoardTemplate: suite.boardTemplates["InsertNoIndex"].id, Name: "InsertNoIndex", Description: "Initial template", Visible: false, Color: columns.ColorGoalGreen, Index: 0}
	suite.columnTemplates["InsertLast"] = DatabaseColumnTemplate{ID: uuid.New(), BoardTemplate: suite.boardTemplates["InsertLast"].id, Name: "InsertLast", Description: "Initial template", Visible: false, Color: columns.ColorGoalGreen, Index: 0}
	suite.columnTemplates["InsertHighIndex"] = DatabaseColumnTemplate{ID: uuid.New(), BoardTemplate: suite.boardTemplates["InsertHighIndex"].id, Name: "InsertHighIndex", Description: "Initial template", Visible: false, Color: columns.ColorGoalGreen, Index: 0}
	suite.columnTemplates["InsertMiddleIndex0"] = DatabaseColumnTemplate{ID: uuid.New(), BoardTemplate: suite.boardTemplates["InsertMiddleIndex"].id, Name: "InsertMiddle0", Description: "Initial template", Visible: false, Color: columns.ColorGoalGreen, Index: 0}
	suite.columnTemplates["InsertMiddleIndex1"] = DatabaseColumnTemplate{ID: uuid.New(), BoardTemplate: suite.boardTemplates["InsertMiddleIndex"].id, Name: "InsertMiddle1", Description: "Initial template", Visible: false, Color: columns.ColorGoalGreen, Index: 1}
	// test column templates for write
	suite.columnTemplates["Update"] = DatabaseColumnTemplate{ID: uuid.New(), BoardTemplate: suite.boardTemplates["Write"].id, Name: "Update", Description: "This is a column description", Visible: false, Color: columns.ColorOnlineOrange, Index: 0}
	suite.columnTemplates["UpdateIndex"] = DatabaseColumnTemplate{ID: uuid.New(), BoardTemplate: suite.boardTemplates["Write"].id, Name: "Update", Description: "The index of this column will be update through the update of the column above", Visible: false, Color: columns.ColorPlanningPink, Index: 1}
	suite.columnTemplates["Delete"] = DatabaseColumnTemplate{ID: uuid.New(), BoardTemplate: suite.boardTemplates["Write"].id, Name: "Delete", Description: "This column will be delete throug a test", Visible: true, Color: columns.ColorPokerPurple, Index: 2}
	// test colum templates for get
	suite.columnTemplates["Read1"] = DatabaseColumnTemplate{ID: uuid.New(), BoardTemplate: suite.boardTemplates["Read1"].id, Name: "Column1", Description: "This is a column description", Visible: true, Color: columns.ColorOnlineOrange, Index: 0}
	suite.columnTemplates["Read2"] = DatabaseColumnTemplate{ID: uuid.New(), BoardTemplate: suite.boardTemplates["Read1"].id, Name: "Column2", Description: "This is a column description", Visible: true, Color: columns.ColorPokerPurple, Index: 1}

	for _, user := range suite.users {
		err := initialize.InsertUser(db, user.id, user.name, string(user.accountType))
		if err != nil {
			log.Fatalf("Failed to insert test user %s", err)
		}
	}

	for _, boardTemplate := range suite.boardTemplates {
		err := initialize.InsertBoardTemplate(db, boardTemplate.id, boardTemplate.creator, boardTemplate.name, boardTemplate.description, boardTemplate.favourite)
		if err != nil {
			log.Fatalf("Failed to insert test board templates %s", err)
		}
	}

	for _, columnTemplate := range suite.columnTemplates {
		err := initialize.InsertColumnTemplate(db, columnTemplate.ID, columnTemplate.BoardTemplate, columnTemplate.Name, columnTemplate.Description, string(columnTemplate.Color), columnTemplate.Visible, columnTemplate.Index)
		if err != nil {
			log.Fatalf("Failed to insert test column templates %s", err)
		}
	}
}
