package boards

import (
	"context"
	"database/sql"
	"errors"
	"log"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"
	"github.com/testcontainers/testcontainers-go"
	"github.com/testcontainers/testcontainers-go/modules/postgres"
	"github.com/uptrace/bun"
	"scrumlr.io/server/columns"
	"scrumlr.io/server/common"
	"scrumlr.io/server/databaseinitialize"
)

const POSTGRES_IMAGE = "postgres:17.5-alpine"
const DATABASE_NAME = "scrumlr_test"
const DATABASE_USERNAME = "stan"
const DATABASE_PASSWORD = "scrumlr"

type DatabaseBoardTestSuite struct {
	suite.Suite
	container *postgres.PostgresContainer
	db        *bun.DB
	users     map[string]TestUser
	boards    map[string]DatabaseBoard
	sessions  map[string]TestSession
}

func TestDatabaseBoardTemplateTestSuite(t *testing.T) {
	suite.Run(t, new(DatabaseBoardTestSuite))
}

func (suite *DatabaseBoardTestSuite) SetupSuite() {
	ctx := context.Background()
	pgcontainer, err := postgres.Run( //creating database
		ctx,
		POSTGRES_IMAGE,
		postgres.WithDatabase(DATABASE_NAME),
		postgres.WithUsername(DATABASE_USERNAME),
		postgres.WithPassword(DATABASE_PASSWORD),
		postgres.BasicWaitStrategies(),
	)

	if err != nil {
		log.Fatalf("Failed to start container: %s", err)
	}

	connectionString, err := pgcontainer.ConnectionString(ctx, "sslmode=disable")
	if err != nil {
		log.Fatalf("Failed to get connection string %s", err)
	}

	db, err := databaseinitialize.InitializeDatabase(connectionString) //migrating database
	if err != nil {
		log.Fatalf("Failed to initialize database %s", err)
	}

	bunDb := databaseinitialize.InitializeBun(db, true) // setup bun

	suite.SeedDatabase(bunDb)

	suite.container = pgcontainer
	suite.db = bunDb
}

func (suite *DatabaseBoardTestSuite) TearDownSuite() {
	if err := testcontainers.TerminateContainer(suite.container); err != nil {
		log.Fatalf("Failed to terminate container: %s", err)
	}
}

func (suite *DatabaseBoardTestSuite) Test_Database_Create_Public() {
	t := suite.T()
	database := NewBoardDatabase(suite.db)

	userId := suite.users["Santa"].id
	name := "Insert Board"
	description := "This board was inserted"

	dbBoard, err := database.CreateBoard(userId,
		DatabaseBoardInsert{Name: &name, Description: &description, AccessPolicy: Public},
		[]columns.DatabaseColumnInsert{
			{Name: "Column 1", Description: "This is a description", Color: columns.ColorGoalGreen},
			{Name: "Column 2", Description: "This is a description", Color: columns.ColorGoalGreen},
		},
	)

	assert.Nil(t, err)
	assert.Equal(t, &name, dbBoard.Name)
	assert.Equal(t, &description, dbBoard.Description)
	assert.Nil(t, dbBoard.Passphrase)
	assert.Nil(t, dbBoard.Salt)
	assert.Equal(t, Public, dbBoard.AccessPolicy)
}

func (suite *DatabaseBoardTestSuite) Test_Database_Create_PublicWithPassphrase() {
	t := suite.T()
	database := NewBoardDatabase(suite.db)

	userId := suite.users["Santa"].id
	name := "Insert Board"
	description := "This board was inserted"
	passphrase := "This is a super secret passphrase"

	dbBoard, err := database.CreateBoard(userId,
		DatabaseBoardInsert{Name: &name, Description: &description, AccessPolicy: Public, Passphrase: &passphrase},
		[]columns.DatabaseColumnInsert{
			{Name: "Column 1", Description: "This is a description", Color: columns.ColorGoalGreen},
			{Name: "Column 2", Description: "This is a description", Color: columns.ColorGoalGreen},
		},
	)

	assert.NotNil(t, err)
	assert.Equal(t, errors.New("passphrase or salt should not be set for policies except 'BY_PASSPHRASE'"), err)
	assert.Equal(t, DatabaseBoard{}, dbBoard)
}

