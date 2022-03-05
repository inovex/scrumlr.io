import {Dispatch, MiddlewareAPI} from "redux";
import {ApplicationState} from "../../types";
import {ReduxAction} from "../action";
import {AuthActionType} from "../action/auth";
import {API} from "../../api";

export const passAuthMiddleware = (stateAPI: MiddlewareAPI<Dispatch, ApplicationState>, dispatch: Dispatch, action: ReduxAction) => {
  if (action.type === AuthActionType.SignOut) {
    API.signOut();
  }
};
