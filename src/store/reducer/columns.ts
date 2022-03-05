import {ActionType, ReduxAction} from "../action";
import {ColumnsState} from "../../types/column";

export const columnsReducer = (state: ColumnsState = [], action: ReduxAction): ColumnsState => {
  if (action.type === ActionType.InitializeBoard || action.type === ActionType.UpdatedColumns) {
    return action.columns;
  }

  return state;
};
