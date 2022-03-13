import {Dispatch, MiddlewareAPI} from "redux";
import {API} from "api";
import {Action, ReduxAction} from "store/action";
import {ApplicationState} from "types";

export const passColumnMiddleware = (stateAPI: MiddlewareAPI<Dispatch, ApplicationState>, dispatch: Dispatch, action: ReduxAction) => {
  if (action.type === Action.EditColumn) {
    const boardId = stateAPI.getState().board.data!.id;
    API.editColumn(boardId, action.id, action.column).catch(() => {
      // TODO report error
    });
  }
};
