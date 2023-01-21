package database

import (
	"database/sql"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"scrumlr.io/server/internal/database/types"
	"testing"
)

func TestInsertUser(t *testing.T) {
	name := "Some user"
	user, err := testDb.CreateAnonymousUser(name)
	assert.Nil(t, err)
	assert.NotEmpty(t, user.ID)
	assert.Equal(t, types.AccountTypeAnonymous, user.AccountType)
	assert.Equal(t, name, user.Name)
}

func TestInsertUserWithEmptyName(t *testing.T) {
	name := "\t\n "
	_, err := testDb.CreateAnonymousUser(name)
	assert.NotNil(t, err)
}

func TestInsertUserWithNewlineName(t *testing.T) {
	name := "Foo\nBar"
	_, err := testDb.CreateAnonymousUser(name)
	assert.NotNil(t, err)
}

func TestGetUser(t *testing.T) {
	user := fixture.MustRow("User.john").(*User)

	gotUser, err := testDb.GetUser(user.ID)
	assert.Nil(t, err)
	assert.NotNil(t, gotUser)
	assert.Equal(t, user.ID, gotUser.ID)
	assert.Equal(t, user.AccountType, gotUser.AccountType)
	assert.Equal(t, user.Name, gotUser.Name)
}

func TestGetUnknownUser(t *testing.T) {
	id, _ := uuid.Parse("123e4567-e89b-12d3-a456-426614174000")
	_, err := testDb.GetUser(id)
	assert.Equal(t, sql.ErrNoRows, err)
}

func TestUpdateUser(t *testing.T) {
	user, err := testDb.CreateAnonymousUser("Some name")
	assert.Nil(t, err)

	newName := "Piece Peace"
	updatedUser, err := testDb.UpdateUser(UserUpdate{ID: user.ID, Name: newName})
	assert.Nil(t, err)

	assert.Equal(t, newName, updatedUser.Name)
	assert.Equal(t, user.ID, updatedUser.ID)
}
