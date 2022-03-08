import {Dispatch, MiddlewareAPI} from "redux";
import {ApplicationState} from "types";
import {ReduxAction} from "../action";

export const passVoteMiddleware = (stateAPI: MiddlewareAPI<Dispatch, ApplicationState>, dispatch: Dispatch, action: ReduxAction) => {};
