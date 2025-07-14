package columntemplates

import (
	"context"
	"log"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"
	"github.com/testcontainers/testcontainers-go"
	"github.com/testcontainers/testcontainers-go/modules/postgres"
	"github.com/uptrace/bun"
	"scrumlr.io/server/columns"
	"scrumlr.io/server/common"
	"scrumlr.io/server/databaseinitialize"
)

const POSTGRES_IMAGE = "postgres:17.5-alpine"
const DATABASE_NAME = "scrumlr_test"
const DATABASE_USERNAME = "stan"
const DATABASE_PASSWORD = "scrumlr"

type DatabaseColumnTemplateTestSuite struct {
	suite.Suite
	container       *postgres.PostgresContainer
	db              *bun.DB
	users           map[string]TestUser
	boardTemplates  map[string]TestBoardTemplate
	columnTemplates map[string]DatabaseColumnTemplate
}

func TestDatabaseBoardTemplateTestSuite(t *testing.T) {
	suite.Run(t, new(DatabaseColumnTemplateTestSuite))
}

func (suite *DatabaseColumnTemplateTestSuite) SetupSuite() {
	ctx := context.Background()
	pgcontainer, err := postgres.Run( //creating database
		ctx,
		POSTGRES_IMAGE,
		postgres.WithDatabase(DATABASE_NAME),
		postgres.WithUsername(DATABASE_USERNAME),
		postgres.WithPassword(DATABASE_PASSWORD),
		postgres.BasicWaitStrategies(),
	)

	if err != nil {
		log.Fatalf("Failed to start container: %s", err)
	}

	connectionString, err := pgcontainer.ConnectionString(ctx, "sslmode=disable")
	if err != nil {
		log.Fatalf("Failed to get connection string %s", err)
	}

	db, err := databaseinitialize.InitializeDatabase(connectionString) //migrating database
	if err != nil {
		log.Fatalf("Failed to initialize database %s", err)
	}

	bunDb := databaseinitialize.InitializeBun(db, true) // setup bun

	suite.SeedDatabase(bunDb)

	suite.container = pgcontainer
	suite.db = bunDb
}

func (suite *DatabaseColumnTemplateTestSuite) TearDownSuite() {
	if err := testcontainers.TerminateContainer(suite.container); err != nil {
		log.Fatalf("Failed to terminate container: %s", err)
	}
}

func (suite *DatabaseColumnTemplateTestSuite) Test_Database_Create() {
	t := suite.T()
	database := NewColumnTemplateDatabase(suite.db)

	boardId := suite.boardTemplates["Write1"].id
	name := "columnCreate"
	description := "This is a description"
	color := columns.ColorYieldingYellow
	visible := true
	index := 0

	dbColumn, err := database.Create(DatabaseColumnTemplateInsert{BoardTemplate: boardId, Name: name, Description: description, Color: color, Visible: &visible, Index: &index})

	assert.Nil(t, err)
	assert.Equal(t, boardId, dbColumn.BoardTemplate)
	assert.Equal(t, name, dbColumn.Name)
	assert.Equal(t, description, dbColumn.Description)
	assert.Equal(t, color, dbColumn.Color)
	assert.Equal(t, index, dbColumn.Index)
	assert.Equal(t, visible, dbColumn.Visible)
}

func (suite *DatabaseColumnTemplateTestSuite) Test_Database_Update() {
	t := suite.T()
	database := NewColumnTemplateDatabase(suite.db)

	columnId := suite.columnTemplates["Update"].ID
	boardId := suite.columnTemplates["Update"].BoardTemplate
	name := "Updated Name"
	description := "New Description"
	color := columns.ColorGoalGreen
	index := 1
	visible := true

	dbColumn, err := database.Update(DatabaseColumnTemplateUpdate{ID: columnId, BoardTemplate: boardId, Name: name, Description: description, Color: color, Index: index, Visible: visible})

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

	err := database.Delete(boardId, columnId)

	assert.Nil(t, err)
}

