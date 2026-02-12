package boards

import (
	"context"
	"database/sql"
	"log"
	"scrumlr.io/server/timeprovider"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"
	"github.com/uptrace/bun"
	"scrumlr.io/server/common"
	"scrumlr.io/server/initialize/testDbTemplates"
)

var nowDate = time.Date(2126, 2, 12, 10, 0, 0, 0, time.UTC)

type DatabaseBoardTestSuite struct {
	suite.Suite
	db           *bun.DB
	users        map[string]TestUser
	boards       map[string]DatabaseBoard
	sessions     map[string]TestSession
	database     BoardDatabase
	timeProvider *timeprovider.MockTimeProvider
}

func TestDatabaseBoardTestSuite(t *testing.T) {
	suite.Run(t, new(DatabaseBoardTestSuite))
}

func (suite *DatabaseBoardTestSuite) SetupTest() {
	suite.db = testDbTemplates.NewBaseTestDB(
		suite.T(),
		false,
		testDbTemplates.AdditionalSeed{
			Name: "boards_database_test_data",
			Func: suite.seedData,
		},
	)
	suite.timeProvider = timeprovider.NewMockTimeProvider(suite.T())
	suite.database = NewBoardDatabase(suite.db, suite.timeProvider)
}

func (suite *DatabaseBoardTestSuite) Test_Database_Create_Public() {
	t := suite.T()

	name := "Insert Board"
	description := "This board was inserted"

	dbBoard, err := suite.database.CreateBoard(context.Background(),
		DatabaseBoardInsert{Name: &name, Description: &description, AccessPolicy: Public},
	)

	assert.Nil(t, err)
	assert.Equal(t, &name, dbBoard.Name)
	assert.Equal(t, &description, dbBoard.Description)
	assert.Nil(t, dbBoard.Passphrase)
	assert.Nil(t, dbBoard.Salt)
	assert.Equal(t, Public, dbBoard.AccessPolicy)
}

func (suite *DatabaseBoardTestSuite) Test_Database_Create_Passphrase() {
	t := suite.T()

	name := "Insert Board"
	description := "This board was inserted"
	passphrase := "This is a super secret passphrase"
	salt := "This is also super secret"

	dbBoard, err := suite.database.CreateBoard(context.Background(),
		DatabaseBoardInsert{
			Name:         &name,
			Description:  &description,
			AccessPolicy: ByPassphrase,
			Passphrase:   &passphrase,
			Salt:         &salt,
		},
	)

	assert.Nil(t, err)
	assert.Equal(t, &name, dbBoard.Name)
	assert.Equal(t, &description, dbBoard.Description)
	assert.Equal(t, &passphrase, dbBoard.Passphrase)
	assert.Equal(t, &salt, dbBoard.Salt)
	assert.Equal(t, ByPassphrase, dbBoard.AccessPolicy)
}

func (suite *DatabaseBoardTestSuite) Test_Database_Create_ByInvite() {
	t := suite.T()

	name := "Insert Board"
	description := "This board was inserted"

	dbBoard, err := suite.database.CreateBoard(context.Background(),
		DatabaseBoardInsert{
			Name:         &name,
			Description:  &description,
			AccessPolicy: ByInvite,
		},
	)

	assert.Nil(t, err)
	assert.Equal(t, &name, dbBoard.Name)
	assert.Equal(t, &description, dbBoard.Description)
	assert.Nil(t, dbBoard.Passphrase)
	assert.Nil(t, dbBoard.Salt)
	assert.Equal(t, ByInvite, dbBoard.AccessPolicy)
}

