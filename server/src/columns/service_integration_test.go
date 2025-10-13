package columns

import (
	"context"
	"log"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"
	"github.com/testcontainers/testcontainers-go/modules/nats"
	"github.com/testcontainers/testcontainers-go/modules/postgres"
	"github.com/uptrace/bun"
	"scrumlr.io/server/common"
	"scrumlr.io/server/initialize"
	"scrumlr.io/server/notes"
	"scrumlr.io/server/realtime"
	"scrumlr.io/server/technical_helper"
)

// TODO: check if user can be removed from CreateRequest
type ColumnServiceIntegrationTestSuite struct {
	suite.Suite
	dbContainer          *postgres.PostgresContainer
	natsContainer        *nats.NATSContainer
	db                   *bun.DB
	natsConnectionString string
	boards               map[string]TestBoard
	columns              map[string]DatabaseColumn
}

func TestColumnServiceIntegrationTestSuite(t *testing.T) {
	suite.Run(t, new(ColumnServiceIntegrationTestSuite))
}

func (suite *ColumnServiceIntegrationTestSuite) SetupSuite() {
	dbContainer, bun := initialize.StartTestDatabase()
	suite.SeedDatabase(bun)
	natsContainer, connectionString := initialize.StartTestNats()

	suite.dbContainer = dbContainer
	suite.natsContainer = natsContainer
	suite.db = bun
	suite.natsConnectionString = connectionString
}

func (suite *ColumnServiceIntegrationTestSuite) TearDownSuite() {
	initialize.StopTestDatabase(suite.dbContainer)
	initialize.StopTestNats(suite.natsContainer)
}

func (suite *ColumnServiceIntegrationTestSuite) Test_Create_WithoutIndex() {
	t := suite.T()
	ctx := context.Background()

	boardId := suite.boards["InsertNoIndex"].id
	name := "Create no index"
	description := "This is inserted from the test"
	color := ColorOnlineOrange
	visible := true
	index := 0

	broker, err := realtime.NewNats(suite.natsConnectionString)
	if err != nil {
		log.Fatalf("Faild to connect to nats server %s", err)
	}

	events := broker.GetBoardChannel(ctx, boardId)

	notesDatabase := notes.NewNotesDatabase(suite.db)
	noteService := notes.NewNotesService(notesDatabase, broker)
	database := NewColumnsDatabase(suite.db)
	service := NewColumnService(database, broker, noteService)

	column, err := service.Create(ctx, ColumnRequest{Board: boardId, Name: name, Description: description, Color: color, Visible: &visible})

	assert.Nil(t, err)
	assert.Equal(t, name, column.Name)
	assert.Equal(t, description, column.Description)
	assert.Equal(t, color, column.Color)
	assert.Equal(t, visible, column.Visible)
	assert.Equal(t, index, column.Index)

	msg := <-events
	assert.Equal(t, realtime.BoardEventColumnsUpdated, msg.Type)
	columnData, err := technical_helper.Unmarshal[[]Column](msg.Data)
	assert.Nil(t, err)
	assert.Len(t, *columnData, 1)

	notesMsg := <-events
	assert.Equal(t, realtime.BoardEventNotesSync, notesMsg.Type)
	notesData, err := technical_helper.Unmarshal[[]notes.Note](notesMsg.Data)
	assert.Nil(t, err)
	assert.Nil(t, notesData)
}

func (suite *ColumnServiceIntegrationTestSuite) Test_Create_WithIndex() {
	t := suite.T()
	ctx := context.Background()

	boardId := suite.boards["InsertMiddle"].id
	name := "Create middle index"
	description := "This is inserted from the test"
	color := ColorOnlineOrange
	visible := true
	index := 1

	broker, err := realtime.NewNats(suite.natsConnectionString)
	if err != nil {
		log.Fatalf("Faild to connect to nats server %s", err)
	}

	events := broker.GetBoardChannel(ctx, boardId)

	notesDatabase := notes.NewNotesDatabase(suite.db)
	noteService := notes.NewNotesService(notesDatabase, broker)
	database := NewColumnsDatabase(suite.db)
	service := NewColumnService(database, broker, noteService)

	column, err := service.Create(ctx,
		ColumnRequest{
			Board:       boardId,
			Name:        name,
			Description: description,
			Color:       color,
			Visible:     &visible,
			Index:       &index,
		},
	)

	assert.Nil(t, err)
	assert.Equal(t, name, column.Name)
	assert.Equal(t, description, column.Description)
	assert.Equal(t, color, column.Color)
	assert.Equal(t, visible, column.Visible)
	assert.Equal(t, index, column.Index)

	colunMsg := <-events
	assert.Equal(t, realtime.BoardEventColumnsUpdated, colunMsg.Type)
	columnData, err := technical_helper.Unmarshal[[]Column](colunMsg.Data)
	assert.Nil(t, err)
	assert.Len(t, *columnData, 3)

	notesMsg := <-events
	assert.Equal(t, realtime.BoardEventNotesSync, notesMsg.Type)
	notesData, err := technical_helper.Unmarshal[[]notes.Note](notesMsg.Data)
	assert.Nil(t, err)
	assert.Nil(t, notesData)
}