func (suite *DatabaseColumnTemplateTestSuite) Test_Database_Get() {
	t := suite.T()
	database := NewColumnTemplateDatabase(suite.db)

	columnId := suite.columnTemplates["Read1"].ID
	boardId := suite.boardTemplates["Read1"].id

	dbColumn, err := database.Get(boardId, columnId)

	assert.Nil(t, err)
	assert.Equal(t, columnId, dbColumn.ID)
	assert.Equal(t, boardId, dbColumn.BoardTemplate)
	assert.Equal(t, suite.columnTemplates["Read1"].Name, dbColumn.Name)
	assert.Equal(t, suite.columnTemplates["Read1"].Description, dbColumn.Description)
	assert.Equal(t, suite.columnTemplates["Read1"].Color, dbColumn.Color)
	assert.Equal(t, suite.columnTemplates["Read1"].Index, dbColumn.Index)
	assert.Equal(t, suite.columnTemplates["Read1"].Visible, dbColumn.Visible)
}

func (suite *DatabaseColumnTemplateTestSuite) Test_Database_GetAll() {
	t := suite.T()
	database := NewColumnTemplateDatabase(suite.db)

	boardId := suite.boardTemplates["Read1"].id

	dbColumns, err := database.GetAll(boardId)

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

func (suite *DatabaseColumnTemplateTestSuite) SeedDatabase(db *bun.DB) {
	// tests users
	suite.users = make(map[string]TestUser, 2)
	suite.users["Stan"] = TestUser{id: uuid.New(), name: "Stan", accountType: common.Google}
	suite.users["Santa"] = TestUser{id: uuid.New(), name: "Santa", accountType: common.Anonymous}

	// test board templates
	suite.boardTemplates = make(map[string]TestBoardTemplate, 3)
	suite.boardTemplates["Write1"] = TestBoardTemplate{id: uuid.New(), creator: suite.users["Santa"].id, name: "WriteTemplate1", description: "This is a description", favourite: false}
	suite.boardTemplates["Write2"] = TestBoardTemplate{id: uuid.New(), creator: suite.users["Santa"].id, name: "WriteTemplate2", description: "This is a description", favourite: true}
	suite.boardTemplates["Read1"] = TestBoardTemplate{id: uuid.New(), creator: suite.users["Stan"].id, name: "Template2", description: "This is a description", favourite: true}

	// test column templates
	suite.columnTemplates = make(map[string]DatabaseColumnTemplate, 5)
	// test column templates for read
	suite.columnTemplates["Update"] = DatabaseColumnTemplate{ID: uuid.New(), BoardTemplate: suite.boardTemplates["Write2"].id, Name: "Column1", Description: "This is a column description", Visible: false, Color: columns.ColorOnlineOrange, Index: 0}
	suite.columnTemplates["Write"] = DatabaseColumnTemplate{ID: uuid.New(), BoardTemplate: suite.boardTemplates["Write2"].id, Name: "Column2", Description: "This is a column description", Visible: false, Color: columns.ColorPlanningPink, Index: 1}
	suite.columnTemplates["Delete"] = DatabaseColumnTemplate{ID: uuid.New(), BoardTemplate: suite.boardTemplates["Write2"].id, Name: "Column3", Description: "This is a column description", Visible: true, Color: columns.ColorPokerPurple, Index: 2}
	// test colum templates for get
	suite.columnTemplates["Read1"] = DatabaseColumnTemplate{ID: uuid.New(), BoardTemplate: suite.boardTemplates["Read1"].id, Name: "Column1", Description: "This is a column description", Visible: true, Color: columns.ColorOnlineOrange, Index: 0}
	suite.columnTemplates["Read2"] = DatabaseColumnTemplate{ID: uuid.New(), BoardTemplate: suite.boardTemplates["Read1"].id, Name: "Column2", Description: "This is a column description", Visible: true, Color: columns.ColorPokerPurple, Index: 1}

	for _, user := range suite.users {
		err := databaseinitialize.InsertUser(db, user.id, user.name, string(user.accountType))
		if err != nil {
			log.Fatalf("Failed to insert test user %s", err)
		}
	}

	for _, boardTemplate := range suite.boardTemplates {
		err := databaseinitialize.InsertBoardTemplate(db, boardTemplate.id, boardTemplate.creator, boardTemplate.name, boardTemplate.description, boardTemplate.favourite)
		if err != nil {
			log.Fatalf("Failed to insert test board templates %s", err)
		}
	}

	for _, columnTemplate := range suite.columnTemplates {
		err := databaseinitialize.InsertColumnTemplate(db, columnTemplate.ID, columnTemplate.BoardTemplate, columnTemplate.Name, columnTemplate.Description, string(columnTemplate.Color), columnTemplate.Visible, columnTemplate.Index)
		if err != nil {
			log.Fatalf("Failed to insert test column templates %s", err)
		}
	}
}
