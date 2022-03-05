import {Dispatch, MiddlewareAPI} from "redux";
import {ApplicationState} from "types";
import {ReduxAction} from "store/action";

export const passVoteConfigurationMiddleware = async (stateAPI: MiddlewareAPI<Dispatch, ApplicationState>, dispatch: Dispatch, action: ReduxAction) => {};
