import {Dispatch, MiddlewareAPI} from "@reduxjs/toolkit";
import {ApplicationState} from "types";
import {Action, ReduxAction} from "store/action";
import {API} from "api";

export const passBoardReactionMiddleware = (stateAPI: MiddlewareAPI<Dispatch, ApplicationState>, dispatch: Dispatch, action: ReduxAction) => {
  if (action.type === Action.AddBoardReaction) {
    API.addBoardReaction(action.context.board!, action.reactionType); // TODO handle promise & toasts
  }
};
