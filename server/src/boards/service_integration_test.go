package boards

import (
	"context"
	"database/sql"
	"log"
	"testing"
	"time"

	"scrumlr.io/server/websocket"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"github.com/stretchr/testify/suite"
	"github.com/testcontainers/testcontainers-go/modules/nats"
	"github.com/uptrace/bun"
	"scrumlr.io/server/cache"
	"scrumlr.io/server/columns"
	"scrumlr.io/server/common"
	"scrumlr.io/server/hash"
	"scrumlr.io/server/initialize"
	"scrumlr.io/server/initialize/testDbTemplates"
	"scrumlr.io/server/notes"
	"scrumlr.io/server/reactions"
	"scrumlr.io/server/realtime"
	"scrumlr.io/server/sessionrequests"
	"scrumlr.io/server/sessions"
	"scrumlr.io/server/technical_helper"
	"scrumlr.io/server/timeprovider"
	"scrumlr.io/server/votings"
)

type testSession struct {
	board uuid.UUID
	user  uuid.UUID
}

type BoardServiceIntegrationTestSuite struct {
	suite.Suite
	natsContainer        *nats.NATSContainer
	natsConnectionString string
	broker               *realtime.Broker
	service              BoardService

	// Additional test-specific data
	users    map[string]testDbTemplates.TestUser
	boards   map[string]Board
	sessions map[string]testSession
}

func TestBoardServiceIntegrationTestSuite(t *testing.T) {
	suite.Run(t, new(BoardServiceIntegrationTestSuite))
}

func (suite *BoardServiceIntegrationTestSuite) SetupSuite() {
	natsContainer, connectionString := initialize.StartTestNats()

	suite.natsContainer = natsContainer
	suite.natsConnectionString = connectionString
	suite.initTestData()
}

func (suite *BoardServiceIntegrationTestSuite) TearDownSuite() {
	initialize.StopTestNats(suite.natsContainer)
}

func (suite *BoardServiceIntegrationTestSuite) SetupTest() {
	db := testDbTemplates.NewBaseTestDB(
		suite.T(),
		false,
		testDbTemplates.AdditionalSeed{
			Name: "boards_test",
			Func: suite.seedBoardsTestData,
		},
	)

	broker, err := realtime.NewNats(suite.natsConnectionString)
	require.NoError(suite.T(), err, "Failed to connect to nats server")
	suite.broker = broker

	clock := timeprovider.NewClock()
	generatedHash := hash.NewHashSha512()
	reactionDatabase := reactions.NewReactionsDatabase(db)
	reactionService := reactions.NewReactionService(reactionDatabase, broker)
	votingDatabase := votings.NewVotingDatabase(db)
	votingService := votings.NewVotingService(votingDatabase, broker)
	ch, err := cache.NewNats(suite.natsConnectionString, "scrumlr-test-boards")
	require.NoError(suite.T(), err, "Failed to connect to nats cache")

	noteDatabase := notes.NewNotesDatabase(db)
	noteService := notes.NewNotesService(noteDatabase, broker, ch)
	columnDatabase := columns.NewColumnsDatabase(db)
	columnService := columns.NewColumnService(columnDatabase, broker, noteService)
	sessionDatabase := sessions.NewSessionDatabase(db)
	sessionService := sessions.NewSessionService(sessionDatabase, broker, columnService, noteService)
	wsService := websocket.NewWebSocketService()
	ws := sessionrequests.NewSessionRequestWebsocket(wsService, broker)
	sessionRequestDatabase := sessionrequests.NewSessionRequestDatabase(db)
	sessionRequestService := sessionrequests.NewSessionRequestService(sessionRequestDatabase, broker, ws, sessionService)
	database := NewBoardDatabase(db)
	suite.service = NewBoardService(database, broker, sessionRequestService, sessionService, columnService, noteService, reactionService, votingService, clock, generatedHash)
}

