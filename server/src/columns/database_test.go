package columns

import (
	"context"
	"database/sql"
	"log"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"
	"github.com/testcontainers/testcontainers-go/modules/postgres"
	"github.com/uptrace/bun"
	"scrumlr.io/server/initialize"
)

type DatabaseColumnTestSuite struct {
	suite.Suite
	container *postgres.PostgresContainer
	db        *bun.DB
	boards    map[string]TestBoard
	columns   map[string]DatabaseColumn
}

func TestDatabaseBoardTemplateTestSuite(t *testing.T) {
	suite.Run(t, new(DatabaseColumnTestSuite))
}

func (suite *DatabaseColumnTestSuite) SetupSuite() {
	container, bun := initialize.StartTestDatabase()

	suite.SeedDatabase(bun)

	suite.container = container
	suite.db = bun
}

func (suite *DatabaseColumnTestSuite) TearDownSuite() {
	initialize.StopTestDatabase(suite.container)
}

func (suite *DatabaseColumnTestSuite) Test_Database_Create() {
	t := suite.T()
	database := NewColumnsDatabase(suite.db)

	boardId := suite.boards["InsertNoIndex"].id
	name := "Create no index"
	description := "This is inserted from the test"
	color := ColorOnlineOrange
	visible := true
	index := 0

	dbColumn, err := database.Create(context.Background(),
		DatabaseColumnInsert{
			Board:       boardId,
			Name:        name,
			Description: description,
			Color:       color,
			Visible:     &visible,
		},
	)

	assert.Nil(t, err)
	assert.Equal(t, boardId, dbColumn.Board)
	assert.Equal(t, name, dbColumn.Name)
	assert.Equal(t, description, dbColumn.Description)
	assert.Equal(t, index, dbColumn.Index)
	assert.Equal(t, color, dbColumn.Color)
	assert.Equal(t, visible, dbColumn.Visible)
}

func (suite *DatabaseColumnTestSuite) Test_Database_Create_FirstIndex() {
	t := suite.T()
	database := NewColumnsDatabase(suite.db)

	boardId := suite.boards["InsertFirst"].id
	name := "Create first"
	description := "This is inserted from the test"
	color := ColorOnlineOrange
	visible := true
	index := 0

	dbColumn, err := database.Create(context.Background(),
		DatabaseColumnInsert{
			Board:       boardId,
			Name:        name,
			Description: description,
			Color:       color,
			Visible:     &visible,
			Index:       index,
		},
	)

	assert.Nil(t, err)
	assert.Equal(t, boardId, dbColumn.Board)
	assert.Equal(t, name, dbColumn.Name)
	assert.Equal(t, description, dbColumn.Description)
	assert.Equal(t, index, dbColumn.Index)
	assert.Equal(t, color, dbColumn.Color)
	assert.Equal(t, visible, dbColumn.Visible)
}

func (suite *DatabaseColumnTestSuite) Test_Database_Create_NegativeIndex() {
	t := suite.T()
	database := NewColumnsDatabase(suite.db)

	boardId := suite.boards["InsertFirst"].id
	name := "Create neagtive index"
	description := "This is inserted from the test"
	color := ColorOnlineOrange
	visible := true
	index := -1
	expectedIndex := -1

	dbColumn, err := database.Create(context.Background(),
		DatabaseColumnInsert{
			Board:       boardId,
			Name:        name,
			Description: description,
			Color:       color,
			Visible:     &visible,
			Index:       index,
		},
	)

	assert.Nil(t, err)
	assert.Equal(t, boardId, dbColumn.Board)
	assert.Equal(t, name, dbColumn.Name)
	assert.Equal(t, description, dbColumn.Description)
	assert.Equal(t, expectedIndex, dbColumn.Index)
	assert.Equal(t, color, dbColumn.Color)
	assert.Equal(t, visible, dbColumn.Visible)
}

func (suite *DatabaseColumnTestSuite) Test_Database_Create_LastIndex() {
	t := suite.T()
	database := NewColumnsDatabase(suite.db)

	boardId := suite.boards["InsertLast"].id
	name := "Create last index"
	description := "This is inserted from the test"
	color := ColorOnlineOrange
	visible := true
	index := 1

	dbColumn, err := database.Create(context.Background(),
		DatabaseColumnInsert{
			Board:       boardId,
			Name:        name,
			Description: description,
			Color:       color,
			Visible:     &visible,
			Index:       index,
		},
	)

	assert.Nil(t, err)
	assert.Equal(t, boardId, dbColumn.Board)
	assert.Equal(t, name, dbColumn.Name)
	assert.Equal(t, description, dbColumn.Description)
	assert.Equal(t, index, dbColumn.Index)
	assert.Equal(t, color, dbColumn.Color)
	assert.Equal(t, visible, dbColumn.Visible)
}

