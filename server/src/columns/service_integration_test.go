package columns

import (
	"context"
	"log"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"github.com/stretchr/testify/suite"
	"github.com/testcontainers/testcontainers-go/modules/nats"
	"github.com/uptrace/bun"
	"scrumlr.io/server/cache"
	"scrumlr.io/server/common"
	"scrumlr.io/server/initialize"
	"scrumlr.io/server/initialize/testDbTemplates"
	"scrumlr.io/server/notes"
	"scrumlr.io/server/realtime"
	"scrumlr.io/server/technical_helper"
)

type ColumnServiceIntegrationTestSuite struct {
	suite.Suite
	natsContainer        *nats.NATSContainer
	natsConnectionString string
	broker               *realtime.Broker
	columnService        ColumnService

	// Additional test-specific data
	boards  map[string]testDbTemplates.TestBoard
	columns map[string]DatabaseColumn
}

func TestColumnServiceIntegrationTestSuite(t *testing.T) {
	suite.Run(t, new(ColumnServiceIntegrationTestSuite))
}

func (suite *ColumnServiceIntegrationTestSuite) SetupSuite() {
	natsContainer, connectionString := initialize.StartTestNats()

	suite.natsContainer = natsContainer
	suite.natsConnectionString = connectionString
	suite.initTestData()
}

func (suite *ColumnServiceIntegrationTestSuite) TearDownSuite() {
	initialize.StopTestNats(suite.natsContainer)
}

func (suite *ColumnServiceIntegrationTestSuite) SetupTest() {
	db := testDbTemplates.NewBaseTestDB(
		suite.T(),
		false,
		testDbTemplates.AdditionalSeed{
			Name: "columns_test",
			Func: suite.seedColumnsTestData,
		},
	)

	broker, err := realtime.NewNats(suite.natsConnectionString)
	require.NoError(suite.T(), err, "Failed to connect to nats server")
	suite.broker = broker

	ch, err := cache.NewNats(suite.natsConnectionString, "scrumlr-test-columns")
	require.NoError(suite.T(), err, "Failed to connect to nats cache")

	notesDatabase := notes.NewNotesDatabase(db)
	noteService := notes.NewNotesService(notesDatabase, broker, ch)
	database := NewColumnsDatabase(db)
	suite.columnService = NewColumnService(database, broker, noteService)
}

func (suite *ColumnServiceIntegrationTestSuite) initTestData() {
	suite.boards = map[string]testDbTemplates.TestBoard{
		"InsertNoIndex": {Name: "InsertNoIndex", ID: uuid.MustParse("c1d2e3f4-a5b6-7890-abcd-ef1234567001")},
		"InsertFirst":   {Name: "InsertFirst", ID: uuid.MustParse("c1d2e3f4-a5b6-7890-abcd-ef1234567002")},
		"InsertLast":    {Name: "InsertLast", ID: uuid.MustParse("c1d2e3f4-a5b6-7890-abcd-ef1234567003")},
		"InsertHigh":    {Name: "InsertHigh", ID: uuid.MustParse("c1d2e3f4-a5b6-7890-abcd-ef1234567004")},
		"InsertMiddle":  {Name: "InsertMiddle", ID: uuid.MustParse("c1d2e3f4-a5b6-7890-abcd-ef1234567005")},
		"Update":        {Name: "Update", ID: uuid.MustParse("c1d2e3f4-a5b6-7890-abcd-ef1234567006")},
		"Delete":        {Name: "Delete", ID: uuid.MustParse("c1d2e3f4-a5b6-7890-abcd-ef1234567007")},
		"Read":          {Name: "Read", ID: uuid.MustParse("c1d2e3f4-a5b6-7890-abcd-ef1234567008")},
		"ReadFilter":    {Name: "ReadFilter", ID: uuid.MustParse("c1d2e3f4-a5b6-7890-abcd-ef1234567009")},
		"UpdateAll":     {Name: "UpdateAll", ID: uuid.MustParse("c1d2e3f4-a5b6-7890-abcd-ef1234567010")},
	}

	suite.columns = map[string]DatabaseColumn{
		// Columns for insert tests
		"InsertLast":    {ID: uuid.MustParse("d1e2f3a4-b5c6-7890-abcd-ef1234567001"), Board: suite.boards["InsertLast"].ID, Name: "Column 1", Description: "This is a description", Color: ColorPlanningPink, Visible: true, Index: 0},
		"InsertHigh":    {ID: uuid.MustParse("d1e2f3a4-b5c6-7890-abcd-ef1234567002"), Board: suite.boards["InsertHigh"].ID, Name: "Column 1", Description: "This is a description", Color: ColorPlanningPink, Visible: true, Index: 0},
		"InsertMiddle0": {ID: uuid.MustParse("d1e2f3a4-b5c6-7890-abcd-ef1234567003"), Board: suite.boards["InsertMiddle"].ID, Name: "Column 1", Description: "This is a description", Color: ColorPlanningPink, Visible: true, Index: 0},
		"InsertMiddle1": {ID: uuid.MustParse("d1e2f3a4-b5c6-7890-abcd-ef1234567004"), Board: suite.boards["InsertMiddle"].ID, Name: "Column 2", Description: "This is a description", Color: ColorPlanningPink, Visible: true, Index: 1},
		// Columns for update tests
		"Update":  {ID: uuid.MustParse("d1e2f3a4-b5c6-7890-abcd-ef1234567005"), Board: suite.boards["Update"].ID, Name: "Column 1", Description: "This is a description", Color: ColorPlanningPink, Visible: true, Index: 0},
		"Update1": {ID: uuid.MustParse("d1e2f3a4-b5c6-7890-abcd-ef1234567006"), Board: suite.boards["Update"].ID, Name: "Column 2", Description: "This is a description", Color: ColorYieldingYellow, Visible: true, Index: 1},
		// Columns for delete tests
		"Delete": {ID: uuid.MustParse("d1e2f3a4-b5c6-7890-abcd-ef1234567007"), Board: suite.boards["Delete"].ID, Name: "Column 1", Description: "This is a description", Color: ColorGoalGreen, Visible: true, Index: 0},
		// Columns for read tests
		"Read1": {ID: uuid.MustParse("d1e2f3a4-b5c6-7890-abcd-ef1234567008"), Board: suite.boards["Read"].ID, Name: "Column 1", Description: "This is a description", Color: ColorBacklogBlue, Visible: true, Index: 0},
		"Read2": {ID: uuid.MustParse("d1e2f3a4-b5c6-7890-abcd-ef1234567009"), Board: suite.boards["Read"].ID, Name: "Column 2", Description: "This is a description", Color: ColorBacklogBlue, Visible: true, Index: 1},
		"Read3": {ID: uuid.MustParse("d1e2f3a4-b5c6-7890-abcd-ef1234567010"), Board: suite.boards["Read"].ID, Name: "Column 3", Description: "This is a description", Color: ColorBacklogBlue, Visible: true, Index: 2},
	}
}

