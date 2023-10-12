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
    const columns = [...state, action.column];
    return columns.sort((a, b) => action.columns_order.indexOf(b.id) - action.columns_order.indexOf(a.id));
  }
  if (action.type === Action.UpdatedColumn) {
    const columns = state.sort((a, b) => action.columns_order.indexOf(b.id) - action.columns_order.indexOf(a.id));
    columns[action.columns_order.indexOf(action.column.id)] = action.column;
    return columns;
  }
  return state;
};
