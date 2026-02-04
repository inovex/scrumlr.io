package columntemplates

import (
	"context"
	"log"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"
	"github.com/uptrace/bun"
	"scrumlr.io/server/columns"
	"scrumlr.io/server/common"
	"scrumlr.io/server/initialize/testDbTemplates"
)

type testBoardTemplate struct {
	id          uuid.UUID
	creator     uuid.UUID
	name        string
	description string
	favourite   bool
}

type ColumnTemplateServiceIntegrationTestSuite struct {
	suite.Suite
	service         ColumnTemplateService
	users           map[string]testDbTemplates.TestUser
	boardTemplates  map[string]testBoardTemplate
	columnTemplates map[string]DatabaseColumnTemplate
}

func TestColumnTemplateServiceIntegrationTestSuite(t *testing.T) {
	suite.Run(t, new(ColumnTemplateServiceIntegrationTestSuite))
}

func (suite *ColumnTemplateServiceIntegrationTestSuite) SetupSuite() {
	suite.initTestData()
}

func (suite *ColumnTemplateServiceIntegrationTestSuite) SetupTest() {
	db := testDbTemplates.NewBaseTestDB(
		suite.T(),
		false,
		testDbTemplates.AdditionalSeed{
			Name: "columntemplates_test",
			Func: suite.seedColumnTemplatesTestData,
		},
	)

	database := NewColumnTemplateDatabase(db)
	suite.service = NewColumnTemplateService(database)
}

func (suite *ColumnTemplateServiceIntegrationTestSuite) initTestData() {
	suite.users = map[string]testDbTemplates.TestUser{
		"Stan":  {Name: "Stan", ID: uuid.MustParse("c1b2c3d4-e5f6-7890-abcd-ef1234567001"), AccountType: common.Google},
		"Santa": {Name: "Santa", ID: uuid.MustParse("c1b2c3d4-e5f6-7890-abcd-ef1234567002"), AccountType: common.Anonymous},
	}

	suite.boardTemplates = map[string]testBoardTemplate{
		"InsertFirst":       {id: uuid.MustParse("c1b2c3d4-e5f6-7890-abcd-ef1234567101"), creator: suite.users["Santa"].ID, name: "InsertFirst", description: "This is a description", favourite: false},
		"InsertNoIndex":     {id: uuid.MustParse("c1b2c3d4-e5f6-7890-abcd-ef1234567102"), creator: suite.users["Santa"].ID, name: "InsertNoIndex", description: "This is a description", favourite: false},
		"InsertLast":        {id: uuid.MustParse("c1b2c3d4-e5f6-7890-abcd-ef1234567103"), creator: suite.users["Santa"].ID, name: "InsertLast", description: "This is a description", favourite: false},
		"InsertHighIndex":   {id: uuid.MustParse("c1b2c3d4-e5f6-7890-abcd-ef1234567104"), creator: suite.users["Santa"].ID, name: "InsertHighIndex", description: "This is a description", favourite: false},
		"InsertMiddleIndex": {id: uuid.MustParse("c1b2c3d4-e5f6-7890-abcd-ef1234567105"), creator: suite.users["Santa"].ID, name: "InsertMiddleindex", description: "This is a description", favourite: false},
		"Write":             {id: uuid.MustParse("c1b2c3d4-e5f6-7890-abcd-ef1234567106"), creator: suite.users["Santa"].ID, name: "WriteTemplate", description: "This is a description", favourite: true},
		"Read1":             {id: uuid.MustParse("c1b2c3d4-e5f6-7890-abcd-ef1234567107"), creator: suite.users["Stan"].ID, name: "ReadTemplate", description: "This is a description", favourite: true},
	}

	suite.columnTemplates = map[string]DatabaseColumnTemplate{
		// test column templates for insert
		"InsertFirst":        {ID: uuid.MustParse("c1b2c3d4-e5f6-7890-abcd-ef1234567201"), BoardTemplate: suite.boardTemplates["InsertFirst"].id, Name: "InsertFirst", Description: "Initial template", Visible: false, Color: columns.ColorYieldingYellow, Index: 0},
		"InsertNoIndex":      {ID: uuid.MustParse("c1b2c3d4-e5f6-7890-abcd-ef1234567202"), BoardTemplate: suite.boardTemplates["InsertNoIndex"].id, Name: "InsertNoIndex", Description: "Initial template", Visible: false, Color: columns.ColorGoalGreen, Index: 0},
		"InsertLast":         {ID: uuid.MustParse("c1b2c3d4-e5f6-7890-abcd-ef1234567203"), BoardTemplate: suite.boardTemplates["InsertLast"].id, Name: "InsertLast", Description: "Initial template", Visible: false, Color: columns.ColorGoalGreen, Index: 0},
		"InsertHighIndex":    {ID: uuid.MustParse("c1b2c3d4-e5f6-7890-abcd-ef1234567204"), BoardTemplate: suite.boardTemplates["InsertHighIndex"].id, Name: "InsertHighIndex", Description: "Initial template", Visible: false, Color: columns.ColorGoalGreen, Index: 0},
		"InsertMiddleIndex0": {ID: uuid.MustParse("c1b2c3d4-e5f6-7890-abcd-ef1234567205"), BoardTemplate: suite.boardTemplates["InsertMiddleIndex"].id, Name: "InsertMiddle0", Description: "Initial template", Visible: false, Color: columns.ColorGoalGreen, Index: 0},
		"InsertMiddleIndex1": {ID: uuid.MustParse("c1b2c3d4-e5f6-7890-abcd-ef1234567206"), BoardTemplate: suite.boardTemplates["InsertMiddleIndex"].id, Name: "InsertMiddle1", Description: "Initial template", Visible: false, Color: columns.ColorGoalGreen, Index: 1},
		// test column templates for write
		"Update":      {ID: uuid.MustParse("c1b2c3d4-e5f6-7890-abcd-ef1234567207"), BoardTemplate: suite.boardTemplates["Write"].id, Name: "Update", Description: "This is a column description", Visible: false, Color: columns.ColorOnlineOrange, Index: 0},
		"UpdateIndex": {ID: uuid.MustParse("c1b2c3d4-e5f6-7890-abcd-ef1234567208"), BoardTemplate: suite.boardTemplates["Write"].id, Name: "Update", Description: "The index of this column will be update through the update of the column above", Visible: false, Color: columns.ColorPlanningPink, Index: 1},
		"Delete":      {ID: uuid.MustParse("c1b2c3d4-e5f6-7890-abcd-ef1234567209"), BoardTemplate: suite.boardTemplates["Write"].id, Name: "Delete", Description: "This column will be delete throug a test", Visible: true, Color: columns.ColorPokerPurple, Index: 2},
		// test column templates for get
		"Read1": {ID: uuid.MustParse("c1b2c3d4-e5f6-7890-abcd-ef1234567210"), BoardTemplate: suite.boardTemplates["Read1"].id, Name: "Column1", Description: "This is a column description", Visible: true, Color: columns.ColorOnlineOrange, Index: 0},
		"Read2": {ID: uuid.MustParse("c1b2c3d4-e5f6-7890-abcd-ef1234567211"), BoardTemplate: suite.boardTemplates["Read1"].id, Name: "Column2", Description: "This is a column description", Visible: true, Color: columns.ColorPokerPurple, Index: 1},
	}
}

