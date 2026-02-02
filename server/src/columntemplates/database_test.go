package columntemplates

import (
	"context"
	"database/sql"
	"log"
	"testing"

	"scrumlr.io/server/initialize/testDbTemplates"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"
	"github.com/uptrace/bun"
	"scrumlr.io/server/columns"
	"scrumlr.io/server/common"
	"scrumlr.io/server/initialize"
)

type DatabaseColumnTemplateTestSuite struct {
	suite.Suite
	db              *bun.DB
	users           map[string]TestUser
	boardTemplates  map[string]TestBoardTemplate
	columnTemplates map[string]DatabaseColumnTemplate
}

func TestDatabaseBoardTemplateTestSuite(t *testing.T) {
	suite.Run(t, new(DatabaseColumnTemplateTestSuite))
}

func (suite *DatabaseColumnTemplateTestSuite) SetupTest() {
	suite.db = testDbTemplates.NewBaseTestDB(
		suite.T(),
		false,
		testDbTemplates.AdditionalSeed{
			Name: "sessions_database_test_data",
			Func: suite.seedData,
		},
	)
}

func (suite *DatabaseColumnTemplateTestSuite) Test_Database_Create() {
	t := suite.T()
	database := NewColumnTemplateDatabase(suite.db)

	boardId := suite.boardTemplates["InsertNoIndex"].id
	name := "CreateNoIndex"
	description := "This is inserted from the test"
	color := columns.ColorYieldingYellow
	visible := true

	dbColumn, err := database.Create(context.Background(), DatabaseColumnTemplateInsert{BoardTemplate: boardId, Name: name, Description: description, Color: color, Visible: &visible})

	assert.Nil(t, err)
	assert.Equal(t, boardId, dbColumn.BoardTemplate)
	assert.Equal(t, name, dbColumn.Name)
	assert.Equal(t, description, dbColumn.Description)
	assert.Equal(t, color, dbColumn.Color)
	assert.Equal(t, 0, dbColumn.Index)
	assert.Equal(t, visible, dbColumn.Visible)
}

func (suite *DatabaseColumnTemplateTestSuite) Test_Database_Create_FirstIndex() {
	t := suite.T()
	database := NewColumnTemplateDatabase(suite.db)

	boardId := suite.boardTemplates["InsertFirst"].id
	name := "CreateFirst"
	description := "This is inserted from the test"
	color := columns.ColorYieldingYellow
	visible := true
	index := 0

	dbColumn, err := database.Create(context.Background(), DatabaseColumnTemplateInsert{BoardTemplate: boardId, Name: name, Description: description, Color: color, Visible: &visible, Index: &index})

	assert.Nil(t, err)
	assert.Equal(t, boardId, dbColumn.BoardTemplate)
	assert.Equal(t, name, dbColumn.Name)
	assert.Equal(t, description, dbColumn.Description)
	assert.Equal(t, color, dbColumn.Color)
	assert.Equal(t, index, dbColumn.Index)
	assert.Equal(t, visible, dbColumn.Visible)
}

func (suite *DatabaseColumnTemplateTestSuite) Test_Database_Create_LastIndex() {
	t := suite.T()
	database := NewColumnTemplateDatabase(suite.db)

	boardId := suite.boardTemplates["InsertLast"].id
	name := "CreateLast"
	description := "This is inserted from the test"
	color := columns.ColorYieldingYellow
	visible := true
	index := 1

	dbColumn, err := database.Create(context.Background(), DatabaseColumnTemplateInsert{BoardTemplate: boardId, Name: name, Description: description, Color: color, Visible: &visible, Index: &index})

	assert.Nil(t, err)
	assert.Equal(t, boardId, dbColumn.BoardTemplate)
	assert.Equal(t, name, dbColumn.Name)
	assert.Equal(t, description, dbColumn.Description)
	assert.Equal(t, color, dbColumn.Color)
	assert.Equal(t, index, dbColumn.Index)
	assert.Equal(t, visible, dbColumn.Visible)
}

func (suite *DatabaseColumnTemplateTestSuite) Test_Database_Create_NegativeIndex() {
	t := suite.T()
	database := NewColumnTemplateDatabase(suite.db)

	boardId := suite.boardTemplates["InsertFirst"].id
	name := "CreateNegativIndex"
	description := "This is inserted from the test"
	color := columns.ColorYieldingYellow
	visible := true
	index := -1

	dbColumn, err := database.Create(context.Background(), DatabaseColumnTemplateInsert{BoardTemplate: boardId, Name: name, Description: description, Color: color, Visible: &visible, Index: &index})

	assert.Nil(t, err)
	assert.Equal(t, boardId, dbColumn.BoardTemplate)
	assert.Equal(t, name, dbColumn.Name)
	assert.Equal(t, description, dbColumn.Description)
	assert.Equal(t, color, dbColumn.Color)
	assert.Equal(t, index, dbColumn.Index)
	assert.Equal(t, visible, dbColumn.Visible)
}

