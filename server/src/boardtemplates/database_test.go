package boardtemplates

import (
	"database/sql"
	"log"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"
	"github.com/testcontainers/testcontainers-go/modules/postgres"
	"github.com/uptrace/bun"
	"scrumlr.io/server/columns"
	"scrumlr.io/server/columntemplates"
	"scrumlr.io/server/common"
	"scrumlr.io/server/initialize"
)

type DatabaseBoardTemplateTestSuite struct {
	suite.Suite
	container *postgres.PostgresContainer
	db        *bun.DB
	users     map[string]TestUser
	templates map[string]DatabaseBoardTemplate
}

func TestDatabaseBoardTemplateTestSuite(t *testing.T) {
	suite.Run(t, new(DatabaseBoardTemplateTestSuite))
}

func (suite *DatabaseBoardTemplateTestSuite) SetupSuite() {
	container, bun := initialize.StartTestDatabase()

	suite.SeedDatabase(bun)

	suite.container = container
	suite.db = bun
}

func (suite *DatabaseBoardTemplateTestSuite) TearDownSuite() {
	initialize.StopTestDatabase(suite.container)
}

func (suite *DatabaseBoardTemplateTestSuite) Test_Database_Create() {
	t := suite.T()
	database := NewBoardTemplateDatabase(suite.db)

	userId := suite.users["Santa"].id
	name := "My Template"
	description := "This is a description"

	dbTemplate, err := database.Create(
		DatabaseBoardTemplateInsert{Creator: userId, Name: &name, Description: &description},
		[]columntemplates.DatabaseColumnTemplateInsert{
			{Name: "Column 1", Description: "This is the first column", Color: columns.ColorBacklogBlue},
			{Name: "Column 2", Description: "This is the second column", Color: columns.ColorOnlineOrange},
		},
	)

	assert.Nil(t, err)
	assert.Equal(t, userId, dbTemplate.Creator)
	assert.Equal(t, name, *dbTemplate.Name)
	assert.Equal(t, description, *dbTemplate.Description)
	assert.False(t, *dbTemplate.Favourite)
	assert.NotNil(t, dbTemplate.CreatedAt)
}

func (suite *DatabaseBoardTemplateTestSuite) Test_Database_Update() {
	t := suite.T()
	database := NewBoardTemplateDatabase(suite.db)

	templateId := suite.templates["Update"].ID
	userId := suite.users["Santa"].id
	name := "Update Template"
	description := "This description was updated"
	favourite := true

	dbTemplate, err := database.Update(DatabaseBoardTemplateUpdate{ID: templateId, Name: &name, Description: &description, Favourite: &favourite})

	assert.Nil(t, err)
	assert.Equal(t, templateId, dbTemplate.ID)
	assert.Equal(t, userId, dbTemplate.Creator)
	assert.Equal(t, name, *dbTemplate.Name)
	assert.Equal(t, description, *dbTemplate.Description)
	assert.NotNil(t, dbTemplate.CreatedAt)
}

func (suite *DatabaseBoardTemplateTestSuite) Test_Database_Delete() {
	t := suite.T()
	database := NewBoardTemplateDatabase(suite.db)

	templateId := suite.templates["Delete"].ID

	err := database.Delete(templateId)

	assert.Nil(t, err)
}

func (suite *DatabaseBoardTemplateTestSuite) Test_Database_Delete_NoTemplate() {
	t := suite.T()
	database := NewBoardTemplateDatabase(suite.db)

	templateId := uuid.New()

	err := database.Delete(templateId)

	assert.Nil(t, err)
}

func (suite *DatabaseBoardTemplateTestSuite) Test_Database_Get() {
	t := suite.T()
	database := NewBoardTemplateDatabase(suite.db)

	templateId := suite.templates["Read1"].ID
	dbTemplate, err := database.Get(templateId)

	assert.Nil(t, err)
	assert.Equal(t, templateId, dbTemplate.ID)
	assert.Equal(t, suite.templates["Read1"].Creator, dbTemplate.Creator)
	assert.Equal(t, suite.templates["Read1"].Name, dbTemplate.Name)
	assert.Equal(t, suite.templates["Read1"].Description, dbTemplate.Description)
	assert.Equal(t, suite.templates["Read1"].Favourite, dbTemplate.Favourite)
	assert.NotNil(t, dbTemplate.CreatedAt)
}

func (suite *DatabaseBoardTemplateTestSuite) Test_Database_Get_NotFound() {
	t := suite.T()
	database := NewBoardTemplateDatabase(suite.db)

	dbTemplate, err := database.Get(uuid.New())

	assert.NotNil(t, err)
	assert.Equal(t, sql.ErrNoRows, err)
	assert.Equal(t, DatabaseBoardTemplate{}, dbTemplate)
}

