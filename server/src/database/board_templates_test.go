package database

import (
	"database/sql"
	"scrumlr.io/server/sessions"
	"testing"

	"scrumlr.io/server/boards"

	"github.com/stretchr/testify/assert"
	"scrumlr.io/server/boardtemplates"
	"scrumlr.io/server/columntemplates"
)

func TestRunnerForBoardTemplates(t *testing.T) {
	t.Run("Create=0", testCreatePublicBoardTemplate)
	t.Run("Create=1", testCreateByPassphraseBoardTemplate)
	t.Run("Create=2", testCreateByInviteBoardTemplate)
	t.Run("Create=3", testCreateBoardTemplateAlsoCreatesColumnTemplates)
	t.Run("Create=4", testCreateBoardTemplateWithName)
	t.Run("Create=5", testCreateBoardTemplateWithDescription)

	t.Run("Update=0", testUpdatePublicBoardTemplateToPassphraseBoardTemplate)
	t.Run("Update=1", testUpdatePublicBoardTemplateToByInviteBoardTemplate)
	t.Run("Update=2", testUpdateByPassphraseBoardTemplateToByInviteBoardTemplate)
	t.Run("Update=3", testUpdateByInviteBoardTemplateToByPassphraseBoardTemplate)
	t.Run("Update=4", testUpdateBoardTemplateName)
	t.Run("Update=5", testUpdateBoardTemplateDescription)
	t.Run("Update=6", testUpdateBoardTemplateFavouriteToTrue)
	t.Run("Update=7", testUpdateBoardTemplateFavouriteFromTrueToFalse)

	t.Run("Get=0", testGetBoardTemplate)
	t.Run("Get=1", testGetAllBoardTemplatesForSpecificUser)

	t.Run("Delete=0", testDeleteBoardTemplate)
}

func testCreatePublicBoardTemplate(t *testing.T) {
	user := fixture.MustRow("DatabaseUser.jack").(*sessions.DatabaseUser)

	template, err := boardTemplatesDb.Create(boardtemplates.DatabaseBoardTemplateInsert{
		Creator:      user.ID,
		Name:         nil,
		Description:  nil,
		Favourite:    nil,
		AccessPolicy: boards.Public,
	}, []columntemplates.DatabaseColumnTemplateInsert{})

	assert.Nil(t, err)
	assert.NotNil(t, template.ID)
	assert.Nil(t, template.Name)
	assert.Nil(t, template.Description)
	assert.False(t, *template.Favourite)
	assert.Equal(t, boards.Public, template.AccessPolicy)
}

func testCreateByPassphraseBoardTemplate(t *testing.T) {
	user := fixture.MustRow("DatabaseUser.jack").(*sessions.DatabaseUser)

	template, err := boardTemplatesDb.Create(boardtemplates.DatabaseBoardTemplateInsert{
		Creator:      user.ID,
		Name:         nil,
		Description:  nil,
		Favourite:    nil,
		AccessPolicy: boards.Public,
	}, []columntemplates.DatabaseColumnTemplateInsert{})

	assert.Nil(t, err)
	assert.NotNil(t, template.ID)
	assert.Nil(t, template.Name)
	assert.Nil(t, template.Description)
	assert.False(t, *template.Favourite)
	assert.Equal(t, boards.Public, template.AccessPolicy)
}

func testCreateByInviteBoardTemplate(t *testing.T) {
	user := fixture.MustRow("DatabaseUser.jack").(*sessions.DatabaseUser)

	template, err := boardTemplatesDb.Create(boardtemplates.DatabaseBoardTemplateInsert{
		Creator:      user.ID,
		Name:         nil,
		Description:  nil,
		Favourite:    nil,
		AccessPolicy: boards.Public,
	}, []columntemplates.DatabaseColumnTemplateInsert{})

	assert.Nil(t, err)
	assert.NotNil(t, template.ID)
	assert.Nil(t, template.Name)
	assert.Nil(t, template.Description)
	assert.False(t, *template.Favourite)
	assert.Equal(t, boards.Public, template.AccessPolicy)
}

