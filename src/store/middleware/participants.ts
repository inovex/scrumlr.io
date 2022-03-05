import {Dispatch, MiddlewareAPI} from "redux";
import {ApplicationState} from "types";
import {ReduxAction} from "../action";

export const passUsersMiddleware = (stateAPI: MiddlewareAPI<Dispatch, ApplicationState>, dispatch: Dispatch, action: ReduxAction) => {};
