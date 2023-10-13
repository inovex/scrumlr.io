package database

import (
	"database/sql"
	"testing"

	"github.com/stretchr/testify/assert"
	"scrumlr.io/server/database/types"
)

func TestRunnerForBoards(t *testing.T) {
	t.Run("Create=0", testCreatePublicBoard)
	t.Run("Create=1", testCreatePublicBoardWithPassphraseShouldFail)
	t.Run("Create=2", testCreatePublicBoardWithSaltShouldFail)
	t.Run("Create=3", testCreateBoardAlsoGeneratesOwnerSession)
	t.Run("Create=4", testCreateBoardAlsoGeneratesColumns)
	t.Run("Create=5", testCreateByPassphraseBoard)
	t.Run("Create=6", testCreateByInviteBoard)
	t.Run("Create=7", testCreateBoardWithName)

	t.Run("Update=0", testChangePublicBoardToPassphraseBoard)
	t.Run("Update=1", testChangeToPassphraseBoardWithMissingPassphraseShouldFail)
	t.Run("Update=2", testChangeToPassphraseBoardWithMissingSaltShouldFail)
	t.Run("Update=3", testChangePassphraseBoardToPublicBoard)
	t.Run("Update=4", testChangePassphraseBoardToPublicBoardWithPassphraseShouldFail)
	t.Run("Update=5", testChangePassphraseBoardToPublicBoardWithSaltShouldFail)
	t.Run("Update=6", testChangePassphraseBoardToBoardByInviteShouldFail)
	t.Run("Update=7", testChangeInviteBoardToPassphraseBoardShouldFail)
	t.Run("Update=8", testChangeInviteBoardToPublicBoardShouldFail)
	t.Run("Update=9", testUpdateBoardName)
	t.Run("Update=10", testUpdateBoardSettings)

	t.Run("Get=0", testGetBoard)
	t.Run("Get=1", testGetUserBoards)

	t.Run("Delete=0", testDeleteBoards)
}

func testCreatePublicBoard(t *testing.T) {
	user := fixture.MustRow("User.jack").(*User)

	board, err := testDb.CreateBoard(user.ID, BoardInsert{
		Name:         nil,
		AccessPolicy: types.AccessPolicyPublic,
		Passphrase:   nil,
		Salt:         nil,
	}, []ColumnInsert{})

	assert.Nil(t, err)
	assert.Nil(t, board.Name)
	assert.Nil(t, board.Passphrase)
	assert.Nil(t, board.Salt)
	assert.True(t, board.ShowAuthors)
	assert.True(t, board.ShowNotesOfOtherUsers)
	assert.Equal(t, types.AccessPolicyPublic, board.AccessPolicy)
}

func testCreatePublicBoardWithPassphraseShouldFail(t *testing.T) {
	user := fixture.MustRow("User.jack").(*User)

	passphrase := "passphrase"
	_, err := testDb.CreateBoard(user.ID, BoardInsert{
		Name:         nil,
		AccessPolicy: types.AccessPolicyPublic,
		Passphrase:   &passphrase,
		Salt:         nil,
	}, []ColumnInsert{})

	assert.NotNil(t, err)
}

func testCreatePublicBoardWithSaltShouldFail(t *testing.T) {
	user := fixture.MustRow("User.jack").(*User)

	salt := "salt"
	_, err := testDb.CreateBoard(user.ID, BoardInsert{
		Name:         nil,
		AccessPolicy: types.AccessPolicyPublic,
		Passphrase:   &salt,
		Salt:         nil,
	}, []ColumnInsert{})

	assert.NotNil(t, err)
}

func testCreateBoardAlsoGeneratesOwnerSession(t *testing.T) {
	user := fixture.MustRow("User.jack").(*User)

	board, err := testDb.CreateBoard(user.ID, BoardInsert{
		Name:         nil,
		AccessPolicy: types.AccessPolicyPublic,
		Passphrase:   nil,
		Salt:         nil,
	}, []ColumnInsert{})

	assert.Nil(t, err)

	session, err := testDb.GetBoardSession(board.ID, user.ID)
	assert.Nil(t, err)
	assert.Equal(t, types.SessionRoleOwner, session.Role)
}

