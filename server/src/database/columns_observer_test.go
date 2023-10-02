package database

/*type ColumnsObserverForTests struct {
	t             *testing.T
	board         *uuid.UUID
	columns       *[]Column
	deletedColumn *uuid.UUID
}

func (o *ColumnsObserverForTests) UpdatedColumns(board uuid.UUID, columns []Column) {
	o.board = &board
	o.columns = &columns
}

func (o *ColumnsObserverForTests) DeletedColumn(user, board, column uuid.UUID, notes []Note, votes []Vote) {
	o.board = &board
	o.deletedColumn = &column
}

func (o *ColumnsObserverForTests) Reset() {
	o.board = nil
	o.columns = nil
	o.deletedColumn = nil
}

var columnsObserver ColumnsObserverForTests
var columnsObserverTestColumn Column

func TestColumnsObserver(t *testing.T) {
	columnsObserver = ColumnsObserverForTests{t: t}
	testDb.AttachObserver(&columnsObserver)

	t.Run("Test=1", testColumnsObserverOnCreate)
	columnsObserver.Reset()
	t.Run("Test=2", testColumnsObserverOnUpdate)
	columnsObserver.Reset()
	t.Run("Test=3", testColumnsObserverOnDelete)
	columnsObserver.Reset()
	t.Run("Test=4", testColumnsObserverOnDeleteNotExisting)

	_, _ = testDb.DetachObserver(columnsObserver)
}

func testColumnsObserverOnCreate(t *testing.T) {
	board := fixture.MustRow("Board.columnsObserverTestBoard").(*Board)
	column, err := testDb.CreateColumn(ColumnInsert{Board: board.ID, Name: "Created column", Color: "backlog-blue"})

	assert.Nil(t, err)
	assert.NotNil(t, columnsObserver.board)
	assert.NotNil(t, columnsObserver.columns)

	assert.Equal(t, 1, len(*columnsObserver.columns))
	assert.Equal(t, column.Board, (*columnsObserver.columns)[0].Board)
	assert.Equal(t, column.Name, (*columnsObserver.columns)[0].Name)

	columnsObserverTestColumn = column
}
func testColumnsObserverOnUpdate(t *testing.T) {
	column, err := testDb.UpdateColumn(ColumnUpdate{
		ID:      columnsObserverTestColumn.ID,
		Board:   columnsObserverTestColumn.Board,
		Name:    "A new name",
		Color:   "backlog-blue",
		Visible: true,
		Index:   0,
	})

	assert.Nil(t, err)
	assert.NotNil(t, columnsObserver.board)
	assert.NotNil(t, columnsObserver.columns)

	assert.Equal(t, 1, len(*columnsObserver.columns))
	assert.Equal(t, column.Board, (*columnsObserver.columns)[0].Board)
	assert.Equal(t, column.Name, (*columnsObserver.columns)[0].Name)
}
func testColumnsObserverOnDelete(t *testing.T) {
	columnsObserverTestUser := fixture.MustRow("User.john").(*User)
	err := testDb.DeleteColumn(columnsObserverTestColumn.Board, columnsObserverTestColumn.ID, columnsObserverTestUser.ID)
	assert.Nil(t, err)
	assert.NotNil(t, columnsObserver.board)
	assert.NotNil(t, columnsObserver.deletedColumn)
}
func testColumnsObserverOnDeleteNotExisting(t *testing.T) {
	columnsObserverTestUser := fixture.MustRow("User.john").(*User)
	err := testDb.DeleteColumn(columnsObserverTestColumn.Board, columnsObserverTestColumn.ID, columnsObserverTestUser.ID)
	assert.Nil(t, err)
	assert.Nil(t, columnsObserver.board)
	assert.Nil(t, columnsObserver.deletedColumn)
}*/