func (suite *DatabaseBoardTestSuite) Test_Database_UpdatePublicToPassphrase() {
	t := suite.T()

	boardId := suite.boards["UpdatePassphrase"].ID
	name := "New Name"
	description := "This is a new description"
	passphrase := "SuperSecret"
	salt := "TopSecret"
	accessPolicy := ByPassphrase
	showAuthors := false
	showNotesOfOtherUsers := false
	showNoteReactions := false
	allowStacking := false
	isLocked := true

	suite.timeProvider.EXPECT().Now().Return(nowDate)

	dbBoard, err := suite.database.UpdateBoard(context.Background(), DatabaseBoardUpdate{
		ID:                    boardId,
		Name:                  &name,
		Description:           &description,
		AccessPolicy:          &accessPolicy,
		Passphrase:            &passphrase,
		Salt:                  &salt,
		ShowAuthors:           &showAuthors,
		ShowNotesOfOtherUsers: &showNotesOfOtherUsers,
		ShowNoteReactions:     &showNoteReactions,
		AllowStacking:         &allowStacking,
		IsLocked:              &isLocked,
	})

	assert.Nil(t, err)
	assert.Equal(t, boardId, dbBoard.ID)
	assert.Equal(t, &name, dbBoard.Name)
	assert.Equal(t, &description, dbBoard.Description)
	assert.Equal(t, accessPolicy, dbBoard.AccessPolicy)
	assert.Equal(t, showAuthors, dbBoard.ShowAuthors)
	assert.Equal(t, showNotesOfOtherUsers, dbBoard.ShowNotesOfOtherUsers)
	assert.Equal(t, showNoteReactions, dbBoard.ShowNoteReactions)
	assert.Equal(t, allowStacking, dbBoard.AllowStacking)
	assert.Equal(t, isLocked, dbBoard.IsLocked)
	assert.Equal(t, &passphrase, dbBoard.Passphrase)
	assert.Equal(t, &salt, dbBoard.Salt)
}

func (suite *DatabaseBoardTestSuite) Test_Database_UpdatePassphraseToPublic() {
	t := suite.T()

	boardId := suite.boards["UpdatePublic"].ID
	name := "New Name"
	description := "This is a new description"
	accessPolicy := Public
	showAuthors := false
	showNotesOfOtherUsers := false
	showNoteReactions := false
	allowStacking := false
	isLocked := true

	suite.timeProvider.EXPECT().Now().Return(nowDate)

	dbBoard, err := suite.database.UpdateBoard(context.Background(), DatabaseBoardUpdate{
		ID:                    boardId,
		Name:                  &name,
		Description:           &description,
		AccessPolicy:          &accessPolicy,
		ShowAuthors:           &showAuthors,
		ShowNotesOfOtherUsers: &showNotesOfOtherUsers,
		ShowNoteReactions:     &showNoteReactions,
		AllowStacking:         &allowStacking,
		IsLocked:              &isLocked,
	})

	assert.Nil(t, err)
	assert.Equal(t, boardId, dbBoard.ID)
	assert.Equal(t, &name, dbBoard.Name)
	assert.Equal(t, &description, dbBoard.Description)
	assert.Equal(t, accessPolicy, dbBoard.AccessPolicy)
	assert.Equal(t, showAuthors, dbBoard.ShowAuthors)
	assert.Equal(t, showNotesOfOtherUsers, dbBoard.ShowNotesOfOtherUsers)
	assert.Equal(t, showNoteReactions, dbBoard.ShowNoteReactions)
	assert.Equal(t, allowStacking, dbBoard.AllowStacking)
	assert.Equal(t, isLocked, dbBoard.IsLocked)
	assert.Nil(t, dbBoard.Passphrase)
	assert.Nil(t, dbBoard.Salt)
}

func (suite *DatabaseBoardTestSuite) Test_Database_UpdateInviteToPublic() {
	t := suite.T()

	boardId := suite.boards["UpdateInvite"].ID
	name := "New Name"
	description := "This is a new description"
	accessPolicy := Public
	showAuthors := false
	showNotesOfOtherUsers := false
	showNoteReactions := false
	allowStacking := false
	isLocked := true

	suite.timeProvider.EXPECT().Now().Return(nowDate)

	dbBoard, err := suite.database.UpdateBoard(context.Background(), DatabaseBoardUpdate{
		ID:                    boardId,
		Name:                  &name,
		Description:           &description,
		AccessPolicy:          &accessPolicy,
		ShowAuthors:           &showAuthors,
		ShowNotesOfOtherUsers: &showNotesOfOtherUsers,
		ShowNoteReactions:     &showNoteReactions,
		AllowStacking:         &allowStacking,
		IsLocked:              &isLocked,
	})

	assert.Nil(t, err)
	assert.Equal(t, boardId, dbBoard.ID)
	assert.Equal(t, &name, dbBoard.Name)
	assert.Equal(t, &description, dbBoard.Description)
	assert.Equal(t, accessPolicy, dbBoard.AccessPolicy)
	assert.Equal(t, showAuthors, dbBoard.ShowAuthors)
	assert.Equal(t, showNotesOfOtherUsers, dbBoard.ShowNotesOfOtherUsers)
	assert.Equal(t, showNoteReactions, dbBoard.ShowNoteReactions)
	assert.Equal(t, allowStacking, dbBoard.AllowStacking)
	assert.Equal(t, isLocked, dbBoard.IsLocked)
	assert.Nil(t, dbBoard.Passphrase)
	assert.Nil(t, dbBoard.Salt)
}