func testCreateBoardAlsoGeneratesColumns(t *testing.T) {
	user := fixture.MustRow("User.jack").(*User)

	board, err := testDb.CreateBoard(user.ID, BoardInsert{
		Name:         nil,
		AccessPolicy: types.AccessPolicyPublic,
		Passphrase:   nil,
		Salt:         nil,
	}, []ColumnInsert{
		{
			Name:  "A",
			Color: "backlog-blue",
		},
		{
			Name:  "B",
			Color: "backlog-blue",
		},
	})

	assert.Nil(t, err)

	columns, err := testDb.GetColumns(board.ID)
	assert.Nil(t, err)

	assert.Equal(t, "A", columns[0].Name)
	assert.Equal(t, 0, columns[0].Index)
	assert.Equal(t, "B", columns[1].Name)
	assert.Equal(t, 1, columns[1].Index)
}

func testCreateByPassphraseBoard(t *testing.T) {
	user := fixture.MustRow("User.jack").(*User)

	passphrase := "passphrase"
	salt := "salt"

	board, err := testDb.CreateBoard(user.ID, BoardInsert{
		Name:         nil,
		AccessPolicy: types.AccessPolicyByPassphrase,
		Passphrase:   &passphrase,
		Salt:         &salt,
	}, []ColumnInsert{})

	assert.Nil(t, err)
	assert.Nil(t, board.Name)
	assert.Equal(t, passphrase, *board.Passphrase)
	assert.Equal(t, salt, *board.Salt)
	assert.Equal(t, types.AccessPolicyByPassphrase, board.AccessPolicy)
}

func testCreateByInviteBoard(t *testing.T) {
	user := fixture.MustRow("User.jack").(*User)

	board, err := testDb.CreateBoard(user.ID, BoardInsert{
		Name:         nil,
		AccessPolicy: types.AccessPolicyByInvite,
		Passphrase:   nil,
		Salt:         nil,
	}, []ColumnInsert{})

	assert.Nil(t, err)
	assert.Nil(t, board.Name)
	assert.Nil(t, board.Passphrase)
	assert.Nil(t, board.Salt)
	assert.Equal(t, types.AccessPolicyByInvite, board.AccessPolicy)
}

func testCreateBoardWithName(t *testing.T) {
	user := fixture.MustRow("User.jack").(*User)

	name := "Board name"
	board, err := testDb.CreateBoard(user.ID, BoardInsert{
		Name:         &name,
		AccessPolicy: types.AccessPolicyPublic,
		Passphrase:   nil,
		Salt:         nil,
	}, []ColumnInsert{})

	assert.Nil(t, err)
	assert.Equal(t, name, *board.Name)
}

func testChangePublicBoardToPassphraseBoard(t *testing.T) {
	user := fixture.MustRow("User.jack").(*User)

	name := "Board name"
	board, err := testDb.CreateBoard(user.ID, BoardInsert{
		Name:         &name,
		AccessPolicy: types.AccessPolicyPublic,
		Passphrase:   nil,
		Salt:         nil,
	}, []ColumnInsert{})

	assert.Nil(t, err)

	accessPolicy := types.AccessPolicyByPassphrase
	passphrase := "passphrase"
	salt := "salt"

	updatedBoard, err := testDb.UpdateBoard(BoardUpdate{
		ID:           board.ID,
		AccessPolicy: &accessPolicy,
		Passphrase:   &passphrase,
		Salt:         &salt,
	})
	assert.Nil(t, err)
	assert.Equal(t, accessPolicy, updatedBoard.AccessPolicy)
	assert.Equal(t, passphrase, *updatedBoard.Passphrase)
	assert.Equal(t, salt, *updatedBoard.Salt)
}

func testChangeToPassphraseBoardWithMissingPassphraseShouldFail(t *testing.T) {
	user := fixture.MustRow("User.jack").(*User)

	name := "Board name"
	board, err := testDb.CreateBoard(user.ID, BoardInsert{
		Name:         &name,
		AccessPolicy: types.AccessPolicyPublic,
		Passphrase:   nil,
		Salt:         nil,
	}, []ColumnInsert{})

	assert.Nil(t, err)

	accessPolicy := types.AccessPolicyByPassphrase
	salt := "salt"

	_, err = testDb.UpdateBoard(BoardUpdate{
		ID:           board.ID,
		AccessPolicy: &accessPolicy,
		Passphrase:   nil,
		Salt:         &salt,
	})
	assert.NotNil(t, err)
}

func testChangeToPassphraseBoardWithMissingSaltShouldFail(t *testing.T) {
	user := fixture.MustRow("User.jack").(*User)

	name := "Board name"
	board, err := testDb.CreateBoard(user.ID, BoardInsert{
		Name:         &name,
		AccessPolicy: types.AccessPolicyPublic,
		Passphrase:   nil,
		Salt:         nil,
	}, []ColumnInsert{})

	assert.Nil(t, err)

	accessPolicy := types.AccessPolicyByPassphrase
	passphrase := "passphrase"

	_, err = testDb.UpdateBoard(BoardUpdate{
		ID:           board.ID,
		AccessPolicy: &accessPolicy,
		Passphrase:   &passphrase,
		Salt:         nil,
	})
	assert.NotNil(t, err)
}

