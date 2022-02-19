import {AnyAction, Dispatch, MiddlewareAPI} from "redux";
import {ApplicationState} from "../../types/store";
import {ReduxAction} from "../action";
import {UserActionType} from "../action/user";

export const passUserMiddleware = (stateAPI: MiddlewareAPI<Dispatch<AnyAction>, ApplicationState>, dispatch: Dispatch, action: ReduxAction) => {
  if (action.type === UserActionType.SignOut) {
    document.cookie = "jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  }
};