func (suite *DatabaseBoardTestSuite) Test_Database_UpdateInviteToPassphrase() {
	t := suite.T()

	boardId := suite.boards["UpdateInvite"].ID
	name := "New Name"
	description := "This is a new description"
	accessPolicy := ByPassphrase
	passphrase := "SuperSecret"
	salt := "TopSecret"
	showAuthors := false
	showNotesOfOtherUsers := false
	showNoteReactions := false
	allowStacking := false
	isLocked := true

	suite.timeProvider.EXPECT().Now().Return(nowDate)

	dbBoard, err := suite.database.UpdateBoard(context.Background(), DatabaseBoardUpdate{
		ID:                    boardId,
		Name:                  &name,
		Description:           &description,
		AccessPolicy:          &accessPolicy,
		Passphrase:            &passphrase,
		Salt:                  &salt,
		ShowAuthors:           &showAuthors,
		ShowNotesOfOtherUsers: &showNotesOfOtherUsers,
		ShowNoteReactions:     &showNoteReactions,
		AllowStacking:         &allowStacking,
		IsLocked:              &isLocked,
	})

	assert.Nil(t, err)
	assert.Equal(t, boardId, dbBoard.ID)
	assert.Equal(t, &name, dbBoard.Name)
	assert.Equal(t, &description, dbBoard.Description)
	assert.Equal(t, accessPolicy, dbBoard.AccessPolicy)
	assert.Equal(t, showAuthors, dbBoard.ShowAuthors)
	assert.Equal(t, showNotesOfOtherUsers, dbBoard.ShowNotesOfOtherUsers)
	assert.Equal(t, showNoteReactions, dbBoard.ShowNoteReactions)
	assert.Equal(t, allowStacking, dbBoard.AllowStacking)
	assert.Equal(t, isLocked, dbBoard.IsLocked)
	assert.NotNil(t, dbBoard.Passphrase)
	assert.NotNil(t, dbBoard.Salt)
}

func (suite *DatabaseBoardTestSuite) Test_Database_UpdateTimer() {
	t := suite.T()
	mockClock := timeprovider.NewMockTimeProvider(t)

	boardId := suite.boards["Timer"].ID
	mockTime := time.Date(2024, 1, 15, 10, 0, 0, 0, time.UTC)
	mockClock.EXPECT().Now().Return(mockTime)
	startTime := mockClock.Now().UTC().Round(time.Millisecond)
	endTime := startTime.Add(time.Minute * 2)

	dbBoard, err := suite.database.UpdateBoardTimer(context.Background(), DatabaseBoardTimerUpdate{ID: boardId, TimerStart: &startTime, TimerEnd: &endTime})

	assert.Nil(t, err)
	assert.Equal(t, boardId, dbBoard.ID)
	assert.Equal(t, &startTime, dbBoard.TimerStart)
	assert.Equal(t, &endTime, dbBoard.TimerEnd)
}

