import {Dispatch, MiddlewareAPI} from "redux";
import {ApplicationState} from "../../types";
import {Action, Actions, ReduxAction} from "../action";
import {API} from "../../api";
import store from "../index";

export const passRequestMiddleware = (stateAPI: MiddlewareAPI<Dispatch, ApplicationState>, dispatch: Dispatch, action: ReduxAction) => {
  if (action.type === Action.JoinBoard) {
    API.joinBoard(action.boardId, action.passphrase).then((r) => {
      if (r.status === "accepted") {
        store.dispatch(Actions.permittedBoardAccess(action.boardId));
      } else {
        dispatch(Actions.rejectedBoardAccess());
      }
    });
  }
};
