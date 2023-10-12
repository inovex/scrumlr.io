import {Action, ReduxAction} from "store/action";
import {ColumnsState} from "types/column";
import {TEMPORARY_COLUMN_ID} from "../../constants/misc";

// eslint-disable-next-line @typescript-eslint/default-param-last
export const columnsReducer = (state: ColumnsState = [], action: ReduxAction): ColumnsState => {
  if (action.type === Action.InitializeBoard || action.type === Action.UpdatedColumns) {
    return action.columns;
  }
  if (action.type === Action.CreateColumnOptimistically) {
    const mutableState = [...state];
    mutableState.splice(action.column.index, 0, action.column);
    return [...mutableState];
  }
  if (action.type === Action.DeleteColumnOptimistically) {
    return [...state.filter((c) => c.id !== TEMPORARY_COLUMN_ID)];
  }
  if (action.type === Action.EditColumnOptimistically) {
    const mutableState = [...state];
    return [...mutableState.map((c) => (c.id === TEMPORARY_COLUMN_ID ? {...c, name: action.column.name} : c))];
  }
  if (action.type === Action.DeletedColumn) {
    return state.filter((c) => c.id !== action.columnId);
  }

  if (action.type === Action.CreatedColumn) {
    const temporaryColumn = state.find((c) => c.id === TEMPORARY_COLUMN_ID);
    if (temporaryColumn) {
      if (temporaryColumn.name === action.column.name && temporaryColumn.color === action.column.color && temporaryColumn.visible === action.column.visible) {
        // replace temporary column by created column if they are equal
        const columns = [...state.filter((c) => c.id !== TEMPORARY_COLUMN_ID), action.column];
        return columns.sort((a, b) => action.columns_order.indexOf(a.id) - action.columns_order.indexOf(b.id));
      } 
        // create column and insert temporary column where it was before
        const indexOfTemporaryColumn = state.findIndex((c) => c.id === TEMPORARY_COLUMN_ID);

        const columns = [...state.filter((c) => c.id !== TEMPORARY_COLUMN_ID), action.column];
        const sortedColumns = columns.sort((a, b) => action.columns_order.indexOf(a.id) - action.columns_order.indexOf(b.id));

        return [...sortedColumns.slice(0, indexOfTemporaryColumn), temporaryColumn, ...sortedColumns.slice(indexOfTemporaryColumn + 1)];
      
    } 
      const columns = [...state, action.column];
      return columns.sort((a, b) => action.columns_order.indexOf(a.id) - action.columns_order.indexOf(b.id));
    
  }

  if (action.type === Action.UpdatedColumn) {
    const temporaryColumn = state.find((c) => c.id === TEMPORARY_COLUMN_ID);
    if (temporaryColumn) {
      const indexOfTemporaryColumn = state.findIndex((c) => c.id === TEMPORARY_COLUMN_ID);

      const columns = [...state.filter((c) => c.id !== TEMPORARY_COLUMN_ID), action.column];
      const sortedColumns = columns.sort((a, b) => action.columns_order.indexOf(a.id) - action.columns_order.indexOf(b.id));
      sortedColumns[action.columns_order.indexOf(action.column.id)] = action.column;

      return [...sortedColumns.slice(0, indexOfTemporaryColumn), temporaryColumn, ...sortedColumns.slice(indexOfTemporaryColumn + 1)];
    } 
      const columns = [...state].sort((a, b) => action.columns_order.indexOf(a.id) - action.columns_order.indexOf(b.id));
      columns[action.columns_order.indexOf(action.column.id)] = action.column;
      return columns;
    
  }

  return state;
};
