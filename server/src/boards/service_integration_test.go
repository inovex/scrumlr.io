package boards

import (
	"context"
	"database/sql"
	"log"
	"testing"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"
	"github.com/testcontainers/testcontainers-go/modules/nats"
	"github.com/testcontainers/testcontainers-go/modules/postgres"
	"github.com/uptrace/bun"
	"scrumlr.io/server/columns"
	"scrumlr.io/server/common"
	"scrumlr.io/server/initialize"
	"scrumlr.io/server/notes"
	"scrumlr.io/server/reactions"
	"scrumlr.io/server/realtime"
	"scrumlr.io/server/sessionrequests"
	"scrumlr.io/server/sessions"
	"scrumlr.io/server/technical_helper"
	"scrumlr.io/server/timeprovider"
	"scrumlr.io/server/votings"
)

type BoardServiceIntegrationTestSuite struct {
	suite.Suite
	dbContainer          *postgres.PostgresContainer
	natsContainer        *nats.NATSContainer
	db                   *bun.DB
	natsConnectionString string
	users                map[string]TestUser
	boards               map[string]Board
	sessions             map[string]TestSession
}

func TestBoardServiceIntegrationTestSuite(t *testing.T) {
	suite.Run(t, new(BoardServiceIntegrationTestSuite))
}

func (suite *BoardServiceIntegrationTestSuite) SetupSuite() {
	dbContainer, bun := initialize.StartTestDatabase()
	suite.SeedDatabase(bun)
	natsContainer, connectionString := initialize.StartTestNats()

	suite.dbContainer = dbContainer
	suite.natsContainer = natsContainer
	suite.db = bun
	suite.natsConnectionString = connectionString
}

func (suite *BoardServiceIntegrationTestSuite) TearDownSuite() {
	initialize.StopTestDatabase(suite.dbContainer)
	initialize.StopTestNats(suite.natsContainer)
}