func (suite *ColumnServiceIntegrationTestSuite) Test_Create_WithoutIndex() {
	t := suite.T()
	ctx := context.Background()

	boardId := suite.boards["InsertNoIndex"].ID
	name := "Create no index"
	description := "This is inserted from the test"
	color := ColorOnlineOrange
	visible := true
	index := 0

	events := suite.broker.GetBoardChannel(ctx, boardId)

	column, err := suite.columnService.Create(ctx, ColumnRequest{Board: boardId, Name: name, Description: description, Color: color, Visible: &visible})

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

	boardId := suite.boards["InsertMiddle"].ID
	name := "Create middle index"
	description := "This is inserted from the test"
	color := ColorOnlineOrange
	visible := true
	index := 1

	events := suite.broker.GetBoardChannel(ctx, boardId)

	column, err := suite.columnService.Create(ctx,
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

	events := suite.broker.GetBoardChannel(ctx, boardId)

	column, err := suite.columnService.Update(ctx, ColumnUpdateRequest{ID: columnId, Board: boardId, Name: name, Description: description, Color: color, Visible: visible, Index: index})

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

	events := suite.broker.GetBoardChannel(ctx, boardId)

	err := suite.columnService.Delete(ctx, boardId, columnId, userId)

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

	column, err := suite.columnService.Get(ctx, boardId, columnId)

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

	column, err := suite.columnService.Get(ctx, boardId, columnId)

	assert.Nil(t, column)
	assert.NotNil(t, err)
	assert.Equal(t, common.NotFoundError, err)
}

func (suite *ColumnServiceIntegrationTestSuite) Test_GetAll() {
	t := suite.T()
	ctx := context.Background()

	boardId := suite.boards["Read"].ID

	columns, err := suite.columnService.GetAll(ctx, boardId)

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

	columns, err := suite.columnService.GetAll(ctx, boardId)

	assert.Nil(t, err)
	assert.Len(t, columns, 0)
}

func (suite *ColumnServiceIntegrationTestSuite) Test_GetCount() {
	t := suite.T()
	ctx := context.Background()

	boardId := suite.boards["Read"].ID

	count, err := suite.columnService.GetCount(ctx, boardId)

	assert.Nil(t, err)
	assert.Equal(t, 3, count)
}

func (suite *ColumnServiceIntegrationTestSuite) Test_GetCount_BoarNotFound() {
	t := suite.T()
	ctx := context.Background()

	boardId := uuid.New()

	count, err := suite.columnService.GetCount(ctx, boardId)

	assert.Nil(t, err)
	assert.Equal(t, 0, count)
}

func (suite *ColumnServiceIntegrationTestSuite) seedColumnsTestData(db *bun.DB) {
	log.Println("Seeding columns test data")

	for _, board := range suite.boards {
		if err := testDbTemplates.InsertBoard(db, board.ID, board.Name, "", nil, nil, "PUBLIC", true, true, true, true, false); err != nil {
			log.Fatalf("Failed to insert board %s: %s", board.Name, err)
		}
	}

	for _, column := range suite.columns {
		if err := testDbTemplates.InsertColumn(db, column.ID, column.Board, column.Name, column.Description, string(column.Color), column.Visible, column.Index); err != nil {
			log.Fatalf("Failed to insert column: %s", err)
		}
	}
}
