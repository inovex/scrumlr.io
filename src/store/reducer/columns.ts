import {Action, ReduxAction} from "store/action";
import {ColumnsState} from "types/column";

// eslint-disable-next-line default-param-last
export const columnsReducer = (state: ColumnsState = [], action: ReduxAction): ColumnsState => {
  if (action.type === Action.InitializeBoard || action.type === Action.UpdatedColumns) {
    return action.columns;
  }

  return state;
};