func (suite *ColumnServiceIntegrationTestSuite) Test_Update() {
	t := suite.T()
	ctx := context.Background()

	columnId := suite.columns["Update"].ID
	boardId := suite.columns["Update"].Board
	name := "Column Updated"
	description := "This column was updated"
	color := ColorOnlineOrange
	visible := false
	index := 1

	broker, err := realtime.NewNats(suite.natsConnectionString)
	if err != nil {
		log.Fatalf("Faild to connect to nats server %s", err)
	}

	events := broker.GetBoardChannel(ctx, boardId)

	notesDatabase := notes.NewNotesDatabase(suite.db)
	noteService := notes.NewNotesService(notesDatabase, broker)
	database := NewColumnsDatabase(suite.db)
	service := NewColumnService(database, broker, noteService)

	column, err := service.Update(ctx, ColumnUpdateRequest{ID: columnId, Board: boardId, Name: name, Description: description, Color: color, Visible: visible, Index: index})

	assert.Nil(t, err)
	assert.Equal(t, columnId, column.ID)
	assert.Equal(t, name, column.Name)
	assert.Equal(t, description, column.Description)
	assert.Equal(t, color, column.Color)
	assert.Equal(t, visible, column.Visible)
	assert.Equal(t, index, column.Index)

	msg := <-events
	assert.Equal(t, realtime.BoardEventColumnsUpdated, msg.Type)
	columnData, err := technical_helper.Unmarshal[[]Column](msg.Data)
	assert.Nil(t, err)
	assert.Len(t, *columnData, 2)

	notesMsg := <-events
	assert.Equal(t, realtime.BoardEventNotesSync, notesMsg.Type)
	notesData, err := technical_helper.Unmarshal[[]notes.Note](notesMsg.Data)
	assert.Nil(t, err)
	assert.Nil(t, notesData)
}

func (suite *ColumnServiceIntegrationTestSuite) Test_Delete() {
	t := suite.T()
	ctx := context.Background()

	columnId := suite.columns["Delete"].ID
	boardId := suite.columns["Delete"].Board
	userId := uuid.New()

	broker, err := realtime.NewNats(suite.natsConnectionString)
	if err != nil {
		log.Fatalf("Faild to connect to nats server %s", err)
	}

	events := broker.GetBoardChannel(ctx, boardId)

	notesDatabase := notes.NewNotesDatabase(suite.db)
	noteService := notes.NewNotesService(notesDatabase, broker)
	database := NewColumnsDatabase(suite.db)
	service := NewColumnService(database, broker, noteService)

	err = service.Delete(ctx, boardId, columnId, userId)

	assert.Nil(t, err)

	msg := <-events
	assert.Equal(t, realtime.BoardEventColumnDeleted, msg.Type)
	type DeleteColumn struct {
		Column uuid.UUID
		Notes  []uuid.UUID
	}
	columnData, err := technical_helper.Unmarshal[DeleteColumn](msg.Data)
	assert.Nil(t, err)
	assert.Equal(t, columnId, columnData.Column)
}