func (suite *BoardServiceIntegrationTestSuite) Test_Create_Public() {
	t := suite.T()
	ctx := context.Background()

	userId := suite.users["Santa"].id
	name := "Insert Board"
	description := "This board was inserted"
	accessPolicy := Public

	broker, err := realtime.NewNats(suite.natsConnectionString)
	if err != nil {
		log.Fatalf("Faild to connect to nats server %s", err)
	}

	clock := timeprovider.NewClock()
	reactionDatabase := reactions.NewReactionsDatabase(suite.db)
	reactionService := reactions.NewReactionService(reactionDatabase, broker)
	votingDatabase := votings.NewVotingDatabase(suite.db)
	votingService := votings.NewVotingService(votingDatabase, broker)
	noteDatabase := notes.NewNotesDatabase(suite.db)
	noteService := notes.NewNotesService(noteDatabase, broker, votingService)
	columnDatabase := columns.NewColumnsDatabase(suite.db)
	columnService := columns.NewColumnService(columnDatabase, broker, noteService)
	sessionDatabase := sessions.NewSessionDatabase(suite.db)
	sessionService := sessions.NewSessionService(sessionDatabase, broker, columnService, noteService)
	ws := websocket.Upgrader{ReadBufferSize: 1024, WriteBufferSize: 1024}
	websocket := sessionrequests.NewWebsocket(ws, broker)
	sessionRequestDatabase := sessionrequests.NewSessionRequestDatabase(suite.db)
	sessionRequestService := sessionrequests.NewSessionRequestService(sessionRequestDatabase, broker, websocket, sessionService)
	database := NewBoardDatabase(suite.db)
	service := NewBoardService(database, broker, sessionRequestService, sessionService, columnService, noteService, reactionService, votingService, clock)

	board, err := service.Create(ctx, CreateBoardRequest{
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

	userId := suite.users["Santa"].id
	name := "Insert Board"
	description := "This board was inserted"
	accessPolicy := ByPassphrase
	passphrase := "This is a super strong passphrase"

	broker, err := realtime.NewNats(suite.natsConnectionString)
	if err != nil {
		log.Fatalf("Faild to connect to nats server %s", err)
	}

	clock := timeprovider.NewClock()
	reactionDatabase := reactions.NewReactionsDatabase(suite.db)
	reactionService := reactions.NewReactionService(reactionDatabase, broker)
	votingDatabase := votings.NewVotingDatabase(suite.db)
	votingService := votings.NewVotingService(votingDatabase, broker)
	noteDatabase := notes.NewNotesDatabase(suite.db)
	noteService := notes.NewNotesService(noteDatabase, broker, votingService)
	columnDatabase := columns.NewColumnsDatabase(suite.db)
	columnService := columns.NewColumnService(columnDatabase, broker, noteService)
	sessionDatabase := sessions.NewSessionDatabase(suite.db)
	sessionService := sessions.NewSessionService(sessionDatabase, broker, columnService, noteService)
	ws := websocket.Upgrader{ReadBufferSize: 1024, WriteBufferSize: 1024}
	websocket := sessionrequests.NewWebsocket(ws, broker)
	sessionRequestDatabase := sessionrequests.NewSessionRequestDatabase(suite.db)
	sessionRequestService := sessionrequests.NewSessionRequestService(sessionRequestDatabase, broker, websocket, sessionService)
	database := NewBoardDatabase(suite.db)
	service := NewBoardService(database, broker, sessionRequestService, sessionService, columnService, noteService, reactionService, votingService, clock)

	board, err := service.Create(ctx, CreateBoardRequest{
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

	boardId := suite.boards["UpdatePassphrase"].ID
	name := "New Name"
	description := "This is a new description"
	passphrase := "SuperSecret"
	accessPolicy := ByPassphrase
	showAuthors := false
	showNotesOfOtherUsers := false
	showNoteReactions := false
	allowStacking := false
	isLocked := true

	broker, err := realtime.NewNats(suite.natsConnectionString)
	if err != nil {
		log.Fatalf("Faild to connect to nats server %s", err)
	}

	events := broker.GetBoardChannel(boardId)

	clock := timeprovider.NewClock()
	reactionDatabase := reactions.NewReactionsDatabase(suite.db)
	reactionService := reactions.NewReactionService(reactionDatabase, broker)
	votingDatabase := votings.NewVotingDatabase(suite.db)
	votingService := votings.NewVotingService(votingDatabase, broker)
	noteDatabase := notes.NewNotesDatabase(suite.db)
	noteService := notes.NewNotesService(noteDatabase, broker, votingService)
	columnDatabase := columns.NewColumnsDatabase(suite.db)
	columnService := columns.NewColumnService(columnDatabase, broker, noteService)
	sessionDatabase := sessions.NewSessionDatabase(suite.db)
	sessionService := sessions.NewSessionService(sessionDatabase, broker, columnService, noteService)
	ws := websocket.Upgrader{ReadBufferSize: 1024, WriteBufferSize: 1024}
	websocket := sessionrequests.NewWebsocket(ws, broker)
	sessionRequestDatabase := sessionrequests.NewSessionRequestDatabase(suite.db)
	sessionRequestService := sessionrequests.NewSessionRequestService(sessionRequestDatabase, broker, websocket, sessionService)
	database := NewBoardDatabase(suite.db)
	service := NewBoardService(database, broker, sessionRequestService, sessionService, columnService, noteService, reactionService, votingService, clock)

	board, err := service.Update(
		ctx,
		BoardUpdateRequest{
			ID:                    boardId,
			Name:                  &name,
			Description:           &description,
			AccessPolicy:          &accessPolicy,
			ShowAuthors:           &showAuthors,
			Passphrase:            &passphrase,
			ShowNotesOfOtherUsers: &showNotesOfOtherUsers,
			ShowNoteReactions:     &showNoteReactions,
			AllowStacking:         &allowStacking,
			IsLocked:              &isLocked,
		})

	assert.Nil(t, err)
	assert.Equal(t, &name, board.Name)
	assert.Equal(t, &description, board.Description)
	assert.Equal(t, accessPolicy, board.AccessPolicy)
	assert.NotNil(t, board.Passphrase)
	assert.NotNil(t, board.Salt)
	assert.Equal(t, allowStacking, board.AllowStacking)
	assert.Equal(t, isLocked, board.IsLocked)
	assert.Equal(t, showAuthors, board.ShowAuthors)
	assert.Equal(t, showNoteReactions, board.ShowNoteReactions)
	assert.Equal(t, showNotesOfOtherUsers, board.ShowNotesOfOtherUsers)

	boardMsg := <-events
	assert.Equal(t, realtime.BoardEventBoardUpdated, boardMsg.Type)
	boardData, err := technical_helper.Unmarshal[Board](boardMsg.Data)
	assert.Nil(t, err)
	assert.Equal(t, &name, boardData.Name)
	assert.Equal(t, &description, boardData.Description)
	assert.Equal(t, accessPolicy, boardData.AccessPolicy)
	assert.Equal(t, allowStacking, boardData.AllowStacking)
	assert.Equal(t, isLocked, boardData.IsLocked)
	assert.Equal(t, showAuthors, boardData.ShowAuthors)
	assert.Equal(t, showNoteReactions, boardData.ShowNoteReactions)
	assert.Equal(t, showNotesOfOtherUsers, boardData.ShowNotesOfOtherUsers)

	noteMsg := <-events
	assert.Equal(t, realtime.BoardEventNotesSync, noteMsg.Type)
	notesData, err := technical_helper.Unmarshal[[]notes.Note](noteMsg.Data)
	assert.Nil(t, err)
	assert.Nil(t, notesData)
}

func (suite *BoardServiceIntegrationTestSuite) Test_Delete() {
	t := suite.T()
	ctx := context.Background()

	boardId := suite.boards["Delete"].ID

	broker, err := realtime.NewNats(suite.natsConnectionString)
	if err != nil {
		log.Fatalf("Faild to connect to nats server %s", err)
	}

	clock := timeprovider.NewClock()
	reactionDatabase := reactions.NewReactionsDatabase(suite.db)
	reactionService := reactions.NewReactionService(reactionDatabase, broker)
	votingDatabase := votings.NewVotingDatabase(suite.db)
	votingService := votings.NewVotingService(votingDatabase, broker)
	noteDatabase := notes.NewNotesDatabase(suite.db)
	noteService := notes.NewNotesService(noteDatabase, broker, votingService)
	columnDatabase := columns.NewColumnsDatabase(suite.db)
	columnService := columns.NewColumnService(columnDatabase, broker, noteService)
	sessionDatabase := sessions.NewSessionDatabase(suite.db)
	sessionService := sessions.NewSessionService(sessionDatabase, broker, columnService, noteService)
	ws := websocket.Upgrader{ReadBufferSize: 1024, WriteBufferSize: 1024}
	websocket := sessionrequests.NewWebsocket(ws, broker)
	sessionRequestDatabase := sessionrequests.NewSessionRequestDatabase(suite.db)
	sessionRequestService := sessionrequests.NewSessionRequestService(sessionRequestDatabase, broker, websocket, sessionService)
	database := NewBoardDatabase(suite.db)
	service := NewBoardService(database, broker, sessionRequestService, sessionService, columnService, noteService, reactionService, votingService, clock)

	err = service.Delete(ctx, boardId)

	assert.Nil(t, err)
}

func (suite *BoardServiceIntegrationTestSuite) Test_Get() {
	t := suite.T()
	ctx := context.Background()

	boardId := suite.boards["Read1"].ID

	broker, err := realtime.NewNats(suite.natsConnectionString)
	if err != nil {
		log.Fatalf("Faild to connect to nats server %s", err)
	}

	clock := timeprovider.NewClock()
	reactionDatabase := reactions.NewReactionsDatabase(suite.db)
	reactionService := reactions.NewReactionService(reactionDatabase, broker)
	votingDatabase := votings.NewVotingDatabase(suite.db)
	votingService := votings.NewVotingService(votingDatabase, broker)
	noteDatabase := notes.NewNotesDatabase(suite.db)
	noteService := notes.NewNotesService(noteDatabase, broker, votingService)
	columnDatabase := columns.NewColumnsDatabase(suite.db)
	columnService := columns.NewColumnService(columnDatabase, broker, noteService)
	sessionDatabase := sessions.NewSessionDatabase(suite.db)
	sessionService := sessions.NewSessionService(sessionDatabase, broker, columnService, noteService)
	ws := websocket.Upgrader{ReadBufferSize: 1024, WriteBufferSize: 1024}
	websocket := sessionrequests.NewWebsocket(ws, broker)
	sessionRequestDatabase := sessionrequests.NewSessionRequestDatabase(suite.db)
	sessionRequestService := sessionrequests.NewSessionRequestService(sessionRequestDatabase, broker, websocket, sessionService)
	database := NewBoardDatabase(suite.db)
	service := NewBoardService(database, broker, sessionRequestService, sessionService, columnService, noteService, reactionService, votingService, clock)

	board, err := service.Get(ctx, boardId)

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

	broker, err := realtime.NewNats(suite.natsConnectionString)
	if err != nil {
		log.Fatalf("Faild to connect to nats server %s", err)
	}

	clock := timeprovider.NewClock()
	reactionDatabase := reactions.NewReactionsDatabase(suite.db)
	reactionService := reactions.NewReactionService(reactionDatabase, broker)
	votingDatabase := votings.NewVotingDatabase(suite.db)
	votingService := votings.NewVotingService(votingDatabase, broker)
	noteDatabase := notes.NewNotesDatabase(suite.db)
	noteService := notes.NewNotesService(noteDatabase, broker, votingService)
	columnDatabase := columns.NewColumnsDatabase(suite.db)
	columnService := columns.NewColumnService(columnDatabase, broker, noteService)
	sessionDatabase := sessions.NewSessionDatabase(suite.db)
	sessionService := sessions.NewSessionService(sessionDatabase, broker, columnService, noteService)
	ws := websocket.Upgrader{ReadBufferSize: 1024, WriteBufferSize: 1024}
	websocket := sessionrequests.NewWebsocket(ws, broker)
	sessionRequestDatabase := sessionrequests.NewSessionRequestDatabase(suite.db)
	sessionRequestService := sessionrequests.NewSessionRequestService(sessionRequestDatabase, broker, websocket, sessionService)
	database := NewBoardDatabase(suite.db)
	service := NewBoardService(database, broker, sessionRequestService, sessionService, columnService, noteService, reactionService, votingService, clock)

	board, err := service.Get(ctx, boardId)

	assert.Nil(t, board)
	assert.NotNil(t, err)
	assert.Equal(t, sql.ErrNoRows, err)
}

func (suite *BoardServiceIntegrationTestSuite) Test_GetAll() {
	t := suite.T()
	ctx := context.Background()

	userId := suite.users["Stan"].id

	broker, err := realtime.NewNats(suite.natsConnectionString)
	if err != nil {
		log.Fatalf("Faild to connect to nats server %s", err)
	}

	clock := timeprovider.NewClock()
	reactionDatabase := reactions.NewReactionsDatabase(suite.db)
	reactionService := reactions.NewReactionService(reactionDatabase, broker)
	votingDatabase := votings.NewVotingDatabase(suite.db)
	votingService := votings.NewVotingService(votingDatabase, broker)
	noteDatabase := notes.NewNotesDatabase(suite.db)
	noteService := notes.NewNotesService(noteDatabase, broker, votingService)
	columnDatabase := columns.NewColumnsDatabase(suite.db)
	columnService := columns.NewColumnService(columnDatabase, broker, noteService)
	sessionDatabase := sessions.NewSessionDatabase(suite.db)
	sessionService := sessions.NewSessionService(sessionDatabase, broker, columnService, noteService)
	ws := websocket.Upgrader{ReadBufferSize: 1024, WriteBufferSize: 1024}
	websocket := sessionrequests.NewWebsocket(ws, broker)
	sessionRequestDatabase := sessionrequests.NewSessionRequestDatabase(suite.db)
	sessionRequestService := sessionrequests.NewSessionRequestService(sessionRequestDatabase, broker, websocket, sessionService)
	database := NewBoardDatabase(suite.db)
	service := NewBoardService(database, broker, sessionRequestService, sessionService, columnService, noteService, reactionService, votingService, clock)

	boards, err := service.GetBoards(ctx, userId)

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

	broker, err := realtime.NewNats(suite.natsConnectionString)
	if err != nil {
		log.Fatalf("Faild to connect to nats server %s", err)
	}

	clock := timeprovider.NewClock()
	reactionDatabase := reactions.NewReactionsDatabase(suite.db)
	reactionService := reactions.NewReactionService(reactionDatabase, broker)
	votingDatabase := votings.NewVotingDatabase(suite.db)
	votingService := votings.NewVotingService(votingDatabase, broker)
	noteDatabase := notes.NewNotesDatabase(suite.db)
	noteService := notes.NewNotesService(noteDatabase, broker, votingService)
	columnDatabase := columns.NewColumnsDatabase(suite.db)
	columnService := columns.NewColumnService(columnDatabase, broker, noteService)
	sessionDatabase := sessions.NewSessionDatabase(suite.db)
	sessionService := sessions.NewSessionService(sessionDatabase, broker, columnService, noteService)
	ws := websocket.Upgrader{ReadBufferSize: 1024, WriteBufferSize: 1024}
	websocket := sessionrequests.NewWebsocket(ws, broker)
	sessionRequestDatabase := sessionrequests.NewSessionRequestDatabase(suite.db)
	sessionRequestService := sessionrequests.NewSessionRequestService(sessionRequestDatabase, broker, websocket, sessionService)
	database := NewBoardDatabase(suite.db)
	service := NewBoardService(database, broker, sessionRequestService, sessionService, columnService, noteService, reactionService, votingService, clock)

	board, err := service.FullBoard(ctx, boardId)

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

	broker, err := realtime.NewNats(suite.natsConnectionString)
	if err != nil {
		log.Fatalf("Faild to connect to nats server %s", err)
	}

	clock := timeprovider.NewClock()
	reactionDatabase := reactions.NewReactionsDatabase(suite.db)
	reactionService := reactions.NewReactionService(reactionDatabase, broker)
	votingDatabase := votings.NewVotingDatabase(suite.db)
	votingService := votings.NewVotingService(votingDatabase, broker)
	noteDatabase := notes.NewNotesDatabase(suite.db)
	noteService := notes.NewNotesService(noteDatabase, broker, votingService)
	columnDatabase := columns.NewColumnsDatabase(suite.db)
	columnService := columns.NewColumnService(columnDatabase, broker, noteService)
	sessionDatabase := sessions.NewSessionDatabase(suite.db)
	sessionService := sessions.NewSessionService(sessionDatabase, broker, columnService, noteService)
	ws := websocket.Upgrader{ReadBufferSize: 1024, WriteBufferSize: 1024}
	websocket := sessionrequests.NewWebsocket(ws, broker)
	sessionRequestDatabase := sessionrequests.NewSessionRequestDatabase(suite.db)
	sessionRequestService := sessionrequests.NewSessionRequestService(sessionRequestDatabase, broker, websocket, sessionService)
	database := NewBoardDatabase(suite.db)
	service := NewBoardService(database, broker, sessionRequestService, sessionService, columnService, noteService, reactionService, votingService, clock)

	board, err := service.FullBoard(ctx, boardId)

	assert.Nil(t, board)
	assert.NotNil(t, err)
	assert.Equal(t, sql.ErrNoRows, err)
}

func (suite *BoardServiceIntegrationTestSuite) Test_GetBoardOverwiev() {
	t := suite.T()
	ctx := context.Background()

	boardIds := []uuid.UUID{suite.boards["Read1"].ID, suite.boards["Read2"].ID}
	userId := suite.users["Stan"].id

	broker, err := realtime.NewNats(suite.natsConnectionString)
	if err != nil {
		log.Fatalf("Faild to connect to nats server %s", err)
	}

	clock := timeprovider.NewClock()
	reactionDatabase := reactions.NewReactionsDatabase(suite.db)
	reactionService := reactions.NewReactionService(reactionDatabase, broker)
	votingDatabase := votings.NewVotingDatabase(suite.db)
	votingService := votings.NewVotingService(votingDatabase, broker)
	noteDatabase := notes.NewNotesDatabase(suite.db)
	noteService := notes.NewNotesService(noteDatabase, broker, votingService)
	columnDatabase := columns.NewColumnsDatabase(suite.db)
	columnService := columns.NewColumnService(columnDatabase, broker, noteService)
	sessionDatabase := sessions.NewSessionDatabase(suite.db)
	sessionService := sessions.NewSessionService(sessionDatabase, broker, columnService, noteService)
	ws := websocket.Upgrader{ReadBufferSize: 1024, WriteBufferSize: 1024}
	websocket := sessionrequests.NewWebsocket(ws, broker)
	sessionRequestDatabase := sessionrequests.NewSessionRequestDatabase(suite.db)
	sessionRequestService := sessionrequests.NewSessionRequestService(sessionRequestDatabase, broker, websocket, sessionService)
	database := NewBoardDatabase(suite.db)
	service := NewBoardService(database, broker, sessionRequestService, sessionService, columnService, noteService, reactionService, votingService, clock)

	boards, err := service.BoardOverview(ctx, boardIds, userId)

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

	broker, err := realtime.NewNats(suite.natsConnectionString)
	if err != nil {
		log.Fatalf("Faild to connect to nats server %s", err)
	}

	clock := timeprovider.NewClock()
	reactionDatabase := reactions.NewReactionsDatabase(suite.db)
	reactionService := reactions.NewReactionService(reactionDatabase, broker)
	votingDatabase := votings.NewVotingDatabase(suite.db)
	votingService := votings.NewVotingService(votingDatabase, broker)
	noteDatabase := notes.NewNotesDatabase(suite.db)
	noteService := notes.NewNotesService(noteDatabase, broker, votingService)
	columnDatabase := columns.NewColumnsDatabase(suite.db)
	columnService := columns.NewColumnService(columnDatabase, broker, noteService)
	sessionDatabase := sessions.NewSessionDatabase(suite.db)
	sessionService := sessions.NewSessionService(sessionDatabase, broker, columnService, noteService)
	ws := websocket.Upgrader{ReadBufferSize: 1024, WriteBufferSize: 1024}
	websocket := sessionrequests.NewWebsocket(ws, broker)
	sessionRequestDatabase := sessionrequests.NewSessionRequestDatabase(suite.db)
	sessionRequestService := sessionrequests.NewSessionRequestService(sessionRequestDatabase, broker, websocket, sessionService)
	database := NewBoardDatabase(suite.db)
	service := NewBoardService(database, broker, sessionRequestService, sessionService, columnService, noteService, reactionService, votingService, clock)

	board, err := service.SetTimer(ctx, boardId, minutes)

	assert.Nil(t, err)
	assert.Equal(t, boardId, board.ID)
	assert.Equal(t, minutes, uint8(board.TimerEnd.Sub(*board.TimerStart).Minutes()))
}

func (suite *BoardServiceIntegrationTestSuite) Test_DeleteTimer() {
	t := suite.T()
	ctx := context.Background()

	boardId := suite.boards["Read1"].ID

	broker, err := realtime.NewNats(suite.natsConnectionString)
	if err != nil {
		log.Fatalf("Faild to connect to nats server %s", err)
	}

	clock := timeprovider.NewClock()
	reactionDatabase := reactions.NewReactionsDatabase(suite.db)
	reactionService := reactions.NewReactionService(reactionDatabase, broker)
	votingDatabase := votings.NewVotingDatabase(suite.db)
	votingService := votings.NewVotingService(votingDatabase, broker)
	noteDatabase := notes.NewNotesDatabase(suite.db)
	noteService := notes.NewNotesService(noteDatabase, broker, votingService)
	columnDatabase := columns.NewColumnsDatabase(suite.db)
	columnService := columns.NewColumnService(columnDatabase, broker, noteService)
	sessionDatabase := sessions.NewSessionDatabase(suite.db)
	sessionService := sessions.NewSessionService(sessionDatabase, broker, columnService, noteService)
	ws := websocket.Upgrader{ReadBufferSize: 1024, WriteBufferSize: 1024}
	websocket := sessionrequests.NewWebsocket(ws, broker)
	sessionRequestDatabase := sessionrequests.NewSessionRequestDatabase(suite.db)
	sessionRequestService := sessionrequests.NewSessionRequestService(sessionRequestDatabase, broker, websocket, sessionService)
	database := NewBoardDatabase(suite.db)
	service := NewBoardService(database, broker, sessionRequestService, sessionService, columnService, noteService, reactionService, votingService, clock)

	board, err := service.DeleteTimer(ctx, boardId)

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

	broker, err := realtime.NewNats(suite.natsConnectionString)
	if err != nil {
		log.Fatalf("Faild to connect to nats server %s", err)
	}

	clock := timeprovider.NewClock()
	reactionDatabase := reactions.NewReactionsDatabase(suite.db)
	reactionService := reactions.NewReactionService(reactionDatabase, broker)
	votingDatabase := votings.NewVotingDatabase(suite.db)
	votingService := votings.NewVotingService(votingDatabase, broker)
	noteDatabase := notes.NewNotesDatabase(suite.db)
	noteService := notes.NewNotesService(noteDatabase, broker, votingService)
	columnDatabase := columns.NewColumnsDatabase(suite.db)
	columnService := columns.NewColumnService(columnDatabase, broker, noteService)
	sessionDatabase := sessions.NewSessionDatabase(suite.db)
	sessionService := sessions.NewSessionService(sessionDatabase, broker, columnService, noteService)
	ws := websocket.Upgrader{ReadBufferSize: 1024, WriteBufferSize: 1024}
	websocket := sessionrequests.NewWebsocket(ws, broker)
	sessionRequestDatabase := sessionrequests.NewSessionRequestDatabase(suite.db)
	sessionRequestService := sessionrequests.NewSessionRequestService(sessionRequestDatabase, broker, websocket, sessionService)
	database := NewBoardDatabase(suite.db)
	service := NewBoardService(database, broker, sessionRequestService, sessionService, columnService, noteService, reactionService, votingService, clock)

	_, err = service.SetTimer(ctx, boardId, minutes)
	assert.Nil(t, err)
	board, err := service.IncrementTimer(ctx, boardId)

	assert.Nil(t, err)
	assert.Equal(t, boardId, board.ID)
	assert.Equal(t, minutes+1, uint8(board.TimerEnd.Sub(*board.TimerStart).Minutes()))
}

func (suite *BoardServiceIntegrationTestSuite) SeedDatabase(db *bun.DB) {
	// tests users
	suite.users = make(map[string]TestUser, 2)
	suite.users["Stan"] = TestUser{id: uuid.New(), name: "Stan", accountType: common.Google}
	suite.users["Santa"] = TestUser{id: uuid.New(), name: "Santa", accountType: common.Anonymous}

	// tests boards
	suite.boards = make(map[string]Board, 10)
	firstReadName := "Read1"
	firstReadDescription := "This is a board"
	suite.boards["Read1"] = Board{ID: uuid.New(), Name: &firstReadName, Description: &firstReadDescription, Passphrase: nil, Salt: nil, AccessPolicy: Public, ShowAuthors: true, ShowNotesOfOtherUsers: true, ShowNoteReactions: true, AllowStacking: true, IsLocked: false}
	secondReadName := "Read2"
	secondReadDescription := "This is also a board"
	suite.boards["Read2"] = Board{ID: uuid.New(), Name: &secondReadName, Description: &secondReadDescription, Passphrase: nil, Salt: nil, AccessPolicy: Public, ShowAuthors: true, ShowNotesOfOtherUsers: true, ShowNoteReactions: true, AllowStacking: true, IsLocked: false}
	timerName := "TimerUpdate"
	timerDescription := "This is a board to update the timer"
	suite.boards["Timer"] = Board{ID: uuid.New(), Name: &timerName, Description: &timerDescription, Passphrase: nil, Salt: nil, AccessPolicy: Public, ShowAuthors: true, ShowNotesOfOtherUsers: true, ShowNoteReactions: true, AllowStacking: true, IsLocked: false}
	updateNamePassphrase := "UpdatePassphrase"
	updateDescriptionPassphrase := "This is a board to update"
	suite.boards["UpdatePassphrase"] = Board{ID: uuid.New(), Name: &updateNamePassphrase, Description: &updateDescriptionPassphrase, Passphrase: nil, Salt: nil, AccessPolicy: Public, ShowAuthors: true, ShowNotesOfOtherUsers: true, ShowNoteReactions: true, AllowStacking: true, IsLocked: false}
	updateNameFailPassphrase := "Update"
	updateDescriptionFailPassphrase := "This is a board to update"
	suite.boards["UpdateFailPassphrase"] = Board{ID: uuid.New(), Name: &updateNameFailPassphrase, Description: &updateDescriptionFailPassphrase, Passphrase: nil, Salt: nil, AccessPolicy: Public, ShowAuthors: true, ShowNotesOfOtherUsers: true, ShowNoteReactions: true, AllowStacking: true, IsLocked: false}
	updateNamePublic := "Update"
	updateDescriptionPublic := "This is a board to update"
	suite.boards["UpdatePublic"] = Board{ID: uuid.New(), Name: &updateNamePublic, Description: &updateDescriptionPublic, Passphrase: nil, Salt: nil, AccessPolicy: ByPassphrase, ShowAuthors: true, ShowNotesOfOtherUsers: true, ShowNoteReactions: true, AllowStacking: true, IsLocked: false}
	updateNameFailPublic := "Update"
	updateDescriptionFailPublic := "This is a board to update"
	suite.boards["UpdateFailPublic"] = Board{ID: uuid.New(), Name: &updateNameFailPublic, Description: &updateDescriptionFailPublic, Passphrase: nil, Salt: nil, AccessPolicy: ByPassphrase, ShowAuthors: true, ShowNotesOfOtherUsers: true, ShowNoteReactions: true, AllowStacking: true, IsLocked: false}
	updateNameInvite := "Update"
	updateDescriptionInvite := "This is a board to update"
	suite.boards["UpdateInvite"] = Board{ID: uuid.New(), Name: &updateNameInvite, Description: &updateDescriptionInvite, Passphrase: nil, Salt: nil, AccessPolicy: ByInvite, ShowAuthors: true, ShowNotesOfOtherUsers: true, ShowNoteReactions: true, AllowStacking: true, IsLocked: false}
	updateNameFailInvite := "Update"
	updateDescriptionFailInvite := "This is a board to update"
	suite.boards["UpdateFailInvite"] = Board{ID: uuid.New(), Name: &updateNameFailInvite, Description: &updateDescriptionFailInvite, Passphrase: nil, Salt: nil, AccessPolicy: ByInvite, ShowAuthors: true, ShowNotesOfOtherUsers: true, ShowNoteReactions: true, AllowStacking: true, IsLocked: false}
	deleteName := "DeleteBoard"
	deleteDescription := "This is a board to delete"
	suite.boards["Delete"] = Board{ID: uuid.New(), Name: &deleteName, Description: &deleteDescription, Passphrase: nil, Salt: nil, AccessPolicy: Public, ShowAuthors: true, ShowNotesOfOtherUsers: true, ShowNoteReactions: true, AllowStacking: true, IsLocked: false}

	// test sessions
	suite.sessions = make(map[string]TestSession, 2)
	suite.sessions["Read1"] = TestSession{board: suite.boards["Read1"].ID, user: suite.users["Stan"].id}
	suite.sessions["Read2"] = TestSession{board: suite.boards["Read2"].ID, user: suite.users["Stan"].id}

	for _, user := range suite.users {
		err := initialize.InsertUser(db, user.id, user.name, string(user.accountType))
		if err != nil {
			log.Fatalf("Failed to insert test user %s", err)
		}
	}

	for _, board := range suite.boards {
		err := initialize.InsertBoard(db, board.ID, *board.Name, *board.Description, board.Passphrase, board.Salt, string(board.AccessPolicy), board.ShowAuthors, board.ShowNotesOfOtherUsers, board.ShowNoteReactions, board.AllowStacking, board.IsLocked)
		if err != nil {
			log.Fatalf("Failed to insert test boards %s", err)
		}
	}

	for _, session := range suite.sessions {
		err := initialize.InsertSession(db, session.user, session.board, string(common.ParticipantRole), false, true, true, false)
		if err != nil {
			log.Fatalf("Failed to insert test sessions %s", err)
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