func (suite *BoardServiceIntegrationTestSuite) initTestData() {
	suite.users = map[string]testDbTemplates.TestUser{
		"Stan":  {Name: "Stan", ID: uuid.MustParse("b1c2d3e4-f5a6-7890-abcd-ef1234567001"), AccountType: common.Google},
		"Santa": {Name: "Santa", ID: uuid.MustParse("b1c2d3e4-f5a6-7890-abcd-ef1234567002"), AccountType: common.Anonymous},
	}

	// Board names and descriptions
	read1Name := "Read1"
	read1Desc := "This is a board"
	read2Name := "Read2"
	read2Desc := "This is also a board"
	timerName := "TimerUpdate"
	timerDesc := "This is a board to update the timer"
	updateName := "Update"
	updateDesc := "This is a board to update"
	updateToPassphraseName := "UpdateToPassphrase"
	updateToPassphraseDesc := "This is a board to update"
	updateToInviteName := "UpdateToInvite"
	updateToInviteDesc := "This is a board to update"
	updateToPublicName := "UpdateToPublic"
	updateToPublicDesc := "This is a board to update"
	passphrase := "SuperStrongPassword"
	salt := "SaltForPassphrase"
	deleteName := "DeleteBoard"
	deleteDesc := "This is a board to delete"

	suite.boards = map[string]Board{
		"Read1":                    {ID: uuid.MustParse("b1c2d3e4-f5a6-7890-abcd-ef1234567101"), Name: &read1Name, Description: &read1Desc, AccessPolicy: Public, ShowAuthors: true, ShowNotesOfOtherUsers: true, ShowNoteReactions: true, AllowStacking: true, IsLocked: false},
		"Read2":                    {ID: uuid.MustParse("b1c2d3e4-f5a6-7890-abcd-ef1234567102"), Name: &read2Name, Description: &read2Desc, AccessPolicy: Public, ShowAuthors: true, ShowNotesOfOtherUsers: true, ShowNoteReactions: true, AllowStacking: true, IsLocked: false},
		"Timer":                    {ID: uuid.MustParse("b1c2d3e4-f5a6-7890-abcd-ef1234567103"), Name: &timerName, Description: &timerDesc, AccessPolicy: Public, ShowAuthors: true, ShowNotesOfOtherUsers: true, ShowNoteReactions: true, AllowStacking: true, IsLocked: false},
		"Update":                   {ID: uuid.MustParse("b1c2d3e4-f5a6-7890-abcd-ef1234567104"), Name: &updateName, Description: &updateDesc, AccessPolicy: Public, ShowAuthors: true, ShowNotesOfOtherUsers: true, ShowNoteReactions: true, AllowStacking: true, IsLocked: false},
		"UpdatePublicToPassphrase": {ID: uuid.MustParse("b1c2d3e4-f5a6-7890-abcd-ef1234567105"), Name: &updateToPassphraseName, Description: &updateToPassphraseDesc, AccessPolicy: Public, ShowAuthors: true, ShowNotesOfOtherUsers: true, ShowNoteReactions: true, AllowStacking: true, IsLocked: false},
		"UpdatePublicToInvite":     {ID: uuid.MustParse("b1c2d3e4-f5a6-7890-abcd-ef1234567106"), Name: &updateToInviteName, Description: &updateToInviteDesc, AccessPolicy: Public, ShowAuthors: true, ShowNotesOfOtherUsers: true, ShowNoteReactions: true, AllowStacking: true, IsLocked: false},
		"UpdatePassphraseToPublic": {ID: uuid.MustParse("b1c2d3e4-f5a6-7890-abcd-ef1234567107"), Name: &updateToPublicName, Description: &updateToPublicDesc, Passphrase: &passphrase, Salt: &salt, AccessPolicy: ByPassphrase, ShowAuthors: true, ShowNotesOfOtherUsers: true, ShowNoteReactions: true, AllowStacking: true, IsLocked: false},
		"UpdatePassphraseToInvite": {ID: uuid.MustParse("b1c2d3e4-f5a6-7890-abcd-ef1234567108"), Name: &updateToInviteName, Description: &updateToInviteDesc, Passphrase: &passphrase, Salt: &salt, AccessPolicy: ByPassphrase, ShowAuthors: true, ShowNotesOfOtherUsers: true, ShowNoteReactions: true, AllowStacking: true, IsLocked: false},
		"UpdateInviteToPublic":     {ID: uuid.MustParse("b1c2d3e4-f5a6-7890-abcd-ef1234567109"), Name: &updateToPublicName, Description: &updateToPublicDesc, AccessPolicy: ByInvite, ShowAuthors: true, ShowNotesOfOtherUsers: true, ShowNoteReactions: true, AllowStacking: true, IsLocked: false},
		"UpdateInviteToPassphrase": {ID: uuid.MustParse("b1c2d3e4-f5a6-7890-abcd-ef123456710a"), Name: &updateToPassphraseName, Description: &updateToPassphraseDesc, AccessPolicy: ByInvite, ShowAuthors: true, ShowNotesOfOtherUsers: true, ShowNoteReactions: true, AllowStacking: true, IsLocked: false},
		"Delete":                   {ID: uuid.MustParse("b1c2d3e4-f5a6-7890-abcd-ef123456710b"), Name: &deleteName, Description: &deleteDesc, AccessPolicy: Public, ShowAuthors: true, ShowNotesOfOtherUsers: true, ShowNoteReactions: true, AllowStacking: true, IsLocked: false},
	}

	suite.sessions = map[string]testSession{
		"Read1": {board: suite.boards["Read1"].ID, user: suite.users["Stan"].ID},
		"Read2": {board: suite.boards["Read2"].ID, user: suite.users["Stan"].ID},
	}
}