func (suite *DatabaseBoardTestSuite) Test_Database_UpdateBoard_SetsLastModifiedAt() {
	t := suite.T()

	boardId := suite.boards["UpdatePassphrase"].ID

	boardBefore, err := suite.database.GetBoard(context.Background(), boardId)
	assert.Nil(t, err)

	suite.timeProvider.EXPECT().Now().Return(nowDate)

	newName := "Updated Name"
	dbBoard, err := suite.database.UpdateBoard(context.Background(), DatabaseBoardUpdate{
		ID:   boardId,
		Name: &newName,
	})

	assert.Nil(t, err)
	assert.Equal(t, boardId, dbBoard.ID)
	assert.Equal(t, &newName, dbBoard.Name)

	assert.True(t, dbBoard.LastModifiedAt.After(boardBefore.LastModifiedAt), "LastModifiedAt should be after the previous value")
	assert.True(t, dbBoard.LastModifiedAt.After(nowDate) || dbBoard.LastModifiedAt.Equal(nowDate), "LastModifiedAt should be at or after timeBeforeUpdate")
}

func (suite *DatabaseBoardTestSuite) Test_Database_Delete() {
	t := suite.T()

	boardId := suite.boards["Delete"].ID

	err := suite.database.DeleteBoard(context.Background(), boardId)

	assert.Nil(t, err)
}

func (suite *DatabaseBoardTestSuite) Test_Database_Get() {
	t := suite.T()

	boardId := suite.boards["Read1"].ID

	dbBoard, err := suite.database.GetBoard(context.Background(), boardId)

	assert.Nil(t, err)
	assert.Equal(t, boardId, dbBoard.ID)
	assert.Equal(t, suite.boards["Read1"].Name, dbBoard.Name)
	assert.Equal(t, suite.boards["Read1"].Description, dbBoard.Description)
	assert.Equal(t, suite.boards["Read1"].AccessPolicy, dbBoard.AccessPolicy)
	assert.Equal(t, suite.boards["Read1"].ShowAuthors, dbBoard.ShowAuthors)
	assert.Equal(t, suite.boards["Read1"].ShowNotesOfOtherUsers, dbBoard.ShowNotesOfOtherUsers)
	assert.Equal(t, suite.boards["Read1"].ShowNoteReactions, dbBoard.ShowNoteReactions)
	assert.Equal(t, suite.boards["Read1"].AllowStacking, dbBoard.AllowStacking)
	assert.Equal(t, suite.boards["Read1"].IsLocked, dbBoard.IsLocked)
	assert.Equal(t, suite.boards["Read1"].Passphrase, dbBoard.Passphrase)
	assert.Equal(t, suite.boards["Read1"].Salt, dbBoard.Salt)
	assert.NotNil(t, dbBoard.CreatedAt)
	assert.Nil(t, dbBoard.TimerStart)
	assert.Nil(t, dbBoard.TimerEnd)
}

func (suite *DatabaseBoardTestSuite) Test_Database_Get_NotFound() {
	t := suite.T()
	boardId := uuid.New()

	dbBoard, err := suite.database.GetBoard(context.Background(), boardId)

	assert.NotNil(t, err)
	assert.Equal(t, sql.ErrNoRows, err)
	assert.Equal(t, DatabaseBoard{}, dbBoard)
}

func (suite *DatabaseBoardTestSuite) Test_Database_GetByUser() {
	t := suite.T()
	userId := suite.users["Stan"].id

	dbBoards, err := suite.database.GetBoards(context.Background(), userId)

	assert.Nil(t, err)
	assert.Len(t, dbBoards, 2)

	firstBoard := checkDbBoardInList(dbBoards, suite.boards["Read1"].ID)
	assert.NotNil(t, firstBoard)
	assert.Equal(t, suite.boards["Read1"].ID, firstBoard.ID)
	assert.Equal(t, suite.boards["Read1"].Name, firstBoard.Name)
	assert.Equal(t, suite.boards["Read1"].Description, firstBoard.Description)
	assert.Equal(t, suite.boards["Read1"].AccessPolicy, firstBoard.AccessPolicy)
	assert.Equal(t, suite.boards["Read1"].ShowAuthors, firstBoard.ShowAuthors)
	assert.Equal(t, suite.boards["Read1"].ShowNotesOfOtherUsers, firstBoard.ShowNotesOfOtherUsers)
	assert.Equal(t, suite.boards["Read1"].ShowNoteReactions, firstBoard.ShowNoteReactions)
	assert.Equal(t, suite.boards["Read1"].AllowStacking, firstBoard.AllowStacking)
	assert.Equal(t, suite.boards["Read1"].IsLocked, firstBoard.IsLocked)

	secondBoard := checkDbBoardInList(dbBoards, suite.boards["Read2"].ID)
	assert.NotNil(t, secondBoard)
	assert.Equal(t, suite.boards["Read2"].ID, secondBoard.ID)
	assert.Equal(t, suite.boards["Read2"].Name, secondBoard.Name)
	assert.Equal(t, suite.boards["Read2"].Description, secondBoard.Description)
	assert.Equal(t, suite.boards["Read2"].AccessPolicy, secondBoard.AccessPolicy)
	assert.Equal(t, suite.boards["Read2"].ShowAuthors, secondBoard.ShowAuthors)
	assert.Equal(t, suite.boards["Read2"].ShowNotesOfOtherUsers, secondBoard.ShowNotesOfOtherUsers)
	assert.Equal(t, suite.boards["Read2"].ShowNoteReactions, secondBoard.ShowNoteReactions)
	assert.Equal(t, suite.boards["Read2"].AllowStacking, secondBoard.AllowStacking)
	assert.Equal(t, suite.boards["Read2"].IsLocked, secondBoard.IsLocked)
}