func (suite *DatabaseColumnTemplateTestSuite) Test_Database_Create_HighIndex() {
	t := suite.T()
	database := NewColumnTemplateDatabase(suite.db)

	boardId := suite.boardTemplates["InsertHighIndex"].id
	name := "CreateHighindex"
	description := "This is inserted from the test"
	color := columns.ColorYieldingYellow
	visible := true
	index := 10000

	dbColumn, err := database.Create(context.Background(), DatabaseColumnTemplateInsert{BoardTemplate: boardId, Name: name, Description: description, Color: color, Visible: &visible, Index: &index})

	assert.Nil(t, err)
	assert.Equal(t, boardId, dbColumn.BoardTemplate)
	assert.Equal(t, name, dbColumn.Name)
	assert.Equal(t, description, dbColumn.Description)
	assert.Equal(t, color, dbColumn.Color)
	assert.Equal(t, index, dbColumn.Index)
	assert.Equal(t, visible, dbColumn.Visible)
}

func (suite *DatabaseColumnTemplateTestSuite) Test_Database_Create_MiddleIndex() {
	t := suite.T()
	database := NewColumnTemplateDatabase(suite.db)

	boardId := suite.boardTemplates["InsertMiddleIndex"].id
	name := "CreateMiddle"
	description := "This is inserted from the test"
	color := columns.ColorYieldingYellow
	visible := true
	index := 1

	dbColumn, err := database.Create(context.Background(), DatabaseColumnTemplateInsert{BoardTemplate: boardId, Name: name, Description: description, Color: color, Visible: &visible, Index: &index})

	assert.Nil(t, err)
	assert.Equal(t, boardId, dbColumn.BoardTemplate)
	assert.Equal(t, name, dbColumn.Name)
	assert.Equal(t, description, dbColumn.Description)
	assert.Equal(t, color, dbColumn.Color)
	assert.Equal(t, index, dbColumn.Index)
	assert.Equal(t, visible, dbColumn.Visible)
}

func (suite *DatabaseColumnTemplateTestSuite) Test_Database_Create_EmptyName() {
	t := suite.T()
	database := NewColumnTemplateDatabase(suite.db)

	boardId := suite.boardTemplates["InsertFirst"].id
	name := ""
	description := "This is inserted from the test"
	color := columns.ColorYieldingYellow

	dbColumn, err := database.Create(context.Background(), DatabaseColumnTemplateInsert{BoardTemplate: boardId, Name: name, Description: description, Color: color})

	assert.NotNil(t, err)
	assert.Equal(t, DatabaseColumnTemplate{}, dbColumn)
}

func (suite *DatabaseColumnTemplateTestSuite) Test_Database_Create_EmptyColor() {
	t := suite.T()
	database := NewColumnTemplateDatabase(suite.db)

	boardId := suite.boardTemplates["InsertFirst"].id
	name := "Test"
	description := "This is inserted from the test"

	dbColumn, err := database.Create(context.Background(), DatabaseColumnTemplateInsert{BoardTemplate: boardId, Name: name, Description: description, Color: ""})

	assert.NotNil(t, err)
	assert.Equal(t, DatabaseColumnTemplate{}, dbColumn)
}

func (suite *DatabaseColumnTemplateTestSuite) Test_Database_Update() {
	t := suite.T()
	database := NewColumnTemplateDatabase(suite.db)

	columnId := suite.columnTemplates["Update"].ID
	boardId := suite.columnTemplates["Update"].BoardTemplate
	name := "Updated Name"
	description := "This column was updated"
	color := columns.ColorGoalGreen
	index := 1
	visible := true

	dbColumn, err := database.Update(context.Background(), DatabaseColumnTemplateUpdate{ID: columnId, BoardTemplate: boardId, Name: name, Description: description, Color: color, Index: index, Visible: visible})

	assert.Nil(t, err)
	assert.Equal(t, columnId, dbColumn.ID)
	assert.Equal(t, boardId, dbColumn.BoardTemplate)
	assert.Equal(t, name, dbColumn.Name)
	assert.Equal(t, description, dbColumn.Description)
	assert.Equal(t, color, dbColumn.Color)
	assert.Equal(t, index, dbColumn.Index)
	assert.Equal(t, visible, dbColumn.Visible)
}

