package columns

import (
	"math/rand"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/uptrace/bun"
)

func TestShouldFilterVisibleColumns(t *testing.T) {

	visibleColumnId := uuid.New()
	hiddenColumnId := uuid.New()

	visibleColumns := ColumnSlice{buildColumn(visibleColumnId, true), buildColumn(hiddenColumnId, false)}

	columns := visibleColumns.FilterVisibleColumns()

	assert.Equal(t, visibleColumnId, columns[0].ID)
}

func TestFromMapping(t *testing.T) {

	columnId := uuid.New()

	databaseColumn := DatabaseColumn{
		BaseModel:   bun.BaseModel{},
		ID:          uuid.New(),
		Board:       uuid.New(),
		Name:        *randSeq(10),
		Description: *randSeq(10),
		Color:       ColorBacklogBlue,
		Visible:     false,
		Index:       1,
	}

	mappedColumn := buildColumn(columnId, true).From(databaseColumn)

	assert.Equal(t, databaseColumn.ID, mappedColumn.ID)
	assert.Equal(t, databaseColumn.Name, mappedColumn.Name)
	assert.Equal(t, databaseColumn.Description, mappedColumn.Description)
	assert.Equal(t, databaseColumn.Color, mappedColumn.Color)
	assert.Equal(t, databaseColumn.Visible, mappedColumn.Visible)
	assert.Equal(t, databaseColumn.Index, mappedColumn.Index)
}

func TestColumnDatabaseMapping(t *testing.T) {

	databaseColumn := DatabaseColumn{
		BaseModel:   bun.BaseModel{},
		ID:          uuid.New(),
		Board:       uuid.New(),
		Name:        *randSeq(10),
		Description: *randSeq(10),
		Color:       ColorBacklogBlue,
		Visible:     false,
		Index:       1,
	}

	mappedColumn := Columns([]DatabaseColumn{databaseColumn})[0]

	assert.Equal(t, databaseColumn.ID, mappedColumn.ID)
	assert.Equal(t, databaseColumn.Name, mappedColumn.Name)
	assert.Equal(t, databaseColumn.Description, mappedColumn.Description)
	assert.Equal(t, databaseColumn.Color, mappedColumn.Color)
	assert.Equal(t, databaseColumn.Visible, mappedColumn.Visible)
	assert.Equal(t, databaseColumn.Index, mappedColumn.Index)
}

func TestColumnDatabaseMappingNil(t *testing.T) {

	mappedColumns := Columns(nil)

	assert.Nil(t, mappedColumns)
}

func TestUnmarshallColumnData(t *testing.T) {

	columns := ColumnSlice{buildColumn(uuid.New(), true)}

	columnSlice, err := UnmarshallColumnData(columns)

	assert.NoError(t, err)
	assert.NotEmpty(t, columnSlice)
}

func TestShouldReturnWithErrorUnmarshallColumnData(t *testing.T) {

	column := buildColumn(uuid.New(), true)

	columnSlice, err := UnmarshallColumnData(column)

	assert.Error(t, err)
	assert.Empty(t, columnSlice)
}

func buildColumn(id uuid.UUID, visible bool) *Column {
	return &Column{
		ID:      id,
		Visible: visible,
		Color:   ColorBacklogBlue,
	}
}

func randSeq(n int) *string {
	var letters = []rune("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ")

	b := make([]rune, n)
	for i := range b {
		b[i] = letters[rand.Intn(len(letters))]
	}

	s := string(b)
	return &s
}