func (suite *DatabaseBoardTestSuite) Test_Database_Create_PublicWithSalt() {
	t := suite.T()
	database := NewBoardDatabase(suite.db)

	userId := suite.users["Santa"].id
	name := "Insert Board"
	description := "This board was inserted"
	salt := "This is also super secret"

	dbBoard, err := database.CreateBoard(userId,
		DatabaseBoardInsert{Name: &name, Description: &description, AccessPolicy: Public, Salt: &salt},
		[]columns.DatabaseColumnInsert{
			{Name: "Column 1", Description: "This is a description", Color: columns.ColorGoalGreen},
			{Name: "Column 2", Description: "This is a description", Color: columns.ColorGoalGreen},
		},
	)

	assert.NotNil(t, err)
	assert.Equal(t, errors.New("passphrase or salt should not be set for policies except 'BY_PASSPHRASE'"), err)
	assert.Equal(t, DatabaseBoard{}, dbBoard)
}

func (suite *DatabaseBoardTestSuite) Test_Database_Create_Passphrase() {
	t := suite.T()
	database := NewBoardDatabase(suite.db)

	userId := suite.users["Santa"].id
	name := "Insert Board"
	description := "This board was inserted"
	passphrase := "This is a super secret passphrase"
	salt := "This is also super secret"

	dbBoard, err := database.CreateBoard(userId,
		DatabaseBoardInsert{Name: &name, Description: &description, AccessPolicy: ByPassphrase, Passphrase: &passphrase, Salt: &salt},
		[]columns.DatabaseColumnInsert{
			{Name: "Column 1", Description: "This is a description", Color: columns.ColorGoalGreen},
			{Name: "Column 2", Description: "This is a description", Color: columns.ColorGoalGreen},
		},
	)

	assert.Nil(t, err)
	assert.Equal(t, &name, dbBoard.Name)
	assert.Equal(t, &description, dbBoard.Description)
	assert.Equal(t, &passphrase, dbBoard.Passphrase)
	assert.Equal(t, &salt, dbBoard.Salt)
	assert.Equal(t, ByPassphrase, dbBoard.AccessPolicy)
}

func (suite *DatabaseBoardTestSuite) Test_Database_Create_PassphraseWithoutPassphrase() {
	t := suite.T()
	database := NewBoardDatabase(suite.db)

	userId := suite.users["Santa"].id
	name := "Insert Board"
	description := "This board was inserted"
	salt := "This is also super secret"

	dbBoard, err := database.CreateBoard(userId,
		DatabaseBoardInsert{Name: &name, Description: &description, AccessPolicy: ByPassphrase, Salt: &salt},
		[]columns.DatabaseColumnInsert{
			{Name: "Column 1", Description: "This is a description", Color: columns.ColorGoalGreen},
			{Name: "Column 2", Description: "This is a description", Color: columns.ColorGoalGreen},
		},
	)

	assert.NotNil(t, err)
	assert.Equal(t, errors.New("passphrase or salt may not be empty"), err)
	assert.Equal(t, DatabaseBoard{}, dbBoard)
}