func testCreateBoardTemplateAlsoCreatesColumnTemplates(t *testing.T) {
	user := fixture.MustRow("DatabaseUser.jack").(*sessions.DatabaseUser)

	visible := true
	notVisible := false
	indexOne := 0
	indexTwo := 1

	template, err := boardTemplatesDb.Create(boardtemplates.DatabaseBoardTemplateInsert{
		Creator:      user.ID,
		Name:         nil,
		Description:  nil,
		Favourite:    nil,
		AccessPolicy: boards.Public,
	}, []columntemplates.DatabaseColumnTemplateInsert{
		{
			Name:        "A",
			Description: "A description",
			Color:       "backlog-blue",
			Visible:     &visible,
			Index:       &indexOne,
		},
		{
			Name:        "B",
			Description: "B description",
			Color:       "backlog-blue",
			Visible:     &notVisible,
			Index:       &indexTwo,
		},
	})

	assert.Nil(t, err)
	assert.NotNil(t, template)

	columns, err := columnTemplateDb.GetAll(template.ID)
	assert.Nil(t, err)
	assert.NotNil(t, columns)

	// Col One
	assert.Equal(t, "A", columns[0].Name)
	assert.Equal(t, "A description", columns[0].Description)
	assert.True(t, columns[0].Visible)
	assert.Equal(t, indexOne, columns[0].Index)

	// Col Two
	assert.Equal(t, "B", columns[1].Name)
	assert.Equal(t, "B description", columns[1].Description)
	assert.False(t, columns[1].Visible)
	assert.Equal(t, indexTwo, columns[1].Index)
}

func testCreateBoardTemplateWithName(t *testing.T) {
	user := fixture.MustRow("DatabaseUser.jack").(*sessions.DatabaseUser)

	name := "Test Template"

	template, err := boardTemplatesDb.Create(boardtemplates.DatabaseBoardTemplateInsert{
		Creator:      user.ID,
		Name:         &name,
		Description:  nil,
		Favourite:    nil,
		AccessPolicy: boards.Public,
	}, []columntemplates.DatabaseColumnTemplateInsert{})

	assert.Nil(t, err)
	assert.NotNil(t, template.ID)
	assert.Equal(t, "Test Template", *template.Name)
}

func testCreateBoardTemplateWithDescription(t *testing.T) {
	user := fixture.MustRow("DatabaseUser.jack").(*sessions.DatabaseUser)

	description := "Test Description"

	template, err := boardTemplatesDb.Create(boardtemplates.DatabaseBoardTemplateInsert{
		Creator:      user.ID,
		Name:         nil,
		Description:  &description,
		Favourite:    nil,
		AccessPolicy: boards.Public,
	}, []columntemplates.DatabaseColumnTemplateInsert{})

	assert.Nil(t, err)
	assert.NotNil(t, template.ID)
	assert.Equal(t, "Test Description", *template.Description)
}

func testUpdatePublicBoardTemplateToPassphraseBoardTemplate(t *testing.T) {
	user := fixture.MustRow("DatabaseUser.jack").(*sessions.DatabaseUser)

	template, err := boardTemplatesDb.Create(boardtemplates.DatabaseBoardTemplateInsert{
		Creator:      user.ID,
		Name:         nil,
		AccessPolicy: boards.Public,
	}, []columntemplates.DatabaseColumnTemplateInsert{})

	assert.Nil(t, err)
	assert.NotNil(t, template)

	updateAccessPolicy := boards.ByPassphrase
	updatedBoard, err := boardTemplatesDb.Update(boardtemplates.DatabaseBoardTemplateUpdate{
		ID:           template.ID,
		AccessPolicy: &updateAccessPolicy,
	})

	assert.Nil(t, err)
	assert.Equal(t, updateAccessPolicy, updatedBoard.AccessPolicy)
}

func testUpdatePublicBoardTemplateToByInviteBoardTemplate(t *testing.T) {
	user := fixture.MustRow("DatabaseUser.jack").(*sessions.DatabaseUser)

	template, err := boardTemplatesDb.Create(boardtemplates.DatabaseBoardTemplateInsert{
		Creator:      user.ID,
		Name:         nil,
		AccessPolicy: boards.Public,
	}, []columntemplates.DatabaseColumnTemplateInsert{})

	assert.Nil(t, err)
	assert.NotNil(t, template)

	updateAccessPolicy := boards.ByInvite
	updatedBoard, err := boardTemplatesDb.Update(boardtemplates.DatabaseBoardTemplateUpdate{
		ID:           template.ID,
		AccessPolicy: &updateAccessPolicy,
	})

	assert.Nil(t, err)
	assert.Equal(t, updateAccessPolicy, updatedBoard.AccessPolicy)
}