func (suite *ColumnServiceIntegrationTestSuite) Test_Get() {
	t := suite.T()
	ctx := context.Background()

	columnId := suite.columns["Read1"].ID
	boardId := suite.columns["Read1"].Board

	broker, err := realtime.NewNats(suite.natsConnectionString)
	if err != nil {
		log.Fatalf("Faild to connect to nats server %s", err)
	}

	notesDatabase := notes.NewNotesDatabase(suite.db)
	noteService := notes.NewNotesService(notesDatabase, broker)
	database := NewColumnsDatabase(suite.db)
	service := NewColumnService(database, broker, noteService)

	column, err := service.Get(ctx, boardId, columnId)

	assert.Nil(t, err)
	assert.Equal(t, columnId, column.ID)
	assert.Equal(t, suite.columns["Read1"].Name, column.Name)
	assert.Equal(t, suite.columns["Read1"].Description, column.Description)
	assert.Equal(t, suite.columns["Read1"].Index, column.Index)
	assert.Equal(t, suite.columns["Read1"].Color, column.Color)
	assert.Equal(t, suite.columns["Read1"].Visible, column.Visible)
}

func (suite *ColumnServiceIntegrationTestSuite) Test_Get_NotFound() {
	t := suite.T()
	ctx := context.Background()

	columnId := uuid.New()
	boardId := uuid.New()

	broker, err := realtime.NewNats(suite.natsConnectionString)
	if err != nil {
		log.Fatalf("Faild to connect to nats server %s", err)
	}

	notesDatabase := notes.NewNotesDatabase(suite.db)
	noteService := notes.NewNotesService(notesDatabase, broker)
	database := NewColumnsDatabase(suite.db)
	service := NewColumnService(database, broker, noteService)

	column, err := service.Get(ctx, boardId, columnId)

	assert.Nil(t, column)
	assert.NotNil(t, err)
	assert.Equal(t, common.NotFoundError, err)
}

func (suite *ColumnServiceIntegrationTestSuite) Test_GetAll() {
	t := suite.T()
	ctx := context.Background()

	boardId := suite.boards["Read"].id

	broker, err := realtime.NewNats(suite.natsConnectionString)
	if err != nil {
		log.Fatalf("Faild to connect to nats server %s", err)
	}

	notesDatabase := notes.NewNotesDatabase(suite.db)
	noteService := notes.NewNotesService(notesDatabase, broker)
	database := NewColumnsDatabase(suite.db)
	service := NewColumnService(database, broker, noteService)

	columns, err := service.GetAll(ctx, boardId)

	assert.Nil(t, err)
	assert.Len(t, columns, 3)

	assert.Equal(t, suite.columns["Read1"].ID, columns[0].ID)
	assert.Equal(t, suite.columns["Read1"].Name, columns[0].Name)
	assert.Equal(t, suite.columns["Read1"].Description, columns[0].Description)
	assert.Equal(t, suite.columns["Read1"].Index, columns[0].Index)
	assert.Equal(t, suite.columns["Read1"].Color, columns[0].Color)
	assert.Equal(t, suite.columns["Read1"].Visible, columns[0].Visible)

	assert.Equal(t, suite.columns["Read2"].ID, columns[1].ID)
	assert.Equal(t, suite.columns["Read2"].Name, columns[1].Name)
	assert.Equal(t, suite.columns["Read2"].Description, columns[1].Description)
	assert.Equal(t, suite.columns["Read2"].Index, columns[1].Index)
	assert.Equal(t, suite.columns["Read2"].Color, columns[1].Color)
	assert.Equal(t, suite.columns["Read2"].Visible, columns[1].Visible)

	assert.Equal(t, suite.columns["Read3"].ID, columns[2].ID)
	assert.Equal(t, suite.columns["Read3"].Name, columns[2].Name)
	assert.Equal(t, suite.columns["Read3"].Description, columns[2].Description)
	assert.Equal(t, suite.columns["Read3"].Index, columns[2].Index)
	assert.Equal(t, suite.columns["Read3"].Color, columns[2].Color)
	assert.Equal(t, suite.columns["Read3"].Visible, columns[2].Visible)
}

func (suite *ColumnServiceIntegrationTestSuite) Test_GetAll_NotFound() {
	t := suite.T()
	ctx := context.Background()

	boardId := uuid.New()

	broker, err := realtime.NewNats(suite.natsConnectionString)
	if err != nil {
		log.Fatalf("Faild to connect to nats server %s", err)
	}

	notesDatabase := notes.NewNotesDatabase(suite.db)
	noteService := notes.NewNotesService(notesDatabase, broker)
	database := NewColumnsDatabase(suite.db)
	service := NewColumnService(database, broker, noteService)

	columns, err := service.GetAll(ctx, boardId)

	assert.Nil(t, err)
	assert.Len(t, columns, 0)
}