func (suite *DatabaseColumnTestSuite) Test_Database_Create_HighIndex() {
	t := suite.T()
	database := NewColumnsDatabase(suite.db)

	boardId := suite.boards["InsertHigh"].id
	name := "Create high index"
	description := "This is inserted from the test"
	color := ColorOnlineOrange
	visible := true
	index := 99
	expectedIndex := 99

	dbColumn, err := database.Create(context.Background(),
		DatabaseColumnInsert{
			Board:       boardId,
			Name:        name,
			Description: description,
			Color:       color,
			Visible:     &visible,
			Index:       index,
		},
	)

	assert.Nil(t, err)
	assert.Equal(t, boardId, dbColumn.Board)
	assert.Equal(t, name, dbColumn.Name)
	assert.Equal(t, description, dbColumn.Description)
	assert.Equal(t, expectedIndex, dbColumn.Index)
	assert.Equal(t, color, dbColumn.Color)
	assert.Equal(t, visible, dbColumn.Visible)
}

func (suite *DatabaseColumnTestSuite) Test_Database_Create_MiddleIndex() {
	t := suite.T()
	database := NewColumnsDatabase(suite.db)

	boardId := suite.boards["InsertMiddle"].id
	name := "Create middle index"
	description := "This is inserted from the test"
	color := ColorOnlineOrange
	visible := true
	index := 1

	dbColumn, err := database.Create(context.Background(),
		DatabaseColumnInsert{
			Board:       boardId,
			Name:        name,
			Description: description,
			Color:       color,
			Visible:     &visible,
			Index:       index,
		},
	)

	assert.Nil(t, err)
	assert.Equal(t, boardId, dbColumn.Board)
	assert.Equal(t, name, dbColumn.Name)
	assert.Equal(t, description, dbColumn.Description)
	assert.Equal(t, index, dbColumn.Index)
	assert.Equal(t, color, dbColumn.Color)
	assert.Equal(t, visible, dbColumn.Visible)
}

func (suite *DatabaseColumnTestSuite) Test_Database_Create_EmptyName() {
	t := suite.T()
	database := NewColumnsDatabase(suite.db)

	boardId := suite.boards["InsertFirst"].id
	name := ""
	description := "This is inserted from the test"
	color := ColorOnlineOrange
	visible := true
	index := 1

	dbColumn, err := database.Create(context.Background(),
		DatabaseColumnInsert{
			Board:       boardId,
			Name:        name,
			Description: description,
			Color:       color,
			Visible:     &visible,
			Index:       index,
		})

	assert.NotNil(t, err)
	assert.Equal(t, DatabaseColumn{}, dbColumn)
}

func (suite *DatabaseColumnTestSuite) Test_Database_Create_EmptyColor() {
	t := suite.T()
	database := NewColumnsDatabase(suite.db)

	boardId := suite.boards["InsertFirst"].id
	name := ""
	description := "This is inserted from the test"
	visible := true
	index := 1

	dbColumn, err := database.Create(context.Background(),
		DatabaseColumnInsert{
			Board:       boardId,
			Name:        name,
			Description: description,
			Color:       "",
			Visible:     &visible,
			Index:       index,
		},
	)

	assert.NotNil(t, err)
	assert.Equal(t, DatabaseColumn{}, dbColumn)
}

func (suite *DatabaseColumnTestSuite) Test_Database_Update() {
	t := suite.T()
	database := NewColumnsDatabase(suite.db)

	columnId := suite.columns["Update"].ID
	boardId := suite.columns["Update"].Board
	name := "Column Updated"
	description := "This column was updated"
	color := ColorOnlineOrange
	visible := false
	index := 1

	dbColumn, err := database.Update(context.Background(), DatabaseColumnUpdate{ID: columnId, Board: boardId, Name: name, Description: description, Color: color, Visible: visible, Index: index})

	assert.Nil(t, err)
	assert.Equal(t, columnId, dbColumn.ID)
	assert.Equal(t, boardId, dbColumn.Board)
	assert.Equal(t, name, dbColumn.Name)
	assert.Equal(t, description, dbColumn.Description)
	assert.Equal(t, index, dbColumn.Index)
	assert.Equal(t, color, dbColumn.Color)
	assert.Equal(t, visible, dbColumn.Visible)
}

func (suite *DatabaseColumnTestSuite) Test_Database_Delete() {
	t := suite.T()
	database := NewColumnsDatabase(suite.db)

	columnId := suite.columns["Delete"].ID
	boardId := suite.columns["Delete"].Board

	err := database.Delete(context.Background(), boardId, columnId)

	assert.Nil(t, err)
}

func (suite *DatabaseColumnTestSuite) Test_Database_Get() {
	t := suite.T()
	database := NewColumnsDatabase(suite.db)

	columnId := suite.columns["Read1"].ID
	boardId := suite.columns["Read1"].Board

	dbColumn, err := database.Get(context.Background(), boardId, columnId)

	assert.Nil(t, err)
	assert.Equal(t, columnId, dbColumn.ID)
	assert.Equal(t, boardId, dbColumn.Board)
	assert.Equal(t, suite.columns["Read1"].Name, dbColumn.Name)
	assert.Equal(t, suite.columns["Read1"].Description, dbColumn.Description)
	assert.Equal(t, suite.columns["Read1"].Index, dbColumn.Index)
	assert.Equal(t, suite.columns["Read1"].Color, dbColumn.Color)
	assert.Equal(t, suite.columns["Read1"].Visible, dbColumn.Visible)
}

