package columns

import (
	"scrumlr.io/server/technical_helper"
)

func Columns(columns []ColumnDB) []*Column {
	if columns == nil {
		return nil
	}

	return technical_helper.MapSlice[ColumnDB, *Column](columns, func(column ColumnDB) *Column {
		return new(Column).From(column)
	})
}

func (c ColumnSlice) FilterVisibleColumns() []*Column {
	return technical_helper.Filter[*Column](c, func(column *Column) bool {
		return column.Visible
	})
}

func UnmarshallColumnData(data interface{}) (ColumnSlice, error) {
	columns, err := technical_helper.UnmarshalSlice[Column](data)

	if err != nil {
		return nil, err
	}

	return columns, nil
}
