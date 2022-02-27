import {ActionType, ReduxAction} from "../action";
import {Column} from "../../types/column";

export const columnsReducer = (state: Column[] = [], action: ReduxAction): Column[] => {
  if (action.type === ActionType.InitializeBoard || action.type === ActionType.UpdatedColumns) {
    return action.columns;
  }

  return state;
};