func testChangePassphraseBoardToPublicBoard(t *testing.T) {
	user := fixture.MustRow("User.jack").(*User)

	passphrase := "passphrase"
	salt := "salt"

	board, err := testDb.CreateBoard(user.ID, BoardInsert{
		Name:         nil,
		AccessPolicy: types.AccessPolicyByPassphrase,
		Passphrase:   &passphrase,
		Salt:         &salt,
	}, []ColumnInsert{})

	assert.Nil(t, err)

	accessPolicy := types.AccessPolicyPublic
	updatedBoard, err := testDb.UpdateBoard(BoardUpdate{
		ID:           board.ID,
		AccessPolicy: &accessPolicy,
		Passphrase:   nil,
		Salt:         nil,
	})
	assert.Nil(t, err)
	assert.Equal(t, accessPolicy, updatedBoard.AccessPolicy)
}

func testChangePassphraseBoardToPublicBoardWithPassphraseShouldFail(t *testing.T) {
	user := fixture.MustRow("User.jack").(*User)

	passphrase := "passphrase"
	salt := "salt"

	board, err := testDb.CreateBoard(user.ID, BoardInsert{
		Name:         nil,
		AccessPolicy: types.AccessPolicyByPassphrase,
		Passphrase:   &passphrase,
		Salt:         &salt,
	}, []ColumnInsert{})

	assert.Nil(t, err)

	accessPolicy := types.AccessPolicyPublic
	_, err = testDb.UpdateBoard(BoardUpdate{
		ID:           board.ID,
		AccessPolicy: &accessPolicy,
		Passphrase:   &passphrase,
		Salt:         nil,
	})
	assert.NotNil(t, err)
}

func testChangePassphraseBoardToPublicBoardWithSaltShouldFail(t *testing.T) {
	user := fixture.MustRow("User.jack").(*User)

	passphrase := "passphrase"
	salt := "salt"

	board, err := testDb.CreateBoard(user.ID, BoardInsert{
		Name:         nil,
		AccessPolicy: types.AccessPolicyByPassphrase,
		Passphrase:   &passphrase,
		Salt:         &salt,
	}, []ColumnInsert{})

	assert.Nil(t, err)

	accessPolicy := types.AccessPolicyPublic
	_, err = testDb.UpdateBoard(BoardUpdate{
		ID:           board.ID,
		AccessPolicy: &accessPolicy,
		Passphrase:   nil,
		Salt:         &salt,
	})
	assert.NotNil(t, err)
}

func testChangePassphraseBoardToBoardByInviteShouldFail(t *testing.T) {
	user := fixture.MustRow("User.jack").(*User)

	passphrase := "passphrase"
	salt := "salt"

	board, err := testDb.CreateBoard(user.ID, BoardInsert{
		Name:         nil,
		AccessPolicy: types.AccessPolicyByPassphrase,
		Passphrase:   &passphrase,
		Salt:         &salt,
	}, []ColumnInsert{})

	assert.Nil(t, err)

	accessPolicy := types.AccessPolicyByInvite
	_, err = testDb.UpdateBoard(BoardUpdate{
		ID:           board.ID,
		AccessPolicy: &accessPolicy,
		Passphrase:   nil,
		Salt:         nil,
	})
	assert.NotNil(t, err)
}

func testChangeInviteBoardToPassphraseBoardShouldFail(t *testing.T) {
	user := fixture.MustRow("User.jack").(*User)

	board, err := testDb.CreateBoard(user.ID, BoardInsert{
		Name:         nil,
		AccessPolicy: types.AccessPolicyByInvite,
		Passphrase:   nil,
		Salt:         nil,
	}, []ColumnInsert{})

	assert.Nil(t, err)

	accessPolicy := types.AccessPolicyByInvite
	passphrase := "passphrase"
	salt := "salt"
	_, err = testDb.UpdateBoard(BoardUpdate{
		ID:           board.ID,
		AccessPolicy: &accessPolicy,
		Passphrase:   &passphrase,
		Salt:         &salt,
	})
	assert.NotNil(t, err)
}