func testUpdateByPassphraseBoardTemplateToByInviteBoardTemplate(t *testing.T) {
	user := fixture.MustRow("DatabaseUser.jack").(*sessions.DatabaseUser)

	template, err := boardTemplatesDb.Create(boardtemplates.DatabaseBoardTemplateInsert{
		Creator:      user.ID,
		Name:         nil,
		AccessPolicy: boards.ByPassphrase,
	}, []columntemplates.DatabaseColumnTemplateInsert{})

	assert.Nil(t, err)
	assert.NotNil(t, template)

	updateAccessPolicy := boards.ByInvite
	updatedBoard, err := boardTemplatesDb.Update(boardtemplates.DatabaseBoardTemplateUpdate{
		ID:           template.ID,
		AccessPolicy: &updateAccessPolicy,
	})

	assert.Nil(t, err)
	assert.Equal(t, updateAccessPolicy, updatedBoard.AccessPolicy)
}

func testUpdateByInviteBoardTemplateToByPassphraseBoardTemplate(t *testing.T) {
	user := fixture.MustRow("DatabaseUser.jack").(*sessions.DatabaseUser)

	template, err := boardTemplatesDb.Create(boardtemplates.DatabaseBoardTemplateInsert{
		Creator:      user.ID,
		Name:         nil,
		AccessPolicy: boards.ByInvite,
	}, []columntemplates.DatabaseColumnTemplateInsert{})

	assert.Nil(t, err)
	assert.NotNil(t, template)

	updateAccessPolicy := boards.ByPassphrase
	updatedBoard, err := boardTemplatesDb.Update(boardtemplates.DatabaseBoardTemplateUpdate{
		ID:           template.ID,
		AccessPolicy: &updateAccessPolicy,
	})

	assert.Nil(t, err)
	assert.Equal(t, updateAccessPolicy, updatedBoard.AccessPolicy)
}

func testUpdateBoardTemplateName(t *testing.T) {
	user := fixture.MustRow("DatabaseUser.jack").(*sessions.DatabaseUser)

	template, err := boardTemplatesDb.Create(boardtemplates.DatabaseBoardTemplateInsert{
		Creator:      user.ID,
		Name:         nil,
		AccessPolicy: boards.ByInvite,
	}, []columntemplates.DatabaseColumnTemplateInsert{})

	assert.Nil(t, err)
	assert.NotNil(t, template)

	updateName := "New Name"
	updatedBoard, err := boardTemplatesDb.Update(boardtemplates.DatabaseBoardTemplateUpdate{
		ID:   template.ID,
		Name: &updateName,
	})

	assert.Nil(t, err)
	assert.Equal(t, updateName, *updatedBoard.Name)
}

func testUpdateBoardTemplateDescription(t *testing.T) {
	user := fixture.MustRow("DatabaseUser.jack").(*sessions.DatabaseUser)

	template, err := boardTemplatesDb.Create(boardtemplates.DatabaseBoardTemplateInsert{
		Creator:      user.ID,
		Description:  nil,
		AccessPolicy: boards.ByInvite,
	}, []columntemplates.DatabaseColumnTemplateInsert{})

	assert.Nil(t, err)
	assert.NotNil(t, template)

	updateDescription := "New Description"
	updatedBoard, err := boardTemplatesDb.Update(boardtemplates.DatabaseBoardTemplateUpdate{
		ID:          template.ID,
		Description: &updateDescription,
	})

	assert.Nil(t, err)
	assert.Equal(t, updateDescription, *updatedBoard.Description)
}

