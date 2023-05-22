import {Dispatch, MiddlewareAPI} from "@reduxjs/toolkit";
import {ApplicationState} from "../../types";
import {Action, ReduxAction} from "../action";
import {API} from "../../api";

export const passReactionMiddleware = (stateAPI: MiddlewareAPI<Dispatch, ApplicationState>, dispatch: Dispatch, action: ReduxAction) => {
  if (action.type === Action.AddReaction) {
    API.addReaction(action.context.board!, action.noteId, action.reactionType);
  }
  if (action.type === Action.DeleteReaction) {
    API.deleteReaction(action.context.board!, action.reactionId);
  }
};