func (suite *DatabaseBoardTestSuite) Test_Database_Create_PassphraseWithoutSalt() {
	t := suite.T()
	database := NewBoardDatabase(suite.db)

	userId := suite.users["Santa"].id
	name := "Insert Board"
	description := "This board was inserted"
	passphrase := "This is a super secret passphrase"

	dbBoard, err := database.CreateBoard(userId,
		DatabaseBoardInsert{Name: &name, Description: &description, AccessPolicy: ByPassphrase, Passphrase: &passphrase},
		[]columns.DatabaseColumnInsert{
			{Name: "Column 1", Description: "This is a description", Color: columns.ColorGoalGreen},
			{Name: "Column 2", Description: "This is a description", Color: columns.ColorGoalGreen},
		},
	)

	assert.NotNil(t, err)
	assert.Equal(t, errors.New("passphrase or salt may not be empty"), err)
	assert.Equal(t, DatabaseBoard{}, dbBoard)
}

func (suite *DatabaseBoardTestSuite) Test_Database_Create_ByInvite() {
	t := suite.T()
	database := NewBoardDatabase(suite.db)

	userId := suite.users["Santa"].id
	name := "Insert Board"
	description := "This board was inserted"

	dbBoard, err := database.CreateBoard(userId,
		DatabaseBoardInsert{Name: &name, Description: &description, AccessPolicy: ByInvite},
		[]columns.DatabaseColumnInsert{
			{Name: "Column 1", Description: "This is a description", Color: columns.ColorGoalGreen},
			{Name: "Column 2", Description: "This is a description", Color: columns.ColorGoalGreen},
		},
	)

	assert.Nil(t, err)
	assert.Equal(t, &name, dbBoard.Name)
	assert.Equal(t, &description, dbBoard.Description)
	assert.Nil(t, dbBoard.Passphrase)
	assert.Nil(t, dbBoard.Salt)
	assert.Equal(t, ByInvite, dbBoard.AccessPolicy)
}

func (suite *DatabaseBoardTestSuite) Test_Database_Create_ByInviteWithPassphrase() {
	t := suite.T()
	database := NewBoardDatabase(suite.db)

	userId := suite.users["Santa"].id
	name := "Insert Board"
	description := "This board was inserted"
	passphrase := "This is a super secret passphrase"

	dbBoard, err := database.CreateBoard(userId,
		DatabaseBoardInsert{Name: &name, Description: &description, AccessPolicy: ByInvite, Passphrase: &passphrase},
		[]columns.DatabaseColumnInsert{
			{Name: "Column 1", Description: "This is a description", Color: columns.ColorGoalGreen},
			{Name: "Column 2", Description: "This is a description", Color: columns.ColorGoalGreen},
		},
	)

	assert.NotNil(t, err)
	assert.Equal(t, errors.New("passphrase or salt should not be set for policies except 'BY_PASSPHRASE'"), err)
	assert.Equal(t, DatabaseBoard{}, dbBoard)
}

func (suite *DatabaseBoardTestSuite) Test_Database_Create_ByInviteWithSalt() {
	t := suite.T()
	database := NewBoardDatabase(suite.db)

	userId := suite.users["Santa"].id
	name := "Insert Board"
	description := "This board was inserted"
	salt := "This is also super secret"

	dbBoard, err := database.CreateBoard(userId,
		DatabaseBoardInsert{Name: &name, Description: &description, AccessPolicy: ByInvite, Salt: &salt},
		[]columns.DatabaseColumnInsert{
			{Name: "Column 1", Description: "This is a description", Color: columns.ColorGoalGreen},
			{Name: "Column 2", Description: "This is a description", Color: columns.ColorGoalGreen},
		},
	)

	assert.NotNil(t, err)
	assert.Equal(t, errors.New("passphrase or salt should not be set for policies except 'BY_PASSPHRASE'"), err)
	assert.Equal(t, DatabaseBoard{}, dbBoard)
}