func (suite *BoardServiceIntegrationTestSuite) assertBoardEventAndData(events chan *realtime.BoardEvent, expectedName string, expectedAccessPolicy AccessPolicy) {
	t := suite.T()
	select {
	case boardMsg := <-events:
		assert.Equal(t, realtime.BoardEventBoardUpdated, boardMsg.Type)
		boardData, err := technical_helper.Unmarshal[Board](boardMsg.Data)
		assert.Nil(t, err)
		assert.Equal(t, expectedName, *boardData.Name)
		assert.Equal(t, "This is a board to update", *boardData.Description)
		assert.Equal(t, expectedAccessPolicy, boardData.AccessPolicy)
		assert.Equal(t, true, boardData.AllowStacking)
		assert.Equal(t, false, boardData.IsLocked)
		assert.Equal(t, true, boardData.ShowAuthors)
		assert.Equal(t, true, boardData.ShowNoteReactions)
		assert.Equal(t, true, boardData.ShowNotesOfOtherUsers)
	case <-time.After(10 * time.Second):
		assert.Fail(t, "timeout waiting for board event")
	}
}

func (suite *BoardServiceIntegrationTestSuite) assertBoardEventAndDataAndExpectFalse(events chan *realtime.BoardEvent, expectedName, expectedDescription string, expectedAccessPolicy AccessPolicy) {
	t := suite.T()
	select {
	case boardMsg := <-events:
		assert.Equal(t, realtime.BoardEventBoardUpdated, boardMsg.Type)
		boardData, err := technical_helper.Unmarshal[Board](boardMsg.Data)
		assert.Nil(t, err)
		assert.Equal(t, expectedName, *boardData.Name)
		assert.Equal(t, expectedDescription, *boardData.Description)
		assert.Equal(t, expectedAccessPolicy, boardData.AccessPolicy)
		assert.Equal(t, false, boardData.AllowStacking)
		assert.Equal(t, true, boardData.IsLocked)
		assert.Equal(t, false, boardData.ShowAuthors)
		assert.Equal(t, false, boardData.ShowNoteReactions)
		assert.Equal(t, false, boardData.ShowNotesOfOtherUsers)
	case <-time.After(10 * time.Second):
		assert.Fail(t, "timeout waiting for board event")
	}
}

