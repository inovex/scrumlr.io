import {Dispatch, MiddlewareAPI} from "redux";
import {ApplicationState} from "types/store";
import {API} from "api";
import {ActionType, ReduxAction} from "../action";

export const passJoinRequestMiddleware = (stateAPI: MiddlewareAPI<any, ApplicationState>, dispatch: Dispatch, action: ReduxAction) => {
  switch (action.type) {
    case ActionType.AcceptJoinRequest:
      API.acceptJoinRequest(action.boardId, action.userId);
      break;
    case ActionType.RejectJoinRequest:
      API.rejectJoinRequest(action.boardId, action.userId);
      break;
    case ActionType.AcceptAllPendingJoinRequests:
      API.acceptAllPendingJoinRequests(action.boardId);
      break;
    case ActionType.RejectAllPendingJoinRequests:
      API.rejectAllPendingJoinRequests(action.boardId);
      break;
  }
};