func (suite *DatabaseColumnTemplateTestSuite) Test_Database_Delete() {
	t := suite.T()
	database := NewColumnTemplateDatabase(suite.db)

	columnId := suite.columnTemplates["Delete"].ID
	boardId := suite.columnTemplates["Delete"].BoardTemplate

	err := database.Delete(context.Background(), boardId, columnId)

	assert.Nil(t, err)
}

func (suite *DatabaseColumnTemplateTestSuite) Test_Database_Get() {
	t := suite.T()
	database := NewColumnTemplateDatabase(suite.db)

	columnId := suite.columnTemplates["Read1"].ID
	boardId := suite.boardTemplates["Read1"].id

	dbColumn, err := database.Get(context.Background(), boardId, columnId)

	assert.Nil(t, err)
	assert.Equal(t, columnId, dbColumn.ID)
	assert.Equal(t, boardId, dbColumn.BoardTemplate)
	assert.Equal(t, suite.columnTemplates["Read1"].Name, dbColumn.Name)
	assert.Equal(t, suite.columnTemplates["Read1"].Description, dbColumn.Description)
	assert.Equal(t, suite.columnTemplates["Read1"].Color, dbColumn.Color)
	assert.Equal(t, suite.columnTemplates["Read1"].Index, dbColumn.Index)
	assert.Equal(t, suite.columnTemplates["Read1"].Visible, dbColumn.Visible)
}

func (suite *DatabaseColumnTemplateTestSuite) Test_Database_Get_NotFound() {
	t := suite.T()
	database := NewColumnTemplateDatabase(suite.db)

	dbColumn, err := database.Get(context.Background(), uuid.New(), uuid.New())

	assert.NotNil(t, err)
	assert.Equal(t, err, sql.ErrNoRows)
	assert.Equal(t, dbColumn, DatabaseColumnTemplate{})
}

func (suite *DatabaseColumnTemplateTestSuite) Test_Database_GetAll() {
	t := suite.T()
	database := NewColumnTemplateDatabase(suite.db)

	boardId := suite.boardTemplates["Read1"].id

	dbColumns, err := database.GetAll(context.Background(), boardId)

	assert.Nil(t, err)
	assert.Len(t, dbColumns, 2)

	assert.Equal(t, suite.columnTemplates["Read1"].ID, dbColumns[0].ID)
	assert.Equal(t, boardId, dbColumns[0].BoardTemplate)
	assert.Equal(t, suite.columnTemplates["Read1"].Name, dbColumns[0].Name)
	assert.Equal(t, suite.columnTemplates["Read1"].Description, dbColumns[0].Description)
	assert.Equal(t, suite.columnTemplates["Read1"].Color, dbColumns[0].Color)
	assert.Equal(t, suite.columnTemplates["Read1"].Index, dbColumns[0].Index)
	assert.Equal(t, suite.columnTemplates["Read1"].Visible, dbColumns[0].Visible)

	assert.Equal(t, suite.columnTemplates["Read2"].ID, dbColumns[1].ID)
	assert.Equal(t, boardId, dbColumns[0].BoardTemplate)
	assert.Equal(t, suite.columnTemplates["Read2"].Name, dbColumns[1].Name)
	assert.Equal(t, suite.columnTemplates["Read2"].Description, dbColumns[1].Description)
	assert.Equal(t, suite.columnTemplates["Read2"].Color, dbColumns[1].Color)
	assert.Equal(t, suite.columnTemplates["Read2"].Index, dbColumns[1].Index)
	assert.Equal(t, suite.columnTemplates["Read2"].Visible, dbColumns[1].Visible)
}

func (suite *DatabaseColumnTemplateTestSuite) Test_Database_GetAll_NotFound() {
	t := suite.T()
	database := NewColumnTemplateDatabase(suite.db)

	dbColumns, err := database.GetAll(context.Background(), uuid.New())

	assert.Nil(t, err)
	assert.Len(t, dbColumns, 0)
}

type TestUser struct {
	id          uuid.UUID
	name        string
	accountType common.AccountType
}

type TestBoardTemplate struct {
	id          uuid.UUID
	creator     uuid.UUID
	name        string
	description string
	favourite   bool
}

func (suite *DatabaseColumnTemplateTestSuite) seedData(db *bun.DB) {
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
