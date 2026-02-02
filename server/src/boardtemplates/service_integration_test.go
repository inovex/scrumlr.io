package boardtemplates

import (
	"context"
	"database/sql"
	"log"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"
	"github.com/uptrace/bun"
	"scrumlr.io/server/columns"
	"scrumlr.io/server/columntemplates"
	"scrumlr.io/server/common"
	"scrumlr.io/server/initialize"
	"scrumlr.io/server/initialize/testDbTemplates"
)

type BoardTemplateServiceIntegrationTestSuite struct {
	suite.Suite
	service   BoardTemplateService
	users     map[string]testDbTemplates.TestUser
	templates map[string]BoardTemplate
}

func TestBoardTemplateServiceIntegrationTestSuite(t *testing.T) {
	suite.Run(t, new(BoardTemplateServiceIntegrationTestSuite))
}

func (suite *BoardTemplateServiceIntegrationTestSuite) SetupSuite() {
	suite.initTestData()
}

func (suite *BoardTemplateServiceIntegrationTestSuite) SetupTest() {
	db := testDbTemplates.NewBaseTestDB(
		suite.T(),
		false,
		testDbTemplates.AdditionalSeed{
			Name: "boardtemplates_test",
			Func: suite.seedBoardTemplatesTestData,
		},
	)

	columnTemplateDatabase := columntemplates.NewColumnTemplateDatabase(db)
	columnTemplateService := columntemplates.NewColumnTemplateService(columnTemplateDatabase)
	database := NewBoardTemplateDatabase(db)
	suite.service = NewBoardTemplateService(database, columnTemplateService)
}

func (suite *BoardTemplateServiceIntegrationTestSuite) initTestData() {
	suite.users = map[string]testDbTemplates.TestUser{
		"Stan":  {Name: "Stan", ID: uuid.MustParse("b1b2c3d4-e5f6-7890-abcd-ef1234567001"), AccountType: common.Google},
		"Santa": {Name: "Santa", ID: uuid.MustParse("b1b2c3d4-e5f6-7890-abcd-ef1234567002"), AccountType: common.Anonymous},
		"Bob":   {Name: "Bob", ID: uuid.MustParse("b1b2c3d4-e5f6-7890-abcd-ef1234567003"), AccountType: common.Anonymous},
	}

	updateName := "UpdateTemplate"
	updateDescription := "This is a description"
	updateFavourite := false

	deleteName := "DeleteTemplate"
	deleteDescription := "This is a description"
	deleteFavourite := true

	name1 := "Template1"
	description1 := "This is a description"
	favourite1 := true

	name2 := "Template2"
	description2 := "This is a description"
	favourite2 := true

	suite.templates = map[string]BoardTemplate{
		"Update": {ID: uuid.MustParse("b1b2c3d4-e5f6-7890-abcd-ef1234567101"), Creator: suite.users["Santa"].ID, Name: &updateName, Description: &updateDescription, Favourite: &updateFavourite},
		"Delete": {ID: uuid.MustParse("b1b2c3d4-e5f6-7890-abcd-ef1234567102"), Creator: suite.users["Santa"].ID, Name: &deleteName, Description: &deleteDescription, Favourite: &deleteFavourite},
		"Read1":  {ID: uuid.MustParse("b1b2c3d4-e5f6-7890-abcd-ef1234567103"), Creator: suite.users["Stan"].ID, Name: &name1, Description: &description1, Favourite: &favourite1},
		"Read2":  {ID: uuid.MustParse("b1b2c3d4-e5f6-7890-abcd-ef1234567104"), Creator: suite.users["Stan"].ID, Name: &name2, Description: &description2, Favourite: &favourite2},
	}
}

func (suite *BoardTemplateServiceIntegrationTestSuite) Test_Create() {
	t := suite.T()
	ctx := context.Background()

	userId := suite.users["Santa"].ID
	name := "My Template"
	description := "This is a description"

	boardtemplate, err := suite.service.Create(ctx,
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
	userId := suite.users["Santa"].ID
	name := "Updated Template"
	description := "This description was updated"
	favourite := true

	boardtemplate, err := suite.service.Update(ctx,
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

	err := suite.service.Delete(ctx, id)

	assert.Nil(t, err)
}

func (suite *BoardTemplateServiceIntegrationTestSuite) Test_Delete_NotFound() {
	t := suite.T()
	ctx := context.Background()

	id := uuid.New()

	err := suite.service.Delete(ctx, id)

	assert.Nil(t, err)
}

func (suite *BoardTemplateServiceIntegrationTestSuite) Test_GetAll() {
	t := suite.T()
	ctx := context.Background()

	userId := suite.users["Stan"].ID

	boardTemplates, err := suite.service.GetAll(ctx, userId)

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

	userId := suite.users["Bob"].ID

	boardTemplates, err := suite.service.GetAll(ctx, userId)

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

	boardTemplate, err := suite.service.Get(ctx, id)

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

	boardTemplate, err := suite.service.Get(ctx, id)

	assert.Nil(t, boardTemplate)
	assert.NotNil(t, err)
	assert.Equal(t, sql.ErrNoRows, err)
}

func (suite *BoardTemplateServiceIntegrationTestSuite) seedBoardTemplatesTestData(db *bun.DB) {
	log.Println("Seeding board templates test data")

	for _, user := range suite.users {
		if err := initialize.InsertUser(db, user.ID, user.Name, string(user.AccountType)); err != nil {
			log.Fatalf("Failed to insert user %s: %s", user.Name, err)
		}
	}

	for _, template := range suite.templates {
		if err := initialize.InsertBoardTemplate(db, template.ID, template.Creator, *template.Name, *template.Description, *template.Favourite); err != nil {
			log.Fatalf("Failed to insert board template: %s", err)
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