func (suite *ColumnServiceIntegrationTestSuite) SeedDatabase(db *bun.DB) {
	// test boards
	suite.boards = make(map[string]TestBoard, 9)
	suite.boards["InsertNoIndex"] = TestBoard{id: uuid.New(), name: "InsertNoIndex"}
	suite.boards["InsertFirst"] = TestBoard{id: uuid.New(), name: "InsertFirst"}
	suite.boards["InsertLast"] = TestBoard{id: uuid.New(), name: "InsertLast"}
	suite.boards["InsertHigh"] = TestBoard{id: uuid.New(), name: "InsertLast"}
	suite.boards["InsertMiddle"] = TestBoard{id: uuid.New(), name: "InsertLast"}
	suite.boards["Update"] = TestBoard{id: uuid.New(), name: "Update"}
	suite.boards["Delete"] = TestBoard{id: uuid.New(), name: "Delete"}
	suite.boards["Read"] = TestBoard{id: uuid.New(), name: "Read"}
	suite.boards["ReadFilter"] = TestBoard{id: uuid.New(), name: "ReadFilter"}
	suite.boards["UpdateAll"] = TestBoard{id: uuid.New(), name: "UpdateAll"}

	// test columns
	suite.columns = make(map[string]DatabaseColumn, 10)
	// test columns to insert
	suite.columns["InsertLast"] = DatabaseColumn{ID: uuid.New(), Board: suite.boards["InsertLast"].id, Name: "Column 1", Description: "This is a description", Color: ColorPlanningPink, Visible: true, Index: 0}
	suite.columns["InsertHigh"] = DatabaseColumn{ID: uuid.New(), Board: suite.boards["InsertHigh"].id, Name: "Column 1", Description: "This is a description", Color: ColorPlanningPink, Visible: true, Index: 0}
	suite.columns["InsertMiddle0"] = DatabaseColumn{ID: uuid.New(), Board: suite.boards["InsertMiddle"].id, Name: "Column 1", Description: "This is a description", Color: ColorPlanningPink, Visible: true, Index: 0}
	suite.columns["InsertMiddle1"] = DatabaseColumn{ID: uuid.New(), Board: suite.boards["InsertMiddle"].id, Name: "Column 1", Description: "This is a description", Color: ColorPlanningPink, Visible: true, Index: 1}
	// test columns to update
	suite.columns["Update"] = DatabaseColumn{ID: uuid.New(), Board: suite.boards["Update"].id, Name: "Column 1", Description: "This is a description", Color: ColorPlanningPink, Visible: true, Index: 0}
	suite.columns["Update1"] = DatabaseColumn{ID: uuid.New(), Board: suite.boards["Update"].id, Name: "Column 2", Description: "This is a description", Color: ColorYieldingYellow, Visible: true, Index: 1}
	// test columns to delete
	suite.columns["Delete"] = DatabaseColumn{ID: uuid.New(), Board: suite.boards["Delete"].id, Name: "Column 1", Description: "This is a description", Color: ColorGoalGreen, Visible: true, Index: 0}
	// test columns to read
	suite.columns["Read1"] = DatabaseColumn{ID: uuid.New(), Board: suite.boards["Read"].id, Name: "Column 1", Description: "This is a description", Color: ColorBacklogBlue, Visible: true, Index: 0}
	suite.columns["Read2"] = DatabaseColumn{ID: uuid.New(), Board: suite.boards["Read"].id, Name: "Column 2", Description: "This is a description", Color: ColorBacklogBlue, Visible: true, Index: 1}
	suite.columns["Read3"] = DatabaseColumn{ID: uuid.New(), Board: suite.boards["Read"].id, Name: "Column 3", Description: "This is a description", Color: ColorBacklogBlue, Visible: true, Index: 2}

	for _, board := range suite.boards {
		err := initialize.InsertBoard(db, board.id, board.name, "", nil, nil, "PUBLIC", true, true, true, true, false)
		if err != nil {
			log.Fatalf("Failed to insert test board %s", err)
		}
	}

	for _, column := range suite.columns {
		err := initialize.InsertColumn(db, column.ID, column.Board, column.Name, column.Description, string(column.Color), column.Visible, column.Index)
		if err != nil {
			log.Fatalf("Failed to insert test column %s", err)
		}
	}
}