func (suite *BoardServiceIntegrationTestSuite) assertNoteSyncEvent(events chan *realtime.BoardEvent) {
	t := suite.T()
	noteMsg := <-events
	assert.Equal(t, realtime.BoardEventNotesSync, noteMsg.Type)
	notesData, err := technical_helper.Unmarshal[[]notes.Note](noteMsg.Data)
	assert.Nil(t, err)
	assert.Nil(t, notesData)
}

func (suite *BoardServiceIntegrationTestSuite) Test_Create_Public() {
	t := suite.T()
	ctx := context.Background()

	userId := suite.users["Santa"].ID
	name := "Insert Board"
	description := "This board was inserted"
	accessPolicy := Public

	board, err := suite.service.Create(ctx, CreateBoardRequest{
		Name:         &name,
		Description:  &description,
		Owner:        userId,
		AccessPolicy: accessPolicy,
		Columns: []columns.ColumnRequest{
			{Name: "Column 1", Description: "This is the first column", Color: columns.ColorBacklogBlue},
			{Name: "Column 2", Description: "This is the second column", Color: columns.ColorOnlineOrange},
		},
	})

	assert.Nil(t, err)
	assert.Equal(t, &name, board.Name)
	assert.Equal(t, &description, board.Description)
	assert.Equal(t, accessPolicy, board.AccessPolicy)
	assert.True(t, board.AllowStacking)
	assert.False(t, board.IsLocked)
	assert.True(t, board.ShowAuthors)
	assert.True(t, board.ShowNoteReactions)
	assert.True(t, board.ShowNotesOfOtherUsers)
}

func (suite *BoardServiceIntegrationTestSuite) Test_Create_Passphrase() {
	t := suite.T()
	ctx := context.Background()

	userId := suite.users["Santa"].ID
	name := "Insert Board"
	description := "This board was inserted"
	accessPolicy := ByPassphrase
	passphrase := "This is a super strong passphrase"

	board, err := suite.service.Create(ctx, CreateBoardRequest{
		Name:         &name,
		Description:  &description,
		Owner:        userId,
		AccessPolicy: accessPolicy,
		Passphrase:   &passphrase,
		Columns: []columns.ColumnRequest{
			{Name: "Column 1", Description: "This is the first column", Color: columns.ColorBacklogBlue},
			{Name: "Column 2", Description: "This is the second column", Color: columns.ColorOnlineOrange},
		},
	})

	assert.Nil(t, err)
	assert.Equal(t, &name, board.Name)
	assert.Equal(t, &description, board.Description)
	assert.Equal(t, accessPolicy, board.AccessPolicy)
	assert.NotNil(t, board.Passphrase)
	assert.NotNil(t, board.Salt)
	assert.True(t, board.AllowStacking)
	assert.False(t, board.IsLocked)
	assert.True(t, board.ShowAuthors)
	assert.True(t, board.ShowNoteReactions)
	assert.True(t, board.ShowNotesOfOtherUsers)
}

func (suite *BoardServiceIntegrationTestSuite) Test_Update() {
	t := suite.T()
	ctx := context.Background()

	boardId := suite.boards["Update"].ID
	name := "New Name"
	description := "This is a new description"
	showAuthors := false
	showNotesOfOtherUsers := false
	showNoteReactions := false
	allowStacking := false
	isLocked := true

	events := suite.broker.GetBoardChannel(ctx, boardId)

	board, err := suite.service.Update(
		ctx,
		BoardUpdateRequest{
			ID:                    boardId,
			Name:                  &name,
			Description:           &description,
			AccessPolicy:          nil,
			ShowAuthors:           &showAuthors,
			Passphrase:            nil,
			ShowNotesOfOtherUsers: &showNotesOfOtherUsers,
			ShowNoteReactions:     &showNoteReactions,
			AllowStacking:         &allowStacking,
			IsLocked:              &isLocked,
		})

	assert.Nil(t, err)
	assert.Equal(t, &name, board.Name)
	assert.Equal(t, &description, board.Description)
	assert.Equal(t, Public, board.AccessPolicy)
	assert.NotNil(t, board)
	assert.Nil(t, board.Salt)
	assert.Equal(t, allowStacking, board.AllowStacking)
	assert.Equal(t, isLocked, board.IsLocked)
	assert.Equal(t, showAuthors, board.ShowAuthors)
	assert.Equal(t, showNoteReactions, board.ShowNoteReactions)
	assert.Equal(t, showNotesOfOtherUsers, board.ShowNotesOfOtherUsers)

	suite.assertBoardEventAndDataAndExpectFalse(events, name, description, Public)
	suite.assertNoteSyncEvent(events)
}

