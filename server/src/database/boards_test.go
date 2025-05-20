package database

import (
	"database/sql"
	"testing"

	"scrumlr.io/server/boards"
	"scrumlr.io/server/common"

	"github.com/stretchr/testify/assert"
	"scrumlr.io/server/columns"
	"scrumlr.io/server/users"
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
	t.Run("Create=8", testCreateBoardWithDescription)

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
	t.Run("Update=11", testUpdateBoardDescription)

	t.Run("Get=0", testGetBoard)
	t.Run("Get=1", testGetUserBoards)

	t.Run("Delete=0", testDeleteBoards)
}

func testCreatePublicBoard(t *testing.T) {
	user := fixture.MustRow("DatabaseUser.jack").(*users.DatabaseUser)

	board, err := boardDb.CreateBoard(user.ID, boards.DatabaseBoardInsert{
		Name:         nil,
		AccessPolicy: boards.Public,
		Passphrase:   nil,
		Salt:         nil,
	}, []columns.DatabaseColumnInsert{})

	assert.Nil(t, err)
	assert.Nil(t, board.Name)
	assert.Nil(t, board.Passphrase)
	assert.Nil(t, board.Salt)
	assert.True(t, board.ShowAuthors)
	assert.True(t, board.ShowNotesOfOtherUsers)
	assert.Equal(t, boards.Public, board.AccessPolicy)
}

func testCreatePublicBoardWithPassphraseShouldFail(t *testing.T) {
	user := fixture.MustRow("DatabaseUser.jack").(*users.DatabaseUser)

	passphrase := "passphrase"
	_, err := boardDb.CreateBoard(user.ID, boards.DatabaseBoardInsert{
		Name:         nil,
		AccessPolicy: boards.Public,
		Passphrase:   &passphrase,
		Salt:         nil,
	}, []columns.DatabaseColumnInsert{})

	assert.NotNil(t, err)
}

func testCreatePublicBoardWithSaltShouldFail(t *testing.T) {
	user := fixture.MustRow("DatabaseUser.jack").(*users.DatabaseUser)

	salt := "salt"
	_, err := boardDb.CreateBoard(user.ID, boards.DatabaseBoardInsert{
		Name:         nil,
		AccessPolicy: boards.Public,
		Passphrase:   &salt,
		Salt:         nil,
	}, []columns.DatabaseColumnInsert{})

	assert.NotNil(t, err)
}

func testCreateBoardAlsoGeneratesOwnerSession(t *testing.T) {
	user := fixture.MustRow("DatabaseUser.jack").(*users.DatabaseUser)

	board, err := boardDb.CreateBoard(user.ID, boards.DatabaseBoardInsert{
		Name:         nil,
		AccessPolicy: boards.Public,
		Passphrase:   nil,
		Salt:         nil,
	}, []columns.DatabaseColumnInsert{})

	assert.Nil(t, err)

	session, err := sessionDb.Get(board.ID, user.ID)
	assert.Nil(t, err)
	assert.Equal(t, common.OwnerRole, session.Role)
}

