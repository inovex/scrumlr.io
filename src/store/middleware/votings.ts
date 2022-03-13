import {Dispatch, MiddlewareAPI} from "redux";
import {ApplicationState} from "types";
import {Action, ReduxAction} from "store/action";
import {API} from "api";

export const passVotingMiddleware = (stateAPI: MiddlewareAPI<Dispatch, ApplicationState>, dispatch: Dispatch, action: ReduxAction) => {
  if (action.type === Action.CreateVoting) {
    API.createVoting(action.context.board!, action.voting).catch(() => {
      // TODO show error message
    });
  }

  if (action.type === Action.CloseVoting) {
    API.changeVotingStatus(action.context.board!, action.voting, "CLOSED").catch(() => {
      // TODO show error message
    });
  }

  if (action.type === Action.AbortVoting) {
    API.changeVotingStatus(action.context.board!, action.voting, "ABORTED").catch(() => {
      // TODO show error message
    });
  }
};
