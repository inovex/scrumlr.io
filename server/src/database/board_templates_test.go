package database

import (
	"database/sql"
	"testing"

	"github.com/stretchr/testify/assert"
	"scrumlr.io/server/database/types"
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
	user := fixture.MustRow("User.jack").(*User)

	template, err := testDb.CreateBoardTemplate(BoardTemplateInsert{
		Creator:      user.ID,
		Name:         nil,
		Description:  nil,
		Favourite:    nil,
		AccessPolicy: types.AccessPolicyPublic,
	}, []ColumnTemplateInsert{})

	assert.Nil(t, err)
	assert.NotNil(t, template.ID)
	assert.Nil(t, template.Name)
	assert.Nil(t, template.Description)
	assert.False(t, *template.Favourite)
	assert.Equal(t, types.AccessPolicyPublic, template.AccessPolicy)
}

func testCreateByPassphraseBoardTemplate(t *testing.T) {
	user := fixture.MustRow("User.jack").(*User)

	template, err := testDb.CreateBoardTemplate(BoardTemplateInsert{
		Creator:      user.ID,
		Name:         nil,
		Description:  nil,
		Favourite:    nil,
		AccessPolicy: types.AccessPolicyPublic,
	}, []ColumnTemplateInsert{})

	assert.Nil(t, err)
	assert.NotNil(t, template.ID)
	assert.Nil(t, template.Name)
	assert.Nil(t, template.Description)
	assert.False(t, *template.Favourite)
	assert.Equal(t, types.AccessPolicyPublic, template.AccessPolicy)
}

func testCreateByInviteBoardTemplate(t *testing.T) {
	user := fixture.MustRow("User.jack").(*User)

	template, err := testDb.CreateBoardTemplate(BoardTemplateInsert{
		Creator:      user.ID,
		Name:         nil,
		Description:  nil,
		Favourite:    nil,
		AccessPolicy: types.AccessPolicyPublic,
	}, []ColumnTemplateInsert{})

	assert.Nil(t, err)
	assert.NotNil(t, template.ID)
	assert.Nil(t, template.Name)
	assert.Nil(t, template.Description)
	assert.False(t, *template.Favourite)
	assert.Equal(t, types.AccessPolicyPublic, template.AccessPolicy)
}