func (suite *BoardServiceIntegrationTestSuite) Test_UpdatePublicToPassphrase() {
	t := suite.T()
	ctx := context.Background()

	boardId := suite.boards["UpdatePublicToPassphrase"].ID
	passphrase := "SuperSecret"
	accessPolicy := ByPassphrase

	events := suite.broker.GetBoardChannel(ctx, boardId)

	board, err := suite.service.Update(
		ctx,
		BoardUpdateRequest{
			ID:           boardId,
			AccessPolicy: &accessPolicy,
			Passphrase:   &passphrase,
		})

	assert.Nil(t, err)
	assert.Equal(t, "UpdateToPassphrase", *board.Name)
	assert.Equal(t, "This is a board to update", *board.Description)
	assert.Equal(t, accessPolicy, board.AccessPolicy)
	assert.NotNil(t, board.Passphrase)
	assert.NotNil(t, board.Salt)
	assert.True(t, board.AllowStacking)
	assert.False(t, board.IsLocked)
	assert.True(t, board.ShowAuthors)
	assert.True(t, board.ShowNoteReactions)
	assert.True(t, board.ShowNotesOfOtherUsers)

	suite.assertBoardEventAndData(events, "UpdateToPassphrase", accessPolicy)
	suite.assertNoteSyncEvent(events)
}

func (suite *BoardServiceIntegrationTestSuite) Test_UpdatePublicToInvite() {
	t := suite.T()
	ctx := context.Background()

	boardId := suite.boards["UpdatePublicToInvite"].ID
	accessPolicy := ByInvite

	events := suite.broker.GetBoardChannel(ctx, boardId)

	board, err := suite.service.Update(
		ctx,
		BoardUpdateRequest{
			ID:           boardId,
			AccessPolicy: &accessPolicy,
		})

	assert.Nil(t, err)
	assert.Equal(t, "UpdateToInvite", *board.Name)
	assert.Equal(t, "This is a board to update", *board.Description)
	assert.Equal(t, accessPolicy, board.AccessPolicy)
	assert.Nil(t, board.Passphrase)
	assert.Nil(t, board.Salt)
	assert.True(t, board.AllowStacking)
	assert.False(t, board.IsLocked)
	assert.True(t, board.ShowAuthors)
	assert.True(t, board.ShowNoteReactions)
	assert.True(t, board.ShowNotesOfOtherUsers)

	suite.assertBoardEventAndData(events, "UpdateToInvite", accessPolicy)
	suite.assertNoteSyncEvent(events)
}

func (suite *BoardServiceIntegrationTestSuite) Test_UpdatePassphraseToPublic() {
	t := suite.T()
	ctx := context.Background()

	boardId := suite.boards["UpdatePassphraseToPublic"].ID
	accessPolicy := Public

	events := suite.broker.GetBoardChannel(ctx, boardId)

	board, err := suite.service.Update(
		ctx,
		BoardUpdateRequest{
			ID:           boardId,
			AccessPolicy: &accessPolicy,
		})

	assert.Nil(t, err)
	assert.Equal(t, "UpdateToPublic", *board.Name)
	assert.Equal(t, "This is a board to update", *board.Description)
	assert.Equal(t, accessPolicy, board.AccessPolicy)
	assert.Nil(t, board.Passphrase)
	assert.Nil(t, board.Salt)
	assert.True(t, board.AllowStacking)
	assert.False(t, board.IsLocked)
	assert.True(t, board.ShowAuthors)
	assert.True(t, board.ShowNoteReactions)
	assert.True(t, board.ShowNotesOfOtherUsers)

	suite.assertBoardEventAndData(events, "UpdateToPublic", accessPolicy)
	suite.assertNoteSyncEvent(events)
}