func (suite *DatabaseColumnTestSuite) Test_Database_Get_NotFound_Column() {
	t := suite.T()
	database := NewColumnsDatabase(suite.db)

	columnId := uuid.New()
	boardId := suite.columns["Read1"].Board

	dbColumn, err := database.Get(context.Background(), boardId, columnId)

	assert.NotNil(t, err)
	assert.Equal(t, sql.ErrNoRows, err)
	assert.Equal(t, DatabaseColumn{}, dbColumn)
}

func (suite *DatabaseColumnTestSuite) Test_Database_Get_NotFound_Board() {
	t := suite.T()
	database := NewColumnsDatabase(suite.db)

	columnId := suite.columns["Read1"].ID
	boardId := uuid.New()

	dbColumn, err := database.Get(context.Background(), boardId, columnId)

	assert.NotNil(t, err)
	assert.Equal(t, sql.ErrNoRows, err)
	assert.Equal(t, DatabaseColumn{}, dbColumn)
}

func (suite *DatabaseColumnTestSuite) Test_Database_GetAll() {
	t := suite.T()
	database := NewColumnsDatabase(suite.db)

	boardId := suite.boards["Read"].id

	dbColumns, err := database.GetAll(context.Background(), boardId)

	assert.Nil(t, err)
	assert.Len(t, dbColumns, 3)

	assert.Equal(t, boardId, dbColumns[0].Board)
	assert.Equal(t, suite.columns["Read1"].ID, dbColumns[0].ID)
	assert.Equal(t, suite.columns["Read1"].Name, dbColumns[0].Name)
	assert.Equal(t, suite.columns["Read1"].Description, dbColumns[0].Description)
	assert.Equal(t, suite.columns["Read1"].Index, dbColumns[0].Index)
	assert.Equal(t, suite.columns["Read1"].Color, dbColumns[0].Color)
	assert.Equal(t, suite.columns["Read1"].Visible, dbColumns[0].Visible)

	assert.Equal(t, boardId, dbColumns[1].Board)
	assert.Equal(t, suite.columns["Read2"].ID, dbColumns[1].ID)
	assert.Equal(t, suite.columns["Read2"].Name, dbColumns[1].Name)
	assert.Equal(t, suite.columns["Read2"].Description, dbColumns[1].Description)
	assert.Equal(t, suite.columns["Read2"].Index, dbColumns[1].Index)
	assert.Equal(t, suite.columns["Read2"].Color, dbColumns[1].Color)
	assert.Equal(t, suite.columns["Read2"].Visible, dbColumns[1].Visible)

	assert.Equal(t, boardId, dbColumns[2].Board)
	assert.Equal(t, suite.columns["Read3"].ID, dbColumns[2].ID)
	assert.Equal(t, suite.columns["Read3"].Name, dbColumns[2].Name)
	assert.Equal(t, suite.columns["Read3"].Description, dbColumns[2].Description)
	assert.Equal(t, suite.columns["Read3"].Index, dbColumns[2].Index)
	assert.Equal(t, suite.columns["Read3"].Color, dbColumns[2].Color)
	assert.Equal(t, suite.columns["Read3"].Visible, dbColumns[2].Visible)
}

func (suite *DatabaseColumnTestSuite) Test_Database_GetAll_NotFound() {
	t := suite.T()
	database := NewColumnsDatabase(suite.db)

	boardId := uuid.New()

	dbColumns, err := database.GetAll(context.Background(), boardId)

	assert.Nil(t, err)
	assert.Len(t, dbColumns, 0)
}

type TestBoard struct {
	id   uuid.UUID
	name string
}

func (suite *DatabaseColumnTestSuite) SeedDatabase(db *bun.DB) {
	// test boards
	suite.boards = make(map[string]TestBoard, 9)
	suite.boards["InsertNoIndex"] = TestBoard{id: uuid.New(), name: "InsertNoIndex"}
	suite.boards["InsertFirst"] = TestBoard{id: uuid.New(), name: "InsertFirst"}
	suite.boards["InsertLast"] = TestBoard{id: uuid.New(), name: "InsertLast"}
	suite.boards["InsertHigh"] = TestBoard{id: uuid.New(), name: "InsertLast"}
	suite.boards["InsertMiddle"] = TestBoard{id: uuid.New(), name: "InsertLast"}
	suite.boards["Update"] = TestBoard{id: uuid.New(), name: "Update"}
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
	suite.columns["Delete"] = DatabaseColumn{ID: uuid.New(), Board: suite.boards["Update"].id, Name: "Column 3", Description: "This is a description", Color: ColorGoalGreen, Visible: true, Index: 2}
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