func testUpdateBoardTemplateFavouriteToTrue(t *testing.T) {
	user := fixture.MustRow("DatabaseUser.jack").(*sessions.DatabaseUser)

	template, err := boardTemplatesDb.Create(boardtemplates.DatabaseBoardTemplateInsert{
		Creator:      user.ID,
		Favourite:    nil,
		AccessPolicy: boards.ByInvite,
	}, []columntemplates.DatabaseColumnTemplateInsert{})

	assert.Nil(t, err)
	assert.NotNil(t, template)

	updateFavourite := true
	updatedBoard, err := boardTemplatesDb.Update(boardtemplates.DatabaseBoardTemplateUpdate{
		ID:        template.ID,
		Favourite: &updateFavourite,
	})

	assert.Nil(t, err)
	assert.Equal(t, updateFavourite, *updatedBoard.Favourite)
}

func testUpdateBoardTemplateFavouriteFromTrueToFalse(t *testing.T) {
	user := fixture.MustRow("DatabaseUser.jack").(*sessions.DatabaseUser)

	favourited := true

	template, err := boardTemplatesDb.Create(boardtemplates.DatabaseBoardTemplateInsert{
		Creator:      user.ID,
		Favourite:    &favourited,
		AccessPolicy: boards.ByInvite,
	}, []columntemplates.DatabaseColumnTemplateInsert{})

	assert.Nil(t, err)
	assert.NotNil(t, template)

	updateFavourite := false
	updatedBoard, err := boardTemplatesDb.Update(boardtemplates.DatabaseBoardTemplateUpdate{
		ID:        template.ID,
		Favourite: &updateFavourite,
	})

	assert.Nil(t, err)
	assert.Equal(t, updateFavourite, *updatedBoard.Favourite)
}

func testGetBoardTemplate(t *testing.T) {
	user := fixture.MustRow("DatabaseUser.jack").(*sessions.DatabaseUser)

	name := "Get Template Test"
	template, err := boardTemplatesDb.Create(boardtemplates.DatabaseBoardTemplateInsert{
		Creator:      user.ID,
		Name:         &name,
		AccessPolicy: boards.Public,
	}, []columntemplates.DatabaseColumnTemplateInsert{})

	assert.Nil(t, err)
	assert.NotNil(t, template)

	getTemplate, err := boardTemplatesDb.Get(template.ID)

	assert.Nil(t, err)
	assert.NotNil(t, getTemplate)
	assert.IsType(t, boardtemplates.DatabaseBoardTemplate{}, template)
	assert.NotNil(t, getTemplate.ID)
	assert.Equal(t, name, *template.Name)
}

func testGetAllBoardTemplatesForSpecificUser(t *testing.T) {
	user := fixture.MustRow("DatabaseUser.jack").(*sessions.DatabaseUser)

	name := "Get Template Test"
	templateOne, err := boardTemplatesDb.Create(boardtemplates.DatabaseBoardTemplateInsert{
		Creator:      user.ID,
		Name:         &name,
		AccessPolicy: boards.Public,
	}, []columntemplates.DatabaseColumnTemplateInsert{})

	assert.Nil(t, err)
	assert.NotNil(t, templateOne)

	templateTwo, err := boardTemplatesDb.Create(boardtemplates.DatabaseBoardTemplateInsert{
		Creator:      user.ID,
		Name:         &name,
		AccessPolicy: boards.Public,
	}, []columntemplates.DatabaseColumnTemplateInsert{})

	assert.Nil(t, err)
	assert.NotNil(t, templateTwo)

	getTemplates, err := boardTemplatesDb.GetAll(user.ID)

	assert.Nil(t, err)
	assert.IsType(t, []boardtemplates.DatabaseBoardTemplateFull{}, getTemplates)
	assert.NotNil(t, getTemplates)
}

func testDeleteBoardTemplate(t *testing.T) {
	user := fixture.MustRow("DatabaseUser.jack").(*sessions.DatabaseUser)

	name := "Delete Template Test"
	template, err := boardTemplatesDb.Create(boardtemplates.DatabaseBoardTemplateInsert{
		Creator:      user.ID,
		Name:         &name,
		AccessPolicy: boards.Public,
	}, []columntemplates.DatabaseColumnTemplateInsert{})

	assert.Nil(t, err)
	assert.NotNil(t, template)

	err = boardTemplatesDb.Delete(template.ID)
	assert.Nil(t, err)

	_, err = boardDb.GetBoard(template.ID)
	assert.NotNil(t, err)
	assert.Equal(t, err, sql.ErrNoRows)
}
