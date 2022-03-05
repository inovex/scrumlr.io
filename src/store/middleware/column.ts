import {Dispatch, MiddlewareAPI} from "redux";
import {ApplicationState} from "types";
import {Action, ReduxAction} from "store/action";
import {API} from "api";

export const passColumnMiddleware = (stateAPI: MiddlewareAPI<Dispatch, ApplicationState>, dispatch: Dispatch, action: ReduxAction) => {
  if (action.type === Action.AddColumn) {
    const boardId = stateAPI.getState().board.data!.id;
    // TODO retry mechanism
    API.addColumn(boardId, action.column);
  }

  if (action.type === Action.DeleteColumn) {
    const boardId = stateAPI.getState().board.data!.id;
    // TODO retry mechanism
    API.deleteColumn(boardId, action.columnId);
  }

  if (action.type === Action.EditColumn) {
    const boardId = stateAPI.getState().board.data!.id;
    // TODO retry mechanism
    API.editColumn(boardId, action.column);
  }
};