func testCreateBoardAlsoGeneratesColumns(t *testing.T) {
	user := fixture.MustRow("DatabaseUser.jack").(*users.DatabaseUser)

	board, err := boardDb.CreateBoard(user.ID, boards.DatabaseBoardInsert{
		Name:         nil,
		AccessPolicy: boards.Public,
		Passphrase:   nil,
		Salt:         nil,
	}, []columns.DatabaseColumnInsert{
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

	columns, err := columnDb.GetAll(board.ID)
	assert.Nil(t, err)

	assert.Equal(t, "A", columns[0].Name)
	assert.Equal(t, 0, columns[0].Index)
	assert.Equal(t, "B", columns[1].Name)
	assert.Equal(t, 1, columns[1].Index)
}

func testCreateByPassphraseBoard(t *testing.T) {
	user := fixture.MustRow("DatabaseUser.jack").(*users.DatabaseUser)

	passphrase := "passphrase"
	salt := "salt"

	board, err := boardDb.CreateBoard(user.ID, boards.DatabaseBoardInsert{
		Name:         nil,
		AccessPolicy: boards.ByPassphrase,
		Passphrase:   &passphrase,
		Salt:         &salt,
	}, []columns.DatabaseColumnInsert{})

	assert.Nil(t, err)
	assert.Nil(t, board.Name)
	assert.Equal(t, passphrase, *board.Passphrase)
	assert.Equal(t, salt, *board.Salt)
	assert.Equal(t, boards.ByPassphrase, board.AccessPolicy)
}

func testCreateByInviteBoard(t *testing.T) {
	user := fixture.MustRow("DatabaseUser.jack").(*users.DatabaseUser)

	board, err := boardDb.CreateBoard(user.ID, boards.DatabaseBoardInsert{
		Name:         nil,
		AccessPolicy: boards.ByInvite,
		Passphrase:   nil,
		Salt:         nil,
	}, []columns.DatabaseColumnInsert{})

	assert.Nil(t, err)
	assert.Nil(t, board.Name)
	assert.Nil(t, board.Passphrase)
	assert.Nil(t, board.Salt)
	assert.Equal(t, boards.ByInvite, board.AccessPolicy)
}

func testCreateBoardWithName(t *testing.T) {
	user := fixture.MustRow("DatabaseUser.jack").(*users.DatabaseUser)

	name := "Board name"
	board, err := boardDb.CreateBoard(user.ID, boards.DatabaseBoardInsert{
		Name:         &name,
		AccessPolicy: boards.Public,
		Passphrase:   nil,
		Salt:         nil,
	}, []columns.DatabaseColumnInsert{})

	assert.Nil(t, err)
	assert.Equal(t, name, *board.Name)
}

func testCreateBoardWithDescription(t *testing.T) {
	user := fixture.MustRow("DatabaseUser.jack").(*users.DatabaseUser)

	description := "A board description"
	board, err := boardDb.CreateBoard(user.ID, boards.DatabaseBoardInsert{
		Name:         nil,
		AccessPolicy: boards.Public,
		Passphrase:   nil,
		Salt:         nil,
		Description:  &description,
	}, []columns.DatabaseColumnInsert{})

	assert.Nil(t, err)
	assert.Equal(t, description, *board.Description)
}

func testChangePublicBoardToPassphraseBoard(t *testing.T) {
	user := fixture.MustRow("DatabaseUser.jack").(*users.DatabaseUser)

	name := "Board name"
	newBoard, err := boardDb.CreateBoard(user.ID, boards.DatabaseBoardInsert{
		Name:         &name,
		AccessPolicy: boards.Public,
		Passphrase:   nil,
		Salt:         nil,
	}, []columns.DatabaseColumnInsert{})

	assert.Nil(t, err)

	accessPolicy := boards.ByPassphrase
	passphrase := "passphrase"
	salt := "salt"

	updatedBoard, err := boardDb.UpdateBoard(boards.DatabaseBoardUpdate{
		ID:           newBoard.ID,
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
	user := fixture.MustRow("DatabaseUser.jack").(*users.DatabaseUser)

	name := "Board name"
	newBoard, err := boardDb.CreateBoard(user.ID, boards.DatabaseBoardInsert{
		Name:         &name,
		AccessPolicy: boards.Public,
		Passphrase:   nil,
		Salt:         nil,
	}, []columns.DatabaseColumnInsert{})

	assert.Nil(t, err)

	accessPolicy := boards.ByPassphrase
	salt := "salt"

	_, err = boardDb.UpdateBoard(boards.DatabaseBoardUpdate{
		ID:           newBoard.ID,
		AccessPolicy: &accessPolicy,
		Passphrase:   nil,
		Salt:         &salt,
	})
	assert.NotNil(t, err)
}

func testChangeToPassphraseBoardWithMissingSaltShouldFail(t *testing.T) {
	user := fixture.MustRow("DatabaseUser.jack").(*users.DatabaseUser)

	name := "Board name"
	newBoard, err := boardDb.CreateBoard(user.ID, boards.DatabaseBoardInsert{
		Name:         &name,
		AccessPolicy: boards.Public,
		Passphrase:   nil,
		Salt:         nil,
	}, []columns.DatabaseColumnInsert{})

	assert.Nil(t, err)

	accessPolicy := boards.ByPassphrase
	passphrase := "passphrase"

	_, err = boardDb.UpdateBoard(boards.DatabaseBoardUpdate{
		ID:           newBoard.ID,
		AccessPolicy: &accessPolicy,
		Passphrase:   &passphrase,
		Salt:         nil,
	})
	assert.NotNil(t, err)
}

func testChangePassphraseBoardToPublicBoard(t *testing.T) {
	user := fixture.MustRow("DatabaseUser.jack").(*users.DatabaseUser)

	passphrase := "passphrase"
	salt := "salt"

	newBoard, err := boardDb.CreateBoard(user.ID, boards.DatabaseBoardInsert{
		Name:         nil,
		AccessPolicy: boards.ByPassphrase,
		Passphrase:   &passphrase,
		Salt:         &salt,
	}, []columns.DatabaseColumnInsert{})

	assert.Nil(t, err)

	accessPolicy := boards.Public
	updatedBoard, err := boardDb.UpdateBoard(boards.DatabaseBoardUpdate{
		ID:           newBoard.ID,
		AccessPolicy: &accessPolicy,
		Passphrase:   nil,
		Salt:         nil,
	})
	assert.Nil(t, err)
	assert.Equal(t, accessPolicy, updatedBoard.AccessPolicy)
}

func testChangePassphraseBoardToPublicBoardWithPassphraseShouldFail(t *testing.T) {
	user := fixture.MustRow("DatabaseUser.jack").(*users.DatabaseUser)

	passphrase := "passphrase"
	salt := "salt"

	newBoard, err := boardDb.CreateBoard(user.ID, boards.DatabaseBoardInsert{
		Name:         nil,
		AccessPolicy: boards.ByPassphrase,
		Passphrase:   &passphrase,
		Salt:         &salt,
	}, []columns.DatabaseColumnInsert{})

	assert.Nil(t, err)

	accessPolicy := boards.Public
	_, err = boardDb.UpdateBoard(boards.DatabaseBoardUpdate{
		ID:           newBoard.ID,
		AccessPolicy: &accessPolicy,
		Passphrase:   &passphrase,
		Salt:         nil,
	})
	assert.NotNil(t, err)
}

func testChangePassphraseBoardToPublicBoardWithSaltShouldFail(t *testing.T) {
	user := fixture.MustRow("DatabaseUser.jack").(*users.DatabaseUser)

	passphrase := "passphrase"
	salt := "salt"

	newBoard, err := boardDb.CreateBoard(user.ID, boards.DatabaseBoardInsert{
		Name:         nil,
		AccessPolicy: boards.ByPassphrase,
		Passphrase:   &passphrase,
		Salt:         &salt,
	}, []columns.DatabaseColumnInsert{})

	assert.Nil(t, err)

	accessPolicy := boards.Public
	_, err = boardDb.UpdateBoard(boards.DatabaseBoardUpdate{
		ID:           newBoard.ID,
		AccessPolicy: &accessPolicy,
		Passphrase:   nil,
		Salt:         &salt,
	})
	assert.NotNil(t, err)
}

func testChangePassphraseBoardToBoardByInviteShouldFail(t *testing.T) {
	user := fixture.MustRow("DatabaseUser.jack").(*users.DatabaseUser)

	passphrase := "passphrase"
	salt := "salt"

	newBoard, err := boardDb.CreateBoard(user.ID, boards.DatabaseBoardInsert{
		Name:         nil,
		AccessPolicy: boards.ByPassphrase,
		Passphrase:   &passphrase,
		Salt:         &salt,
	}, []columns.DatabaseColumnInsert{})

	assert.Nil(t, err)

	accessPolicy := boards.ByInvite
	_, err = boardDb.UpdateBoard(boards.DatabaseBoardUpdate{
		ID:           newBoard.ID,
		AccessPolicy: &accessPolicy,
		Passphrase:   nil,
		Salt:         nil,
	})
	assert.NotNil(t, err)
}

func testChangeInviteBoardToPassphraseBoardShouldFail(t *testing.T) {
	user := fixture.MustRow("DatabaseUser.jack").(*users.DatabaseUser)

	newBoard, err := boardDb.CreateBoard(user.ID, boards.DatabaseBoardInsert{
		Name:         nil,
		AccessPolicy: boards.ByInvite,
		Passphrase:   nil,
		Salt:         nil,
	}, []columns.DatabaseColumnInsert{})

	assert.Nil(t, err)

	accessPolicy := boards.ByInvite
	passphrase := "passphrase"
	salt := "salt"
	_, err = boardDb.UpdateBoard(boards.DatabaseBoardUpdate{
		ID:           newBoard.ID,
		AccessPolicy: &accessPolicy,
		Passphrase:   &passphrase,
		Salt:         &salt,
	})
	assert.NotNil(t, err)
}

func testChangeInviteBoardToPublicBoardShouldFail(t *testing.T) {
	user := fixture.MustRow("DatabaseUser.jack").(*users.DatabaseUser)

	newBoard, err := boardDb.CreateBoard(user.ID, boards.DatabaseBoardInsert{
		Name:         nil,
		AccessPolicy: boards.ByInvite,
		Passphrase:   nil,
		Salt:         nil,
	}, []columns.DatabaseColumnInsert{})

	assert.Nil(t, err)

	accessPolicy := boards.Public
	_, err = boardDb.UpdateBoard(boards.DatabaseBoardUpdate{
		ID:           newBoard.ID,
		AccessPolicy: &accessPolicy,
		Passphrase:   nil,
		Salt:         nil,
	})
	assert.NotNil(t, err)
}

func testUpdateBoardName(t *testing.T) {
	user := fixture.MustRow("DatabaseUser.jack").(*users.DatabaseUser)

	newBoard, err := boardDb.CreateBoard(user.ID, boards.DatabaseBoardInsert{
		Name:         nil,
		AccessPolicy: boards.ByInvite,
		Passphrase:   nil,
		Salt:         nil,
	}, []columns.DatabaseColumnInsert{})

	assert.Nil(t, err)

	name := "New name"

	updatedBoard, err := boardDb.UpdateBoard(boards.DatabaseBoardUpdate{ID: newBoard.ID, Name: &name})

	assert.Nil(t, err)
	assert.Equal(t, name, *updatedBoard.Name)
}

func testUpdateBoardSettings(t *testing.T) {
	user := fixture.MustRow("DatabaseUser.jack").(*users.DatabaseUser)

	newBoard, err := boardDb.CreateBoard(user.ID, boards.DatabaseBoardInsert{
		Name:         nil,
		AccessPolicy: boards.ByInvite,
		Passphrase:   nil,
		Salt:         nil,
	}, []columns.DatabaseColumnInsert{})

	assert.Nil(t, err)

	showAuthors := true
	showNotesOfOtherUsers := true
	isLocked := true
	updatedBoard, err := boardDb.UpdateBoard(boards.DatabaseBoardUpdate{ID: newBoard.ID, ShowAuthors: &showAuthors, ShowNotesOfOtherUsers: &showNotesOfOtherUsers, IsLocked: &isLocked})

	assert.Nil(t, err)
	assert.Equal(t, showAuthors, updatedBoard.ShowAuthors)
	assert.Equal(t, showNotesOfOtherUsers, updatedBoard.ShowNotesOfOtherUsers)
	assert.Equal(t, isLocked, updatedBoard.IsLocked)
}

func testUpdateBoardDescription(t *testing.T) {
	user := fixture.MustRow("DatabaseUser.jack").(*users.DatabaseUser)

	newBoard, err := boardDb.CreateBoard(user.ID, boards.DatabaseBoardInsert{
		Name:         nil,
		AccessPolicy: boards.ByInvite,
		Passphrase:   nil,
		Salt:         nil,
	}, []columns.DatabaseColumnInsert{})

	assert.Nil(t, err)

	description := "New description"

	updatedBoard, err := boardDb.UpdateBoard(boards.DatabaseBoardUpdate{ID: newBoard.ID, Description: &description})

	assert.Nil(t, err)
	assert.Equal(t, description, *updatedBoard.Description)
}

func testGetBoard(t *testing.T) {
	board := fixture.MustRow("Board.boardTestBoard").(*boards.DatabaseBoard)

	gotBoard, err := boardDb.GetBoard(board.ID)
	assert.Nil(t, err)

	assert.Equal(t, board.ID, gotBoard.ID)
	assert.Equal(t, board.Name, gotBoard.Name)
	assert.Equal(t, board.Description, gotBoard.Description)
	assert.Equal(t, board.ShowAuthors, gotBoard.ShowAuthors)
	assert.Equal(t, board.ShowNotesOfOtherUsers, gotBoard.ShowNotesOfOtherUsers)
	assert.Equal(t, board.AccessPolicy, gotBoard.AccessPolicy)
	assert.Equal(t, board.Passphrase, gotBoard.Passphrase)
	assert.Equal(t, board.Salt, gotBoard.Salt)
}

func testGetUserBoards(t *testing.T) {
	user := fixture.MustRow("DatabaseUser.jack").(*users.DatabaseUser)

	// Create some boards associated with the user
	boardName1 := "Board 1"
	board1, err := boardDb.CreateBoard(user.ID, boards.DatabaseBoardInsert{
		Name:         &boardName1,
		AccessPolicy: boards.Public,
		Passphrase:   nil,
		Salt:         nil,
	}, []columns.DatabaseColumnInsert{})
	assert.Nil(t, err)
	boardName2 := "Board 2"
	board2, err := boardDb.CreateBoard(user.ID, boards.DatabaseBoardInsert{
		Name:         &boardName2,
		AccessPolicy: boards.Public,
		Passphrase:   nil,
		Salt:         nil,
	}, []columns.DatabaseColumnInsert{})
	assert.Nil(t, err)

	// Retrieve the boards associated with the user
	boards, err := boardDb.GetBoards(user.ID)
	assert.Nil(t, err)

	// Check that the correct boards were retrieved

	amountOfBoards := len(boards)
	assert.Equal(t, board1.ID, boards[amountOfBoards-2].ID)
	assert.Equal(t, board1.Name, boards[amountOfBoards-2].Name)
	assert.Equal(t, board2.ID, boards[amountOfBoards-1].ID)
	assert.Equal(t, board2.Name, boards[amountOfBoards-1].Name)
}

func testDeleteBoards(t *testing.T) {
	board := fixture.MustRow("DatabaseBoard.boardTestBoard").(*boards.DatabaseBoard)

	err := boardDb.DeleteBoard(board.ID)
	assert.Nil(t, err)

	_, err = boardDb.GetBoard(board.ID)
	assert.NotNil(t, err)
	assert.Equal(t, err, sql.ErrNoRows)
}
