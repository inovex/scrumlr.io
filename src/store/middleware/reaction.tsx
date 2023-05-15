import {Dispatch, MiddlewareAPI} from "@reduxjs/toolkit";
import {ApplicationState} from "../../types";
import {ReduxAction} from "../action";

export const passReactionMiddleware = (stateAPI: MiddlewareAPI<Dispatch, ApplicationState>, dispatch: Dispatch, action: ReduxAction) => {
  // TODO
};
