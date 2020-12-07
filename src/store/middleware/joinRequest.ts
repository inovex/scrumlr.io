import {Dispatch, MiddlewareAPI} from "redux";
import {ApplicationState} from "../../types/store";
import {ActionType, ReduxAction} from "../action";
import {API} from "../../api";

export const passJoinRequestMiddleware = (stateAPI: MiddlewareAPI<any, ApplicationState>, dispatch: Dispatch, action: ReduxAction) => {
    switch (action.type) {
        case ActionType.AcceptJoinRequest:
            API.acceptJoinRequest(action.boardId, action.userId);
            break;
        case ActionType.RejectJoinRequest:
            API.rejectJoinRequest(action.boardId, action.userId);
            break;
    }
}