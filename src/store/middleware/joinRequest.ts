import {Dispatch, MiddlewareAPI} from "redux";
import {ApplicationState} from "types/store";
import {API} from "api";
import {ActionType, ReduxAction} from "../action";

export const passJoinRequestMiddleware = (stateAPI: MiddlewareAPI<any, ApplicationState>, dispatch: Dispatch, action: ReduxAction) => {
  switch (action.type) {
    case ActionType.AcceptJoinRequests:
      API.acceptJoinRequests(action.boardId, action.userIds);
      break;
    case ActionType.RejectJoinRequests:
      API.rejectJoinRequests(action.boardId, action.userIds);
      break;
  }
};