func (suite *BoardServiceIntegrationTestSuite) Test_UpdatePassphraseToInvite() {
	t := suite.T()
	ctx := context.Background()

	boardId := suite.boards["UpdatePassphraseToInvite"].ID
	accessPolicy := ByInvite

	events := suite.broker.GetBoardChannel(ctx, boardId)

	board, err := suite.service.Update(
		ctx,
		BoardUpdateRequest{
			ID:           boardId,
			AccessPolicy: &accessPolicy,
		})

	assert.Nil(t, err)
	assert.Equal(t, "UpdateToInvite", *board.Name)
	assert.Equal(t, "This is a board to update", *board.Description)
	assert.Equal(t, accessPolicy, board.AccessPolicy)
	assert.Nil(t, board.Passphrase)
	assert.Nil(t, board.Salt)
	assert.True(t, board.AllowStacking)
	assert.False(t, board.IsLocked)
	assert.True(t, board.ShowAuthors)
	assert.True(t, board.ShowNoteReactions)
	assert.True(t, board.ShowNotesOfOtherUsers)

	suite.assertBoardEventAndData(events, "UpdateToInvite", accessPolicy)
	suite.assertNoteSyncEvent(events)
}

func (suite *BoardServiceIntegrationTestSuite) Test_UpdateInviteToPublic() {
	t := suite.T()
	ctx := context.Background()

	boardId := suite.boards["UpdateInviteToPublic"].ID
	accessPolicy := Public

	events := suite.broker.GetBoardChannel(ctx, boardId)

	board, err := suite.service.Update(
		ctx,
		BoardUpdateRequest{
			ID:           boardId,
			AccessPolicy: &accessPolicy,
		})

	assert.Nil(t, err)
	assert.Equal(t, "UpdateToPublic", *board.Name)
	assert.Equal(t, "This is a board to update", *board.Description)
	assert.Equal(t, accessPolicy, board.AccessPolicy)
	assert.Nil(t, board.Passphrase)
	assert.Nil(t, board.Salt)
	assert.True(t, board.AllowStacking)
	assert.False(t, board.IsLocked)
	assert.True(t, board.ShowAuthors)
	assert.True(t, board.ShowNoteReactions)
	assert.True(t, board.ShowNotesOfOtherUsers)

	suite.assertBoardEventAndData(events, "UpdateToPublic", accessPolicy)
	suite.assertNoteSyncEvent(events)
}

func (suite *BoardServiceIntegrationTestSuite) Test_UpdateInviteToPassphrase() {
	t := suite.T()
	ctx := context.Background()

	boardId := suite.boards["UpdateInviteToPassphrase"].ID
	accessPolicy := ByPassphrase
	passphrase := "SuperStrongPassword"

	events := suite.broker.GetBoardChannel(ctx, boardId)

	board, err := suite.service.Update(
		ctx,
		BoardUpdateRequest{
			ID:           boardId,
			AccessPolicy: &accessPolicy,
			Passphrase:   &passphrase,
		})

	assert.Nil(t, err)
	assert.Equal(t, "UpdateToPassphrase", *board.Name)
	assert.Equal(t, "This is a board to update", *board.Description)
	assert.Equal(t, accessPolicy, board.AccessPolicy)
	assert.NotNil(t, board.Passphrase)
	assert.NotNil(t, board.Salt)
	assert.True(t, board.AllowStacking)
	assert.False(t, board.IsLocked)
	assert.True(t, board.ShowAuthors)
	assert.True(t, board.ShowNoteReactions)
	assert.True(t, board.ShowNotesOfOtherUsers)

	suite.assertBoardEventAndData(events, "UpdateToPassphrase", accessPolicy)
	suite.assertNoteSyncEvent(events)
}