func testChangeInviteBoardToPublicBoardShouldFail(t *testing.T) {
	user := fixture.MustRow("User.jack").(*User)

	board, err := testDb.CreateBoard(user.ID, BoardInsert{
		Name:         nil,
		AccessPolicy: types.AccessPolicyByInvite,
		Passphrase:   nil,
		Salt:         nil,
	}, []ColumnInsert{})

	assert.Nil(t, err)

	accessPolicy := types.AccessPolicyPublic
	_, err = testDb.UpdateBoard(BoardUpdate{
		ID:           board.ID,
		AccessPolicy: &accessPolicy,
		Passphrase:   nil,
		Salt:         nil,
	})
	assert.NotNil(t, err)
}

func testUpdateBoardName(t *testing.T) {
	user := fixture.MustRow("User.jack").(*User)

	board, err := testDb.CreateBoard(user.ID, BoardInsert{
		Name:         nil,
		AccessPolicy: types.AccessPolicyByInvite,
		Passphrase:   nil,
		Salt:         nil,
	}, []ColumnInsert{})

	assert.Nil(t, err)

	name := "New name"

	updatedBoard, err := testDb.UpdateBoard(BoardUpdate{ID: board.ID, Name: &name})

	assert.Nil(t, err)
	assert.Equal(t, name, *updatedBoard.Name)
}

func testUpdateBoardSettings(t *testing.T) {
	user := fixture.MustRow("User.jack").(*User)

	board, err := testDb.CreateBoard(user.ID, BoardInsert{
		Name:         nil,
		AccessPolicy: types.AccessPolicyByInvite,
		Passphrase:   nil,
		Salt:         nil,
	}, []ColumnInsert{})

	assert.Nil(t, err)

	showAuthors := true
	showNotesOfOtherUsers := true
	updatedBoard, err := testDb.UpdateBoard(BoardUpdate{ID: board.ID, ShowAuthors: &showAuthors, ShowNotesOfOtherUsers: &showNotesOfOtherUsers})

	assert.Nil(t, err)
	assert.Equal(t, showAuthors, updatedBoard.ShowAuthors)
	assert.Equal(t, showNotesOfOtherUsers, updatedBoard.ShowNotesOfOtherUsers)
}

func testGetBoard(t *testing.T) {
	board := fixture.MustRow("Board.boardTestBoard").(*Board)

	gotBoard, err := testDb.GetBoard(board.ID)
	assert.Nil(t, err)

	assert.Equal(t, board.ID, gotBoard.ID)
	assert.Equal(t, board.Name, gotBoard.Name)
	assert.Equal(t, board.ShowAuthors, gotBoard.ShowAuthors)
	assert.Equal(t, board.ShowNotesOfOtherUsers, gotBoard.ShowNotesOfOtherUsers)
	assert.Equal(t, board.AccessPolicy, gotBoard.AccessPolicy)
	assert.Equal(t, board.Passphrase, gotBoard.Passphrase)
	assert.Equal(t, board.Salt, gotBoard.Salt)
}

func testGetUserBoards(t *testing.T) {
	user := fixture.MustRow("User.jack").(*User)

	// Create some boards associated with the user
	boardName1 := "Board 1"
	board1, err := testDb.CreateBoard(user.ID, BoardInsert{
		Name:         &boardName1,
		AccessPolicy: types.AccessPolicyPublic,
		Passphrase:   nil,
		Salt:         nil,
	}, []ColumnInsert{})
	assert.Nil(t, err)
	boardName2 := "Board 2"
	board2, err := testDb.CreateBoard(user.ID, BoardInsert{
		Name:         &boardName2,
		AccessPolicy: types.AccessPolicyPublic,
		Passphrase:   nil,
		Salt:         nil,
	}, []ColumnInsert{})
	assert.Nil(t, err)

	// Retrieve the boards associated with the user
	boards, err := testDb.GetUserBoards(user.ID)
	assert.Nil(t, err)

	// Check that the correct boards were retrieved

	amountOfBoards := len(boards)
	assert.Equal(t, board1.ID, boards[amountOfBoards-2].ID)
	assert.Equal(t, board1.Name, boards[amountOfBoards-2].Name)
	assert.Equal(t, board2.ID, boards[amountOfBoards-1].ID)
	assert.Equal(t, board2.Name, boards[amountOfBoards-1].Name)
}

func testDeleteBoards(t *testing.T) {
	board := fixture.MustRow("Board.boardTestBoard").(*Board)

	err := testDb.DeleteBoard(board.ID)
	assert.Nil(t, err)

	_, err = testDb.GetBoard(board.ID)
	assert.NotNil(t, err)
	assert.Equal(t, err, sql.ErrNoRows)
}
