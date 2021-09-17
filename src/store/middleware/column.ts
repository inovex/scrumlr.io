import {AnyAction, Dispatch, MiddlewareAPI} from "redux";
import {ApplicationState} from "types/store";
import {ActionType, ReduxAction} from "store/action";
import {API} from "api";

export const passColumnMiddleware = (stateAPI: MiddlewareAPI<Dispatch<AnyAction>, ApplicationState>, dispatch: Dispatch, action: ReduxAction) => {
  if (action.type === ActionType.AddColumn) {
    const boardId = stateAPI.getState().board.data!.id;
    // TODO retry mechanism
    API.addColumn(boardId, action.addColumnRequest);
  }

  if (action.type === ActionType.DeleteColumn) {
    const boardId = stateAPI.getState().board.data!.id;
    // TODO retry mechanism
    API.deleteColumn(boardId, action.columnId);
  }

  if (action.type === ActionType.EditColumn) {
    const boardId = stateAPI.getState().board.data!.id;
    // TODO retry mechanism
    API.editColumn(boardId, action.editColumnRequest);
  }
};
