package boardtemplates

import (
	"context"
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

type BoardTemplateServiceIntegrationTestSuite struct {
	suite.Suite
	dbContainer *postgres.PostgresContainer
	db          *bun.DB
	users       map[string]TestUser
	templates   map[string]BoardTemplate
}

func TestBoardTemplateServiceIntegrationTestSuite(t *testing.T) {
	suite.Run(t, new(BoardTemplateServiceIntegrationTestSuite))
}

func (suite *BoardTemplateServiceIntegrationTestSuite) SetupSuite() {
	dbContainer, bun := initialize.StartTestDatabase()
	suite.SeedDatabase(bun)

	suite.dbContainer = dbContainer
	suite.db = bun
}

func (suite *BoardTemplateServiceIntegrationTestSuite) TearDownSuite() {
	initialize.StopTestDatabase(suite.dbContainer)
}

func (suite *BoardTemplateServiceIntegrationTestSuite) Test_Create() {
	t := suite.T()
	ctx := context.Background()

	userId := suite.users["Santa"].id
	name := "My Template"
	description := "This is a description"

	database := NewBoardTemplateDatabase(suite.db)
	service := NewBoardTemplateService(database)

	boardtemplate, err := service.Create(ctx,
		CreateBoardTemplateRequest{Name: &name, Creator: userId, Description: &description,
			Columns: []*columntemplates.ColumnTemplateRequest{
				{Name: "Column 1", Description: "This is the first column", Color: columns.ColorGoalGreen},
				{Name: "Column 2", Description: "This is the second column", Color: columns.ColorOnlineOrange},
			},
		},
	)

	assert.Nil(t, err)
	assert.Equal(t, userId, boardtemplate.Creator)
	assert.Equal(t, name, *boardtemplate.Name)
	assert.Equal(t, description, *boardtemplate.Description)
	assert.False(t, *boardtemplate.Favourite)
}

func (suite *BoardTemplateServiceIntegrationTestSuite) Test_Update() {
	t := suite.T()
	ctx := context.Background()

	id := suite.templates["Update"].ID
	userId := suite.users["Santa"].id
	name := "Updated Template"
	description := "This description was updated"
	favourite := true

	database := NewBoardTemplateDatabase(suite.db)
	service := NewBoardTemplateService(database)

	boardtemplate, err := service.Update(ctx,
		BoardTemplateUpdateRequest{ID: id, Name: &name, Description: &description, Favourite: &favourite},
	)

	assert.Nil(t, err)
	assert.Equal(t, id, boardtemplate.ID)
	assert.Equal(t, userId, boardtemplate.Creator)
	assert.Equal(t, name, *boardtemplate.Name)
	assert.Equal(t, description, *boardtemplate.Description)
}

func (suite *BoardTemplateServiceIntegrationTestSuite) Test_Delete() {
	t := suite.T()
	ctx := context.Background()

	id := suite.templates["Delete"].ID

	database := NewBoardTemplateDatabase(suite.db)
	service := NewBoardTemplateService(database)

	err := service.Delete(ctx, id)

	assert.Nil(t, err)
}

func (suite *BoardTemplateServiceIntegrationTestSuite) Test_Delete_NotFound() {
	t := suite.T()
	ctx := context.Background()

	id := uuid.New()

	database := NewBoardTemplateDatabase(suite.db)
	service := NewBoardTemplateService(database)

	err := service.Delete(ctx, id)

	assert.Nil(t, err)
}

func (suite *BoardTemplateServiceIntegrationTestSuite) Test_GetAll() {
	t := suite.T()
	ctx := context.Background()

	userId := suite.users["Stan"].id

	database := NewBoardTemplateDatabase(suite.db)
	service := NewBoardTemplateService(database)

	boardTemplates, err := service.GetAll(ctx, userId)

	assert.Nil(t, err)
	assert.Len(t, boardTemplates, 2)

	firstTemplate := checkBoardTemplateInList(boardTemplates, suite.templates["Read1"].ID)
	assert.NotNil(t, firstTemplate)
	assert.Equal(t, suite.templates["Read1"].ID, firstTemplate.Template.ID)
	assert.Equal(t, userId, firstTemplate.Template.Creator)
	assert.Equal(t, suite.templates["Read1"].Name, firstTemplate.Template.Name)
	assert.Equal(t, suite.templates["Read1"].Description, firstTemplate.Template.Description)

	secondTemplate := checkBoardTemplateInList(boardTemplates, suite.templates["Read2"].ID)
	assert.NotNil(t, secondTemplate)
	assert.Equal(t, suite.templates["Read2"].ID, secondTemplate.Template.ID)
	assert.Equal(t, userId, secondTemplate.Template.Creator)
	assert.Equal(t, suite.templates["Read2"].Name, secondTemplate.Template.Name)
	assert.Equal(t, suite.templates["Read2"].Description, secondTemplate.Template.Description)
}

func (suite *BoardTemplateServiceIntegrationTestSuite) Test_GetAll_NoTemplates() {
	t := suite.T()
	ctx := context.Background()

	userId := suite.users["Bob"].id

	database := NewBoardTemplateDatabase(suite.db)
	service := NewBoardTemplateService(database)

	boardTemplates, err := service.GetAll(ctx, userId)

	assert.Nil(t, err)
	assert.Len(t, boardTemplates, 0)
}

func (suite *BoardTemplateServiceIntegrationTestSuite) Test_Get() {
	t := suite.T()
	ctx := context.Background()

	id := suite.templates["Read1"].ID
	name := suite.templates["Read1"].Name
	description := suite.templates["Read1"].Description
	favourite := suite.templates["Read1"].Favourite

	database := NewBoardTemplateDatabase(suite.db)
	service := NewBoardTemplateService(database)

	boardTemplate, err := service.Get(ctx, id)

	assert.Nil(t, err)
	assert.Equal(t, id, boardTemplate.ID)
	assert.Equal(t, name, boardTemplate.Name)
	assert.Equal(t, description, boardTemplate.Description)
	assert.True(t, *favourite)
}

func (suite *BoardTemplateServiceIntegrationTestSuite) Test_Get_NotFound() {
	t := suite.T()
	ctx := context.Background()

	id := uuid.New()

	database := NewBoardTemplateDatabase(suite.db)
	service := NewBoardTemplateService(database)

	boardTemplate, err := service.Get(ctx, id)

	assert.Nil(t, boardTemplate)
	assert.NotNil(t, err)
	assert.Equal(t, sql.ErrNoRows, err)
}

func (suite *BoardTemplateServiceIntegrationTestSuite) SeedDatabase(db *bun.DB) {
	// tests users
	suite.users = make(map[string]TestUser, 2)
	suite.users["Stan"] = TestUser{id: uuid.New(), name: "Stan", accountType: common.Google}
	suite.users["Santa"] = TestUser{id: uuid.New(), name: "Santa", accountType: common.Anonymous}
	suite.users["Bob"] = TestUser{id: uuid.New(), name: "Bob", accountType: common.Anonymous}

	// test board templates
	suite.templates = make(map[string]BoardTemplate, 4)
	// test board template to update
	updateName := "UpdateTemplate"
	updateDescription := "This is a description"
	updateFavourite := false
	suite.templates["Update"] = BoardTemplate{ID: uuid.New(), Creator: suite.users["Santa"].id, Name: &updateName, Description: &updateDescription, Favourite: &updateFavourite}
	// test board template to delete
	deleteName := "DeleteTemplate"
	deleteDescription := "This is a description"
	deleteFavourite := true
	suite.templates["Delete"] = BoardTemplate{ID: uuid.New(), Creator: suite.users["Santa"].id, Name: &deleteName, Description: &deleteDescription, Favourite: &deleteFavourite}
	// test board templates to get
	name1 := "Template1"
	description1 := "This is a description"
	favourite1 := true
	suite.templates["Read1"] = BoardTemplate{ID: uuid.New(), Creator: suite.users["Stan"].id, Name: &name1, Description: &description1, Favourite: &favourite1}
	name2 := "Template2"
	description2 := "This is a description"
	favourite2 := true
	suite.templates["Read2"] = BoardTemplate{ID: uuid.New(), Creator: suite.users["Stan"].id, Name: &name2, Description: &description2, Favourite: &favourite2}

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

func checkBoardTemplateInList(list []*BoardTemplateFull, id uuid.UUID) *BoardTemplateFull {
	for _, template := range list {
		if template.Template.ID == id {
			return template
		}
	}
	return nil
}