func (suite *BoardServiceIntegrationTestSuite) Test_Delete() {
	t := suite.T()
	ctx := context.Background()

	boardId := suite.boards["Delete"].ID

	err := suite.service.Delete(ctx, boardId)

	assert.Nil(t, err)
}

func (suite *BoardServiceIntegrationTestSuite) Test_Get() {
	t := suite.T()
	ctx := context.Background()

	boardId := suite.boards["Read1"].ID

	board, err := suite.service.Get(ctx, boardId)

	assert.Nil(t, err)
	assert.Equal(t, boardId, board.ID)
	assert.Equal(t, suite.boards["Read1"].Name, board.Name)
	assert.Equal(t, suite.boards["Read1"].Description, board.Description)
	assert.Equal(t, suite.boards["Read1"].AccessPolicy, board.AccessPolicy)
	assert.Equal(t, suite.boards["Read1"].ShowAuthors, board.ShowAuthors)
}

func (suite *BoardServiceIntegrationTestSuite) Test_Get_NotFound() {
	t := suite.T()
	ctx := context.Background()

	boardId := uuid.New()

	board, err := suite.service.Get(ctx, boardId)

	assert.Nil(t, board)
	assert.NotNil(t, err)
	assert.Equal(t, sql.ErrNoRows, err)
}

func (suite *BoardServiceIntegrationTestSuite) Test_GetAll() {
	t := suite.T()
	ctx := context.Background()

	userId := suite.users["Stan"].ID

	boards, err := suite.service.GetBoards(ctx, userId)

	assert.Nil(t, err)
	assert.Len(t, boards, 2)

	firstBoard := checkBoardInList(boards, suite.boards["Read1"].ID)
	assert.Equal(t, suite.boards["Read1"].ID, *firstBoard)
	secondBoard := checkBoardInList(boards, suite.boards["Read2"].ID)
	assert.Equal(t, suite.boards["Read2"].ID, *secondBoard)
}

func (suite *BoardServiceIntegrationTestSuite) Test_GetFullBoard() {
	t := suite.T()
	ctx := context.Background()

	boardId := suite.boards["Read1"].ID

	board, err := suite.service.FullBoard(ctx, boardId)

	assert.Nil(t, err)
	assert.NotNil(t, board.Board)
	assert.Equal(t, boardId, board.Board.ID)
	assert.Equal(t, suite.boards["Read1"].Name, board.Board.Name)
	assert.Equal(t, suite.boards["Read1"].Description, board.Board.Description)
	assert.Equal(t, suite.boards["Read1"].AccessPolicy, board.Board.AccessPolicy)
	assert.Equal(t, suite.boards["Read1"].ShowAuthors, board.Board.ShowAuthors)
	assert.Nil(t, board.BoardSessionRequests)
	assert.Nil(t, board.Columns)
	assert.Nil(t, board.Notes)
	assert.Nil(t, board.Votes)
	assert.Nil(t, board.Votings)
	assert.Len(t, board.BoardSessions, 1)
}

func (suite *BoardServiceIntegrationTestSuite) Test_GetFullBoard_NotFound() {
	t := suite.T()
	ctx := context.Background()

	boardId := uuid.New()

	board, err := suite.service.FullBoard(ctx, boardId)

	assert.Nil(t, board)
	assert.NotNil(t, err)
	assert.Equal(t, sql.ErrNoRows, err)
}

