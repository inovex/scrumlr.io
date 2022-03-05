import {Dispatch, MiddlewareAPI} from "redux";
import {ApplicationState} from "types";
import {ReduxAction} from "../action";

export const passVoteMiddlware = async (stateAPI: MiddlewareAPI<Dispatch, ApplicationState>, dispatch: Dispatch, action: ReduxAction) => {};