func (suite *DatabaseBoardTestSuite) Test_Database_GetByUser_NotFound() {
	t := suite.T()
	userId := uuid.New()

	dbBoards, err := suite.database.GetBoards(context.Background(), userId)

	assert.Nil(t, err)
	assert.Len(t, dbBoards, 0)
}

type TestUser struct {
	id          uuid.UUID
	name        string
	accountType common.AccountType
}

type TestSession struct {
	board uuid.UUID
	user  uuid.UUID
}

func (suite *DatabaseBoardTestSuite) seedData(db *bun.DB) {
	log.Println("Seeding boards database test data")

	// tests users
	suite.users = make(map[string]TestUser, 2)
	suite.users["Stan"] = TestUser{id: uuid.New(), name: "Stan", accountType: common.Google}
	suite.users["Santa"] = TestUser{id: uuid.New(), name: "Santa", accountType: common.Anonymous}

	// tests boards
	suite.boards = make(map[string]DatabaseBoard, 10)
	firstReadName := "Read1"
	firstReadDescription := "This is a board"
	suite.boards["Read1"] = DatabaseBoard{ID: uuid.New(), Name: &firstReadName, Description: &firstReadDescription, Passphrase: nil, Salt: nil, AccessPolicy: Public, ShowAuthors: true, ShowNotesOfOtherUsers: true, ShowNoteReactions: true, AllowStacking: true, IsLocked: false}
	secondReadName := "Read2"
	secondReadDescription := "This is also a board"
	suite.boards["Read2"] = DatabaseBoard{ID: uuid.New(), Name: &secondReadName, Description: &secondReadDescription, Passphrase: nil, Salt: nil, AccessPolicy: Public, ShowAuthors: true, ShowNotesOfOtherUsers: true, ShowNoteReactions: true, AllowStacking: true, IsLocked: false}
	timerName := "TimerUpdate"
	timerDescription := "This is a board to update the timer"
	suite.boards["Timer"] = DatabaseBoard{ID: uuid.New(), Name: &timerName, Description: &timerDescription, Passphrase: nil, Salt: nil, AccessPolicy: Public, ShowAuthors: true, ShowNotesOfOtherUsers: true, ShowNoteReactions: true, AllowStacking: true, IsLocked: false}
	updateNamePassphrase := "UpdatePassphrase"
	updateDescriptionPassphrase := "This is a board to update"
	suite.boards["UpdatePassphrase"] = DatabaseBoard{ID: uuid.New(), Name: &updateNamePassphrase, Description: &updateDescriptionPassphrase, Passphrase: nil, Salt: nil, AccessPolicy: Public, ShowAuthors: true, ShowNotesOfOtherUsers: true, ShowNoteReactions: true, AllowStacking: true, IsLocked: false}
	updateNameFailPassphrase := "Update"
	updateDescriptionFailPassphrase := "This is a board to update"
	suite.boards["UpdateFailPassphrase"] = DatabaseBoard{ID: uuid.New(), Name: &updateNameFailPassphrase, Description: &updateDescriptionFailPassphrase, Passphrase: nil, Salt: nil, AccessPolicy: Public, ShowAuthors: true, ShowNotesOfOtherUsers: true, ShowNoteReactions: true, AllowStacking: true, IsLocked: false}
	updateNamePublic := "Update"
	updateDescriptionPublic := "This is a board to update"
	suite.boards["UpdatePublic"] = DatabaseBoard{ID: uuid.New(), Name: &updateNamePublic, Description: &updateDescriptionPublic, Passphrase: nil, Salt: nil, AccessPolicy: ByPassphrase, ShowAuthors: true, ShowNotesOfOtherUsers: true, ShowNoteReactions: true, AllowStacking: true, IsLocked: false}
	updateNameFailPublic := "Update"
	updateDescriptionFailPublic := "This is a board to update"
	suite.boards["UpdateFailPublic"] = DatabaseBoard{ID: uuid.New(), Name: &updateNameFailPublic, Description: &updateDescriptionFailPublic, Passphrase: nil, Salt: nil, AccessPolicy: ByPassphrase, ShowAuthors: true, ShowNotesOfOtherUsers: true, ShowNoteReactions: true, AllowStacking: true, IsLocked: false}
	updateNameInvite := "Update"
	updateDescriptionInvite := "This is a board to update"
	suite.boards["UpdateInvite"] = DatabaseBoard{ID: uuid.New(), Name: &updateNameInvite, Description: &updateDescriptionInvite, Passphrase: nil, Salt: nil, AccessPolicy: ByInvite, ShowAuthors: true, ShowNotesOfOtherUsers: true, ShowNoteReactions: true, AllowStacking: true, IsLocked: false}
	updateNameFailInvite := "Update"
	updateDescriptionFailInvite := "This is a board to update"
	suite.boards["UpdateFailInvite"] = DatabaseBoard{ID: uuid.New(), Name: &updateNameFailInvite, Description: &updateDescriptionFailInvite, Passphrase: nil, Salt: nil, AccessPolicy: ByInvite, ShowAuthors: true, ShowNotesOfOtherUsers: true, ShowNoteReactions: true, AllowStacking: true, IsLocked: false}
	deleteName := "DeleteBoard"
	deleteDescription := "This is a board to delete"
	suite.boards["Delete"] = DatabaseBoard{ID: uuid.New(), Name: &deleteName, Description: &deleteDescription, Passphrase: nil, Salt: nil, AccessPolicy: Public, ShowAuthors: true, ShowNotesOfOtherUsers: true, ShowNoteReactions: true, AllowStacking: true, IsLocked: false}

	// test sessions
	suite.sessions = make(map[string]TestSession, 2)
	suite.sessions["Read1"] = TestSession{board: suite.boards["Read1"].ID, user: suite.users["Stan"].id}
	suite.sessions["Read2"] = TestSession{board: suite.boards["Read2"].ID, user: suite.users["Stan"].id}

	for _, user := range suite.users {
		err := testDbTemplates.InsertUser(db, user.id, user.name, string(user.accountType))
		if err != nil {
			log.Fatalf("Failed to insert test user %s", err)
		}
	}

	for _, board := range suite.boards {
		err := testDbTemplates.InsertBoard(db, board.ID, *board.Name, *board.Description, board.Passphrase, board.Salt, string(board.AccessPolicy), board.ShowAuthors, board.ShowNotesOfOtherUsers, board.ShowNoteReactions, board.AllowStacking, board.IsLocked)
		if err != nil {
			log.Fatalf("Failed to insert test boards %s", err)
		}
	}

	for _, session := range suite.sessions {
		err := testDbTemplates.InsertSession(db, session.user, session.board, string(common.ParticipantRole), false, true, true, false)
		if err != nil {
			log.Fatalf("Failed to insert test sessions %s", err)
		}
	}
}

func checkDbBoardInList(list []DatabaseBoard, id uuid.UUID) *DatabaseBoard {
	for _, board := range list {
		if board.ID == id {
			return &board
		}
	}
	return nil
}