func (suite *DatabaseBoardTemplateTestSuite) Test_Database_GetAll() {
	t := suite.T()
	database := NewBoardTemplateDatabase(suite.db)

	userId := suite.users["Stan"].id

	dbTemplates, err := database.GetAll(userId)

	assert.Nil(t, err)
	assert.Len(t, dbTemplates, 2)

	firstTemplate := checkDatabaseBoardTemplateInList(dbTemplates, suite.templates["Read1"].ID)
	assert.NotNil(t, firstTemplate)
	assert.Equal(t, suite.templates["Read1"].ID, firstTemplate.Template.ID)
	assert.Equal(t, userId, firstTemplate.Template.Creator)
	assert.Equal(t, suite.templates["Read1"].Name, firstTemplate.Template.Name)
	assert.Equal(t, suite.templates["Read1"].Description, firstTemplate.Template.Description)
	assert.NotNil(t, firstTemplate.Template.CreatedAt)

	secondTemplate := checkDatabaseBoardTemplateInList(dbTemplates, suite.templates["Read2"].ID)
	assert.NotNil(t, secondTemplate)
	assert.Equal(t, suite.templates["Read2"].ID, secondTemplate.Template.ID)
	assert.Equal(t, userId, secondTemplate.Template.Creator)
	assert.Equal(t, suite.templates["Read2"].Name, secondTemplate.Template.Name)
	assert.Equal(t, suite.templates["Read2"].Description, secondTemplate.Template.Description)
	assert.NotNil(t, secondTemplate.Template.CreatedAt)
}

func (suite *DatabaseBoardTemplateTestSuite) Test_Database_GetAll_NoTemplates() {
	t := suite.T()
	database := NewBoardTemplateDatabase(suite.db)

	userId := suite.users["Bob"].id

	dbTemplates, err := database.GetAll(userId)

	assert.Nil(t, err)
	assert.Len(t, dbTemplates, 0)
}

type TestUser struct {
	id          uuid.UUID
	name        string
	accountType common.AccountType
}

func (suite *DatabaseBoardTemplateTestSuite) SeedDatabase(db *bun.DB) {
	// tests users
	suite.users = make(map[string]TestUser, 2)
	suite.users["Stan"] = TestUser{id: uuid.New(), name: "Stan", accountType: common.Google}
	suite.users["Santa"] = TestUser{id: uuid.New(), name: "Santa", accountType: common.Anonymous}
	suite.users["Bob"] = TestUser{id: uuid.New(), name: "Bob", accountType: common.Anonymous}

	// test board templates
	suite.templates = make(map[string]DatabaseBoardTemplate, 4)
	// test board template to update
	updateName := "UpdateTemplate"
	updateDescription := "This is a description"
	updateFavourite := false
	suite.templates["Update"] = DatabaseBoardTemplate{ID: uuid.New(), Creator: suite.users["Santa"].id, Name: &updateName, Description: &updateDescription, Favourite: &updateFavourite}
	// test board template to delete
	deleteName := "DeleteTemplate"
	deleteDescription := "This is a description"
	deleteFavourite := true
	suite.templates["Delete"] = DatabaseBoardTemplate{ID: uuid.New(), Creator: suite.users["Santa"].id, Name: &deleteName, Description: &deleteDescription, Favourite: &deleteFavourite}
	// test board templates to get
	name1 := "Template1"
	description1 := "This is a description"
	favourite1 := true
	suite.templates["Read1"] = DatabaseBoardTemplate{ID: uuid.New(), Creator: suite.users["Stan"].id, Name: &name1, Description: &description1, Favourite: &favourite1}
	name2 := "Template2"
	description2 := "This is a description"
	favourite2 := true
	suite.templates["Read2"] = DatabaseBoardTemplate{ID: uuid.New(), Creator: suite.users["Stan"].id, Name: &name2, Description: &description2, Favourite: &favourite2}

	for _, user := range suite.users {
		err := initialize.InsertUser(db, user.id, user.name, string(user.accountType))
		if err != nil {
			log.Fatalf("Failed to insert test user %s", err)
		}
	}

	for _, template := range suite.templates {
		err := initialize.InsertBoardTemplate(db, template.ID, template.Creator, *template.Name, *template.Description, *template.Favourite)
		if err != nil {
			log.Fatalf("Failed to insert test board templates %s", err)
		}
	}
}

func checkDatabaseBoardTemplateInList(list []DatabaseBoardTemplateFull, id uuid.UUID) *DatabaseBoardTemplateFull {
	for _, template := range list {
		if template.Template.ID == id {
			return &template
		}
	}
	return nil
}