func (suite *BoardServiceIntegrationTestSuite) Test_GetBoardOverview() {
	t := suite.T()
	ctx := context.Background()

	boardIds := []uuid.UUID{suite.boards["Read1"].ID, suite.boards["Read2"].ID}
	userId := suite.users["Stan"].ID

	boards, err := suite.service.BoardOverview(ctx, boardIds, userId)

	assert.Nil(t, err)
	assert.Len(t, boards, 2)

	assert.Equal(t, suite.boards["Read1"].ID, boards[0].Board.ID)
	assert.Equal(t, suite.boards["Read1"].Name, boards[0].Board.Name)
	assert.Equal(t, suite.boards["Read1"].Description, boards[0].Board.Description)
	assert.Equal(t, suite.boards["Read1"].AccessPolicy, boards[0].Board.AccessPolicy)
	assert.Equal(t, suite.boards["Read1"].ShowAuthors, boards[0].Board.ShowAuthors)

	assert.Equal(t, suite.boards["Read2"].ID, boards[1].Board.ID)
	assert.Equal(t, suite.boards["Read2"].Name, boards[1].Board.Name)
	assert.Equal(t, suite.boards["Read2"].Description, boards[1].Board.Description)
	assert.Equal(t, suite.boards["Read2"].AccessPolicy, boards[1].Board.AccessPolicy)
	assert.Equal(t, suite.boards["Read2"].ShowAuthors, boards[1].Board.ShowAuthors)
}

func (suite *BoardServiceIntegrationTestSuite) Test_SetTimer() {
	t := suite.T()
	ctx := context.Background()

	boardId := suite.boards["Read1"].ID
	minutes := uint8(2)

	board, err := suite.service.SetTimer(ctx, boardId, minutes)

	assert.Nil(t, err)
	assert.Equal(t, boardId, board.ID)
	assert.Equal(t, minutes, uint8(board.TimerEnd.Sub(*board.TimerStart).Minutes()))
}

func (suite *BoardServiceIntegrationTestSuite) Test_DeleteTimer() {
	t := suite.T()
	ctx := context.Background()

	boardId := suite.boards["Read1"].ID

	board, err := suite.service.DeleteTimer(ctx, boardId)

	assert.Nil(t, err)
	assert.Equal(t, boardId, board.ID)
	assert.Nil(t, board.TimerStart)
	assert.Nil(t, board.TimerEnd)
}

func (suite *BoardServiceIntegrationTestSuite) Test_IncrementTimer() {
	t := suite.T()
	ctx := context.Background()

	boardId := suite.boards["Timer"].ID
	minutes := uint8(2)

	_, err := suite.service.SetTimer(ctx, boardId, minutes)
	assert.Nil(t, err)
	board, err := suite.service.IncrementTimer(ctx, boardId)

	assert.Nil(t, err)
	assert.Equal(t, boardId, board.ID)
	assert.Equal(t, minutes+1, uint8(board.TimerEnd.Sub(*board.TimerStart).Minutes()))
}

func (suite *BoardServiceIntegrationTestSuite) seedBoardsTestData(db *bun.DB) {
	log.Println("Seeding boards test data")

	for _, user := range suite.users {
		if err := testDbTemplates.InsertUser(db, user.ID, user.Name, string(user.AccountType)); err != nil {
			log.Fatalf("Failed to insert user %s: %s", user.Name, err)
		}
	}

	for _, board := range suite.boards {
		if err := testDbTemplates.InsertBoard(db, board.ID, *board.Name, *board.Description, board.Passphrase, board.Salt, string(board.AccessPolicy), board.ShowAuthors, board.ShowNotesOfOtherUsers, board.ShowNoteReactions, board.AllowStacking, board.IsLocked); err != nil {
			log.Fatalf("Failed to insert board %s: %s", *board.Name, err)
		}
	}

	for _, session := range suite.sessions {
		if err := testDbTemplates.InsertSession(db, session.user, session.board, string(common.ParticipantRole), false, true, true, false); err != nil {
			log.Fatalf("Failed to insert session: %s", err)
		}
	}
}

func checkBoardInList(list []uuid.UUID, id uuid.UUID) *uuid.UUID {
	for _, boardId := range list {
		if boardId == id {
			return &boardId
		}
	}
	return nil
}