func (suite *ColumnTemplateServiceIntegrationTestSuite) Test_Create() {
	t := suite.T()
	ctx := context.Background()

	boardId := suite.boardTemplates["InsertNoIndex"].id
	name := "CreateNoIndex"
	description := "This is inserted from the test"
	color := columns.ColorYieldingYellow
	visible := true

	template, err := suite.service.Create(ctx, ColumnTemplateRequest{
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

	template, err := suite.service.Create(ctx, ColumnTemplateRequest{
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

	template, err := suite.service.Create(ctx, ColumnTemplateRequest{
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

	template, err := suite.service.Create(ctx, ColumnTemplateRequest{
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

	template, err := suite.service.Update(ctx, ColumnTemplateUpdateRequest{
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

	err := suite.service.Delete(ctx, boardId, columnId)

	assert.Nil(t, err)
}

func (suite *ColumnTemplateServiceIntegrationTestSuite) Test_Get() {
	t := suite.T()
	ctx := context.Background()

	columnId := suite.columnTemplates["Read1"].ID
	boardId := suite.boardTemplates["Read1"].id

	template, err := suite.service.Get(ctx, boardId, columnId)

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

	templates, err := suite.service.GetAll(ctx, boardId)

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

func (suite *ColumnTemplateServiceIntegrationTestSuite) seedColumnTemplatesTestData(db *bun.DB) {
	log.Println("Seeding column templates test data")

	for _, user := range suite.users {
		if err := testDbTemplates.InsertUser(db, user.ID, user.Name, string(user.AccountType)); err != nil {
			log.Fatalf("Failed to insert user %s: %s", user.Name, err)
		}
	}

	for _, boardTemplate := range suite.boardTemplates {
		if err := testDbTemplates.InsertBoardTemplate(db, boardTemplate.id, boardTemplate.creator, boardTemplate.name, boardTemplate.description, boardTemplate.favourite); err != nil {
			log.Fatalf("Failed to insert board template %s: %s", boardTemplate.name, err)
		}
	}

	for _, columnTemplate := range suite.columnTemplates {
		if err := testDbTemplates.InsertColumnTemplate(db, columnTemplate.ID, columnTemplate.BoardTemplate, columnTemplate.Name, columnTemplate.Description, string(columnTemplate.Color), columnTemplate.Visible, columnTemplate.Index); err != nil {
			log.Fatalf("Failed to insert column template: %s", err)
		}
	}
}