func testCreateBoardTemplateAlsoCreatesColumnTemplates(t *testing.T) {
	user := fixture.MustRow("User.jack").(*User)

	visible := true
	notVisible := false
	indexOne := 0
	indexTwo := 1

	template, err := testDb.CreateBoardTemplate(BoardTemplateInsert{
		Creator:      user.ID,
		Name:         nil,
		Description:  nil,
		Favourite:    nil,
		AccessPolicy: types.AccessPolicyPublic,
	}, []ColumnTemplateInsert{
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

	columns, err := testDb.ListColumnTemplates(template.ID)
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
	user := fixture.MustRow("User.jack").(*User)

	name := "Test Template"

	template, err := testDb.CreateBoardTemplate(BoardTemplateInsert{
		Creator:      user.ID,
		Name:         &name,
		Description:  nil,
		Favourite:    nil,
		AccessPolicy: types.AccessPolicyPublic,
	}, []ColumnTemplateInsert{})

	assert.Nil(t, err)
	assert.NotNil(t, template.ID)
	assert.Equal(t, "Test Template", *template.Name)
}

func testCreateBoardTemplateWithDescription(t *testing.T) {
	user := fixture.MustRow("User.jack").(*User)

	description := "Test Description"

	template, err := testDb.CreateBoardTemplate(BoardTemplateInsert{
		Creator:      user.ID,
		Name:         nil,
		Description:  &description,
		Favourite:    nil,
		AccessPolicy: types.AccessPolicyPublic,
	}, []ColumnTemplateInsert{})

	assert.Nil(t, err)
	assert.NotNil(t, template.ID)
	assert.Equal(t, "Test Description", *template.Description)
}

func testUpdatePublicBoardTemplateToPassphraseBoardTemplate(t *testing.T) {
	user := fixture.MustRow("User.jack").(*User)

	template, err := testDb.CreateBoardTemplate(BoardTemplateInsert{
		Creator:      user.ID,
		Name:         nil,
		AccessPolicy: types.AccessPolicyPublic,
	}, []ColumnTemplateInsert{})

	assert.Nil(t, err)
	assert.NotNil(t, template)

	updateAccessPolicy := types.AccessPolicyByPassphrase
	updatedBoard, err := testDb.UpdateBoardTemplate(BoardTemplateUpdate{
		ID:           template.ID,
		AccessPolicy: &updateAccessPolicy,
	})

	assert.Nil(t, err)
	assert.Equal(t, updateAccessPolicy, updatedBoard.AccessPolicy)
}

func testUpdatePublicBoardTemplateToByInviteBoardTemplate(t *testing.T) {
	user := fixture.MustRow("User.jack").(*User)

	template, err := testDb.CreateBoardTemplate(BoardTemplateInsert{
		Creator:      user.ID,
		Name:         nil,
		AccessPolicy: types.AccessPolicyPublic,
	}, []ColumnTemplateInsert{})

	assert.Nil(t, err)
	assert.NotNil(t, template)

	updateAccessPolicy := types.AccessPolicyByInvite
	updatedBoard, err := testDb.UpdateBoardTemplate(BoardTemplateUpdate{
		ID:           template.ID,
		AccessPolicy: &updateAccessPolicy,
	})

	assert.Nil(t, err)
	assert.Equal(t, updateAccessPolicy, updatedBoard.AccessPolicy)
}

func testUpdateByPassphraseBoardTemplateToByInviteBoardTemplate(t *testing.T) {
	user := fixture.MustRow("User.jack").(*User)

	template, err := testDb.CreateBoardTemplate(BoardTemplateInsert{
		Creator:      user.ID,
		Name:         nil,
		AccessPolicy: types.AccessPolicyByPassphrase,
	}, []ColumnTemplateInsert{})

	assert.Nil(t, err)
	assert.NotNil(t, template)

	updateAccessPolicy := types.AccessPolicyByInvite
	updatedBoard, err := testDb.UpdateBoardTemplate(BoardTemplateUpdate{
		ID:           template.ID,
		AccessPolicy: &updateAccessPolicy,
	})

	assert.Nil(t, err)
	assert.Equal(t, updateAccessPolicy, updatedBoard.AccessPolicy)
}

func testUpdateByInviteBoardTemplateToByPassphraseBoardTemplate(t *testing.T) {
	user := fixture.MustRow("User.jack").(*User)

	template, err := testDb.CreateBoardTemplate(BoardTemplateInsert{
		Creator:      user.ID,
		Name:         nil,
		AccessPolicy: types.AccessPolicyByInvite,
	}, []ColumnTemplateInsert{})

	assert.Nil(t, err)
	assert.NotNil(t, template)

	updateAccessPolicy := types.AccessPolicyByPassphrase
	updatedBoard, err := testDb.UpdateBoardTemplate(BoardTemplateUpdate{
		ID:           template.ID,
		AccessPolicy: &updateAccessPolicy,
	})

	assert.Nil(t, err)
	assert.Equal(t, updateAccessPolicy, updatedBoard.AccessPolicy)
}

func testUpdateBoardTemplateName(t *testing.T) {
	user := fixture.MustRow("User.jack").(*User)

	template, err := testDb.CreateBoardTemplate(BoardTemplateInsert{
		Creator:      user.ID,
		Name:         nil,
		AccessPolicy: types.AccessPolicyByInvite,
	}, []ColumnTemplateInsert{})

	assert.Nil(t, err)
	assert.NotNil(t, template)

	updateName := "New Name"
	updatedBoard, err := testDb.UpdateBoardTemplate(BoardTemplateUpdate{
		ID:   template.ID,
		Name: &updateName,
	})

	assert.Nil(t, err)
	assert.Equal(t, updateName, *updatedBoard.Name)
}

func testUpdateBoardTemplateDescription(t *testing.T) {
	user := fixture.MustRow("User.jack").(*User)

	template, err := testDb.CreateBoardTemplate(BoardTemplateInsert{
		Creator:      user.ID,
		Description:  nil,
		AccessPolicy: types.AccessPolicyByInvite,
	}, []ColumnTemplateInsert{})

	assert.Nil(t, err)
	assert.NotNil(t, template)

	updateDescription := "New Description"
	updatedBoard, err := testDb.UpdateBoardTemplate(BoardTemplateUpdate{
		ID:          template.ID,
		Description: &updateDescription,
	})

	assert.Nil(t, err)
	assert.Equal(t, updateDescription, *updatedBoard.Description)
}

func testUpdateBoardTemplateFavouriteToTrue(t *testing.T) {
	user := fixture.MustRow("User.jack").(*User)

	template, err := testDb.CreateBoardTemplate(BoardTemplateInsert{
		Creator:      user.ID,
		Favourite:    nil,
		AccessPolicy: types.AccessPolicyByInvite,
	}, []ColumnTemplateInsert{})

	assert.Nil(t, err)
	assert.NotNil(t, template)

	updateFavourite := true
	updatedBoard, err := testDb.UpdateBoardTemplate(BoardTemplateUpdate{
		ID:        template.ID,
		Favourite: &updateFavourite,
	})

	assert.Nil(t, err)
	assert.Equal(t, updateFavourite, *updatedBoard.Favourite)
}

func testUpdateBoardTemplateFavouriteFromTrueToFalse(t *testing.T) {
	user := fixture.MustRow("User.jack").(*User)

	favourited := true

	template, err := testDb.CreateBoardTemplate(BoardTemplateInsert{
		Creator:      user.ID,
		Favourite:    &favourited,
		AccessPolicy: types.AccessPolicyByInvite,
	}, []ColumnTemplateInsert{})

	assert.Nil(t, err)
	assert.NotNil(t, template)

	updateFavourite := false
	updatedBoard, err := testDb.UpdateBoardTemplate(BoardTemplateUpdate{
		ID:        template.ID,
		Favourite: &updateFavourite,
	})

	assert.Nil(t, err)
	assert.Equal(t, updateFavourite, *updatedBoard.Favourite)
}

func testGetBoardTemplate(t *testing.T) {
	user := fixture.MustRow("User.jack").(*User)

	name := "Get Template Test"
	template, err := testDb.CreateBoardTemplate(BoardTemplateInsert{
		Creator:      user.ID,
		Name:         &name,
		AccessPolicy: types.AccessPolicyPublic,
	}, []ColumnTemplateInsert{})

	assert.Nil(t, err)
	assert.NotNil(t, template)

	getTemplate, err := testDb.GetBoardTemplate(template.ID)

	assert.Nil(t, err)
	assert.NotNil(t, getTemplate)
	assert.IsType(t, BoardTemplate{}, template)
	assert.NotNil(t, getTemplate.ID)
	assert.Equal(t, name, *template.Name)
}

func testGetAllBoardTemplatesForSpecificUser(t *testing.T) {
	user := fixture.MustRow("User.jack").(*User)

	name := "Get Template Test"
	templateOne, err := testDb.CreateBoardTemplate(BoardTemplateInsert{
		Creator:      user.ID,
		Name:         &name,
		AccessPolicy: types.AccessPolicyPublic,
	}, []ColumnTemplateInsert{})

	assert.Nil(t, err)
	assert.NotNil(t, templateOne)

	templateTwo, err := testDb.CreateBoardTemplate(BoardTemplateInsert{
		Creator:      user.ID,
		Name:         &name,
		AccessPolicy: types.AccessPolicyPublic,
	}, []ColumnTemplateInsert{})

	assert.Nil(t, err)
	assert.NotNil(t, templateTwo)

	getTemplates, err := testDb.GetBoardTemplates(user.ID)

	assert.Nil(t, err)
	assert.IsType(t, []BoardTemplateFull{}, getTemplates)
	assert.NotNil(t, getTemplates)
}

func testDeleteBoardTemplate(t *testing.T) {
	user := fixture.MustRow("User.jack").(*User)

	name := "Delete Template Test"
	template, err := testDb.CreateBoardTemplate(BoardTemplateInsert{
		Creator:      user.ID,
		Name:         &name,
		AccessPolicy: types.AccessPolicyPublic,
	}, []ColumnTemplateInsert{})

	assert.Nil(t, err)
	assert.NotNil(t, template)

	err = testDb.DeleteBoardTemplate(template.ID)
	assert.Nil(t, err)

	_, err = testDb.GetBoard(template.ID)
	assert.NotNil(t, err)
	assert.Equal(t, err, sql.ErrNoRows)
}
