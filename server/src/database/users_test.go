package database

import (
	"database/sql"
	"scrumlr.io/server/sessions"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"scrumlr.io/server/common"
)

func TestRunnerForUser(t *testing.T) {
	t.Run("Create=0", testInsertUser)

	t.Run("Update=0", testUpdateUser)

	t.Run("Get=0", testGetUser)
	t.Run("Get=1", testGetUnknownUser)
}

func testInsertUser(t *testing.T) {
	name := "Some user"
	user, err := userDb.CreateAnonymousUser(name)
	assert.Nil(t, err)
	assert.NotEmpty(t, user.ID)
	assert.Equal(t, common.Anonymous, user.AccountType)
	assert.Equal(t, name, user.Name)
}

func testGetUser(t *testing.T) {
	user := fixture.MustRow("DatabaseUser.john").(*sessions.DatabaseUser)

	gotUser, err := userDb.GetUser(user.ID)
	assert.Nil(t, err)
	assert.NotNil(t, gotUser)
	assert.Equal(t, user.ID, gotUser.ID)
	assert.Equal(t, user.AccountType, gotUser.AccountType)
	assert.Equal(t, user.Name, gotUser.Name)
}

func testGetUnknownUser(t *testing.T) {
	id, _ := uuid.Parse("123e4567-e89b-12d3-a456-426614174000")
	_, err := userDb.GetUser(id)
	assert.Equal(t, sql.ErrNoRows, err)
}

func testUpdateUser(t *testing.T) {
	user, err := userDb.CreateAnonymousUser("Some name")
	assert.Nil(t, err)

	newName := "Piece Peace"
	updatedUser, err := userDb.UpdateUser(sessions.DatabaseUserUpdate{ID: user.ID, Name: newName})
	assert.Nil(t, err)

	assert.Equal(t, newName, updatedUser.Name)
	assert.Equal(t, user.ID, updatedUser.ID)
}
