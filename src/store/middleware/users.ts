import {AnyAction, Dispatch, MiddlewareAPI} from "redux";
import {ApplicationState} from "types/store";
import {API} from "api";
import {ActionType, ReduxAction} from "../action";

export const passUsersMiddleware = (stateAPI: MiddlewareAPI<Dispatch<AnyAction>, ApplicationState>, dispatch: Dispatch, action: ReduxAction) => {
  if (action.type === ActionType.ChangePermission) {
    const boardId = stateAPI.getState().board.data!.id;
    API.changePermission(action.userId, boardId, action.moderator);
  }
};
