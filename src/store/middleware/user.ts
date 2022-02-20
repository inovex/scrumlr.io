import {AnyAction, Dispatch, MiddlewareAPI} from "redux";
import {ApplicationState} from "../../types/store";
import {ReduxAction} from "../action";
import {UserActionType} from "../action/user";
import {API} from "../../api";

export const passUserMiddleware = (stateAPI: MiddlewareAPI<Dispatch<AnyAction>, ApplicationState>, dispatch: Dispatch, action: ReduxAction) => {
  if (action.type === UserActionType.SignOut) {
    API.signOut();
  }
};
