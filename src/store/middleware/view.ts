import {Dispatch, MiddlewareAPI} from "redux";
import {ApplicationState} from "../../types";
import {Action, Actions, ReduxAction} from "../action";
import {API} from "../../api";

export const passViewMiddleware = (stateAPI: MiddlewareAPI<Dispatch, ApplicationState>, dispatch: Dispatch, action: ReduxAction) => {
  if (action.type === Action.InitApplication) {
    API.getServerInfo().then((r) => {
      dispatch(Actions.setEnabledAuthProvider(r?.authProvider || []));
    });
  }
};