func (suite *DatabaseBoardTestSuite) Test_Database_UpdatePublicToPassphrase() {
	t := suite.T()
	database := NewBoardDatabase(suite.db)

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

	dbBoard, err := database.UpdateBoard(DatabaseBoardUpdate{
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

func (suite *DatabaseBoardTestSuite) Test_Database_UpdatePublicToPassphrase_WithoutPassphrase() {
	t := suite.T()
	database := NewBoardDatabase(suite.db)

	boardId := suite.boards["UpdateFailPassphrase"].ID
	name := "New Name"
	description := "This is a new description"
	salt := "TopSecret"
	accessPolicy := ByPassphrase
	showAuthors := false
	showNotesOfOtherUsers := false
	showNoteReactions := false
	allowStacking := false
	isLocked := true

	dbBoard, err := database.UpdateBoard(DatabaseBoardUpdate{
		ID:                    boardId,
		Name:                  &name,
		Description:           &description,
		AccessPolicy:          &accessPolicy,
		Salt:                  &salt,
		ShowAuthors:           &showAuthors,
		ShowNotesOfOtherUsers: &showNotesOfOtherUsers,
		ShowNoteReactions:     &showNoteReactions,
		AllowStacking:         &allowStacking,
		IsLocked:              &isLocked,
	})

	assert.NotNil(t, err)
	assert.Equal(t, errors.New("passphrase and salt should be set when access policy is updated"), err)
	assert.Equal(t, DatabaseBoard{}, dbBoard)
}

func (suite *DatabaseBoardTestSuite) Test_Database_UpdatePublicToPassphrase_WithoutSalt() {
	t := suite.T()
	database := NewBoardDatabase(suite.db)

	boardId := suite.boards["UpdateFailPassphrase"].ID
	name := "New Name"
	description := "This is a new description"
	passphrase := "SuperSecret"
	accessPolicy := ByPassphrase
	showAuthors := false
	showNotesOfOtherUsers := false
	showNoteReactions := false
	allowStacking := false
	isLocked := true

	dbBoard, err := database.UpdateBoard(DatabaseBoardUpdate{
		ID:                    boardId,
		Name:                  &name,
		Description:           &description,
		AccessPolicy:          &accessPolicy,
		Passphrase:            &passphrase,
		ShowAuthors:           &showAuthors,
		ShowNotesOfOtherUsers: &showNotesOfOtherUsers,
		ShowNoteReactions:     &showNoteReactions,
		AllowStacking:         &allowStacking,
		IsLocked:              &isLocked,
	})

	assert.NotNil(t, err)
	assert.Equal(t, errors.New("passphrase and salt should be set when access policy is updated"), err)
	assert.Equal(t, DatabaseBoard{}, dbBoard)
}

func (suite *DatabaseBoardTestSuite) Test_Database_UpdatePassphraseToPublic() {
	t := suite.T()
	database := NewBoardDatabase(suite.db)

	boardId := suite.boards["UpdatePublic"].ID
	name := "New Name"
	description := "This is a new description"
	accessPolicy := Public
	showAuthors := false
	showNotesOfOtherUsers := false
	showNoteReactions := false
	allowStacking := false
	isLocked := true

	dbBoard, err := database.UpdateBoard(DatabaseBoardUpdate{
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

func (suite *DatabaseBoardTestSuite) Test_Database_UpdatePassphraseToPublic_WithPassphrase() {
	t := suite.T()
	database := NewBoardDatabase(suite.db)

	boardId := suite.boards["UpdateFailPublic"].ID
	name := "New Name"
	description := "This is a new description"
	passphrase := "SuperSecret"
	accessPolicy := Public
	showAuthors := false
	showNotesOfOtherUsers := false
	showNoteReactions := false
	allowStacking := false
	isLocked := true

	dbBoard, err := database.UpdateBoard(DatabaseBoardUpdate{
		ID:                    boardId,
		Name:                  &name,
		Description:           &description,
		AccessPolicy:          &accessPolicy,
		Passphrase:            &passphrase,
		ShowAuthors:           &showAuthors,
		ShowNotesOfOtherUsers: &showNotesOfOtherUsers,
		ShowNoteReactions:     &showNoteReactions,
		AllowStacking:         &allowStacking,
		IsLocked:              &isLocked,
	})

	assert.NotNil(t, err)
	assert.Equal(t, errors.New("passphrase and salt should not be set if access policy is defined as 'BY_PASSPHRASE'"), err)
	assert.Equal(t, DatabaseBoard{}, dbBoard)
}

func (suite *DatabaseBoardTestSuite) Test_Database_UpdatePassphraseToPublic_WithSalt() {
	t := suite.T()
	database := NewBoardDatabase(suite.db)

	boardId := suite.boards["UpdateFailPublic"].ID
	name := "New Name"
	description := "This is a new description"
	salt := "TopSecret"
	accessPolicy := Public
	showAuthors := false
	showNotesOfOtherUsers := false
	showNoteReactions := false
	allowStacking := false
	isLocked := true

	dbBoard, err := database.UpdateBoard(DatabaseBoardUpdate{
		ID:                    boardId,
		Name:                  &name,
		Description:           &description,
		AccessPolicy:          &accessPolicy,
		Salt:                  &salt,
		ShowAuthors:           &showAuthors,
		ShowNotesOfOtherUsers: &showNotesOfOtherUsers,
		ShowNoteReactions:     &showNoteReactions,
		AllowStacking:         &allowStacking,
		IsLocked:              &isLocked,
	})

	assert.NotNil(t, err)
	assert.Equal(t, errors.New("passphrase and salt should not be set if access policy is defined as 'BY_PASSPHRASE'"), err)
	assert.Equal(t, DatabaseBoard{}, dbBoard)
}

func (suite *DatabaseBoardTestSuite) Test_Database_UpdateInviteToPublic() {
	t := suite.T()
	database := NewBoardDatabase(suite.db)

	boardId := suite.boards["UpdateInvite"].ID
	name := "New Name"
	description := "This is a new description"
	accessPolicy := Public
	showAuthors := false
	showNotesOfOtherUsers := false
	showNoteReactions := false
	allowStacking := false
	isLocked := true

	dbBoard, err := database.UpdateBoard(DatabaseBoardUpdate{
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

	assert.NotNil(t, err)
	assert.Equal(t, sql.ErrNoRows, err)
	assert.Equal(t, DatabaseBoard{}, dbBoard)
}

func (suite *DatabaseBoardTestSuite) Test_Database_UpdateInviteToPassphrase() {
	t := suite.T()
	database := NewBoardDatabase(suite.db)

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

	dbBoard, err := database.UpdateBoard(DatabaseBoardUpdate{
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

	assert.NotNil(t, err)
	assert.Equal(t, sql.ErrNoRows, err)
	assert.Equal(t, DatabaseBoard{}, dbBoard)
}

func (suite *DatabaseBoardTestSuite) Test_Database_UpdateTimer() {
	t := suite.T()
	database := NewBoardDatabase(suite.db)

	boardId := suite.boards["Timer"].ID
	startTime := time.Now().UTC().Round(time.Millisecond)
	endTime := startTime.Add(time.Minute * 2)

	dbBoard, err := database.UpdateBoardTimer(DatabaseBoardTimerUpdate{ID: boardId, TimerStart: &startTime, TimerEnd: &endTime})

	assert.Nil(t, err)
	assert.Equal(t, boardId, dbBoard.ID)
	assert.Equal(t, &startTime, dbBoard.TimerStart)
	assert.Equal(t, &endTime, dbBoard.TimerEnd)
}

func (suite *DatabaseBoardTestSuite) Test_Database_Delete() {
	t := suite.T()
	database := NewBoardDatabase(suite.db)

	boardId := suite.boards["Delete"].ID

	err := database.DeleteBoard(boardId)

	assert.Nil(t, err)
}

func (suite *DatabaseBoardTestSuite) Test_Database_Get() {
	t := suite.T()
	database := NewBoardDatabase(suite.db)

	boardId := suite.boards["Read1"].ID

	dbBoard, err := database.GetBoard(boardId)

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
	database := NewBoardDatabase(suite.db)

	boardId := uuid.New()

	dbBoard, err := database.GetBoard(boardId)

	assert.NotNil(t, err)
	assert.Equal(t, sql.ErrNoRows, err)
	assert.Equal(t, DatabaseBoard{}, dbBoard)
}

func (suite *DatabaseBoardTestSuite) Test_Database_GetByUser() {
	t := suite.T()
	database := NewBoardDatabase(suite.db)

	userId := suite.users["Stan"].id

	dbBoards, err := database.GetBoards(userId)

	assert.Nil(t, err)
	assert.Len(t, dbBoards, 2)

	assert.Equal(t, suite.boards["Read1"].ID, dbBoards[0].ID)
	assert.Equal(t, suite.boards["Read1"].Name, dbBoards[0].Name)
	assert.Equal(t, suite.boards["Read1"].Description, dbBoards[0].Description)
	assert.Equal(t, suite.boards["Read1"].AccessPolicy, dbBoards[0].AccessPolicy)
	assert.Equal(t, suite.boards["Read1"].ShowAuthors, dbBoards[0].ShowAuthors)
	assert.Equal(t, suite.boards["Read1"].ShowNotesOfOtherUsers, dbBoards[0].ShowNotesOfOtherUsers)
	assert.Equal(t, suite.boards["Read1"].ShowNoteReactions, dbBoards[0].ShowNoteReactions)
	assert.Equal(t, suite.boards["Read1"].AllowStacking, dbBoards[0].AllowStacking)
	assert.Equal(t, suite.boards["Read1"].IsLocked, dbBoards[0].IsLocked)

	assert.Equal(t, suite.boards["Read2"].ID, dbBoards[0].ID)
	assert.Equal(t, suite.boards["Read2"].Name, dbBoards[0].Name)
	assert.Equal(t, suite.boards["Read2"].Description, dbBoards[0].Description)
	assert.Equal(t, suite.boards["Read2"].AccessPolicy, dbBoards[0].AccessPolicy)
	assert.Equal(t, suite.boards["Read2"].ShowAuthors, dbBoards[0].ShowAuthors)
	assert.Equal(t, suite.boards["Read2"].ShowNotesOfOtherUsers, dbBoards[0].ShowNotesOfOtherUsers)
	assert.Equal(t, suite.boards["Read2"].ShowNoteReactions, dbBoards[0].ShowNoteReactions)
	assert.Equal(t, suite.boards["Read2"].AllowStacking, dbBoards[0].AllowStacking)
	assert.Equal(t, suite.boards["Read2"].IsLocked, dbBoards[0].IsLocked)
}

func (suite *DatabaseBoardTestSuite) Test_Database_GetByUser_NotFound() {
	t := suite.T()
	database := NewBoardDatabase(suite.db)

	userId := uuid.New()

	dbBoards, err := database.GetBoards(userId)

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

func (suite *DatabaseBoardTestSuite) SeedDatabase(db *bun.DB) {
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
		err := databaseinitialize.InsertUser(db, user.id, user.name, string(user.accountType))
		if err != nil {
			log.Fatalf("Failed to insert test user %s", err)
		}
	}

	for _, board := range suite.boards {
		err := databaseinitialize.InsertBoard(db, board.ID, *board.Name, *board.Description, board.Passphrase, board.Salt, string(board.AccessPolicy), board.ShowAuthors, board.ShowNotesOfOtherUsers, board.ShowNoteReactions, board.AllowStacking, board.IsLocked)
		if err != nil {
			log.Fatalf("Failed to insert test boards %s", err)
		}
	}

	for _, session := range suite.sessions {
		err := databaseinitialize.InsertSession(db, session.user, session.board, string(common.ParticipantRole), false, true, true, false)
		if err != nil {
			log.Fatalf("Failed to insert test sessions %s", err)
		}
	}
}
