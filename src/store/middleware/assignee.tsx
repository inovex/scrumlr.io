import {Dispatch, MiddlewareAPI} from "redux";
import {ReduxAction} from "store/action";
import {ApplicationState} from "types";

export const passAssigneeMiddleware = (stateAPI: MiddlewareAPI<Dispatch, ApplicationState>, dispatch: Dispatch, action: ReduxAction) => {};
