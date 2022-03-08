import {Dispatch, MiddlewareAPI} from "redux";
import {ApplicationState} from "types";
import {Action, ReduxAction} from "../action";
import {API} from "../../api";

export const passVoteMiddleware = (stateAPI: MiddlewareAPI<Dispatch, ApplicationState>, dispatch: Dispatch, action: ReduxAction) => {
  if (action.type === Action.AddVote) {
    API.addVote(action.context.board!, action.note).catch(() => {
      // TODO show error
    });
  }

  if (action.type === Action.DeleteVote) {
    API.deleteVote(action.context.board!, action.note).catch(() => {
      // TODO show error
    });
  }
};
